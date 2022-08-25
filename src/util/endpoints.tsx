import Home from "../App/home/home";
import { TFunction } from "react-i18next";
import Artist from "../App/artist/artist";
import Login from "../App/login/login";
import Playlist from "../App/playlist/playlist";
import Profile from "../App/profile/profile";

export const endpoints:{[key:string]:{
  rootSelector: string;
  Element: (t:TFunction) => JSX.Element;
  translations:string[];
}|undefined} = {
	"/login": {
		rootSelector: ".form-main>.form-control.pt30p.pb50p",
		Element: Login,
		translations: ["login"]
	},
	"/": {
		rootSelector: ".l-contents_wrapper>.inner",
		Element: Home,
		translations: ["home"]
	},
	"/artist": {
		rootSelector: ".l-contents_wrapper",
		Element: Artist,
		translations: []
	},
	"/playlist": {
		rootSelector: ".l-contents_wrapper",
		Element: Playlist,
		translations: []
	},
	"/user": {
		rootSelector: ".l-contents_wrapper",
		Element: Profile,
		translations: []
	}
};