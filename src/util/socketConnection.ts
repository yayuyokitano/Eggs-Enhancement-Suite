import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { getEggshellverToken } from "./util";
import { SongData } from "./wrapper/eggs/artist";
import { baseURL, UserStub } from "./wrapper/eggshellver/util";

type PlaybackEvent = "play"|"pause";

type InfoEvent = "join";

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
}

export default class SocketConnection extends (EventEmitter as new () => TypedEmitter<SocketEmitters>) {
	private socket:null|WebSocket;

	constructor(target:string, isNew:boolean) {
		super();
		this.socket = null;
		this.init(target, isNew);
	}

	public closeConnection() {
		this.socket?.close();
	}

	private async init(target:string, isNew:boolean) {
		const url = `wss${baseURL}ws/${isNew ? "create" : "join"}/${target}/${await getEggshellverToken()}`;
		this.socket = new WebSocket(url);

		this.socket.addEventListener("open", () => {
			this.send({
				type: "info",
				message: "join",
			});
		});
		
		this.socket.addEventListener("message", (message) => {

			console.log("receiving: ", message.data);
			
			const rawMessage = JSON.parse(message.data) as RawSocketMessage;
			
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

			this.emit("message", processedMessage);
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
}