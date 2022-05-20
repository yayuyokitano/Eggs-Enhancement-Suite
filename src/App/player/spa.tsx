import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { convertTime, defaultAvatar, lastfmAuthLink } from '../../util/util';
import { SongData } from '../../util/wrapper/eggs/artist';
import { initializePlayback, PlaybackController } from './playback';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import "./spa.scss";
import { Repeat } from '../../util/queue';
import { LastFMIcon } from '../../util/icons';
import LastFM from "lastfm-typed";
import { getInfo as TrackInfo } from "lastfm-typed/dist/interfaces/trackInterface";
import browser from 'webextension-polyfill';
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

export interface TimeData {
  current: number;
  duration: number;
}

function Player() {

  const [playbackController, setPlaybackController] = useState<PlaybackController>();
  const [current, setCurrent] = useState<SongData>();
  const [timeData, setTimeData] = useState<TimeData>({
    current: 0,
    duration: 0
  });
  const [shuffle, setShuffle] = useState(true);
  const [repeat, setRepeat] = useState(Repeat.All);
  const youtubeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (root) return;
    root = ReactDOM.createRoot(document.getElementById("ees-audio-container")!);
    setPlaybackController(initializePlayback(root, setCurrent, youtubeRef, setTimeData, setShuffle, setRepeat));
  }, []);

  useEffect(() => { updateScrollables(); }, [current]);

  return (
    <div id="ees-player">
      <img id="ees-player-thumbnail" src={current?.imageDataPath ?? current?.artistData.imageDataPath ?? defaultAvatar} />
      <div id="ees-player-metadata">
        <span id="ees-player-title" className="ees-scroll-container"><span>{current?.musicTitle}</span></span>
        <span id="ees-player-artist" className="ees-scroll-container"><span>{current?.artistData.displayName}</span></span>
      </div>
      <div id="ees-player-controls">
        <div id="ees-player-controls-buttons">
          <LastFMButton track={current} />
          <button type="button" id="ees-shuffle" className="ees-navtype" data-state={shuffle} onClick={() => playbackController?.toggleShuffle()}><ShuffleRoundedIcon /></button>
          <button type="button" id="ees-prev" className="ees-playnav" onClick={() => {playbackController?.previous()}}><SkipPreviousRoundedIcon /></button>
          <button type="button" id="ees-play" className={`ees-playpause ${playbackController?.isPlaying ? "ees-hidden":""}`} onClick={() => {playbackController?.play()}}><PlayArrowRoundedIcon /></button>
          <button type="button" id="ees-pause" className={`ees-playpause ${playbackController?.isPlaying ? "":"ees-hidden"}`} onClick={() => {playbackController?.pause()}}><PauseRoundedIcon /></button>
          <button type="button" id="ees-next" className="ees-playnav" onClick={() => {playbackController?.next()}}><SkipNextRoundedIcon /></button>
          <button type="button" id="ees-repeat" className="ees-navtype" data-state={repeat} onClick={() => playbackController?.cycleRepeat()}>{
            repeat === Repeat.One ?
            <RepeatOneRoundedIcon /> :
            <RepeatRoundedIcon />
          }</button>
        </div>
        <div id="ees-player-controls-time" data-current={timeData?.current} data-duration={timeData?.duration}>
          <span id="ees-player-current-time">{convertTime(timeData?.current ?? 0)}</span>
          <progress value={timeData?.current} max={timeData?.duration} onClick={(e) => { 
            playbackController?.setCurrentTime((e.clientX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth);
          }} />
          <span id="ees-player-duration">{convertTime(timeData?.duration ?? 0)}</span>
        </div>
      </div>
      <div id="ees-audio-container" />
      <iframe id="ees-youtube-container" ref={youtubeRef}></iframe>
    </div>
  );
}

function LastFMButton(props: { track: SongData|undefined }) {
  const {track} = props;

  const [sk, setSk] = useState("");

  useEffect(() => {
    if (sk) return;
    browser.storage.local.get("lastfmToken").then((token) => {
      if (!token.lastfmToken) return;
      setSk(token.lastfmToken);
    });
  }, []);

  if (!sk) return (
    <a 
      id="ees-lastfm"
      className="ees-navtype ees-disabled"
      href={lastfmAuthLink()}
    >
      <LastFMIcon />
    </a>
  );
  
  return <button type="button" id="ees-lasfm" className="ees-navtype"><LastFMIcon /></button>
}
