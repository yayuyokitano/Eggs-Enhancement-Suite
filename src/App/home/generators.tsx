import { TFunction } from "react-i18next";
import { getArtistPage } from "../../util/util";
import { ArtistData } from "../../util/wrapper/eggs/artist";
import { News } from "./home";

export function NewsList(props: {t:TFunction, items:News[], refName:React.RefObject<HTMLUListElement>}) {
	const {t, items, refName} = props;
	return (
		<ul
			className="ees-carousel"
			ref={refName}>
			{items.map((summary) => (
				<CarouselItem key={summary.url}>
					<a
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
				</CarouselItem>
			))}
		</ul>
	);
}

export function RecommendedList(props: {t:TFunction, items:ArtistData[], refName:React.RefObject<HTMLUListElement>}) {
	const { t, items, refName } = props;
	return (
		<ul
			className="ees-carousel"
			ref={refName}>
			{items.map((artist) => (
				<CarouselItem key={artist.artistName}>
					<a
						className="ees-carousel-artist"
						href={getArtistPage(artist.artistName)}>
						<p>{artist.displayName}</p>
						<p>{t("news.error")}</p>
					</a>
				</CarouselItem>
			))}
		</ul>
	);
}

function CarouselItem(props: { children:JSX.Element }) {
	const { children } = props;

	return (
		<li className="ees-carousel-item">
			{children}
		</li>
	);
}
