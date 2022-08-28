import { SongData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";

export interface Playlist {
  createdAt: string,
  displayUserName: string,
  isPrivate: number,
  musicData: SongData[],
  playlistId: string,
  playlistName: string,
  updatedAt: string,
  userId: number
}

export interface PlaylistPartial {
  arrayOfArtistId:string;
  arrayOfImageDataPath:string;
  arrayOfMusicId: string;
  createdAt: string;
  isPrivate: number;
  playlistId: string;
  playlistName: string;
  updatedAt: string;
  userId: number;
}

interface PlaylistPartials extends PlaylistPartialList {
  offsetHash: string;
}

export interface PlaylistPartialList {
  data: PlaylistPartial[];
  totalCount: number;
}

interface Playlists {
  data: Playlist[];
  totalCount: number;
}

export async function playlist(playlistID:string) {
	const playlist = await eggsRequest(`search/search/playlists?playlistIds=${playlistID}&limit=1`, {}, {}) as Playlists;
	if (playlist.totalCount) {
		return playlist;
	}
	return eggsRequest(`playlists/playlists/${playlistID}`, {}, { isAuthorizedRequest: true }) as Promise<Playlists>;
}

export async function getPlaylists(limit:number, options?: {
	offsetHash?:string,
	cache?:Cacher
}) {
	let qs = `limit=${limit}`;
	if (options?.offsetHash) qs += `&offsetHash=${options.offsetHash}`;
	return eggsRequest(`playlists/playlists?${qs}`, {}, { isAuthorizedRequest: true, cache: options?.cache }) as Promise<PlaylistPartials>;
}

export async function getEggsPlaylistsWrapped(offset:string, limit:number) {
	const playlists = await getPlaylists(limit, { offsetHash: offset || undefined });
	return {
		data: playlists.data.map(playlist => ({
			playlistID: playlist.playlistId,
			lastModified: new Date(playlist.updatedAt),
		})),
		totalCount: playlists.totalCount,
		offset: playlists.offsetHash,
	};
}

export async function playlistAdd(playlist:PlaylistPartial, song:{artistId:number, musicId:string}) {
	const playlistModifier = {
		playlistId: playlist.playlistId,
		playlistName: playlist.playlistName,
		arrayOfArtistId: playlist.arrayOfArtistId + `,${song.artistId}`,
		arrayOfMusicId: playlist.arrayOfMusicId + `,${song.musicId}`,
		isPrivate: playlist.isPrivate,
	};
	return eggsRequest("playlists/playlists", playlistModifier, { isPutRequest: true, isAuthorizedRequest: true }) as Promise<Playlist>;
}

export async function newPlaylists(options?:{offset?:number, limit?:number}) {
	const qs = new URLSearchParams();
	if (options?.offset) qs.set("offset", options.offset.toString());
	qs.set("limit", options?.limit?.toString() ?? "30");
	return eggsRequest(`playlists/new/playlists?${qs.toString()}`, {}, {}) as Promise<PlaylistPartialList>;
}

export async function getEggsNewPlaylistsWrapped(offset:string, limit:number) {
	const offsetNum = offset === "" ? 0 : Number(offset);
	const playlists = await newPlaylists({
		limit,
		offset: offsetNum,
	});
	return {
		data: playlists.data,
		totalCount: playlists.totalCount,
		offset: (offsetNum + limit).toString()
	};
}

export async function popularPlaylists(options?:{offset?:number, limit?:number}) {
	const qs = new URLSearchParams();
	if (options?.offset) qs.set("offset", options.offset.toString());
	qs.set("limit", options?.limit?.toString() ?? "30");
	return eggsRequest(`playlists/playlists/popular?${qs.toString()}`, {}, {}) as Promise<PlaylistPartialList>;
}

export async function getEggsPopularPlaylistsWrapped(offset:string, limit:number) {
	const offsetNum = offset === "" ? 0 : Number(offset);
	const playlists = await popularPlaylists({
		limit,
		offset: offsetNum,
	});
	return {
		data: playlists.data,
		totalCount: playlists.totalCount,
		offset: (offsetNum + limit).toString()
	};
}
