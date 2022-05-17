import ReactDOM from "react-dom/client";

import { Queue, Repeat } from "../../util/queue";
import { SongData } from "../../util/wrapper/eggs/artist";
import { TimeData } from "./spa";

export function initializePlayback(root:ReactDOM.Root, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>) {
  const playbackController = new PlaybackController(root, true, Repeat.All, setCurrent, youtube, setTimeData);
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type !== "trackUpdate") {
      return;
    }
    switch(event.data.data.type) {
      case "setPlayback": 
        const track = event.data.data.track as SongData;
        const trackList = event.data.data.trackList as SongData[];
        playbackController.setPlayback(trackList, track);
        break;
    }
  });
  return playbackController;
}

export class PlaybackController {
  private queue:Queue|undefined;
  private shuffle:boolean;
  private repeat:Repeat;
  private root:ReactDOM.Root;
  private youtube:React.RefObject<HTMLIFrameElement>;
  private setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>;
  private setTimeData:React.Dispatch<React.SetStateAction<TimeData>>;

  constructor(root:ReactDOM.Root, shuffle:boolean, repeat:Repeat, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>, youtube:React.RefObject<HTMLIFrameElement>, setTimeData:React.Dispatch<React.SetStateAction<TimeData>>) {
    this.shuffle = shuffle;
    this.repeat = repeat;
    this.root = root;
    this.youtube = youtube;
    this.setCurrent = setCurrent;
    this.setTimeData = setTimeData;
  }

  public setPlayback(initialQueue:SongData[], initialElement:SongData) {
    this.queue?.destroy();
    this.queue = new Queue(initialQueue, initialElement, this.root, this.shuffle, this.repeat, this.setCurrent, this.youtube, this.setTimeData);
    this.play();
  }

  public play() {
    this.queue?.play();
  }

  public pause() {
    this.queue?.pause();
  }

  public next() {
    this.queue?.next();
  }

  public previous() {
    this.queue?.previous();
  }

  public setCurrentTime(percentage:number) {
    this.queue?.setCurrentTime(percentage * this.duration);
  }

  get current() {
    return this.queue?.current;
  }

  get duration() {
    return Number(document.getElementById("ees-player-controls-time")?.dataset.duration ?? 0);
  }

  get isPlaying() {
    return this.queue?.isPlaying;
  }
}
