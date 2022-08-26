import Home from "../App/home/home";
import { TFunction } from "react-i18next";
import Artist from "../App/artist/artist";
import Login from "../App/login/login";
import Playlist from "../App/playlist/playlist";
import Profile from "../App/profile/profile";
import { profile } from "./wrapper/eggs/users";
import { getPlaylists } from "./wrapper/eggs/playlists";
import { artist } from "./wrapper/eggs/artist";
import { songLikeInfo } from "./wrapper/eggs/evaluation";
import Cacher from "./wrapper/eggs/cacher";

export const endpoints:{[key:string]:{
  rootSelector: string;
  Element: (t:TFunction) => JSX.Element;
  translations:string[];
	cacheFunc: (cache:Cacher) => Promise<void>;
}|undefined} = {
	"/login": {
		rootSelector: ".form-main>.form-control.pt30p.pb50p",
		Element: Login,
		translations: ["login"],
		cacheFunc: fetchProfile
	},
	"/": {
		rootSelector: ".l-contents_wrapper>.inner",
		Element: Home,
		translations: ["home"],
		cacheFunc: fetchProfile
	},
	"/artist": {
		rootSelector: ".l-contents_wrapper",
		Element: Artist,
		translations: [],
		cacheFunc: fetchArtist
	},
	"/playlist": {
		rootSelector: ".l-contents_wrapper",
		Element: Playlist,
		translations: [],
		cacheFunc: fetchProfile
	},
	"/user": {
		rootSelector: ".l-contents_wrapper",
		Element: Profile,
		translations: [],
		cacheFunc: fetchProfile
	}
};

async function fetchArtist(cache:Cacher) {
	fetchProfile(cache);
	const artistID = window.location.pathname.split("/")[2];
	const artistData = await artist(artistID, cache);
	songLikeInfo(artistData.data.map((song) => song.musicId), cache);
}

async function fetchProfile(cache:Cacher) {
	profile(cache);
	getPlaylists(10, { cache: cache });
}
