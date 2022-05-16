import React from 'react';
import ReactDOM from 'react-dom/client';

import { shuffleArray } from "./util";
import { SongData } from "./wrapper/eggs/artist";

export enum Repeat {
  None = 0,
  All,
  One
}

class DOMPreloader {
  private root:ReactDOM.Root;

  constructor(root:HTMLElement) {
    this.root = ReactDOM.createRoot(root);
  }

  public render(tracks:Set<string>) {
    this.root.render(
      <div>
        {[...tracks].map(trackPath => (
          <audio key={trackPath} preload="auto">
            <source src={trackPath} type="audio/mpeg" />
          </audio>
        ))}
      </div>
    );
  }


}

export class Queue {
  private innerQueue = new InnerQueue();
  private innerOverrideQueue = new InnerOverrideQueue();
  private initialQueue:SongData[];
  private _shuffle:boolean;
  private _repeat:Repeat;
  private current:SongData;
  private preloader:DOMPreloader;

  constructor(initialQueue:SongData[], initialElement:SongData, root:HTMLElement, shuffle:boolean, repeat:Repeat) {
    this.initialQueue = initialQueue;
    this._shuffle = shuffle;
    this._repeat = repeat;
    this.current = initialElement;
    this.preloader = new DOMPreloader(root);
    this.populate();
  }

  public pop() {
    let newTrack:SongData|undefined;
    if (this.innerOverrideQueue.length > 0) {
      newTrack = this.innerOverrideQueue.pop();
    } else {
      newTrack = this.innerQueue.pop();
    }
    if (newTrack) {
      this.current = newTrack;
      this.populate();
    }
  }

  public set shuffle(value:boolean) {
    this.shuffle = value;
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