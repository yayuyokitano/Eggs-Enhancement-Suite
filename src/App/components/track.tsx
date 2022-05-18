import { defaultAvatar } from "../../util/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ModeCommentRoundedIcon from '@mui/icons-material/ModeCommentRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import "./track.scss";
import { TFunction } from "react-i18next";
import { useEffect, useState } from "react";
import { likeSong, songLikeInfo } from "../../util/wrapper/eggs/evaluation";

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

function playNext(track:SongData) {
  window.parent.postMessage({
    type: "trackUpdate",
    data: {
      type: "playNext",
      track
    }
  }, "*");
}

function addToQueue(track:SongData) {
  window.parent.postMessage({
    type: "trackUpdate",
    data: {
      type: "addToQueue",
      track
    }
  }, "*");
}

export function Track(props:{track:SongData, size:"normal", z:number, t:TFunction, isLiked:boolean, toggleLiked:(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, trackID: string) => void}) {
  const {track, size, z, t, isLiked, toggleLiked} = props;

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
      <div className="ees-track-right">
        <button type="button" className="ees-track-like" data-liked={isLiked} onClick={(e) => {toggleLiked(e, track.musicId)}}>
          {
            isLiked ?
            <FavoriteRoundedIcon /> :
            <FavoriteBorderRoundedIcon />
          }
        </button>
      </div>
      <details style={{zIndex: z}} className="ees-track-expandable">
          <summary><MoreVertRoundedIcon /></summary>
          <ul className="ees-track-menu">
            <li onClick={() => { playNext(track) }}>{t("track.playNext")}</li>
            <li onClick={() => { addToQueue(track) }}>{t("track.addToQueue")}</li>
            <li onClick={() => { (document.querySelector("#ees-playlist-dialog") as HTMLDialogElement).showModal(); }}>Add to playlist</li>
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


});

function createToggleLiked(likedTracks:string[], setLikedTracks:React.Dispatch<React.SetStateAction<string[]>>) {
  return (e:React.MouseEvent<HTMLButtonElement, MouseEvent>, trackID:string) => {
    e.stopPropagation();
    const isLiked = likedTracks.includes(trackID);
    const newLikedTracks = isLiked ? likedTracks.filter((t) => t !== trackID) : [...likedTracks, trackID];
    setLikedTracks(newLikedTracks);
    likeSong(trackID);
  }
}

export function TrackContainer(props: {data:SongData[]|undefined, t:TFunction}) {
  const {data, t} = props;
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    songLikeInfo(data.map((track) => track.musicId)).then((likedTracks) => {
        const likedTrackList = likedTracks.data
          .filter((track) => track.isLike)
          .map((track) => track.musicId);
        setLikedTracks(likedTrackList);
    });
  }, []);

  return (
    <ul id="ees-song-list" className="ees-track-container">
      {data?.map((song, i) => (
        <Track
          track={song}
          size="normal"
          z={data.length-i}
          t={t}
          isLiked={likedTracks.includes(song.musicId)}
          toggleLiked={createToggleLiked(likedTracks, setLikedTracks)}
        />
      ))}
    </ul>
  );
}