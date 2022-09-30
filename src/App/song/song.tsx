import TrackContainer from "../components/track/trackContainer";
import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { defaultAvatar } from "../../util/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import { trackDetails } from "../../util/wrapper/eggs/search";
import UserCapsule from "../components/userCapsule";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./song.scss";

interface CrawledSong {
	title: string;
	artist: string;
	artistHref: string;
	imageDataPath: string;
	profileText: string;
	artistImageDataPath: string;
	lyrics: string;
	composer: string;
	lyricist: string;
	explanation: string;
}

function crawlSong():CrawledSong {
	const title = document.querySelector("#js-product-name-0 p")?.textContent ?? "";
	const artist = document.querySelector(".product-list_txt .artist_name a")?.textContent ?? "";
	const artistHref = document.querySelector(".product-list_txt .artist_name a")?.getAttribute("href") ?? "";
	const imageDataPath = document.querySelector(".musicTit img")?.getAttribute("src") ?? "";
	const profileText = document.querySelector(".artistinfo>p")?.textContent ?? "";
	const artistImageDataPath = document.querySelector(".artstWrapp img")?.getAttribute("src") ?? defaultAvatar;
	const lyrics = document.querySelector(".lyrics p:last-child")?.textContent ?? "";
	const composer = document.querySelector(".lyrics .composer")?.textContent?.slice(3) ?? "";
	const lyricist = document.querySelector(".lyrics .lyricist")?.textContent?.slice(3) ?? "";
	const explanation = document.querySelector(".musicintroduction p")?.textContent ?? "";
	return {
		title,
		artist,
		artistHref,
		imageDataPath,
		profileText,
		artistImageDataPath,
		lyrics,
		composer,
		lyricist,
		explanation,
	};
}

function userStubFromSongData(song:SongData):UserStub {
	return {
		userId: 0,
		userName: song.artistData.artistName,
		displayName: song.artistData.displayName,
		imageDataPath: song.artistData.imageDataPath ?? defaultAvatar,
		profile: song.artistData.profile ?? "",
		isArtist: true,
		prefectureCode: 0,
	};
}

function userStubFromCrawledSong(song:CrawledSong):UserStub {
	return {
		userId: 0,
		userName: song.artistHref.at(-1) ?? "",
		displayName: song.artist,
		imageDataPath: song.artistImageDataPath,
		profile: song.profileText,
		isArtist: true,
		prefectureCode: 0,
	};
}

function createUserStub(song:CrawledSong|SongData) {
	if ("artistData" in song) return userStubFromSongData(song);
	return userStubFromCrawledSong(song);  
}

export default function Song(t:TFunction) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [song, setSong] = useState<SongData>();

	const songStub = crawlSong();

	useEffect(() => {
		const songID = window.location.pathname.split("/").pop();
		if (!songID) {
			setLoading(false);
			setError(true);
			return;
		}
		trackDetails([songID]).then((data) => {
			if (!data.data[0]) {
				setLoading(false);
				setError(true);
				return;
			}
			setSong(data.data[0]);
			setLoading(false);
		}).catch((err) => {
			setLoading(false);
			setError(true);
			console.error(err);
		});
	},[]);

	if (error) return <div id="ees-song">{t("general.error")}</div>;

	return (
		<div id="ees-song">
			<div
				id="ees-song-header"
				style={{backgroundImage: `url(${song?.imageDataPath ?? songStub.imageDataPath})`}}>
				<div id="ees-song-header-image">
					<img
						src={song?.imageDataPath ?? songStub.imageDataPath}
						alt="" />
				</div>
				<div id="ees-song-header-info">
					<h1>{song?.musicTitle ?? songStub.title}</h1>
					<p>{song?.explanation ?? songStub.explanation}</p>
					<UserCapsule
						t={t}
						user={createUserStub(song ?? songStub)} />
				</div>
			</div>
			<div id="ees-song-body">
				{loading && <div id="ees-song-loading">{t("general.loading")}</div>}
				{song && <TrackContainer
					data={[song]}
					t={t}
					size="large" />}
				<div id="ees-song-lyrics">
					<h3 id="ees-song-lyrics-title">{t("track.lyrics")}</h3>
					<p id="ees-song-lyricist">{t("track.lyricist")+(song?.lyricist ?? songStub.lyricist)}</p>
					<p id="ees-song-composer">{t("track.composer")+(song?.composer ?? songStub.composer)}</p>
					<p id="ees-song-lyrics-text">{song?.lyrics ?? songStub.lyrics}</p>
				</div>
			</div>
		</div>
	);
}