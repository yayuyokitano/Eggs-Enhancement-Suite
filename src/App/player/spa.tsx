import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom/client';
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