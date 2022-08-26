import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { getEggsRecommendedArtistsWrapped } from "../../util/wrapper/eggs/recommend";
import Carousel from "./carousel";
import { NewsGenerator, RecommendedGenerator } from "./generators";

import "./home.scss";

export interface News {
  title: string;
  image: string;
  date: string;
  url: string;
  type: string;
}

export default function Home(t:TFunction) {
	const original = document.querySelectorAll(".m-main_article_list>li");
	const [news, setNews] = useState<News[]>([]);
  
	useEffect(() => {
		setNews(Array.from(original).map((el) => ({
			title: el.querySelector(".mult_ellipsis>p")?.textContent ?? "",
			image: (el.querySelector(".m_octagon img") as HTMLImageElement)?.src ?? "",
			date: el.querySelector(".article_date")?.textContent ?? "",
			url: el.querySelector("a")?.href ?? "",
			type: el.querySelector(".article_category")?.textContent ?? "error",
		})));
	}, []);
	return (
		<div id="ees-home-wrapper">
			<Carousel
				width={260}
				size="large"
				type="basic">{NewsGenerator(t, news)}</Carousel>
			<Carousel
				width={260}
				size="large"
				type="artist"
				eggsGet={getEggsRecommendedArtistsWrapped}
				elementGenerator={RecommendedGenerator}
				eggsGetSongCurry="curryEggsRecommendedArtistsWrapped"></Carousel>
		</div>
	);
}