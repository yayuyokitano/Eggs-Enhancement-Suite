import PlaybackController from "../App/player/playbackController";
import i18next from "i18next";
import { TFunction } from "react-i18next";
import browser from "webextension-polyfill";
import { apiKey } from "./scrobbler";
import { artistAllTracks, artistNewTrack, artistTopTrack, SourceType } from "./wrapper/eggs/artist";
import Cacher from "./wrapper/eggs/cacher";
import { artistRanking, curryEggsArtistRankingPlayback, musicRanking } from "./wrapper/eggs/ranking";
import { curryEggsRecommendedArtistsPlayback } from "./wrapper/eggs/recommend";
import { curryEggsArtistSearchPlayback } from "./wrapper/eggs/search";

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

export async function getEggsID():Promise<string|undefined> {
	return (await browser.storage.sync.get("eggsid")).eggsid;
}

export const defaultAvatar = "https://eggs.mu/wp-content/themes/eggs/assets/img/common/signin.png";
export const defaultBanner = "https://resource.lap.recochoku.jp/e8/assets/v2/img/common/bg_main03.jpg";

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
	const concat = [
		new URLSearchParams(window.location.search).has("playlist") ? "playlist" : "",
		new URLSearchParams(window.location.search).has("timeline") ? "timeline" : ""
	];

	const processedPath = "/" + window.location.pathname.split("/").filter((e,i)=>i%2 && e !== "daily" && e !== "weekly").join("/");
	if (processedPath !== "/") {
		return removeTrailingSlash(processedPath);
	}
	return processedPath + removeTrailingSlash(concat.join(""));
}

function removeTrailingSlash(path: string) {
	if (path.endsWith("/")) {
		return path.slice(0, -1);
	}
	return path;
}

export const sleep:(ms:number) => Promise<void> = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getArtistPage = (artistName:string) => `https://eggs.mu/artist/${artistName}`;
export const getUserPage = (userName:string) => `https://eggs.mu/user/${userName}`;
export const getTrackPage = (artistName:string, musicId:string) => `https://eggs.mu/artist/${artistName}/song/${musicId}`;

export type ArtistFetcherString = "curryEggsRecommendedArtistsPlayback"|"curryEggsArtistSearchPlayback"|"curryEggsArtistRankingPlayback";
export type SongFetcherString = "artistAllTracks"|"artistTopTrack"|"artistNewTrack";

export interface SongCurry {
	artistFetcher:ArtistFetcherString;
	songFetcher:SongFetcherString;
	payload?:string;
}

export function currySongFunction(songCurry:SongCurry) {
	const songFunction = getSongFunction(songCurry.songFetcher);
	
	switch(songCurry.artistFetcher) {
	case "curryEggsRecommendedArtistsPlayback":
		return curryEggsRecommendedArtistsPlayback(songFunction);
	case "curryEggsArtistSearchPlayback":
		if (!songCurry.payload) throw new Error("payload is required for curryEggsArtistSearchPlayback");
		return curryEggsArtistSearchPlayback(songCurry.payload, songFunction);
	case "curryEggsArtistRankingPlayback":
		if (!songCurry.payload) throw new Error("payload is required for curryEggsArtistRankingPlayback");
		if (songCurry.payload !== "daily" && songCurry.payload !== "weekly") throw new Error("payload must be either daily or weekly");
		return curryEggsArtistRankingPlayback(songCurry.payload, songFunction);
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

export type Param = string|number|string[]|number[];

export function stringifyParam(param:Param) {
	if (Array.isArray(param)) {
		return param.join(",");
	}
	if (typeof param === "number") {
		return param.toString();
	}
	return param;
}

export async function getRanking(cache?:Cacher) {
	const path = window.location.pathname.split("/").slice(2);
	if (path.length !== 2) throw new Error("Invalid path");

	const timePeriod = path[1];
	if (timePeriod !== "daily" && timePeriod !== "weekly") throw new Error("Invalid path");


	// for some reason this breaks in the dev environment sometimes, dont worry about it, it works in prod.
	// even if it breaks it only slows down load by about 100ms its fine.
	switch(path[0]) {
	case "artist":
		return artistRanking(timePeriod, {limit: 30, offset: 0}, cache);
	case "song":
		return musicRanking(SourceType.Eggs, timePeriod, cache);
	case "youtube":
		return musicRanking(SourceType.YouTube, timePeriod, cache);
	}
	throw new Error("Invalid path");
}

export function toOrdinal(n:number) {
	switch (i18next.resolvedLanguage) {
	case "en": {
		const s = ["th","st","nd","rd"];
		const v = n % 100;
		return `${n}${s[(v-20)%10]||s[v]||s[0]}`;
	}
	case "ja":
		return `${n}位`;
	}
	return n.toString();
}

export interface SocialMedia {
	href:string;
	title:string;
}

export const prefectureLink = (code:number) => `/search/area/${prefectures[code-1]}`;
export const genreLink = (code:number) => `/search/genre/fg${code}`;

export const getStaticFileName = (path:string) => browser.runtime.getURL(`up_/static/${path}`);

export async function getMemberId():Promise<number> {
	return new Promise((resolve) => {
		window.addEventListener("message", e => {
			if (e.data.type === "memberId") {
				if (!e.data.data) {
					resolve(0);
				}
				resolve(parseInt(e.data.data as string));
			}
		});
		const s = document.createElement("script");
		s.src = getStaticFileName("idFetcher.js");
		(document.head || document.documentElement).appendChild(s);
		sleep(5000).then(() => resolve(0));
	});
}
