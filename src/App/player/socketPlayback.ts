import { Incrementer } from "../../App/components/sync/itemFetcher";
import EventEmitter from "events";
import ReactDOM from "react-dom/client";
import TypedEmitter from "typed-emitter";

import { Queue, Repeat } from "../../util/queue";
import { SongData } from "../../util/wrapper/eggs/artist";
import { TimeData } from "./types";
import { getEggsID } from "../../util/util";
import SocketConnection from "../../util/socketConnection";
import PlaybackController from "./playbackController";

export function initializeSocketPlayback(root:ReactDOM.Root, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>, setShuffle:React.Dispatch<React.SetStateAction<boolean>>, setRepeat:React.Dispatch<React.SetStateAction<Repeat>>, setVolume:React.Dispatch<React.SetStateAction<number>>, volume:number) {
	const playbackController = new SocketPlaybackController(root, true, Repeat.All, setCurrent, youtube, setTimeData, setShuffle, setRepeat, setVolume, volume);
	window.addEventListener("message", async(event) => {
		if (event.origin !== window.location.origin) {
			return;
		}

		if (event.data.type !== "trackUpdate") {
			return;
		}
		switch(event.data.data.type) {
		case "suggest": {
			const track = event.data.data.track as SongData;
			playbackController.suggestion = track;
			break;
		}
		}
	});
	return playbackController;
}

type PlaybackEmitters = {
  update: () => void;
	updateChat: () => void;
	updateSuggestions: () => void;
	updateSettings: () => void;
}

export class SocketPlaybackController extends (EventEmitter as new () => TypedEmitter<PlaybackEmitters>) implements PlaybackController {
	private queue:Queue|undefined;
	private shuffle:boolean;
	private repeat:Repeat;
	private root:ReactDOM.Root;
	private youtube:React.RefObject<HTMLIFrameElement>;
	private setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>;
	private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>;
	private setShuffle:React.Dispatch<React.SetStateAction<boolean>>;
	private setRepeat:React.Dispatch<React.SetStateAction<Repeat>>;
	private setVolume:React.Dispatch<React.SetStateAction<number>>;
	private _volume:number;
	private socket:null|SocketConnection = null;
	private _title = "";
	private _playSuggestions = false;

	constructor(root:ReactDOM.Root, shuffle:boolean, repeat:Repeat, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>, setShuffle:React.Dispatch<React.SetStateAction<boolean>>, setRepeat:React.Dispatch<React.SetStateAction<Repeat>>, setVolume:React.Dispatch<React.SetStateAction<number>>, volume:number) {
		super();
		this.shuffle = shuffle;
		this.repeat = repeat;
		this.root = root;
		this.youtube = youtube;
		this.setCurrent = setCurrent;
		this.setTimeData = setTimeData;
		this.setShuffle = setShuffle;
		this.setRepeat = setRepeat;
		this.setVolume = setVolume;
		this._volume = volume;
		this.volume = volume;
	}

	public closeConnection() {
		this.socket?.closeConnection();
		this.emit("update");
	}

	public async initSocket(eggsID:string) {
		this.socket = new SocketConnection(eggsID, false);

		this.socket.on("updateChat", () => { this.emit("updateChat"); });
		this.socket.on("updateSuggestions", () => { this.emit("updateSuggestions"); });

		this.socket.on("message", (message) => {
			if (!message.privileged) {
				return;
			}

			switch (message.message.type) {
			case "playback": {
				if (message.message.message === "play") {
					this.play();
				} else if (message.message.message === "pause") {
					this.pause();
				}
				break;
			}
			case "start": {
				this.setPlayback([message.message.message], message.message.message);
				break;
			}
			case "currentTime": {
				this.setCurrentTime(message.message.message);
				break;
			}
			case "playSuggestions": {
				this.playSuggestions = message.message.message;
				break;
			}
			case "join": {
				getEggsID().then((eggsID) => {
					if (message.message.type !== "join" || message.message.message.target !== eggsID) {
						return;
					}
					this.title = message.message.message.title;

					if (!message.message.message.song) {
						return;
					}
					this.setPlayback([message.message.message.song], message.message.message.song);
					this.setCurrentTime(message.message.message.time);
					if (!message.message.message.isPlaying) {
						this.pause();
					}
				});
				break;
			}
			case "setTitle": {
				this.title = message.message.message;
				break;
			}
			}
		});
		this.emit("update");
	}

	public sendChatMessage(message: string): void {
		this.socket?.send({
			type: "chat",
			message: message
		});
	}
	
	public blockUser(eggsID: string): void {
		this.socket?.addBlockedUserLocal(eggsID);
	}

	public unblockUser(eggsID: string): void {
		this.socket?.removeBlockedUserLocal(eggsID);
	}

	public setBool() {
		// Do nothing
	}

	public setPlayback(initialQueue:SongData[], initialElement:SongData) {
		this.queue?.destroy();
		this.queue = new Queue(initialQueue, initialElement, this.root, false, Repeat.None, this.setCurrent, this.setVolume, this.youtube, this.setTimeData, this._volume);
		this.play();
		this.emit("update");
	}

	public async setPlaybackDynamic(initialQueue:SongData[], incrementer:Incrementer<SongData>) {
		this.queue?.destroy();
		this.queue = new Queue(initialQueue, initialQueue[0], this.root, false, Repeat.None, this.setCurrent, this.setVolume, this.youtube, this.setTimeData, this._volume, incrementer);
		this.play();
		this.emit("update");
	}

	public play() {
		this.queue?.play();
	}

	public pause() {
		this.queue?.pause();
	}

	public next() {
		// Do nothing
	}

	public previous() {
		// Do nothing
	}

	public playNext() {
		// Do nothing
	}

	public addToQueue() {
		// Do nothing
	}

	public removeFromQueue() {
		// Do nothing
	}

	public setCurrentTime(currentTime:number) {
		this.queue?.setCurrentTime(currentTime);
	}

	public skipTo() {
		// Do nothing
	}

	public toggleShuffle() {
		// Do nothing
	}

	public cycleRepeat() {
		// Do nothing
	}

	set volume(volume:number) {
		this._volume = volume;
		if (!this.queue) return;
		this.queue.volume = volume;
	}

	set scrobbleInfo(scrobble:{artist:string, track:string, album:string}) {
		if (!this.queue) return;
		this.queue.scrobbleInfo = scrobble;
	}

	set title(title:string) {
		this._title = title;
		this.emit("update");
	}

	get title() {
		return this._title;
	}

	set playSuggestions(playSuggestions:boolean) {
		this._playSuggestions = playSuggestions;
		this.emit("updateSettings");
	}

	get playSuggestions() {
		return this._playSuggestions;
	}

	set suggestion(suggestion:SongData|null) {
		if (!this.socket) {
			return;
		}
		
		this.socket.suggestion = suggestion;
	}

	get suggestions() {
		return this.socket?.suggestions;
	}

	get isPublic() {
		return true;
	}

	get current() {
		return this.queue?.current;
	}

	get currentTime() {
		return this.queue?.currentTime;
	}

	get duration() {
		return this.queue?.duration;
	}

	get isPlaying() {
		return this.queue?.isPlaying;
	}

	get priorityQueue() {
		return [];
	}

	get mainQueue() {
		return [];
	}

	get all() {
		return [];
	}

	get chatMessages() {
		return this.socket?.chatMessages;
	}
}
