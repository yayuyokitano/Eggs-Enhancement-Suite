import { SongData } from "util/wrapper/eggs/artist";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./details.scss";
import { TFunction } from "react-i18next";

function openTrackImage() {
  const dialog = document.getElementById("ees-cover-expanded") as HTMLDialogElement;
  dialog.showModal();
}

function attemptCloseTrackImage(e:React.MouseEvent<HTMLDivElement, MouseEvent>) {
  const target = e.target as HTMLElement;
  if (target.closest("#ees-cover-expanded") && target.id !== "ees-cover-expanded") return;
  const dialog = document.getElementById("ees-cover-expanded") as HTMLDialogElement;
  dialog.close();
}

function forceCloseTrackImage() {
  const dialog = document.getElementById("ees-cover-expanded") as HTMLDialogElement;
  dialog.close();
}

function downloadTrackImage(track?:SongData) {
  const url = track?.imageDataPath ?? track?.artistData.imageDataPath ?? "";
  const elem = document.createElement("a");
  elem.href = url;
  elem.download = url;
  elem.click();
}

export default function Details(props:{track?:SongData, t:TFunction}) {
  const { track, t } = props;
  return (
    <div id="ees-player-details" onClick={attemptCloseTrackImage}>

      <div id="ees-player-details-inner">
        <h2 id="ees-player-details-title">{track?.musicTitle}</h2>
        <p id="ees-player-details-artist">{track?.artistData.displayName}</p>

        <button type="button" id="ees-player-details-cover" onClick={(e) => { openTrackImage(); e.stopPropagation(); }}>
          <img src={track?.imageDataPath ?? track?.artistData.imageDataPath ?? ""} alt="" height="300" />
          <div id="ees-player-details-cover-expand">
            <OpenInFullRoundedIcon />
          </div>
        </button>

        <h3 id="ees-player-details-lyrics">{t("track.lyrics")}</h3>
        <p id="ees-player-details-lyrics-text"><Lyrics track={track} t={t} /></p>
      </div>

      <dialog id="ees-cover-expanded">
        <img src={track?.imageDataPath ?? track?.artistData.imageDataPath ?? ""} alt="" />
        <div id="ees-cover-expanded-buttons">
          <button type="button" id="ees-cover-expanded-buttons-download" onClick={() => { downloadTrackImage(track) }}>
            <DownloadRoundedIcon />
          </button>
          <button type="button" id="ees-cover-expanded-buttons-close" onClick={forceCloseTrackImage}>
            <CloseRoundedIcon />
          </button>
        </div>
      </dialog>
    </div>
    
  );
}

function Lyrics(props:{track?:SongData, t:TFunction}) {
  const { track, t } = props;
  console.log(track);
  if (!track?.lyrics) return <div id="ees-player-details-lyrics-text"><p>{t("track.lyricsNotFound")}</p></div>

  return (
    <div id="ees-player-details-lyrics-wrapper">
      <p>{t("track.composer")}{track.composer || track.cmoComposer || "--"}</p>
      <p>{t("track.lyricist")}{track.lyricist || track.cmoLyricist || "--"}</p>
      <div id="ees-player-details-lyrics-text">
        {track.lyrics.split("\r\n\r\n").map((paragraph) => {
          return <p>{paragraph}</p>;
        })}
      </div>
    </div>
  )
}
