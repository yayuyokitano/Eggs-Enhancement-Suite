import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom/client';
import "./spa.scss";

export function createSpa() {
  const root = ReactDOM.createRoot(document.body);
  root.render(<SPA />);
}

function updateSpa(event:SyntheticEvent<HTMLIFrameElement, Event>) {
  const url = event.currentTarget.contentWindow?.location.href;
  console.log(url);
  if (typeof url !== "undefined") {
    history.pushState(null, "", url);
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
    <div id="ees-player">{Math.random()}</div>
  );
}