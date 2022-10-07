import { Suggestion } from "../App/player/playbackController";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { getEggshellverToken, getEggsID } from "./util";
import { SongData } from "./wrapper/eggs/artist";
import { baseURL, UserStub } from "./wrapper/eggshellver/util";
import browser from "webextension-polyfill";

type PlaybackEvent = "play"|"pause";

type InfoEvent = "join";

interface RawChatMessage {
	privileged: boolean;
	blocked: boolean;
	sender: UserStub;
	message: {
		type: "chat";
		message: string;
	}
}

type MessageContent = {
	type: "chat";
	message: string;
} | {
	type: "suggest";
	message: SongData|null;
} | {
	type: "playback";
	message: PlaybackEvent
} | {
	type: "start";
	message: SongData;
} | {
	type: "currentTime";
	message: number;
} | {
	type: "info";
	message: InfoEvent;
} | {
	type: "join";
	message: {
		song?: SongData;
		time: number;
		target: string;
		title: string;
		isPlaying: boolean;
	}
} | {
	type: "setTitle";
	message: string;
} | {
	type: "playSuggestions";
	message: boolean;
} | {
	type: "blockedUsers";
	message: string[];
} | {
	type: "unblockedUsers";
	message: string[];
}

type RawMessageContent = {
	type: "chat";
	message: string;
} | {
	type: "suggest";
	message: string;
} | {
	type: "playback";
	message: string
} | {
	type: "start";
	message: string;
} | {
	type: "currentTime";
	message: number;
} | {
	type: "info";
	message: string;
} | {
	type: "join";
	message: string
} | {
	type: "setTitle";
	message: string;
} | {
	type: "playSuggestions";
	message: string;
} | {
	type: "blockedUsers";
	message: string;
} | {
	type: "unblockedUsers";
	message: string;
}

interface MessageMetadata {
	privileged: boolean;
	blocked: boolean;
	sender: UserStub;
}

interface SocketMessage extends MessageMetadata {
	message: MessageContent;
}

interface MiddleSocketMessage extends MessageMetadata {
	message: RawMessageContent;
}

interface RawSocketMessage extends MessageMetadata {
	message: string;
}

type SocketEmitters = {
	message: (message: SocketMessage) => void;
	update: () => void;
	updateChat: () => void;
	updateSuggestions: () => void;
}

export interface ChatMessage {
	message: string;
	timestamp: Date;
	sender: UserStub;
	self: boolean;
	owner: boolean;
}

export default class SocketConnection extends (EventEmitter as new () => TypedEmitter<SocketEmitters>) {
	private socket:null|WebSocket;
	private chat:ChatMessage[] = [];
	private blockedUsers:Promise<string[]> = browser.storage.sync.get("blockedUsers").then((data) => {
		const blockedUsers = (data.blockedUsers || []) as string[];
		if (!blockedUsers) return [];
		return blockedUsers;
	});
	private _suggestion:SongData|null = null;
	private _suggestions:{[name:string]: Suggestion} = {};

	constructor(target:string, isNew:boolean, title?:string) {
		super();
		this.socket = null;
		this.init(target, isNew, title);

		setInterval(() => {
			this.send({
				type: "suggest",
				message: this._suggestion
			});

			const cur = Number(new Date());
			this._suggestions = Object.fromEntries(Object.entries(this._suggestions).filter(suggestion => cur - Number(suggestion[1].updated) < 30_000));
			this.emit("updateSuggestions");
		}, 10_000);
	}

	public closeConnection() {
		this.socket?.close();
	}

