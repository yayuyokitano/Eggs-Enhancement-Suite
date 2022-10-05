import Cacher from "../eggs/cacher";
import {trackDetails} from "../eggs/search";
import { Playlist, publicPlaylists } from "../eggs/playlists";
import { eggshellverRequest } from "./request";
import { getUsers } from "./user";
import { fillEggshellverSearchParams, UserStub } from "./util";
import { List } from "../eggs/util";
import { SongData } from "../eggs/artist";

type TimelineType = "music"|"playlist"|"follow"|"musiclike"|"playlistlike";

interface RawTimelineEvent {
	id: string;
	target: string;
	timestamp: string;
	type: TimelineType;
}

export type TimelineEvent = {
	user:UserStub;
	target:UserStub;
	type:"follow";
	timestamp:Date;
}|{
	user:UserStub;
	target:SongData;
	type:"musiclike"|"music";
	timestamp:Date;
}|{
	user:UserStub;
	target:Playlist;
	type:"playlistlike"|"playlist";
	timestamp:Date;
}

export async function getTimeline(options:{
  eggsID: string,
  limit?: number,
  offset?: number,
}, cache?:Cacher):Promise<TimelineEvent[]> {
	const url = fillEggshellverSearchParams("timeline", options);
	const rawTimeline = await eggshellverRequest(url, {}, {method: "GET", cache}) as RawTimelineEvent[];
	const users = new Set<string>();
	const music = new Set<string>();
	const playlists = new Set<string>();
	for (const event of rawTimeline) {
		users.add(event.id);
		switch (event.type) {
		case "music":
		case "musiclike":
			music.add(event.target);
			break;
		case "playlist":
		case "playlistlike":
			playlists.add(event.target);
			break;
		case "follow":
			users.add(event.target);
			break;
		}
	}
	const [userArr, playlistArr, trackArr] = await Promise.allSettled([
		getUsers({
			eggsids: [...users]
		}),
		publicPlaylists([...playlists], playlists.size),
		trackDetails([...music])
	]) as [PromiseSettledResult<UserStub[]>, PromiseSettledResult<List<Playlist>>, PromiseSettledResult<List<SongData>>];

	const userMap = new Map<string, UserStub>();
	if (userArr.status === "fulfilled") {
		for (const user of userArr.value) {
			userMap.set(user.userName, user);
		}
	}
	const playlistMap = new Map<string, Playlist>();
	if (playlistArr.status === "fulfilled") {
		for (const playlist of playlistArr.value.data) {
			playlistMap.set(playlist.playlistId, playlist);
		}
	}
	const trackMap = new Map<string, SongData>();
	if (trackArr.status === "fulfilled") {
		for (const track of trackArr.value.data) {
			trackMap.set(track.musicId, track);
		}
	}

	return rawTimeline.filter(event => {
		if (!userMap.get(event.id)) {
			return false;
		}
		switch (event.type) {
		case "music":
		case "musiclike":
			return Boolean(trackMap.get(event.target));
		case "playlist":
		case "playlistlike":
			return Boolean(playlistMap.get(event.target));
		case "follow":
			return Boolean(userMap.get(event.target));
		}
	}).map(event => {
		const user = userMap.get(event.id);
		if (!user) {
			throw new Error("User not found");
		}
		switch (event.type) {
		case "music":
		case "musiclike": {
			const target = trackMap.get(event.target);
			if (!target) {
				throw new Error("Track not found");
			}
			return {
				user,
				target,
				timestamp: new Date(event.timestamp),
				type: event.type
			};
		}
		case "playlist":
		case "playlistlike": {
			const target = playlistMap.get(event.target);
			if (!target) {
				throw new Error("Playlist not found");
			}
			return {
				user,
				target,
				timestamp: new Date(event.timestamp),
				type: event.type
			};
		}
		case "follow": {
			const target = userMap.get(event.target);
			if (!target) {
				throw new Error("Target not found");
			}
			return {
				user,
				target,
				timestamp: new Date(event.timestamp),
				type: event.type
			};
		}
		}
	});
}