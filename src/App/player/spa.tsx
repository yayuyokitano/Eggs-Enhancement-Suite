import React, { SyntheticEvent, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { initializePlayback, PlaybackController } from './playback';
import "./spa.scss";
var root:ReactDOM.Root;

export function createSpa() {
  const root = ReactDOM.createRoot(document.body);
  root.render(<SPA />);
}

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

  let playbackController:PlaybackController;

  useEffect(() => {
    if (root) return;
    root = ReactDOM.createRoot(document.getElementById("ees-audio-container")!);
    playbackController = initializePlayback(playbackController, root);
  }, [])

  return (
    <div id="ees-player">
      <span id="ees-state">{Math.random()}</span>
      <button id="ees-play" onClick={() => {playbackController.play()}}>Play</button>
      <button id="ees-pause" onClick={() => {playbackController.pause()}}>Pause</button>
      <button id="ees-prev" onClick={() => {playbackController.previous()}}>Prev</button>
      <button id="ees-next" onClick={() => {playbackController.next()}}>Next</button>
      <div id="ees-audio-container" />
    </div>
  );
}