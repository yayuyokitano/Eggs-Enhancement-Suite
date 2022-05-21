import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { convertTime, defaultAvatar, lastfmAuthLink, processAlbumName, processArtistName, processTrackName } from '../../util/util';
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
import { apiKey, apiSecret, userAgent } from '../../util/scrobbler';
import "../../i18n/config";
import { TFunction, useTranslation } from 'react-i18next';
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

  const {t, i18n} = useTranslation(["global"]);

  useEffect(() => {
    function handleMessage(message:any) {
      if (message.type === "changeLanguage") {
        console.log("change language to " + message.lang);
        i18n.changeLanguage(message.lang);
      }
    }
    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    }
  });

  return (
    <div>
      <iframe
        id="ees-spa-iframe"
        src={window.location.href}
        onLoad={updateSpa}
      />
      <Player t={t} />
    </div>
  );
}

export interface TimeData {
  current: number;
  duration: number;
}

function Player(props:{ t:TFunction }) {
  const { t } = props;

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
          <LastFMButton track={current} t={t} playbackController={playbackController} />
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

function LastFMButton(props: { track: SongData|undefined, t:TFunction, playbackController:PlaybackController|undefined}) {
  const { track, t, playbackController } = props;

  const [sk, setSk] = useState("");
  const [lastfmTrack, setLastfmTrack] = useState<TrackInfo>();
  const [processedTrack, setProcessedTrack] = useState({
    track: "",
    album: "",
    artist: ""
  });

  const lastfm = new LastFM(apiKey, {
    apiSecret,
    userAgent
  })

  useEffect(() => {
    if (sk) return;
    browser.storage.local.get("lastfmToken").then((token) => {
      if (!token.lastfmToken) return;
      setSk(token.lastfmToken);
    });
  }, []);

  useEffect(() => {

    if (!track) {
      setProcessedTrack({
        track: "",
        album: "",
        artist: "",
      });
      return;
    }

    try {
      browser.storage.sync.get(track.musicId).then((e) => {
        setTrack(e[track.musicId], track, lastfm, sk, setLastfmTrack, setProcessedTrack, playbackController);
      })
      .catch((e) => console.log(e));
    } catch(e) {
      setTrack(null, track, lastfm, sk, setLastfmTrack, setProcessedTrack, playbackController)
    }
    
  }, [track]);

  useEffect(() => {
    if (!playbackController) return;
    playbackController.scrobbleInfo = processedTrack;
  }, [processedTrack]);

  if (!sk) return (
    <a 
      id="ees-lastfm"
      className="ees-navtype ees-disabled"
      href={lastfmAuthLink()}
    >
      <LastFMIcon />
    </a>
  );
  
  return (
    <details id="ees-lastfm-edit">
      <div id="ees-lastfm-edit-window" onKeyDown={(e) => {onKeyDown(e, track)}}>
        <label htmlFor="ees-lastfm-edit-track">{t("general.song.singular")}</label>
        <input type="text" id="ees-lastfm-edit-track" name="track" defaultValue={processedTrack.track} />
        <label htmlFor="ees-lastfm-edit-album">{t("general.album.singular")}</label>
        <input type="text" id="ees-lastfm-edit-album" name="album" defaultValue={processedTrack.album} />
        <label htmlFor="ees-lastfm-edit-artist">{t("general.artist.singular")}</label>
        <input type="text" id="ees-lastfm-edit-artist" name="artist" defaultValue={processedTrack.artist} />
        <button type="button" id="ees-lastfm-submit-edit" onClick={() => {saveEdit(track, setProcessedTrack)}}>{t("general.confirm")}</button>
      </div>
      <summary id="ees-lastfm" className="ees-navtype">
        <LastFMIcon />
        <div id="ees-lastfm-playcount" data-displayed={lastfmTrack?.userplaycount || lastfmTrack?.userplaycount === 0}>
          {
            lastfmTrack?.userplaycount || lastfmTrack?.userplaycount === 0 ?
            <PlayArrowRoundedIcon /> : <></>
          }
          <span>{lastfmTrack?.userplaycount}</span>
        </div>
      </summary>
    </details>
  );
}

window.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("#ees-lastfm-edit")) return;
  (window.document.getElementById("ees-lastfm-edit") as HTMLDetailsElement)?.removeAttribute("open");
});

window.addEventListener("blur", () => {
  (window.document.getElementById("ees-lastfm-edit") as HTMLDetailsElement)?.removeAttribute("open");
});

function onKeyDown(e:React.KeyboardEvent<HTMLDivElement>, track:SongData|undefined) {
  if (e.key !== "Enter" || e.keyCode === 229) return; //keycode 229 indicates IME is being used atm. Dont submit.
  updateSongMetadata(track);
}

function updateSongMetadata(track:SongData|undefined) {
  console.log(track);
}

function saveEdit(track:SongData|undefined, setProcessedTrack:React.Dispatch<React.SetStateAction<{
  track: string;
  album: string;
  artist: string;
}>>) {
  if (!track) return;
  const editedTrack = {
    track: (document.getElementById("ees-lastfm-edit-track") as HTMLInputElement)?.value,
    album: (document.getElementById("ees-lastfm-edit-album") as HTMLInputElement)?.value ?? "",
    artist: (document.getElementById("ees-lastfm-edit-artist") as HTMLInputElement)?.value,
  }
  if (!editedTrack.track || !editedTrack.track) return;
  (document.getElementById("ees-lastfm-edit") as HTMLDetailsElement)?.removeAttribute("open");
  try {
    browser.storage.sync.set({
      [track.musicId]: editedTrack
    });
    setProcessedTrack(editedTrack);
  } catch(e) {
    console.log("Failed to save edit.");
    console.error(e);
  }
}

function setTrack(
  edit:{
    artist:string,
    album:string,
    track:string,
  }|null,
  track:SongData,
  lastfm:LastFM, sk:string,
  setLastfmTrack:React.Dispatch<React.SetStateAction<TrackInfo | undefined>>,
  setProcessedTrack:React.Dispatch<React.SetStateAction<{
    track: string;
    album: string;
    artist: string;
  }>>,
  playbackController:PlaybackController|undefined
){
  let newTrack = {
    track: "",
    album: "",
    artist: "",
  }

  if (edit) {
    newTrack = {
      track: edit.track,
      album: edit?.album,
      artist: edit?.artist,
    };
  }

  lastfm.track.getInfo(lastfm.helper.TrackFromName(newTrack.artist || track.artistData.displayName, newTrack.track || processTrackName(track.musicTitle)), {
    sk
  }).then(lfmTrack => {
    setLastfmTrack(lfmTrack);
    
    if (!edit) {
      newTrack = {
        track: processTrackName(track.musicTitle),
        album: processAlbumName(lfmTrack?.album?.title),
        artist: processArtistName(track.artistData.displayName),
      };
    }

    setProcessedTrack(newTrack);
    if (!playbackController) return;
    playbackController.scrobbleInfo = newTrack;

  }).catch(() => {

    setLastfmTrack(undefined);
    if (!edit) {
      newTrack = {
        track: processTrackName(track.musicTitle),
        album: "",
        artist: processArtistName(track.artistData.displayName),
      }
    }
    
    setProcessedTrack(newTrack);
    if (!playbackController) return;
    playbackController.scrobbleInfo = newTrack;

  });
}
