import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { artist, ArtistEndpoint } from "../../util/wrapper/eggs/artist";
import "./artist.scss";

export function Artist(t:TFunction) {
  const artistID = window.location.pathname.split("/")[2];

  const [data, setData] = useState<ArtistEndpoint>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    artist(artistID).then((artistData) => {
      setData(artistData);
      setLoading(false);
    })
  }, []);
  
  if (isLoading) return <p>Loading</p>

  return (
    <div className="artist">
      <h2>{data?.data[0].artistData.displayName}</h2>
    </div>
  )
}