	private async init(target:string, isNew:boolean, title?:string) {
		const url = `wss${baseURL}ws/${isNew ? "create" : "join"}/${target}/${await getEggshellverToken()}`;
		console.log(url);
		this.socket = new WebSocket(url);

		this.socket.addEventListener("open", async() => {
			
			this.send({
				type: "info",
				message: "join",
			});
			this.send({
				type: "suggest",
				message: null
			});
			if (isNew && title) {
				this.send({
					type: "setTitle",
					message: title,
				});
			}
			this.emit("update");
			this.send({
				type: "blockedUsers",
				message: await this.blockedUsers
			});
		});

		this.socket.addEventListener("message", (message) => {
			for (const obj of message.data.slice(1, -1).split("}\n{")) {
				this.processMessage(`{${obj}}`);
			}
		});
	}

	public async send(message: MessageContent) {
		const rawMessage = {
			type: message.type,
			message: JSON.stringify(message.message)
		};
		console.log("sending: ", JSON.stringify(rawMessage));
		this.socket?.send(JSON.stringify(rawMessage));
	}

	private processMessage(data:any) {
		console.log("receiving: ", data);
				
		const rawMessage = JSON.parse(data) as RawSocketMessage;
				
		const middleMessage:MiddleSocketMessage = {
			...rawMessage,
			message: JSON.parse(rawMessage.message)
		};
				
		if (typeof middleMessage.message.message !== "string") {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line - typescript does not narrow the type correctly. It is verified that the message is not a string and so does not need parsing.
			this.emit("message", middleMessage);
			return;
		}
	
		const processedMessage:SocketMessage = {
			...middleMessage,
			message: {
				...middleMessage.message,
				message: JSON.parse(middleMessage.message.message)
			}
		};

		switch (processedMessage.message.type) {
		case "chat": {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line - typescript does not narrow the type correctly. It is verified that the message is of type chat and so fits the addChatMessage method.
			this.addChatMessage(processedMessage);
			console.log("hiii");
			return;
		}
		case "suggest": {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line - typescript does not narrow the type correctly. It is verified that the message is of type suggest.
			this._suggestions[processedMessage.sender.userName] = {
				song: processedMessage.message.message,
				user: processedMessage.sender,
				updated: new Date(),
			};
			this.emit("updateSuggestions");
			console.log(this._suggestions);
			return;
		}
		case "join": {
			this.send({
				type: "suggest",
				message: this._suggestion
			});
			break;
		}
		case "blockedUsers": {
			for (const user of processedMessage.message.message) {
				this.pruneMessages(user);
			}
		}
		}
	
		this.emit("message", processedMessage);
	}

	private async addChatMessage(message:RawChatMessage) {
		if (message.blocked || (await this.blockedUsers).includes(message.sender.userName)) {
			return;
		}
		this.chat.push({
			message: message.message.message,
			timestamp: new Date(),
			sender: message.sender,
			self: message.sender.userName === await getEggsID(),
			owner: message.privileged,
		});
		this.emit("updateChat");
	}

	public async addBlockedUser(eggsID:string) {
		this.addBlockedUserLocal(eggsID);
		this.send({
			type: "blockedUsers",
			message: [eggsID],
		});
	}

	public async addBlockedUserLocal(eggsID:string) {
		(await this.blockedUsers).push(eggsID);
		browser.storage.sync.set({
			blockedUsers: await this.blockedUsers
		});
		this.pruneMessages(eggsID);
	}

	public async pruneMessages(eggsID:string) {
		this.chat = this.chat.filter((message) => message.sender.userName !== eggsID);
	}

	public async removeBlockedUser(eggsID:string) {
		this.removeBlockedUserLocal(eggsID);
		this.send({
			type: "unblockedUsers",
			message: [eggsID],
		});
	}

	public async removeBlockedUserLocal(eggsID:string) {
		this.blockedUsers = this.blockedUsers.then(bu => bu.filter(u => u !== eggsID));
		browser.storage.sync.set({
			blockedUsers: await this.blockedUsers
		});
	}

	public get chatMessages() {
		return this.chat;
	}

	public get suggestions() {
		return Object.values(this._suggestions);
	}

	public set suggestion(suggestion:SongData|null) {
		this._suggestion = suggestion;
		this.send({
			type: "suggest",
			message: suggestion
		});
	}
	
}

