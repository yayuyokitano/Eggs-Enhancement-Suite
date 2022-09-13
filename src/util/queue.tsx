import React from "react";
import ReactDOM from "react-dom/client";

import { shuffleArray } from "./util";
import { SongData, SourceType } from "./wrapper/eggs/artist";

import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { TimeData } from "../App/player/types";
import { Scrobbler } from "./scrobbler";
import { Incrementer, IncrementerError } from "../App/components/sync/itemFetcher";


export enum Repeat {
  None = 0,
  All,
  One
}

class DOMPreloader {
	private root:ReactDOM.Root;

	constructor(root:ReactDOM.Root) {
		this.root = root;
	}

	public render(tracks:Set<string>) {
		this.root.render(
			<div>
				{[...tracks].map(trackPath => (
					<audio
						key={trackPath}
						data-path={trackPath}
						preload="auto">
						<source
							src={trackPath}
							type="audio/mpeg" />
					</audio>
				))}
			</div>
		);
	}
}

type AudioEmitter = {
  ended: () => void;
}

type YoutubeMessage = {
	event: "onStateChange";
	info: number;
}|{
	event: "infoDelivery",
	info?: {
		duration?: number;
		currentTime?: number;
	}
}

class YoutubePlayer implements EventListenerObject {
	private youtube:HTMLIFrameElement;
	private ready:Promise<boolean>;
	private audioEmitter:TypedEmitter<AudioEmitter>;
	private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>;

	constructor(youtube:HTMLIFrameElement, track:SongData, audioEmitter:TypedEmitter<AudioEmitter>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>) {
		this.youtube = youtube;
		this.youtube.src = `https://www.youtube.com/embed/${track.youtubeVideoId}?enablejsapi=1&widgetid=1`;
		this.audioEmitter = audioEmitter;
		this.setTimeData = setTimeData;
		this.ready = new Promise((resolve) => {
			this.youtube.addEventListener("load", async () => {
				resolve(true);
				prepareYoutubeListeners(youtube);
			});

			// calls .handleEvent method because javascript
			window.addEventListener("message", this);
		});
	}

	public handleEvent(event:MessageEvent<string>) {
		if (event.origin !== "https://www.youtube.com") return;
		const data:YoutubeMessage = JSON.parse(event.data);
		switch (data.event) {
		case "onStateChange":
			if (data.info === 0) {
				this.audioEmitter.emit("ended");
			}
			break;
		case "infoDelivery": {
			const timeElement = document.getElementById("ees-player-controls-time");
			const curTimeData = {
				current: Number(timeElement?.dataset.current),
				duration: Number(timeElement?.dataset.duration)
			};
			this.setTimeData({
				current: data.info?.currentTime ?? curTimeData.current,
				duration: data.info?.duration ?? curTimeData.duration,
			});
			break;
		}
		}
	}

	public destroy() {
		window.removeEventListener("message", this);
	}

	public async play() {
		await this.ready;
		this.youtube.contentWindow?.postMessage(JSON.stringify({
			event: "command",
			func: "playVideo",
		}), "https://www.youtube.com");
	}

	public async pause() {
		await this.ready;
		this.youtube.contentWindow?.postMessage(JSON.stringify({
			event: "command",
			func: "pauseVideo",
		}), "https://www.youtube.com");
	}

	set volume(newVolume:number) {
		this.ready.then(() => {
			this.youtube.contentWindow?.postMessage(JSON.stringify({
				event: "command",
				func: "setVolume",
				args: [(newVolume * 100).toString()],
			}), "https://www.youtube.com");
		});
	}

	set currentTime(newTime:number) {
		this.ready.then(() => {
			this.youtube.contentWindow?.postMessage(JSON.stringify({
				event: "command",
				func: "seekTo",
				args: [newTime.toString(), "true"],
			}), "https://www.youtube.com");
		});
	}
}

function prepareYoutubeListeners(youtube:HTMLIFrameElement) {
	let message = JSON.stringify({
		event: "listening",
		id: "ees-youtube-container",
		channel: "widget",
	});
	youtube?.contentWindow?.postMessage(message, "https://www.youtube.com");

	message = JSON.stringify({
		event: "command",
		func: "addEventListener",
		args: ["onStateChange"],
		id: "ees-youtube-container",
		channel: "widget",
	});
	youtube?.contentWindow?.postMessage(message, "https://www.youtube.com");
}

class SongElement {

	private element:HTMLAudioElement|YoutubePlayer|undefined;
	private sourceType:SourceType;
	public audioEmitter = new EventEmitter() as TypedEmitter<AudioEmitter>;
	private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>;

	constructor(track:SongData, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>) {
		this.sourceType = track.sourceType;
		this.setTimeData = setTimeData;
		switch (this.sourceType) {
		case SourceType.Eggs:
			this.element = new Audio(track.musicDataPath);
			this.element.addEventListener("timeupdate", (e) => {
				const aud = e.target as HTMLAudioElement;
				this.setTimeData({
					current: aud.currentTime,
					duration: aud.duration
				});
			});
			break;
		case SourceType.YouTube:
			if (!youtube.current) return;
			this.element = new YoutubePlayer(youtube.current, track, this.audioEmitter, this.setTimeData);
			break;
		}
	}

