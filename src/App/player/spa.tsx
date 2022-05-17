import React, { SyntheticEvent, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { defaultAvatar } from '../../util/util';
import { SongData } from '../../util/wrapper/eggs/artist';
import { initializePlayback, PlaybackController } from './playback';
import "./spa.scss";
var root:ReactDOM.Root;

export function createSpa() {
  const root = ReactDOM.createRoot(document.body);
  root.render(<SPA />);
}

function updateScrollables() {
  for (const scrollContainer of document.querySelectorAll(".ees-scroll-container") as NodeListOf<HTMLElement>) {
    const scrollable = scrollContainer.firstElementChild;
    if (!scrollable) return;
    if (scrollContainer.clientWidth < scrollable.clientWidth) {
      scrollable.classList.add("ees-scroll-animated");
    } else {
      scrollable.classList.remove("ees-scroll-animated");
    }
  }
}

window.addEventListener("resize", updateScrollables);

function updateSpa(event:SyntheticEvent<HTMLIFrameElement, Event>) {
  const url = event.currentTarget.contentWindow?.location.href;
  if (typeof url !== "undefined") {
    history.replaceState(null, "", url);
  }
}

function SPA() {
  return (
    <div>
      <iframe
        id="ees-spa-iframe"
        src={window.location.href}
        onLoad={updateSpa}
      />
      <Player />
    </div>
  );
}

function Player() {

  const [playbackController, setPlaybackController] = useState<PlaybackController>();
  const [current, setCurrent] = useState<SongData>();

  useEffect(() => {
    if (root) return;
    root = ReactDOM.createRoot(document.getElementById("ees-audio-container")!);
    setPlaybackController(initializePlayback(root, setCurrent));
  }, []);

  useEffect(() => { updateScrollables(); }, [current]);

  return (
    <div id="ees-player">
      <img id="ees-player-thumbnail" src={current?.imageDataPath ?? defaultAvatar} />
      <div id="ees-player-metadata">
        <span id="ees-player-title" className="ees-scroll-container"><span>{current?.musicTitle}</span></span>
        <span id="ees-player-artist" className="ees-scroll-container"><span>{current?.artistData.displayName}</span></span>
      </div>
      <span id="ees-state">{Math.random()}</span>
      <button id="ees-play" onClick={() => {playbackController?.play()}}>Play</button>
      <button id="ees-pause" onClick={() => {playbackController?.pause()}}>Pause</button>
      <button id="ees-prev" onClick={() => {playbackController?.previous()}}>Prev</button>
      <button id="ees-next" onClick={() => {playbackController?.next()}}>Next</button>
      <div id="ees-audio-container" />
    </div>
  );
}