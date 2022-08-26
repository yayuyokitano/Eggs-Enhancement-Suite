import { TFunction } from "react-i18next";
import { getArtistPage } from "../../util/util";
import { ArtistData } from "../../util/wrapper/eggs/artist";
import { News } from "./home";

export function NewsGenerator(t:TFunction, news:News[]) {
	return news.map((summary) => (
		<a
			key={summary.url}
			className="ees-article"
			href={summary.url}>
			<div className="ees-article-text-wrapper">
				<h3 className="ees-article-title">{summary.title}</h3>
			</div>
			<div className="m_octagon">
				<span>
					<img
						className="ees-article-image"
						src={summary.image}
						alt="" />
				</span>
			</div>
			<span className="ees-article-date">{summary.date}</span>
			<span className="ees-article-type">{t("news."+summary.type)}</span>
		</a>
	));
}

export function RecommendedGenerator(artist:ArtistData) {
	return (
		<a
			key={artist.artistName}
			className="ees-carousel-artist"
			href={getArtistPage(artist.artistName)}>
			<p>{artist.displayName}</p>
		</a>
	);
}
