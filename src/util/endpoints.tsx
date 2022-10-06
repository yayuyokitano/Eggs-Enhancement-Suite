import Home from "../App/home/home";
import { TFunction } from "react-i18next";
import Artist from "../App/artist/artist";
import Login from "../App/login/login";
import Playlist from "../App/playlist/playlist";
import Profile from "../App/profile/profile";
import { profile } from "./wrapper/eggs/users";
import { getPlaylists, newPlaylists, playlist, popularPlaylists, searchArtistPlaylists } from "./wrapper/eggs/playlists";
import { artistTracks, newTracks } from "./wrapper/eggs/artist";
import { playlistLikeInfo, songLikeInfo } from "./wrapper/eggs/evaluation";
import Cacher from "./wrapper/eggs/cacher";
import { searchArtists, searchPlaylists, searchTracks, trackDetails } from "./wrapper/eggs/search";
import Search from "../App/search/search";
import Ranking from "../App/ranking/ranking";
import { getEggsID, getRanking } from "./util";
import { recommendedArtists } from "./wrapper/eggs/recommend";
import { eggsRequest } from "./wrapper/eggs/request";
import Timeline from "../App/timeline/timeline";
import Song from "../App/song/song";
import SearchGenre from "../App/search/searchGenre";
import SearchArea from "../App/search/searchArea";
import { useEffect } from "react";
import { hardReloadParent } from "./loadHandler";

export const endpoints:{[key:string]:{
  rootSelector: string;
  Element: (t:TFunction) => JSX.Element;
  translations:string[];
	cacheFunc: (cache:Cacher) => Promise<void>;
	appendSelector:string; // a selector unique to the extension, that tells the extension to not delete itself.
}|undefined} = {
	"/login": {
		rootSelector: ".form-main>.form-control.pt30p.pb50p",
		Element: Login,
		translations: ["login"],
		cacheFunc: fetchProfile,
		appendSelector: "#ees-login-form"
	},
	"/": {
		rootSelector: ".l-contents_wrapper>.inner",
		Element: Home,
		translations: ["home"],
		cacheFunc: fetchHome,
		appendSelector: "#ees-home-wrapper"
	},
	"/artist": {
		rootSelector: ".l-contents_wrapper",
		Element: Artist,
		translations: [],
		cacheFunc: fetchArtist,
		appendSelector: "#ees-artist"
	},
	"/artist/song": {
		rootSelector: ".l-contents_wrapper",
		Element: Song,
		translations: [],
		cacheFunc: fetchSong,
		appendSelector: "#ees-song"
	},
	"/search": {
		rootSelector: ".l-contents_wrapper",
		Element: Search,
		translations: ["search"],
		cacheFunc: fetchSearch,
		appendSelector: ".ees-search-wrapper"
	},
	"/search/genre": {
		rootSelector: ".l-contents_wrapper",
		Element: SearchGenre,
		translations: [],
		cacheFunc: fetchProfile,
		appendSelector: ".ees-ranking-wrapper"
	},
	"/search/area": {
		rootSelector: ".l-contents_wrapper",
		Element: SearchArea,
		translations: ["search"],
		cacheFunc: fetchProfile,
		appendSelector: ".ees-search-wrapper"
	},
	"/ranking": {
		rootSelector: ".l-contents_wrapper",
		Element: Ranking,
		translations: [],
		cacheFunc: fetchRanking,
		appendSelector: ".ees-ranking-wrapper"
	},
	"/playlist": {
		rootSelector: ".l-contents_wrapper",
		Element: Playlist,
		translations: [],
		cacheFunc: fetchPlaylist,
		appendSelector: "#ees-playlist"
	},
	"/timeline": {
		rootSelector: ".l-contents_wrapper",
		Element: Timeline,
		translations: [],
		cacheFunc: fetchProfile,
		appendSelector: "#ees-timeline"
	},
	"/user": {
		rootSelector: ".l-contents_wrapper",
		Element: Profile,
		translations: [],
		cacheFunc: fetchProfile,
		appendSelector: "#ees-profile"
	},
	"/home": {
		rootSelector: ".m-btn_pagetop",
		Element: redirectProfile,
		translations: [],
		cacheFunc: fetchProfile,
		appendSelector: "#thiselementdoesnotexist"
	},
	"/signup": {
		rootSelector: ".m-btn_pagetop",
		Element: killIframe,
		translations: [],
		cacheFunc: fetchProfile,
		appendSelector: "#thiselementdoesnotexist"
	}
};

function killIframe() {
	hardReloadParent();
	return <></>;
}

function redirectProfile() {
	const btns = document.querySelectorAll(".button-signup.mid");
	for (const btn of btns) {
		btn.setAttribute("target", "_blank");
		btn.setAttribute("rel", "noopener noreferrer");
	}

	useEffect(() => {
		getEggsID().then((id) => {
			if (window.location.pathname === "/home") {
				if (id) {
					setTimeout(() => {window.location.assign(`https://eggs.mu/user/${id}`); }, 100); //ensure chrome doesnt crash
					return;
				}
				window.location.assign("https://eggs.mu/");
			}
		});
	}, []);
	
	return <></>;
}

async function fetchArtist(cache:Cacher) {
	fetchProfile(cache);
	const artistID = window.location.pathname.split("/")[2];

	// for some reason this breaks in the dev environment sometimes, dont worry about it, it works in prod.
	// even if it breaks it only slows down load by about 100ms its fine.
	searchArtistPlaylists(artistID, 30, {cache});
	const artistData = await artistTracks(artistID, cache);
	songLikeInfo(artistData.data.map((song) => song.musicId), cache);
}

async function fetchSong(cache:Cacher) {
	fetchProfile(cache);
	const songID = window.location.pathname.split("/").pop();
	if (!songID) return;
	trackDetails([songID]);
}

async function fetchPlaylist(cache:Cacher) {
	fetchProfile(cache);
	const playlistID = new URLSearchParams(window.location.search).get("playlist");
	if (!playlistID) return;
	playlist(playlistID, cache);
	eggsRequest(`playlists/playlists/${playlistID}`, {}, {cache, isAuthorizedRequest: true});
	playlistLikeInfo([playlistID], cache);
}

async function fetchProfile(cache:Cacher) {
	profile(cache);
	getPlaylists(10, { cache: cache });
}

async function fetchSearch(cache:Cacher) {
	fetchProfile(cache);
	const searchWord = new URLSearchParams(window.location.search).get("searchKeyword");
	if (!searchWord) return;

	// for some reason this breaks in the dev environment sometimes, dont worry about it, it works in prod.
	// even if it breaks it only slows down load by about 100ms its fine.
	searchPlaylists(searchWord, {offset: 0, limit: 30}, cache);
	searchArtists(searchWord, {offset: 0, limit: 30}, cache);
	searchTracks(searchWord, {offset: 0, limit: 30}, cache);
}

async function fetchRanking(cache:Cacher) {
	fetchProfile(cache);
	getRanking(cache);
}

async function fetchHome(cache:Cacher) {
	fetchProfile(cache);
	recommendedArtists({
		offset: 0,
		limit: 10,
		cache
	});
	newPlaylists({
		offset: 0,
		limit: 30,
	}, cache);
	popularPlaylists({
		offset: 0,
		limit: 30,
	}, cache);
	newTracks({
		offset: 0,
		limit: 30,
	}, cache);
}

