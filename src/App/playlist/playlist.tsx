import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { Playlist, playlist } from "../../util/wrapper/eggs/playlists";
import { TrackContainer } from "../components/track";
import "./playlist.scss";

export function Playlist(t:TFunction) {

  const playlistID = new URLSearchParams(window.location.search).get("playlist")!;

  const [data, setData] = useState<Playlist>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    playlist(playlistID).then((playlistData) => {
      setData(playlistData.data[0]);
      setLoading(false);
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

  if (error) return (
    <div id="ees-playlist">
      {t("playlist.error")}
    </div>
  );

  return (
    <div id="ees-playlist">
      <h2>{t("general.song.plural")}</h2>
      <TrackContainer data={data?.musicData} t={t} />
    </div>
  )
}