	private setEndEvent() {
		switch (this.sourceType) {
		case SourceType.Eggs:
			(this.element as HTMLAudioElement).onended = () => {this.audioEmitter.emit("ended");};
			break;
		}
	}

	public destroy() {
		if (this.sourceType === SourceType.YouTube) {
			(this.element as YoutubePlayer).destroy();
		}
	}

	public play() {
		this.element?.play();
		this.setEndEvent();
	}

	public pause() {
		this.element?.pause();
		this.setEndEvent();
	}

	public setCurrentTime(newTime:number) {
		if (!this.element) return;
		this.element.currentTime = newTime;
	}

	public setVolume(newVolume:number) {
		if (!this.element) return;
		this.element.volume = newVolume;
	}

}

type QueueEmitters = {
  update: () => void;
	next: () => void;
}

export class Queue extends (EventEmitter as new () => TypedEmitter<QueueEmitters>) {
	private innerQueue = new InnerQueue();
	private innerOverrideQueue = new InnerQueue();
	private initialQueue:SongData[];
	private _shuffle:boolean;
	private _repeat:Repeat;
	private _current:SongData;
	private preloader:DOMPreloader;
	private currentElement?:SongElement;
	private historyStack:HistoryStack;
	private setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>;
	private youtube:React.RefObject<HTMLIFrameElement>;
	private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>;
	private _isPlaying = false;
	private scrobbler = new Scrobbler();
	private realCurrent = 0;
	private scrobbled = false;
	private _scrobbleInfo = {
		track: "",
		album: "",
		artist: "",
	};
	private secondInterval = setInterval(() => {
		this.secondUpdate();
	}, 1000);
	private _volume;
	private incrementer?:Incrementer<SongData>;
	private populating = false;
	private initialQueueUsed = false;

	constructor(
		initialQueue:SongData[],
		initialElement:SongData,
		root:ReactDOM.Root,
		shuffle:boolean,
		repeat:Repeat,
		setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>,
		youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>,
		volume:number,
		incrementer?:Incrementer<SongData>
	) {

		super();
		this.initialQueue = initialQueue;
		this._current = initialElement;
		this._shuffle = shuffle;
		this._repeat = repeat;
		this.preloader = new DOMPreloader(root);
		this.historyStack = new HistoryStack();
		this.setCurrent = setCurrent;
		this.setTimeData = setTimeData;
		this.youtube = youtube;
		this.currentElement = new SongElement(this.current, this.youtube, this.setTimeData);
		this.currentElement.destroy();
		this._volume = volume;
		this.volume = volume;
		this.incrementer = incrementer;
			
		this.current = initialElement;
		this.populate();
	}

	public destroy() {
		this.pause();
		this.empty();
		this.innerOverrideQueue.empty();
		this.historyStack.empty();
		this.currentElement?.destroy();
		delete this.currentElement;
		this.removeAllListeners();
		clearInterval(this.secondInterval);
	}

	public play() {
		this.currentElement?.setVolume(this._volume);
		this.currentElement?.play();
		this._isPlaying = true;
	}

	public pause() {
		this.currentElement?.pause();
		this._isPlaying = false;
	}

	public next() {
		if (!this.innerQueue.length) return;
		this.realCurrent = 0;
		this.scrobbled = false;

		this.pause();
		this.pop();
		this.play();
	}

	public previous() {
		const newTrack = this.historyStack.pop();
		if (!newTrack) return;
		this.realCurrent = 0;
		this.scrobbled = false;

		this.pause();
		this.innerOverrideQueue.playNext(this.current);
		this.current = newTrack;
		this.play();
	}

	public setCurrentTime(newTime:number) {
		this.currentElement?.setCurrentTime(newTime);
	}

	public pop() {
		let newTrack:SongData|undefined;
		if (this.innerOverrideQueue.length > 0) {
			newTrack = this.innerOverrideQueue.pop();
		} else {
			newTrack = this.innerQueue.pop();
		}
		if (!newTrack) return;
    
		this.historyStack.add(this.current);
		this.current = newTrack;
		//avoid autopopulation happening on going to next song when no repeat.
		if (this._repeat === Repeat.None) return;
		this.populate();
	}

	private empty = () => { this.innerQueue.empty(); };

	// prepare DOM so audio can preload using react
	private preload() {
		const toLoad = [this.current, ...this.get(5)];
		const tracks = new Set<string>(toLoad.map(track => track.musicDataPath));
		this.preloader.render(tracks);
	}

	private async populate() {

		if (this.innerQueue.length >= 50 || this.populating) return;
		this.populating = true;

		// ignore options and use incrementer if present
		if (this.incrementer) {
			if (!this.initialQueueUsed) {
				this.innerQueue.add(...this.initialQueue.slice(1));
				this.initialQueueUsed = true;
			}
			try {
				while (this.innerQueue.length < 50 && this.incrementer.isAlive) {
					this.innerQueue.add(...(await this.incrementer.getPage()).data);
					this.emit("update");
					this.preload();
				}
			} catch(err) {
				// stop populating if there is an empty items error
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					this.emit("update");
					this.preload();
					return;
				}
			}
			this.emit("update");
			this.preload();
			this.populating = false;
			return;
		}

