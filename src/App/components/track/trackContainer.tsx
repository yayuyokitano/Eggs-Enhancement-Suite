import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { SongData } from "../../../util/wrapper/eggs/artist";
import "./track.scss";
import Track from "./track";
import { songLikeInfo, likeSong } from "../../../util/wrapper/eggs/evaluation";

export default function TrackContainer(props: {data:SongData[]|undefined, t:TFunction}) {
  const {data, t} = props;
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    
    songLikeInfo(data.map((track) => track.musicId)).then((likedTracks) => {
      const likedTrackList = likedTracks.data
        .filter((track) => track.isLike)
        .map((track) => track.musicId);
      setLikedTracks(likedTrackList);
    }).catch(() => {
      setLikedTracks([]);
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

function createToggleLiked(likedTracks:string[], setLikedTracks:React.Dispatch<React.SetStateAction<string[]>>) {
  return (e:React.MouseEvent<HTMLButtonElement, MouseEvent>, trackID:string) => {
    e.stopPropagation();
    const isLiked = likedTracks.includes(trackID);
    const newLikedTracks = isLiked ? likedTracks.filter((t) => t !== trackID) : [...likedTracks, trackID];
    setLikedTracks(newLikedTracks);
    likeSong(trackID);
  }
}