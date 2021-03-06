import { PlaybackController } from "App/player/playback";
import { TFunction } from "react-i18next";
import browser from "webextension-polyfill";
import { apiKey } from "./scrobbler";

const generateRandomHex = (size:number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

async function getDeviceID() {
  const deviceID = await browser.storage.local.get("deviceID");
  if (deviceID.deviceID) {
    return deviceID.deviceID;
  }
  const newDeviceID = generateRandomHex(16);
  await browser.storage.local.set({deviceID: newDeviceID});
  return newDeviceID;
}

export async function getToken() {
  return browser.storage.local.get();
}

export const eggsRoot = "https://api-flmg.eggs.mu/v1/";
export const eggsSelector = "https://api-flmg.eggs.mu/v1/*";
export const eggsUserAgent = "flamingo/7.1.00 (Android; 11)";
export const defaultAvatar = "https://eggs.mu/wp-content/themes/eggs/assets/img/common/signin.png";

export async function getEggsHeaders(isAuthorizedRequest:boolean = false):Promise<{
  "User-Agent": string;
  Apversion: string;
  "Content-Type": string;
  deviceId: any;
  deviceName: string;
  authorization: string;
} | {
  "User-Agent": string;
  Apversion: string;
  "Content-Type": string;
  deviceId: any;
  deviceName: string;
}> {
  const token = (await getToken()).token;
  if (isAuthorizedRequest) {
    if (!token) {
      throw new Error("Not logged in.");
    }
    return {
      "User-Agent": eggsUserAgent,
      Apversion: "7.1.00",
      "Content-Type": "application/json; charset=utf-8",
      deviceId: await getDeviceID(),
      deviceName: "SM-G977N",
      authorization: "Bearer " + token,
    };
  }
  return {
    "User-Agent": eggsUserAgent,
    Apversion: "7.1.00",
    "Content-Type": "application/json; charset=utf-8",
    deviceId: await getDeviceID(),
    deviceName: "SM-G977N"
  };
};

// returns shuffled array, avoids mutating the original array to allow unshuffling.
export function shuffleArray(array:any[]) {
  let copy = [...array];
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

export function numToSingularPlural(num:number) {
  return num === 1 ? "singular" : "plural";
}

export function getTimeSince(timestamp:string, t:TFunction) {
  const oldUnix = new Date(timestamp).getTime();
  const newUnix = new Date().getTime();
  const diff = newUnix - oldUnix;
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (years) {
    return years.toString() + t(`general.timeSince.year.${numToSingularPlural(years)}`);
  }
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months) {
    return months.toString() + t(`general.timeSince.month.${numToSingularPlural(months)}`);
  }
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  if (weeks) {
    return weeks.toString() + t(`general.timeSince.week.${numToSingularPlural(weeks)}`);
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days) {
    return days.toString() + t(`general.timeSince.day.${numToSingularPlural(days)}`);
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours) {
    return hours.toString() + t(`general.timeSince.hour.${numToSingularPlural(hours)}`);
  }
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes) {
    return minutes.toString() + t(`general.timeSince.minute.${numToSingularPlural(minutes)}`);
  }
  return t("general.timeSince.recent");
}

export function addToSearch(url:string, addedParams:{[key:string]:string}) {
  const params = new URLSearchParams(url.split("?")[1]);
  for (let [key, value] of Object.entries(addedParams)) {
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

const prefix = "[([{?????????????????????????????????_???]";
const suffix = "[)\\]}?????????????????????????????????]";

const trackFilters = [
  `${prefix}?\\s*(MV|??????|DEMO|??????|????????????)\\s*${suffix}?`,
];

const artistFilters = [
  `${prefix}?\\s*(official|??????)\\s*${suffix}?`,
];

const albumFilters = [
  " - (EP|Single)"
];

export function processTrackName(track:string|undefined) {
  if (!track) return "";
  for (let filter of trackFilters) {
    const regex = new RegExp(filter, "gi");
    track = track.replace(regex, "");
  }
  return track.trim();
}

export function processArtistName(artist:string|undefined) {
  if (!artist) return "";
  for (let filter of artistFilters) {
    const regex = new RegExp(filter, "gi");
    artist = artist.replace(regex, "");
  }
  return artist.trim();
}

export function processAlbumName(album:string|undefined) {
  if (!album) return "";
  for (let filter of albumFilters) {
    const regex = new RegExp(filter, "gi");
    album = album.replace(regex, "");
  }
  return album.trim();
}

export async function queryAsync(selector:string):Promise<Element> {
  return new Promise((resolve, reject) => {
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
    });
  });
}

export async function getVolume():Promise<number|undefined> {
  const volume = await browser.storage.local.get("volume");
  return volume?.volume;
}

export async function updateVolume(volume:number, playbackController?:PlaybackController) {
  if (playbackController) {
    playbackController.volume = volume;
  }
  await browser.storage.local.set({
    volume,
  });
}
