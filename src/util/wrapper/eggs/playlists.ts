import { IncrementerError } from "../../../App/components/sync/itemFetcher";
import { getEggshellverPlaylists } from "../eggshellver/playlist";
import { SongData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, createEggsWrappedGetterHash, fillEggsSearchParams, List, OffsetHashList, OffsetList, offsetListMap } from "./util";

export interface PlaylistPartial {
	createdAt:string;
	isPrivate:number;
	arrayOfArtistId:string;
	arrayOfMusicId:string;
	arrayOfImageDataPath:string;
	playlistId:string;
	playlistName:string;
	updatedAt:string;
	userId:number;
}

export interface Playlist extends PlaylistPartial {
  displayUserName:string;
  musicData:SongData[];
}

export async function playlist(playlistID:string) {
	const playlist = await eggsRequest(`search/search/playlists?playlistIds=${playlistID}&limit=1`, {}, {}) as List<Playlist>;
	if (playlist.totalCount) {
		return playlist;
	}
	return eggsRequest(`playlists/playlists/${playlistID}`, {}, {}) as Promise<List<Playlist>>;
}

export async function getPlaylists(limit:number, options?: {
	offsetHash?:string,
	cache?:Cacher
}) {
	const url = fillEggsSearchParams("playlists/playlists", {
		limit,
	});

	// avoid urlencoding
	const urlWHash = new URL(url.toString() + (options?.offsetHash ? `&offsetHash=${options.offsetHash}` : ""));

	return eggsRequest(urlWHash, {}, { isAuthorizedRequest: true, cache: options?.cache }) as Promise<OffsetHashList<PlaylistPartial>>;
}

export const eggsPlaylistsWrapped2 = async(offset:string, limit:number) =>
	await createEggsWrappedGetterHash(getPlaylists)(limit, {offsetHash:offset || undefined});

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

export async function newPlaylists(options?:{offset?:number, limit?:number}, cache?:Cacher) {
	const url = fillEggsSearchParams("playlists/new/playlists", {
		offset: options?.offset ?? 0,
		limit: options?.limit ?? 30,
	});
	return eggsRequest(url, {}, {cache}) as Promise<List<PlaylistPartial>>;
}

export const eggsNewPlaylistsWrapped = async(offset:string, limit:number) =>
	await createEggsWrappedGetter(newPlaylists)(offset, limit);

export async function popularPlaylists(options?:{offset?:number, limit?:number}, cache?:Cacher) {
	const url = fillEggsSearchParams("playlists/playlists/popular", {
		offset: options?.offset ?? 0,
		limit: options?.limit ?? 30,
	});
	return eggsRequest(url, {}, {cache}) as Promise<List<PlaylistPartial>>;
}

export const eggsPopularPlaylistsWrapped = async(offset:string, limit:number) =>
	await createEggsWrappedGetter(popularPlaylists)(offset, limit);

export async function publicPlaylists(playlistIDs:string[], limit:number, cache?:Cacher) {
	const url = fillEggsSearchParams("search/search/playlists", {
		playlistIds: playlistIDs,
		limit,
	});
	return eggsRequest(url, {}, {cache}) as Promise<List<Playlist>>;
}
	
export async function getPublicPlaylists(userIDs:string[], options:{offset:number, limit:number}, cache?:Cacher) {
	const cachedPlaylists = await getEggshellverPlaylists({
		offset: options.offset,
		limit: options.limit,
		eggsIDs: userIDs,
	});
	if (cachedPlaylists.playlists.length === 0) throw new Error(IncrementerError.NoItemsError);
	const res = await publicPlaylists(cachedPlaylists.playlists.map(p => p.playlistID), options.limit, cache);
	if (res.data.length === 0) throw new Error(IncrementerError.EmptyPage);

	return res;
}

const curryPublicPlaylists = (userIDs:string[]) => async(options: {offset:number, limit:number}) => getPublicPlaylists(userIDs, options);

export const publicPlaylistsWrapped = (userIDs:string[]) => async(offset:string, limit:number) =>
	await createEggsWrappedGetter(curryPublicPlaylists(userIDs))(offset, limit);


export function agnosticPlaylists(isSelf:boolean, userID:string) {
	if (isSelf) {
		return eggsPlaylistsWrapped2;
	}
	return publicPlaylistsWrapped([userID]) as (offset: string, limit: number) => Promise<OffsetList<PlaylistPartial>>;
}

export async function searchArtistPlaylists(artistName:string, limit:number, options?: {
	offsetHash?:string,
}, cache?:Cacher) {
	const url = fillEggsSearchParams("playlists/playlists/artists/search", {
		limit,
		artistName
	});

	// avoid urlencoding
	const urlWHash = new URL(url.toString() + (options?.offsetHash ? `&offsetHash=${options.offsetHash}` : ""));

	return eggsRequest(urlWHash, {}, {cache}) as Promise<OffsetHashList<PlaylistPartial>>;
}

const currySearchArtistPlaylists = (artistName:string) => async(limit:number, options?:{offsetHash?:string}) => searchArtistPlaylists(artistName, limit, options);

export const curryEggsSearchArtistPlaylistsWrapped = (artistName:string) => async(offset:string, limit:number) =>
	await createEggsWrappedGetterHash(currySearchArtistPlaylists(artistName))(limit, {offsetHash:offset || undefined});