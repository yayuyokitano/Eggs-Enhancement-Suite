import EventEmitter from "events";
import ReactDOM from "react-dom/client";
import TypedEmitter from "typed-emitter";

import { Queue, Repeat } from "../../util/queue";
import { SongData } from "../../util/wrapper/eggs/artist";
import { TimeData } from "./types";

export function initializePlayback(root:ReactDOM.Root, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>, setShuffle:React.Dispatch<React.SetStateAction<boolean>>, setRepeat:React.Dispatch<React.SetStateAction<Repeat>>) {
  const playbackController = new PlaybackController(root, true, Repeat.All, setCurrent, youtube, setTimeData, setShuffle, setRepeat);
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type !== "trackUpdate") {
      return;
    }
    switch(event.data.data.type) {
      case "setPlayback": {
        const track = event.data.data.track as SongData;
        const trackList = event.data.data.trackList as SongData[];
        playbackController.setPlayback(trackList, track);
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
}

export class PlaybackController extends (EventEmitter as new () => TypedEmitter<PlaybackEmitters>) {
  private queue:Queue|undefined;
  private shuffle:boolean;
  private repeat:Repeat;
  private root:ReactDOM.Root;
  private youtube:React.RefObject<HTMLIFrameElement>;
  private setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>;
  private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>;
  private setShuffle:React.Dispatch<React.SetStateAction<boolean>>;
  private setRepeat:React.Dispatch<React.SetStateAction<Repeat>>;

  constructor(root:ReactDOM.Root, shuffle:boolean, repeat:Repeat, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>, setShuffle:React.Dispatch<React.SetStateAction<boolean>>, setRepeat:React.Dispatch<React.SetStateAction<Repeat>>) {
    super();
    this.shuffle = shuffle;
    this.repeat = repeat;
    this.root = root;
    this.youtube = youtube;
    this.setCurrent = setCurrent;
    this.setTimeData = setTimeData;
    this.setShuffle = setShuffle;
    this.setRepeat = setRepeat;
  }

  public setPlayback(initialQueue:SongData[], initialElement:SongData) {
    this.queue?.destroy();
    this.queue = new Queue(initialQueue, initialElement, this.root, this.shuffle, this.repeat, this.setCurrent, this.youtube, this.setTimeData);
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
    this.queue?.next();
    this.emit("update");
  }

  public previous() {
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
  }

  public skipTo(n:number) {
    for (let i = 0; i <= n; i++) {
      this.next();
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

  set scrobbleInfo(scrobble:{artist:string, track:string, album:string}) {
    if (!this.queue) return;
    this.queue.scrobbleInfo = scrobble;
  }

  get current() {
    return this.queue?.current;
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
}
