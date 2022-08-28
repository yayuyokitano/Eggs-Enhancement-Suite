import { useEffect, useRef, useState } from "react";
import { TFunction } from "react-i18next";
import "./artist.scss";
import { artistTracks, SongData } from "../../util/wrapper/eggs/artist";
import TrackContainer from "../components/track/trackContainer";
import { List } from "../../util/wrapper/eggs/util";

export default function Artist(t:TFunction) {
	const artistElement = document.getElementsByClassName("header_mypage_wrapper")[0];
  
	const artistID = window.location.pathname.split("/")[2];

	const [data, setData] = useState<List<SongData>>();
	const [isLoading, setLoading] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current !== null) {
			ref.current.appendChild(artistElement);
		}
		setLoading(true);
		artistTracks(artistID).then((artistData) => {
			setData(artistData);
			setLoading(false);
			if (ref.current === null) {
				return <p>{t("general.error")}</p>;
			}
			ref.current.appendChild(artistElement);
		});
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
			<h2>{t("general.song", {count: data?.totalCount})}</h2>
			<TrackContainer
				data={data?.data}
				t={t}
				size="normal" />
		</div>
	);
}