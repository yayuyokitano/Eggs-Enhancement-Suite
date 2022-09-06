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
import { searchArtists, searchPlaylists, searchTracks } from "./wrapper/eggs/search";
import Search from "../App/search/search";
import Ranking from "../App/ranking/ranking";
import { getRanking } from "./util";
import { recommendedArtists } from "./wrapper/eggs/recommend";
import { eggsRequest } from "./wrapper/eggs/request";

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
	"/search": {
		rootSelector: ".l-contents_wrapper",
		Element: Search,
		translations: ["search"],
		cacheFunc: fetchSearch,
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
	"/user": {
		rootSelector: ".l-contents_wrapper",
		Element: Profile,
		translations: [],
		cacheFunc: fetchProfile,
		appendSelector: "#ees-profile"
	}
};

async function fetchArtist(cache:Cacher) {
	fetchProfile(cache);
	const artistID = window.location.pathname.split("/")[2];

	// for some reason this breaks in the dev environment sometimes, dont worry about it, it works in prod.
	// even if it breaks it only slows down load by about 100ms its fine.
	searchArtistPlaylists(artistID, 30, {cache});
	const artistData = await artistTracks(artistID, cache);
	songLikeInfo(artistData.data.map((song) => song.musicId), cache);
}

async function fetchPlaylist(cache:Cacher) {
	fetchProfile(cache);
	const playlistID = new URLSearchParams(window.location.search).get("playlist");
	if (!playlistID) return;
	playlist(playlistID, cache);
	eggsRequest(`playlists/playlists/${playlistID}`, {}, {cache});
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

