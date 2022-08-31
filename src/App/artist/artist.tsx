import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import "./artist.scss";
import { artistTracks, SongData } from "../../util/wrapper/eggs/artist";
import TrackContainer from "../components/track/trackContainer";
import { List } from "../../util/wrapper/eggs/util";
import { crawlUser } from "../../util/wrapper/eggshellver/user";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import ProfileBanner from "../components/profileBanner";
import { SocialMedia } from "../../util/util";
import Carousel from "../components/carousel/carousel";
import { Incrementer } from "../components/sync/itemFetcher";
import { curryEggsSearchArtistPlaylistsWrapped } from "../../util/wrapper/eggs/playlists";
import { PlaylistList } from "../components/carousel/generators";

function fetchSocialMedia(socialMedia?:HTMLDivElement) {
	if (!socialMedia) return [];
	return [...socialMedia.getElementsByTagName("a")].map(a => ({
		href: a.href,
		title: a.getElementsByClassName("links_title")[0]?.textContent ?? "",
	}));
}

export default function Artist(t:TFunction) {
	const artistID = window.location.pathname.split("/")[2];
	const socialMediaDiv = document.querySelector("#js-header_mypage_links") as HTMLDivElement|undefined;

	const [data, setData] = useState<List<SongData>>();
	const [isLoading, setLoading] = useState(false);
	const [user, setUser] = useState<UserStub>();
	const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
	const userPromise = Promise.resolve(crawlUser());

	useEffect(() => {
		setSocialMedia(fetchSocialMedia(socialMediaDiv));
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
			<ProfileBanner
				t={t}
				user={user}
				socialMedia={socialMedia} />
			<div className="ees-inner-div">
				<Carousel
					width={204}
					size="small"
					type="playlist"
					t={t}
					title="general.playlistsFeaturing"
					init={[]}
					ElementList={PlaylistList}
					incrementer={new Incrementer(curryEggsSearchArtistPlaylistsWrapped(user.userName), 30)}
					uniquePropName="playlistId"
				/>
				<h2>{t("general.song", {count: 0})}</h2>
				{t("general.loading")}
			</div>
		</div>
	);

	return (
		<div id="ees-artist">
			<ProfileBanner
				user={user}
				t={t}
				socialMedia={socialMedia} />
			<div className="ees-inner-div">
				<Carousel
					width={204}
					size="small"
					type="playlist"
					t={t}
					title="general.playlistsFeaturing"
					init={[]}
					ElementList={PlaylistList}
					incrementer={new Incrementer(curryEggsSearchArtistPlaylistsWrapped(user.userName), 30)}
					uniquePropName="playlistId"
				/>
				<h2>{t("general.song", {count: data?.totalCount})}</h2>
				<TrackContainer
					data={data?.data}
					t={t}
					size="large" />
			</div>
		</div>
	);
}