import { TFunction } from "react-i18next";
import { PlaylistPartial } from "../../../util/wrapper/eggs/playlists";
import { defaultAvatar, getArtistPage, toOrdinal } from "../../../util/util";
import { ArtistData } from "../../../util/wrapper/eggs/artist";
import { News } from "../../home/home";
import { PlaylistCover } from "../playlistcover";
import { ComparedRank, RankingArtist } from "../../../util/wrapper/eggs/ranking";

export function NewsList(props: {t:TFunction, items:News[], refName:React.RefObject<HTMLUListElement>, setScroll:React.Dispatch<React.SetStateAction<number>>}) {
	const {t, items, refName, setScroll} = props;
	return (
		<ul
			className="ees-carousel"
			ref={refName}
			onScroll={e => setScroll(e.currentTarget.scrollLeft)}>
			{items.map((summary) => (
				<CarouselItem key={summary.url}>
					<a
						className="ees-article"
						href={summary.url}>
						<div className="ees-article-text-wrapper">
							<h3 className="ees-article-title">{summary.title}</h3>
						</div>
						<div className="ees-article-image-wrapper">
							<img
								className="ees-article-image"
								src={summary.image}
								alt=""
								width={180}
								height={106} />
						</div>
						<span className="ees-article-date">{summary.date}</span>
						<span className="ees-article-type">{t("news."+summary.type)}</span>
					</a>
				</CarouselItem>
			))}
		</ul>
	);
}

export function ArtistList(props: {t:TFunction, items:ArtistData[], refName:React.RefObject<HTMLUListElement>, setScroll:React.Dispatch<React.SetStateAction<number>>}) {
	const { items, refName, setScroll } = props;
	return (
		<ul
			className="ees-carousel"
			ref={refName}
			onScroll={e => setScroll(e.currentTarget.scrollLeft)}>
			{items.map((artist) => (
				<CarouselItem key={artist.artistName}>
					<a
						className="ees-carousel-artist"
						href={getArtistPage(artist.artistName)}>
						<h3 className="ees-carousel-artist-name">{artist.displayName}</h3>
						<div className="ees-carousel-artist-image-wrapper">
							<img
								className="ees-carousel-artist-image"
								src={artist.imageDataPath ?? defaultAvatar}
								alt=""
								width={175}
								height={175} />
						</div>
					</a>
				</CarouselItem>
			))}
		</ul>
	);
}

export function RankingArtistList(props: {t:TFunction, items:RankingArtist[], refName:React.RefObject<HTMLUListElement>, setScroll:React.Dispatch<React.SetStateAction<number>>}) {
	const { items, refName, setScroll } = props;
	return (
		<ul
			className="ees-carousel"
			ref={refName}
			onScroll={e => setScroll(e.currentTarget.scrollLeft)}>
			{items.map((artist) => (
				<CarouselItem key={artist.artistId}>
					<a
						className="ees-carousel-artist-detailed"
						href={getArtistPage(artist.artistData.artistName)}>
						
						<h3 className="ees-carousel-artist-name">{artist.artistData.displayName}</h3>
						<div className="ees-carousel-rank m-search artistranking">
							<span className="ees-carousel-rank-number">{toOrdinal(artist.rank)}</span>
							<RankingArrow comparedRank={artist.comparedRank} />
						</div>
						<div className="ees-carousel-artist-image-wrapper">
							<img
								className="ees-carousel-artist-image"
								src={artist.artistData.imageDataPath ?? defaultAvatar}
								alt=""
								width={175}
								height={175} />
						</div>
					</a>
				</CarouselItem>
			))}
		</ul>
	);
}

const rankingObj = {
	"up": 2,
	"stay": 3,
	"down": 4,
};

const RankingArrow = (props: {comparedRank:ComparedRank}) =>
	<div className={`m-ranking_counter ranking_${rankingObj[props.comparedRank]}`} />;

export function PlaylistList(props: {t:TFunction, items:PlaylistPartial[], refName:React.RefObject<HTMLUListElement>, setScroll:React.Dispatch<React.SetStateAction<number>>}) {
	const { items, refName, setScroll } = props;
	return (
		<ul
			className="ees-carousel"
			ref={refName}
			onScroll={e => setScroll(e.currentTarget.scrollLeft)}>
			{items.map((playlist) => (
				<CarouselItem key={playlist.playlistId}>
					<a
						className="ees-carousel-playlist"
						href={`https://eggs.mu/?playlist=${playlist.playlistId}`}>
						<h3 className="ees-carousel-playlist-name">{playlist.playlistName || "\u00A0"}</h3>
						<div className="ees-playlist-cover-wrapper">
							<PlaylistCover
								imageURLs={playlist.arrayOfImageDataPath.split(",")}
								columnCount={2}
								rowCount={2}
								width={174}
								height={174} />
						</div>
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
