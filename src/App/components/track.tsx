import { defaultAvatar } from "../../util/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import "./track.scss";

function setPlayback(track:SongData) {
  window.postMessage({
    type: "trackUpdate",
    data: {
      type: "setPlayback",
      track
    }
  }, "*");
}

export function Track(props:{track:SongData, size:"normal"}) {
  const {track, size} = props;
  return (
    <li
      key={track.musicId}
      className={`ees-track ees-track-${size}`}
      onClick={() => {setPlayback(track)}}
    >
      <img className="ees-track-thumb" src={track.imageDataPath ?? track.artistData.imageDataPath ?? defaultAvatar} alt="" />
      <p>{track.musicTitle}</p>
    </li>
  )
}