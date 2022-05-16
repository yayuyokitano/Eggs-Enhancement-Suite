import { defaultAvatar } from "../../util/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ModeCommentRoundedIcon from '@mui/icons-material/ModeCommentRounded';
import "./track.scss";

function setPlayback(e:React.MouseEvent<HTMLLIElement, MouseEvent>, track:SongData) {

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

export function Track(props:{track:SongData, size:"normal"}) {
  const {track, size} = props;
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
    </li>
  )
}