		// if no shuffle make sure to add from the selected starting song, if shuffled dont add initial song to queue
		if (this.innerQueue.length === 0 && this._repeat === Repeat.All || this._repeat === Repeat.None && !this.innerQueue.length) {
			const curIndex = this.initialQueue.findIndex(track => track.musicDataPath === this.current.musicDataPath);
			if (!this._shuffle) {
				this.innerQueue.add(...this.initialQueue.slice(curIndex + 1));
			} else {
				const toAdd = [...this.initialQueue.slice(0, curIndex), ...this.initialQueue.slice(curIndex + 1)];
				this.innerQueue.add(...shuffleArray(toAdd));
			}
		}

		if (this._repeat !== Repeat.None) {
			while (this.innerQueue.length < 50) {

				if (this._repeat === Repeat.One) {
					this.innerQueue.add(this.current);
					continue;
				}
	
				if (this._shuffle) {
					this.innerQueue.add(...shuffleArray(this.initialQueue));
				} else {
					this.innerQueue.add(...this.initialQueue);
				}
			}
		}
		
		this.emit("update");
		this.preload();
		this.populating = false;

	}
  
	public get(count:number) {
		if (this.innerOverrideQueue.length >= count) {
			return this.innerOverrideQueue.get(count);
		}
		return [
			...this.innerOverrideQueue.get(this.innerOverrideQueue.length),
			...this.innerQueue.get(count - this.innerOverrideQueue.length)
		];
	}

	public playNext(track:SongData) {
		this.innerOverrideQueue.playNext(track);
		this.preload();
	}

	public addToQueue(track:SongData) {
		this.innerOverrideQueue.add(track);
		this.preload();
	}

	public removeFromQueue(trackIndex:number) {
		if (this.innerOverrideQueue.length > trackIndex) {
			this.innerOverrideQueue.remove(trackIndex);
		}
		this.innerQueue.remove(trackIndex - this.innerOverrideQueue.length);
	}

	private secondUpdate() {
		if (!this.isPlaying) return;
		this.realCurrent++;
		this.attemptScrobble();
	}

	private attemptScrobble() {
		if (!this.scrobbler.loggedIn || this.scrobbled || this.duration < 30 || this.realCurrent < this.duration / 2) return;
		this.scrobbled = true;
		this.scrobbler.scrobble(this.scrobbleInfo, this.duration);
	}

	get length() {
		return this.innerQueue.length + this.innerOverrideQueue.length;
	}

	get current() {
		return this._current;
	}

	private set current(track:SongData) {
		this.currentElement?.destroy();
		this._current = track;
		this.setCurrent(track);
		this.currentElement = new SongElement(this.current, this.youtube, this.setTimeData);
		this.currentElement.audioEmitter.on("ended", () => { this.emit("next"); this.emit("update"); });
	}

	get isPlaying() {
		return this._isPlaying;
	}

	get duration() {
		return Number(document.getElementById("ees-player-controls-time")?.dataset.duration ?? 0);
	}

	get scrobbleInfo() {
		return this._scrobbleInfo;
	}

	set scrobbleInfo(info:{artist:string, album:string, track:string}) {
		this._scrobbleInfo = info;
		this.scrobbler.nowPlaying(info, this.duration);
	}

	get priorityQueue() {
		return this.innerOverrideQueue.all;
	}

	get mainQueue() {
		return this.innerQueue.all.map((e) => {
			e.eesIndex += this.innerOverrideQueue.length;
			return e;
		});
	}

	get all() {
		return [
			...this.priorityQueue,
			...this.mainQueue
		];
	}

	set volume(volume:number) {
		this._volume = volume;
		this.currentElement?.setVolume(volume);
	}

	set shuffle(value:boolean) {
		this._shuffle = value;
		this.empty();
		this.populate();
	}
  
	set repeat(value:Repeat) {
		this._repeat = value;
		this.empty();
		this.populate();
	}

}

class InnerQueue {
	protected queue:SongData[] = [];

	public empty = () => { this.queue = []; };

	public add = (...songs:SongData[]) => this.queue.push(...songs);

	public pop = () => this.queue.shift();

	public get = (count:number) => this.queue.slice(0, count);

	public remove = (index:number) => this.queue.splice(index, 1);

	public playNext(song:SongData) {
		this.queue.unshift(song);
	}

	get length() {
		return this.queue.length;
	}

	get all() {
		return this.queue.map((e,i) => ({
			eesIndex: i,
			...e
		}));
	}

}

class HistoryStack {
	private stack:SongData[] = [];
  
	public add(song:SongData) {
		this.stack.push(song);
		if (this.length > 50) {
			this.stack.shift();
		}
	}

	public pop = () => this.stack.pop();

	get = (count:number) => this.stack.slice(-count);

	empty = () => { this.stack = []; };

	get length() {
		return this.stack.length;
	}
}