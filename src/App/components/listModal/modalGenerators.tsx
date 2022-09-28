import { News } from "../../home/home";
import { TFunction } from "react-i18next";
import { defaultAvatar, getArtistPage, getUserPage } from "../../../util/util";
import { PlaylistPartial } from "../../../util/wrapper/eggs/playlists";
import { RecommendedArtist } from "../../../util/wrapper/eggs/recommend";
import { PlaylistCover } from "../playlistcover";
import { ArtistData, SongData } from "../../../util/wrapper/eggs/artist";
import { RankingArtist } from "../../../util/wrapper/eggs/ranking";
import "./modalItems.scss";
import TrackContainer from "../track/trackContainer";
import { UserStub } from "util/wrapper/eggshellver/util";
import { ListeningParty } from "util/wrapper/eggshellver/ws";

export function NewsModalList(props: {t:TFunction, items:News[], refName:React.RefObject<HTMLUListElement>}) {
	const {t, items, refName} = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((summary) => (
				<ModalItem key={summary.url}>
					<a
						className="ees-modal-article"
						href={summary.url}>
						<div className="ees-modal-article-text-wrapper">
							<h3 className="ees-modal-article-title">{summary.title}</h3>
						</div>
						<div className="ees-modal-article-image-wrapper">
							<img
								className="ees-modal-article-image"
								src={summary.image}
								alt=""
								width={180}
								height={106} />
						</div>
						<span className="ees-modal-article-date">{summary.date}</span>
						<span className="ees-modal-article-type">{t("news."+summary.type)}</span>
					</a>
				</ModalItem>
			))}
		</ul>
	);
}

export function ArtistModalList(props: {t:TFunction, items:ArtistData[], refName:React.RefObject<HTMLUListElement>}) {
	const { items, refName } = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((artist) => (
				<ModalItem key={artist.artistName}>
					<a
						className="ees-modal-artist"
						href={getArtistPage(artist.artistName)}>
						<h3 className="ees-modal-artist-name">{artist.displayName}</h3>
						<div className="ees-modal-artist-image-wrapper">
							<img
								className="ees-modal-artist-image"
								src={artist.imageDataPath ?? defaultAvatar}
								alt=""
								width={64}
								height={64} />
						</div>
					</a>
				</ModalItem>
			))}
		</ul>
	);
}

export function RankingArtistModalList(props: {t:TFunction, items:RankingArtist[], refName:React.RefObject<HTMLUListElement>}) {
	const { items, refName } = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((artist) => (
				<ModalItem key={artist.artistId}>
					<a
						className="ees-modal-artist"
						href={getArtistPage(artist.artistData.artistName)}>
						<h3 className="ees-modal-artist-name">{artist.artistData.displayName}</h3>
						<div className="ees-modal-artist-image-wrapper">
							<img
								className="ees-modal-artist-image"
								src={artist.artistData.imageDataPath ?? defaultAvatar}
								alt=""
								width={64}
								height={64} />
						</div>
					</a>
				</ModalItem>
			))}
		</ul>
	);
}

export function PlaylistModalList(props: {t:TFunction, items:PlaylistPartial[], refName:React.RefObject<HTMLUListElement>}) {
	const { items, refName } = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((playlist) => (
				<ModalItem key={playlist.playlistId}>
					<a
						className="ees-modal-playlist"
						href={`https://eggs.mu/?playlist=${playlist.playlistId}`}>
						<h3 className="ees-modal-playlist-name">{playlist.playlistName || "\u00A0"}</h3>
						<div className="ees-modal-cover-wrapper">
							<PlaylistCover
								imageURLs={playlist.arrayOfImageDataPath.split(",")}
								columnCount={2}
								rowCount={2}
								width={64}
								height={64} />
						</div>
					</a>
				</ModalItem>
			))}
		</ul>
	);
}

export function IntroducedArtistModalList(props: {t:TFunction, items:RecommendedArtist[], refName:React.RefObject<HTMLUListElement>}) {
	const { items, refName } = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((artist) => (
				<ModalItem key={artist.artistId}>
					<a
						className="ees-modal-artist-introduction"
						href={getArtistPage(artist.artistName)}>
						<div className="ees-modal-artist-introduction-text">
							<h3 className="ees-modal-artist-name">{artist.displayName}</h3>
							<span className="ees-modal-artist-introtext">{artist.introduction}</span>
						</div>
						<div className="ees-modal-artist-image-wrapper">
							<img
								className="ees-modal-artist-image"
								src={artist.imageDataPath ?? defaultAvatar}
								alt=""
								width={64}
								height={64} />
						</div>
					</a>
				</ModalItem>
			))}
		</ul>
	);
}

export function UserStubModalList(props: {t:TFunction, items:UserStub[], refName:React.RefObject<HTMLUListElement>}) {
	const { items, refName } = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((user) => (
				<ModalItem key={user.userId}>
					<a
						className="ees-modal-artist-introduction"
						href={user.isArtist ? getArtistPage(user.userName) : getUserPage(user.userName)}>
						<div className="ees-modal-artist-introduction-text">
							<h3 className="ees-modal-artist-name">{user.displayName}</h3>
							{user.profile && <span className="ees-modal-artist-introtext">{user.profile}</span>}
						</div>
						<div className="ees-modal-artist-image-wrapper">
							<img
								className="ees-modal-artist-image"
								src={user.imageDataPath || defaultAvatar}
								alt=""
								width={64}
								height={64} />
						</div>
					</a>
				</ModalItem>
			))}
		</ul>
	);
}

export function TrackModalList(props: {t:TFunction, items:SongData[], refName:React.RefObject<HTMLUListElement>}) {
	const { t, items, refName } = props;
	return (
		<TrackContainer
			data={items}
			t={t}
			size="medium"
			refName={refName} />
	);
}

export function ListeningPartyModalList(props: {t:TFunction, items:ListeningParty[], refName:React.RefObject<HTMLUListElement>}) {
	const { items, refName } = props;
	return (
		<ul
			className="ees-modal-list"
			ref={refName}>
			{items.map((party) => (
				<ModalItem key={party.owner}>
					<button
						className="ees-modal-listening-party"
						onClick={() => {
							window.parent.postMessage({
								type: "trackUpdate",
								data: {
									type: "setPlaybackSocket",
									targetID: party.owner,
								}
							}, "*");
						}}>
						<div className="ees-modal-listening-party-text">
							<h3 className="ees-modal-listening-party-name">{party.title}</h3>
							<span className="ees-modal-listening-party-owner">{party.owner}</span>
						</div>
						<div className="ees-modal-artist-image-wrapper">
							<img
								className="ees-modal-artist-image"
								src={party.song.musicImageDataPath ?? party.song.artistImageDataPath ?? defaultAvatar}
								alt=""
								width={64}
								height={64} />
						</div>
					</button>
				</ModalItem>
			))}
		</ul>
	);
}

function ModalItem(props: { children:JSX.Element }) {
	const { children } = props;

	return (
		<li className="ees-modal-item">
			{children}
		</li>
	);
}
