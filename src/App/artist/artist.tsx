import { useEffect, useRef, useState } from "react";
import { TFunction } from "react-i18next";
import { artist, ArtistEndpoint } from "../../util/wrapper/eggs/artist";
import { Track } from "../components/track";
import "./artist.scss";

export function Artist(t:TFunction) {
  const artistElement = document.getElementsByClassName("header_mypage_wrapper")[0];
  
  const artistID = window.location.pathname.split("/")[2];

  const [data, setData] = useState<ArtistEndpoint>();
  const [isLoading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.appendChild(artistElement);
    }
    setLoading(true);
    artist(artistID).then((artistData) => {
      setData(artistData);
      setLoading(false);
      if (ref.current === null) {
        return <p>{t("general.error")}</p>;
      }
      ref.current.appendChild(artistElement);
    })
  }, []);
  
  if (isLoading) return (
    <div id="ees-artist">
      <div ref={ref} />
      {t("general.loading")}
    </div>
  );

  return (
    <div id="ees-artist">
      <div ref={ref} />
      <h2>{t("general.song.plural")}</h2>
      <ul id="ees-song-list" className="ees-track-container">
        {data?.data.map((song) => (<Track track={song} size="normal" />))}
      </ul>
    </div>
  )
}