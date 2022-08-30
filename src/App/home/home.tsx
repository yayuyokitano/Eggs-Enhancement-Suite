import { Incrementer } from "../../App/components/sync/itemFetcher";
import { TFunction } from "react-i18next";
import { eggsRecommendedArtistsWrapped } from "../../util/wrapper/eggs/recommend";
import Carousel from "../components/carousel/carousel";
import { NewsList, PlaylistList, IntroducedArtistList } from "../components/carousel/generators";

import "./home.scss";
import { eggsNewPlaylistsWrapped, eggsPopularPlaylistsWrapped } from "../../util/wrapper/eggs/playlists";

export interface News {
  title: string;
  image: string;
  date: string;
  url: string;
  type: string;
}

export default function Home(t:TFunction) {
	const original = document.querySelectorAll(".m-main_article_list>li");
	const news = Array.from(original).map((el) => ({
		title: el.querySelector(".mult_ellipsis>p")?.textContent ?? "",
		image: (el.querySelector(".m_octagon img") as HTMLImageElement)?.src ?? "",
		date: el.querySelector(".article_date")?.textContent ?? "",
		url: el.querySelector("a")?.href ?? "",
		type: el.querySelector(".article_category")?.textContent ?? "error",
	}));

	return (
		<div id="ees-home-wrapper">
			<Carousel
				width={260}
				size="large"
				type="basic"
				t={t}
				title="heading.news"
				init={news}
				ElementList={NewsList} />
			<Carousel
				width={205}
				size="large"
				type="artist"
				t={t}
				title="heading.recommendedByEggs"
				init={[]}
				ElementList={IntroducedArtistList}
				incrementer={new Incrementer(eggsRecommendedArtistsWrapped, 10)}
				uniquePropName="artistName"
				eggsGetSongCurry="curryEggsRecommendedArtistsPlayback"
			/>
			<Carousel
				width={204}
				size="small"
				type="playlist"
				t={t}
				title="heading.newPlaylists"
				init={[]}
				ElementList={PlaylistList}
				incrementer={new Incrementer(eggsNewPlaylistsWrapped, 30, true)}
				uniquePropName="playlistId"
			/>
			<Carousel
				width={204}
				size="small"
				type="playlist"
				t={t}
				title="heading.popularPlaylists"
				init={[]}
				ElementList={PlaylistList}
				incrementer={new Incrementer(eggsPopularPlaylistsWrapped, 30)}
				uniquePropName="playlistId"
			/>
		</div>
	);
}