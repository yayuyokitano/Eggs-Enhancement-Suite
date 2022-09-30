import EventEmitter from "events";
import { t } from "i18next";
import TypedEmitter from "typed-emitter";
import { getEggshellverToken, getEggsID } from "./util";
import { SongData } from "./wrapper/eggs/artist";
import { baseURL, UserStub } from "./wrapper/eggshellver/util";

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
	message: SongData;
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
	}
} | {
	type: "setTitle";
	message: string;
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
	private blockedUsers:string[] = [];

	constructor(target:string, isNew:boolean, title?:string) {
		super();
		this.socket = null;
		this.init(target, isNew, title);
	}

	public closeConnection() {
		this.socket?.close();
	}

	private async init(target:string, isNew:boolean, title?:string) {
		const url = `wss${baseURL}ws/${isNew ? "create" : "join"}/${target}/${await getEggshellverToken()}`;
		this.socket = new WebSocket(url);

		this.socket.addEventListener("open", () => {
			this.send({
				type: "info",
				message: "join",
			});
			if (isNew && title) {
				this.send({
					type: "setTitle",
					message: title,
				});
			}
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

		if (processedMessage.message.type === "chat") {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line - typescript does not narrow the type correctly. It is verified that the message is of type chat and so fits the addChatMessage method.
			this.addChatMessage(processedMessage);
			return;
		}
	
		this.emit("message", processedMessage);
	}

	private async addChatMessage(message:RawChatMessage) {
		if (message.blocked || this.blockedUsers.includes(message.sender.userName)) {
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

	private blockUser(eggsID:string) {
		this.blockedUsers.push(eggsID);
		this.chat = this.chat.filter((message) => message.sender.userName !== eggsID);
	}

	public get chatMessages() {
		return this.chat;
	}
	
}

