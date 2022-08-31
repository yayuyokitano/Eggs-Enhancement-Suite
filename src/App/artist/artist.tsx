import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import "./artist.scss";
import { artistTracks, SongData } from "../../util/wrapper/eggs/artist";
import TrackContainer from "../components/track/trackContainer";
import { List } from "../../util/wrapper/eggs/util";
import { crawlUser } from "../../util/wrapper/eggshellver/user";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import ProfileBanner from "../components/profileBanner";

export default function Artist(t:TFunction) {
	const artistID = window.location.pathname.split("/")[2];

	const [data, setData] = useState<List<SongData>>();
	const [isLoading, setLoading] = useState(false);
	const [user, setUser] = useState<UserStub>();
	const userPromise = Promise.resolve(crawlUser());

	useEffect(() => {
		setLoading(true);
		userPromise.then(u => {
			setUser(u);
		});
		artistTracks(artistID).then((artistData) => {
			setData(artistData);
			setLoading(false);
		});
	}, []);
  
	if (!user) return <div id="ees-artist">{t("general.loading")}</div>;
	if (isLoading) return (
		<div id="ees-artist">
			<ProfileBanner user={user} />
			<h2>{t("general.song", {count: 0})}</h2>
			{t("general.loading")}
		</div>
	);

	return (
		<div id="ees-artist">
			<ProfileBanner user={user} />
			<h2>{t("general.song", {count: data?.totalCount})}</h2>
			<TrackContainer
				data={data?.data}
				t={t}
				size="large" />
		</div>
	);
}