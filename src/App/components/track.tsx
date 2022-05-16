import { defaultAvatar } from "../../util/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ModeCommentRoundedIcon from '@mui/icons-material/ModeCommentRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import "./track.scss";
import zIndex from "@mui/material/styles/zIndex";

function setPlayback(e:React.MouseEvent<HTMLLIElement, MouseEvent>, track:SongData) {
  if ((e.target as HTMLElement)?.closest(".ees-track-expandable")) return;

  const trackElements = e.currentTarget.closest(".ees-track-container")?.querySelectorAll(".ees-track");
  if (!trackElements) return;

  let trackList:SongData[] = [];
  for (const trackElement of trackElements) {
    if (!(trackElement instanceof HTMLElement)) continue;
    if (trackElement.dataset.track) trackList.push(JSON.parse(trackElement.dataset.track ?? "{}"));
  }

  window.parent.postMessage({
    type: "trackUpdate",
    data: {
      type: "setPlayback",
      track,
      trackList
    }
  }, "*");
}

export function Track(props:{track:SongData, size:"normal", z:number}) {
  const {track, size, z} = props;
  return (
    <li
      key={track.musicId}
      className={`ees-track ees-track-${size}`}
      data-track={JSON.stringify(track)}
      onClick={(e) => {setPlayback(e, track)}}
    >
      <img className="ees-track-thumb" src={track.imageDataPath ?? track.artistData.imageDataPath ?? defaultAvatar} alt="" />
      <div className="ees-track-info">
        <span className="ees-track-title">{track.musicTitle}</span>
        <span className="ees-artist-name">{track.artistData.displayName}</span>
        <div className="ees-track-details">
          <div>
            <PlayArrowRoundedIcon className="ees-data-icon" />
            <span className="ees-data-count">{track.numberOfMusicPlays}</span>
          </div>
          <div>
            <FavoriteRoundedIcon className="ees-data-icon" />
            <span className="ees-data-count">{track.numberOfLikes}</span>
          </div>
          <div>
            <ModeCommentRoundedIcon className="ees-data-icon" />
            <span className="ees-data-count">{track.numberOfComments}</span>
          </div>
          

        </div>
      </div>
      <details style={{zIndex: z}} className="ees-track-expandable">
        <summary><MoreVertRoundedIcon /></summary>
        <ul className="ees-track-menu">
          <li>hallo</li>
          <li>hallo</li>
          <li>hallo</li>
          <li>hallo</li>
          <li>hallo</li>
          <li>hallo</li>
        </ul>
      </details>
    </li>
  )
}

document.addEventListener("click", (e) => {
  const targetDetails = (e.target as HTMLElement)?.closest(".ees-track-expandable");
  const summaryDetails = (e.target as HTMLElement)?.closest("summary");
  const isOpen = targetDetails?.hasAttribute("open");
  document.querySelectorAll(".ees-track-expandable").forEach((details) => {
    details.removeAttribute("open");
  });

  if (summaryDetails && isOpen) {
    e.preventDefault();
  }


})