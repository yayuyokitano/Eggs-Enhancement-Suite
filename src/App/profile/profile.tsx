import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { crawlUser } from "../../util/wrapper/eggshellver/user";
import { agnosticPlaylists } from "../../util/wrapper/eggs/playlists";
import { Profile, profile } from "../../util/wrapper/eggs/users";
import Carousel from "../components/carousel/carousel";
import { PlaylistList } from "../components/carousel/generators";
import { Incrementer } from "../components/sync/itemFetcher";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./profile.scss";

export default function Profile(t:TFunction) {
	const [isLoading, setLoading] = useState(true);
	const [isSelf, setSelf] = useState(false);
	const [user, setUser] = useState<UserStub>();
	const userPromise = Promise.resolve(crawlUser());

	useEffect(() => {
		profile().then((profile) => {
			userPromise.then(u => {
				setSelf(profile.data.userName === u.userName);
				setUser(u);
				setLoading(false);
			}).catch((err) => {console.error(err);});
		}).catch(() => {
			setSelf(false);
			userPromise.then(u => {
				setUser(u);
				setLoading(false);
			}).catch((err) => {console.error(err);});
		});
	}, []);

	if (isLoading) return <div id="ees-profile">{t("general.loading")}</div>;
	if (!user) return <div id="ees-profile">{t("general.error")}</div>;

	return (
		<div id="ees-profile">
			<h1>{user.displayName}</h1>
			<Carousel
				width={204}
				size="small"
				type="playlist"
				t={t}
				title="general.playlist"
				init={[]}
				ElementList={PlaylistList}
				incrementer={new Incrementer(agnosticPlaylists(isSelf, user.userName), 10)}
				uniquePropName="playlistId"
			/>
		</div>
	);

  
}
