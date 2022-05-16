import React from 'react';
import ReactDOM from 'react-dom/client';

import { shuffleArray } from "./util";
import { SongData } from "./wrapper/eggs/artist";

import EventEmitter from "events"
import TypedEmitter from "typed-emitter"

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

class SongElement {
  private element:HTMLAudioElement;
  public audioEmitter = new EventEmitter() as TypedEmitter<AudioEmitter>;
  constructor(url:string) {
    this.element = new Audio(url);
  }

  public play() {
    this.element.play();
    this.element.onended = () => {this.audioEmitter.emit("ended")};
  }

  public pause() {
    this.element.pause();
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

  constructor(initialQueue:SongData[], initialElement:SongData, root:ReactDOM.Root, shuffle:boolean, repeat:Repeat) {
    this.initialQueue = initialQueue;
    this._shuffle = shuffle;
    this._repeat = repeat;
    this._current = initialElement;
    this.preloader = new DOMPreloader(root);
    this.currentElement = new SongElement(this.current.musicDataPath);
    this.historyStack = new HistoryStack();
    this.populate();
  }

  public destroy() {
    this.pause();
    this.empty();
    this.innerOverrideQueue.empty();
    this.historyStack.empty();
    delete this.currentElement;
  }

  public play() {
    this.currentElement?.play();
  }

  public pause() {
    this.currentElement?.pause();
  }

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

  private get current() {
    return this._current;
  }

  private set current(track:SongData) {
    this._current = track;
    this.currentElement = new SongElement(this.current.musicDataPath);
    this.currentElement.audioEmitter.on("ended", () => { this.next(); })
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

  public set shuffle(value:boolean) {
    this._shuffle = value;
    this.empty();
    this.populate();
  }
  
  public set repeat(value:Repeat) {
    this._repeat = value;
    this.empty();
    this.populate();
  }

  private empty() {
    this.innerQueue.empty();
  }

  // prepare DOM so audio can preload using react
  private preload() {
    const toLoad = [this.current, ...this.get(5)];
    let tracks = new Set<string>(toLoad.map(track => track.musicDataPath));
    this.preloader.render(tracks);
  }

  private populate() {
    if (this._repeat === Repeat.None) {
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

  public get length() {
    return this.innerQueue.length + this.innerOverrideQueue.length;
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
  }

  public addToQueue(track:SongData) {
    this.innerOverrideQueue.add(track);
  }
}

class InnerQueue {
  protected queue:SongData[] = [];
  public get length() {
    return this.queue.length;
  }

  public empty() {
    this.queue = [];
  }

  public add(...songs:SongData[]) {
    this.queue.push(...songs);
  }

  public pop() {
    return this.queue.shift();
  }

  public get(count:number) {
    return this.queue.slice(0, count);
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

  public pop() {
    return this.stack.pop();
  }

  get length() {
    return this.stack.length;
  }

  get(count:number) {
    return this.stack.slice(-count);
  }

  empty() {
    this.stack = [];
  }
}