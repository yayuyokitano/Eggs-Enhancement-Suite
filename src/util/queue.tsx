import React from 'react';
import ReactDOM from 'react-dom/client';

import { shuffleArray } from "./util";
import { SongData, SourceType } from "./wrapper/eggs/artist";

import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { TimeData } from '../App/player/spa';


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
          <audio key={trackPath} data-path={trackPath} preload="auto">
            <source src={trackPath} type="audio/mpeg" />
          </audio>
        ))}
      </div>
    );
  }
}

type AudioEmitter = {
  ended: () => void;
}

class YoutubePlayer {
  private youtube:HTMLIFrameElement;
  private ready:Promise<boolean>;
  private audioEmitter:TypedEmitter<AudioEmitter>;
  private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>

  constructor(youtube:HTMLIFrameElement, track:SongData, audioEmitter:TypedEmitter<AudioEmitter>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>) {
    this.youtube = youtube;
    this.youtube.src = `https://www.youtube.com/embed/${track.youtubeVideoId}?enablejsapi=1&widgetid=1`;
    this.audioEmitter = audioEmitter;
    this.setTimeData = setTimeData;
    this.ready = new Promise((resolve) => {
      this.youtube.addEventListener('load', async () => {
        resolve(true);
        prepareYoutubeListeners(youtube);
      });
      window.addEventListener('message', (e) => this.handleEvent(e));
    });
  }

  private handleEvent(event:MessageEvent<any>) {
    if (event.origin !== 'https://www.youtube.com') {
      return;
    }
    const data = JSON.parse(event.data);
    switch (data.event) {
      case 'onStateChange':
        if (data.info === 0) {
          console.log(this);
          this.audioEmitter.emit("ended");
        }
        //onYoutubeStateChange(data);
        console.log("e");
        break;
      case 'infoDelivery':
        const timeElement = document.getElementById("ees-player-time");
        const curTimeData = {
          current: Number(timeElement?.dataset.current),
          duration: Number(timeElement?.dataset.duration)
        }

        this.setTimeData({
          current: data.info?.currentTime ?? curTimeData.current,
          duration: data.info?.duration ?? curTimeData.duration,
        })
        break;
    }
  }

  public destroy() {
    window.removeEventListener('message', this.handleEvent);
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
}

function prepareYoutubeListeners(youtube:HTMLIFrameElement) {
  let message = JSON.stringify({
    event: 'listening',
    id: "ees-youtube-container",
    channel: 'widget',
  });
  youtube?.contentWindow?.postMessage(message, 'https://www.youtube.com');

  message = JSON.stringify({
    event: 'command',
    func: 'addEventListener',
    args: ['onStateChange'],
    id: "ees-youtube-container",
    channel: 'widget',
  });
  youtube?.contentWindow?.postMessage(message, 'https://www.youtube.com');
}

class SongElement {

  private element:HTMLAudioElement|YoutubePlayer|undefined;
  private sourceType:SourceType;
  public audioEmitter = new EventEmitter() as TypedEmitter<AudioEmitter>;
  private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>

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
        })
        break;
      case SourceType.Youtube:
        if (!youtube.current) return;
        this.element = new YoutubePlayer(youtube.current, track, this.audioEmitter, this.setTimeData);
        break;
    }
  }

  private setEndEvent() {
    switch (this.sourceType) {
      case SourceType.Eggs:
        (this.element as HTMLAudioElement).onended = () => {this.audioEmitter.emit("ended")};
        break;
    }
  }

  public destroy() {
    if (this.sourceType === SourceType.Youtube) {
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

}

export class Queue {
  private innerQueue = new InnerQueue();
  private innerOverrideQueue = new InnerOverrideQueue();
  private initialQueue:SongData[];
  private _shuffle:boolean;
  private _repeat:Repeat;
  private _current:SongData;
  private preloader:DOMPreloader;
  private currentElement?:SongElement;
  private historyStack:HistoryStack;
  private setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>
  private youtube:React.RefObject<HTMLIFrameElement>;
  private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>

  constructor(initialQueue:SongData[], initialElement:SongData, root:ReactDOM.Root, shuffle:boolean, repeat:Repeat, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>) {
    this.initialQueue = initialQueue;
    this._shuffle = shuffle;
    this._repeat = repeat;
    this._current = initialElement;
    this.preloader = new DOMPreloader(root);
    this.historyStack = new HistoryStack();
    this.setCurrent = setCurrent;
    this.setTimeData = setTimeData;
    this.youtube = youtube;
    this.currentElement = new SongElement(this.current, this.youtube, this.setTimeData);

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
  }

  public play = () => { this.currentElement?.play(); }

  public pause = () => { this.currentElement?.pause(); }

  public next() {
    this.pause();
    this.pop();
    this.play();
  }

  public previous() {
    const newTrack = this.historyStack.pop();
    if (!newTrack) return;

    this.pause();
    this.playNext(this.current);
    this.current = newTrack;
    this.play();
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
    this.populate();
  }

  private empty = () => { this.innerQueue.empty(); }

  // prepare DOM so audio can preload using react
  private preload() {
    const toLoad = [this.current, ...this.get(5)];
    let tracks = new Set<string>(toLoad.map(track => track.musicDataPath));
    this.preloader.render(tracks);
  }

  private populate() {

    if (this._repeat === Repeat.None || this.innerQueue.length > 50) {
      return;
    }

    // if no shuffle make sure to add from the selected starting song, if shuffled dont add initial song to queue
    if (this._repeat === Repeat.All && !this.innerQueue.length) {
      const curIndex = this.initialQueue.findIndex(track => track.musicDataPath === this.current.musicDataPath);
      if (!this._shuffle) {
        this.innerQueue.add(...this.initialQueue.slice(curIndex + 1));
      } else {
        const toAdd = [...this.initialQueue.slice(0, curIndex), ...this.initialQueue.slice(curIndex + 1)];
        this.innerQueue.add(...shuffleArray(toAdd));
      }
    }

    while (this.innerQueue.length < 50) {

      if (this._repeat === Repeat.One) {
        this.innerQueue.add(this.current);
        continue;
      }

      if (this._shuffle) {
        this.innerQueue.add(...shuffleArray(this.initialQueue));
      } else {
        this.innerQueue.add(...this.initialQueue)
      }
    }
    this.preload();

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

  public playNext = (track:SongData) => { this.innerOverrideQueue.playNext(track); }

  public addToQueue =(track:SongData) => { this.innerOverrideQueue.add(track); }

  get length() {
    return this.innerQueue.length + this.innerOverrideQueue.length;
  }

  get current() {
    return this._current;
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

  private set current(track:SongData) {
    this._current = track;
    this.setCurrent(track);
    this.currentElement = new SongElement(this.current, this.youtube, this.setTimeData);
    this.currentElement.audioEmitter.on("ended", () => { this.next(); })
  }

}

class InnerQueue {
  protected queue:SongData[] = [];

  public empty = () => { this.queue = []; }

  public add = (...songs:SongData[]) => this.queue.push(...songs);

  public pop = () => this.queue.shift();

  public get = (count:number) => this.queue.slice(0, count);

  get length() {
    return this.queue.length;
  }

}

class InnerOverrideQueue extends InnerQueue {
  public playNext(song:SongData) {
    this.queue.unshift(song);
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

  empty = () => { this.stack = []; }

  get length() {
    return this.stack.length;
  }
}