import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { SongData } from '../../util/wrapper/eggs/artist';
import { setPlayback } from './playback';
import "./spa.scss";

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
      setPlayback(track);
      break;
  }
});

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
  return (
    <div id="ees-player">
      <span id="ees-state">{Math.random()}</span>
    </div>
  );
}