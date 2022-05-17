import ReactDOM from "react-dom/client";

import { Queue, Repeat } from "../../util/queue";
import { SongData } from "../../util/wrapper/eggs/artist";

export function initializePlayback(root:ReactDOM.Root, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>) {
  const playbackController = new PlaybackController(root, true, Repeat.All, setCurrent);
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
  private setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>

  constructor(root:ReactDOM.Root, shuffle:boolean, repeat:Repeat, setCurrent:React.Dispatch<React.SetStateAction<SongData | undefined>>) {
    this.shuffle = shuffle;
    this.repeat = repeat;
    this.root = root;
    this.setCurrent = setCurrent;
  }

  public setPlayback(initialQueue:SongData[], initialElement:SongData) {
    this.queue?.destroy();
    this.queue = new Queue(initialQueue, initialElement, this.root, this.shuffle, this.repeat, this.setCurrent);
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

  get current() {
    return this.queue?.current;
  }
}
