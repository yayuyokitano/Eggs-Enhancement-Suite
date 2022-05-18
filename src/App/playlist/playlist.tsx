import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { likePlaylist, playlistLikeInfo } from "../../util/wrapper/eggs/evaluation";
import { Playlist, playlist } from "../../util/wrapper/eggs/playlists";
import { PlaylistCover } from "../components/playlistcover";
import { TrackContainer } from "../components/track";
import "./playlist.scss";

export function Playlist(t:TFunction) {

  const playlistID = new URLSearchParams(window.location.search).get("playlist")!;

  const [data, setData] = useState<Playlist>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    playlist(playlistID).then((playlistData) => {
      setData(playlistData.data[0]);
      setLoading(false);
      playlistLikeInfo([playlistID]).then((data) => {
        setLikeCount(data.data[0].numberOfLikes);
        setLiked(data.data[0].isLike);
      });
    }).catch(() => {
      setError(true);
      setLoading(false);
    })
  }, []);
  
  if (isLoading) return (
    <div id="ees-playlist">
      {t("general.loading")}
    </div>
  );

  if (error || !data) return (
    <div id="ees-playlist">
      {t("playlist.error")}
    </div>
  );

  return (
    <div id="ees-playlist">
      <div id="ees-playlist-header">
        <PlaylistCover
          imageURLs={data?.musicData
            .map((track) => track.imageDataPath ?? track.artistData.imageDataPath)
            .filter((x) => x !== null) as string[]|undefined}
          columnCount={3}
          rowCount={3}
          width={210}
          height={210}
        />
        <div id="ees-playlist-metadata">
          <h1 id="ees-playlist-name">{data?.playlistName}</h1>
          <p id="ees-playlist-creator">{data?.displayUserName}</p>
          <p id="ees-playlist-date">{data?.createdAt.split("T")[0].replace(/-/g, "/")}</p>
          <div id="ees-playlist-like">
            <button type="button" id="ees-playlist-like-button" onClick={() => {
              setLikeCount(likeCount + (isLiked ? -1 : 1));
              setLiked(!isLiked);
              likePlaylist(playlistID);
            }}>
              {
                isLiked ? <FavoriteRounded /> : <FavoriteBorderRounded />
              }
            </button>
            <span id="ees-playlist-like-count">{likeCount}</span>
          </div>
        </div>
      </div>
      <h2>{t("general.song.plural")}</h2>
      <TrackContainer data={data?.musicData} t={t} />
    </div>
  )
}