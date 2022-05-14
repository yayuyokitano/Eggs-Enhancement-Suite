import { useEffect, useRef, useState } from "react";
import { TFunction } from "react-i18next";
import { artist, ArtistEndpoint } from "../../util/wrapper/eggs/artist";
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
        return <p>error occured</p>;
      }
      ref.current.appendChild(artistElement);
    })
  }, []);
  
  if (isLoading) return (
    <div id="ees-artist">
      <div ref={ref} />
      Loading
    </div>
  );

  return (
    <div id="ees-artist">
      <div ref={ref} />
      <h2>{data?.data[0].artistData.displayName}</h2>
    </div>
  )
}