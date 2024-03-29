import { Incrementer } from "../../App/components/sync/itemFetcher";
import ReactDOM from "react-dom/client";

import { Queue, Repeat } from "../../util/queue";
import { SongData, SourceType } from "../../util/wrapper/eggs/artist";
import { TimeData } from "./types";
import { currySongFunction, getEggsID, SongCurry } from "../../util/util";
import SocketConnection from "../../util/socketConnection";
import PlaybackController from "./playbackController";
import TypedEmitter from "typed-emitter";
import EventEmitter from "events";
import browser from "webextension-polyfill";

export function setPlaybackLocal(data: any, playbackController: PlaybackController) {
	const track = data.track as SongData;
	const trackList = data.trackList as SongData[];
	playbackController.setPlayback(trackList, track);
}

export async function setPlaybackDynamicLocal(data: any, playbackController: PlaybackController) {
	const eggsGetCurry = data.eggsGetSongCurry as SongCurry;
	const eggsGet = currySongFunction(eggsGetCurry);
	const incrementer = new Incrementer(eggsGet, 1);
	try {
		let shouldContinue = true;
		do {
			const initialItems = (await incrementer.getPage()).data.flat();
			if (initialItems.length === 0) {
				continue;
			}
			playbackController.setPlaybackDynamic(initialItems, incrementer);
			shouldContinue = false;
		} while (shouldContinue);
	} catch(err) {
		console.error(err);
	}
}

