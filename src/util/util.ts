import { PlaybackController } from "App/player/playback";
import { TFunction } from "react-i18next";
import browser from "webextension-polyfill";
import { apiKey } from "./scrobbler";
import { artistAllTracks, artistNewTrack, artistTopTrack } from "./wrapper/eggs/artist";
import { curryEggsRecommendedArtistsWrapped } from "./wrapper/eggs/recommend";

const generateRandomHex = (size:number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

export async function getDeviceID() {
	const deviceID = await browser.storage.sync.get("deviceID");
	if (deviceID.deviceID) {
		return deviceID.deviceID as string;
	}
	const newDeviceID = generateRandomHex(16);
	await browser.storage.sync.set({deviceID: newDeviceID});
	return newDeviceID;
}

export async function getToken():Promise<string|undefined> {
	return (await browser.storage.sync.get("token")).token;
}

export async function getEggshellverToken():Promise<string|undefined> {
	return (await browser.storage.sync.get("eggshellvertoken")).eggshellvertoken;
}

export const eggsSelector = "https://api-flmg.eggs.mu/v1/*";
export const defaultAvatar = "https://eggs.mu/wp-content/themes/eggs/assets/img/common/signin.png";

// returns shuffled array, avoids mutating the original array to allow unshuffling.
export function shuffleArray<T>(array:T[]) {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export function convertTime(seconds:number) {
	const minutes = Math.floor(seconds / 60);
	const secondsLeft = Math.floor(seconds % 60);
	return `${minutes}:${secondsLeft.toString().padStart(2, "0")}`;
}

export function getTimeSince(timestamp:string, t:TFunction) {
	const oldUnix = new Date(timestamp).getTime();
	const newUnix = new Date().getTime();
	const diff = newUnix - oldUnix;
	const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
	if (years) {
		return t("general.timeSince.yearWithCount", {count: years});
	}
	const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
	if (months) {
		return t("general.timeSince.monthWithCount", {count: months});
	}
	const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
	if (weeks) {
		return t("general.timeSince.weekWithCount", {count: weeks});
	}
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	if (days) {
		return t("general.timeSince.dayWithCount", {count: days});
	}
	const hours = Math.floor(diff / (1000 * 60 * 60));
	if (hours) {
		return t("general.timeSince.hourWithCount", {count: hours});
	}
	const minutes = Math.floor(diff / (1000 * 60));
	if (minutes) {
		return t("general.timeSince.minuteWithCount", {count: minutes});
	}
	return t("general.timeSince.recent");
}

export function addToSearch(url:string, addedParams:{[key:string]:string}) {
	const params = new URLSearchParams(url.split("?")[1]);
	for (const [key, value] of Object.entries(addedParams)) {
		params.set(key, value);
	}
	return url.split("?")[0] + "?" + params.toString();
}

export function lastfmAuthLink() {
	const location = addToSearch(window.location.href, {
		"script": "lastfm-auth",
	});
	return addToSearch("http://www.last.fm/api/auth/", {
		"api_key": apiKey,
		"cb": location
	});
}

const prefix = "[([{（「『｢【［｛〈〔《（_＿]";
const suffix = "[)\\]}）」』｣】］｝〉〕》）]";

const trackFilters = [
	`${prefix}?\\s*(MV|ＭＶ|DEMO|デモ|ＤＥＭＯ)\\s*${suffix}?`,
];

const artistFilters = [
	`${prefix}?\\s*(official|公式)\\s*${suffix}?`,
];

const albumFilters = [
	" - (EP|Single)"
];

export function processTrackName(track:string|undefined) {
	if (!track) return "";
	for (const filter of trackFilters) {
		const regex = new RegExp(filter, "gi");
		track = track.replace(regex, "");
	}
	return track.trim();
}

export function processArtistName(artist:string|undefined) {
	if (!artist) return "";
	for (const filter of artistFilters) {
		const regex = new RegExp(filter, "gi");
		artist = artist.replace(regex, "");
	}
	return artist.trim();
}

export function processAlbumName(album:string|undefined) {
	if (!album) return "";
	for (const filter of albumFilters) {
		const regex = new RegExp(filter, "gi");
		album = album.replace(regex, "");
	}
	return album.trim();
}

export async function queryAsync(selector:string):Promise<Element> {
	return new Promise((resolve) => {
		const immediate = document.querySelector(selector);
		if (immediate) resolve(immediate);
    
		const observer = new MutationObserver(() => {
			const rootElement = document.querySelector(selector);
			if (!rootElement) return;
			observer.disconnect();
			resolve(rootElement);
		});
		observer.observe(document, {
			childList: true,
			subtree: true,
		});
	});
}

export async function getVolume():Promise<number|undefined> {
	const volume = await browser.storage.sync.get("volume");
	return volume?.volume;
}

export async function updateVolume(volume:number, playbackController?:PlaybackController) {
	if (playbackController) {
		playbackController.volume = volume;
	}
	await browser.storage.sync.set({
		volume,
	});
}

export const prefectures = [
	"HOKKAIDO",
	"AOMORI",
	"IWATE",
	"MIYAGI",
	"AKITA",
	"YAMAGATA",
	"FUKUSHIMA",
	"IBARAKI",
	"TOCHIGI",
	"GUNMA",
	"SAITAMA",
	"CHIBA",
	"TOKYO",
	"KANAGAWA",
	"NIIGATA",
	"TOYAMA",
	"ISHIKAWA",
	"FUKUI",
	"YAMANASHI",
	"NAGANO",
	"GIFU",
	"SHIZUOKA",
	"AICHI",
	"MIE",
	"SHIGA",
	"KYOTO",
	"OSAKA",
	"HYOGO",
	"NARA",
	"WAKAYAMA",
	"TOTTORI",
	"SHIMANE",
	"OKAYAMA",
	"HIROSHIMA",
	"YAMAGUCHI",
	"TOKUSHIMA",
	"KAGAWA",
	"EHIME",
	"KOCHI",
	"FUKUOKA",
	"SAGA",
	"NAGASAKI",
	"KUMAMOTO",
	"OITA",
	"MIYAZAKI",
	"KAGOSHIMA",
	"OKINAWA"
];

export const clamp = (min:number, num:number, max:number) => Math.min(Math.max(num, min), max);

export type PopupMessage = {
	type: "changeLanguage";
	lang: string;
}|{
	type: "changeTheme";
	theme: string;
}

export function processedPathname() {
	const playlistConcat = new URLSearchParams(window.location.search).has("playlist") ? "playlist" : "";
	const processedPath = "/" + window.location.pathname.split("/").filter((_,i)=>i%2).join("/");
	if (processedPath !== "/") {
		return removeTrailingSlash(processedPath);
	}
	return processedPath + removeTrailingSlash(playlistConcat);
}

function removeTrailingSlash(path: string) {
	if (path.endsWith("/")) {
		return path.slice(0, -1);
	}
	return path;
}

export const sleep:(ms:number) => Promise<void> = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getArtistPage = (artistName:string) => `https://eggs.mu/artist/${artistName}`;

export type ArtistFetcherString = "curryEggsRecommendedArtistsWrapped";
export type SongFetcherString = "artistAllTracks"|"artistTopTrack"|"artistNewTrack";

export interface SongCurry {
	artistFetcher:ArtistFetcherString;
	songFetcher:SongFetcherString;
}

export function currySongFunction(songCurry:SongCurry) {
	const songFunction = getSongFunction(songCurry.songFetcher);
	
	switch(songCurry.artistFetcher) {
	case "curryEggsRecommendedArtistsWrapped":
		return curryEggsRecommendedArtistsWrapped(songFunction);
	}
}

function getSongFunction(name:SongFetcherString) {
	switch(name) {
	case "artistAllTracks": {
		return artistAllTracks;
	}
	case "artistNewTrack": {
		return artistNewTrack;
	}
	case "artistTopTrack": {
		return artistTopTrack;
	}
	}
}
//eggsGetSongCurry:(trackFunc: (artistID: string, cache?: Cacher) => Promise<SongData[]>) => EggsGet<SongData>
