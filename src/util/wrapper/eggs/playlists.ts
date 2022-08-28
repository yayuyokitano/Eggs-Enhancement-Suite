import { SongData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, createEggsWrappedGetterHash, fillEggsSearchParams, List, OffsetHashList, offsetListMap } from "./util";

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

export async function playlist(playlistID:string) {
	const playlist = await eggsRequest(`search/search/playlists?playlistIds=${playlistID}&limit=1`, {}, {}) as List<Playlist>;
	if (playlist.totalCount) {
		return playlist;
	}
	return eggsRequest(`playlists/playlists/${playlistID}`, {}, { isAuthorizedRequest: true }) as Promise<List<Playlist>>;
}

export async function getPlaylists(limit:number, options?: {
	offsetHash?:string,
	cache?:Cacher
}) {
	const url = fillEggsSearchParams("playlists/playlists", {
		limit,
		offsetHash: options?.offsetHash
	});
	return eggsRequest(url, {}, { isAuthorizedRequest: true, cache: options?.cache }) as Promise<OffsetHashList<PlaylistPartial>>;
}

export const eggsPlaylistsWrapped = async(offset:string, limit:number) => 
	offsetListMap(await createEggsWrappedGetterHash(getPlaylists)(limit, {offsetHash:offset || undefined}), playlist => ({
		playlistID: playlist.playlistId,
		lastModified: new Date(playlist.updatedAt),
	}));

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
	const url = fillEggsSearchParams("playlists/new/playlists", {
		offset: options?.offset ?? 0,
		limit: options?.limit ?? 30,
	});
	return eggsRequest(url, {}, {}) as Promise<List<PlaylistPartial>>;
}

export const eggsNewPlaylistsWrapped = async(offset:string, limit:number) =>
	await createEggsWrappedGetter(newPlaylists)(offset, limit);

export async function popularPlaylists(options?:{offset?:number, limit?:number}) {
	const url = fillEggsSearchParams("playlists/playlists/popular", {
		offset: options?.offset ?? 0,
		limit: options?.limit ?? 30,
	});
	return eggsRequest(url, {}, {}) as Promise<List<PlaylistPartial>>;
}

export const eggsPopularPlaylistsWrapped = async(offset:string, limit:number) =>
	await createEggsWrappedGetter(popularPlaylists)(offset, limit);