export function initializePlayback(root:ReactDOM.Root, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>, setShuffle:React.Dispatch<React.SetStateAction<boolean>>, setRepeat:React.Dispatch<React.SetStateAction<Repeat>>, setVolume:React.Dispatch<React.SetStateAction<number>>, volume:number) {
	const playbackController = new LocalPlaybackController(root, true, Repeat.All, setCurrent, youtube, setTimeData, setShuffle, setRepeat, setVolume, volume);
	window.addEventListener("message", async(event) => {
		if (event.origin !== window.location.origin) {
			return;
		}

		if (event.data.type !== "trackUpdate") {
			return;
		}
		switch(event.data.data.type) {
		case "setPlayback": {
			setPlaybackLocal(event.data.data, playbackController);
			break;
		}
		case "suggest": {
			const track = event.data.data.track as SongData;
			playbackController.suggestion = track;
			break;
		}
		case "setPlaybackDynamic": {
			await setPlaybackDynamicLocal(event.data.data, playbackController);
			break;
		}
		case "playNext": {
			const track = event.data.data.track as SongData;
			playbackController.playNext(track);
			break;
		}
		case "addToQueue": {
			const track = event.data.data.track as SongData;
			playbackController.addToQueue(track);
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

export class LocalPlaybackController extends (EventEmitter as new () => TypedEmitter<PlaybackEmitters>) implements PlaybackController {
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
	private socket: SocketConnection|null = null;
	private _title = "";
	private _playSuggestions = false;
	private dontPlayYoutube = browser.storage.sync.get("dontPlayYoutube").then((data) => data.dontPlayYoutube === true);
	private dontPlayFollowerOnly = browser.storage.sync.get("dontPlayFollowerOnly").then((data) => data.dontPlayFollowerOnly === true);

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

	public publicize(title:string) {
		this._title = title;
		this.initSocket(title);
		this.emit("update");
	}

	public closeConnection() {
		this.socket?.closeConnection();
		this.emit("update");
	}

	private async initSocket(title:string) {
		const eggsID = await getEggsID();
		if (eggsID === undefined) {
			return;
		}
		this.socket = new SocketConnection(eggsID, true, title);

		this.socket.on("updateChat", () => { this.emit("updateChat"); });
		this.socket.on("updateSuggestions", () => { this.emit("updateSuggestions"); });
		this.socket.on("update", () => { this.emit("update"); });

		this.socket.on("message", (message) => {
			switch (message.message.type) {
			case "info": {
				if (message.message.message === "join") {
					this.socket?.send({
						type: "join",
						message: {
							song: this.current,
							time: this.currentTime ?? 0,
							target: message.sender.userName,
							title: this.title,
							isPlaying: this.isPlaying ?? false,
						}
					});
				}
				break;
			}
			case "playSuggestions": {
				this._playSuggestions = message.message.message;
				this.emit("updateSettings");
				break;
			}
			case "chat":
			case "suggest": {
				//console.log(message);
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
		this.socket?.addBlockedUser(eggsID);
	}

	public unblockUser(eggsID: string): void {
		this.socket?.removeBlockedUser(eggsID);
	}

	public setBool(name:string, value:boolean) {
		switch(name) {
		case "dontPlayYoutube":
			this.dontPlayYoutube = Promise.resolve(value);
			break;
		case "dontPlayFollowerOnly":
			this.dontPlayFollowerOnly = Promise.resolve(value);
			break;
		}
	}

	private async filterTracks(queue:SongData[]) {
		if (await this.dontPlayYoutube) {
			queue = queue.filter((track) => track.sourceType !== SourceType.YouTube);
		}
		if (await this.dontPlayFollowerOnly) {
			queue = queue.filter((track) => !track.isFollowerOnly);
		}
		return queue;
	}

	public async setPlayback(initialQueue:SongData[], initialElement:SongData) {
		this.queue?.destroy();
		const newQueue = await this.filterTracks(initialQueue);
		this.queue = new Queue(newQueue, initialElement, this.root, this.shuffle, this.repeat, this.setCurrent, this.setVolume, this.youtube, this.setTimeData, this._volume);
		this.play();
		this.emit("update");
		this.queue.on("update", () => { this.emit("update"); });
		this.queue.on("next", () => { this.next(); });
		this.socket?.send({
			type: "start",
			message: initialElement
		});
	}

	public async setPlaybackDynamic(initialQueue:SongData[], incrementer:Incrementer<SongData>) {
		this.queue?.destroy();
		this.queue = new Queue(initialQueue, initialQueue[0], this.root, this.shuffle, this.repeat, this.setCurrent, this.setVolume, this.youtube, this.setTimeData, this._volume, incrementer);
		this.play();
		this.emit("update");
		this.queue.on("update", () => { this.emit("update"); });
		this.queue.on("next", () => { this.next(); });
		this.socket?.send({
			type: "start",
			message: initialQueue[0]
		});
	}

	public play() {
		this.queue?.play();
		this.socket?.send({
			type: "playback",
			message: "play"
		});
	}

	public pause() {
		this.queue?.pause();
		this.socket?.send({
			type: "playback",
			message: "pause"
		});
	}

	public next(destination = true) {
		if (!destination) {
			this.queue?.next;
		}
		this.preparePlaySuggestion();
		const song = this.queue?.peek();
		if (song) {
			this.socket?.send({
				type: "start",
				message: song,
			});
		}
		this.queue?.next();
		this.emit("update");
	}

	private preparePlaySuggestion() {
		if (this.playSuggestions) {
			const filtered = this.suggestions?.filter(s => s.song !== null);
			if (filtered && filtered.length > 0) {
				const song = filtered[Math.floor(Math.random() * filtered.length)].song as SongData;
				this.playNext(song);
			}
		}
	}

	public previous() {
		const song = this.queue?.peekHistory();
		if (song) {
			this.socket?.send({
				type: "start",
				message: song,
			});
		}
		this.queue?.previous();
		this.emit("update");
	}

	public playNext(track:SongData) {
		this.queue?.playNext(track);
		this.emit("update");
	}

	public addToQueue(track:SongData) {
		this.queue?.addToQueue(track);
		this.emit("update");
	}

	public removeFromQueue(trackIndex:number) {
		this.queue?.removeFromQueue(trackIndex);
		this.emit("update");
	}

	public setCurrentTime(percentage:number) {
		this.queue?.setCurrentTime(percentage * (this.duration ?? 0));
		this.socket?.send({
			type: "currentTime",
			message: percentage * (this.duration ?? 0),
		});
	}

	public skipTo(n:number) {
		let song = this.queue?.peek();
		for (let i = 0; i <= n; i++) {
			song = this.queue?.peek();
			this.next(false);
		}

		if (song) {
			this.socket?.send({
				type: "start",
				message: song,
			});
		}

		this.emit("update");
	}

	public toggleShuffle() {
		this.shuffle = !this.shuffle;
		this.setShuffle(this.shuffle);
		if (!this.queue) return;
		this.queue.shuffle = this.shuffle;
		this.emit("update");
	}

	public cycleRepeat() {
		this.repeat = (this.repeat + 1) % 3;
		this.setRepeat(this.repeat);
		if (!this.queue) return;
		this.queue.repeat = this.repeat;
		this.emit("update");
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
		this.socket?.send({
			type: "setTitle",
			message: title
		});
		this._title = title;
		this.emit("update");
	}

	get title() {
		return this._title;
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

	set playSuggestions(playSuggestions:boolean) {
		this._playSuggestions = playSuggestions;
		if (!this.socket) {
			return;
		}
		this.socket.send({
			type: "playSuggestions",
			message: playSuggestions
		});
		this.emit("updateSettings");
	}

	get playSuggestions() {
		return this._playSuggestions;
	}

	get isPublic() {
		return this.socket !== null;
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
		return this.queue?.priorityQueue;
	}

	get mainQueue() {
		return this.queue?.mainQueue;
	}

	get all() {
		return this.queue?.all;
	}
	
	get chatMessages() {
		return this.socket?.chatMessages;
	}
}
