import { Queue, Repeat } from "../../util/queue";
import { SongData } from "../../util/wrapper/eggs/artist";

export function initializePlayback() {
  const playbackController = new PlaybackController(document.getElementById("ees-audio-container")!, true, Repeat.All);
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    console.log("ping: ", event.data);
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
}

class PlaybackController {
  queue:Queue|undefined;
  shuffle:boolean;
  repeat:Repeat;
  root:HTMLElement;

  constructor(root:HTMLElement, shuffle:boolean, repeat:Repeat) {
    this.shuffle = shuffle;
    this.repeat = repeat;
    this.root = root;
  }

  public setPlayback(initialQueue:SongData[], initialElement:SongData) {
    this.queue = new Queue(initialQueue, initialElement, this.root, this.shuffle, this.repeat);
  }
}
