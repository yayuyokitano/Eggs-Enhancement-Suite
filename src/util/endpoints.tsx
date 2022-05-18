import { TFunction } from "react-i18next";
import { Artist } from "../App/artist/artist";
import { Login } from "../App/login/login";
import { Playlist } from "../App/playlist/playlist";

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
    rootSelector: ".ttl_side",
    Element: () => <p>hello</p>,
    translations: []
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
  }
}