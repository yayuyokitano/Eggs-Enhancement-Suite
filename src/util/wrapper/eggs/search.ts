import { ArtistData, SongData } from "./artist";
import Cacher from "./cacher";
import { PlaylistPartial } from "./playlists";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, createEggsWrappedGetterCached, fillEggsSearchParams, List } from "./util";

export async function searchPlaylists(playlistName:string, options: {
  limit: number,
  offset: number,
}, cache?:Cacher) {
	const url = fillEggsSearchParams("search/search/playlists", {
		...options,
		playlistName
	});
	return eggsRequest(url, {}, {cache}) as Promise<List<PlaylistPartial>>;
}

const currySearchPlaylists = (searchWord:string) =>
	async(options: {offset:number, limit:number}) => searchPlaylists(searchWord, {...options});

export const currySearchPlaylistsWrapped = (searchWord:string) => async(offset:string, limit:number) => 
	await createEggsWrappedGetter(currySearchPlaylists(searchWord))(offset, limit);

export async function searchArtists(searchWord:string, options: {
  limit: number,
  offset: number,
}, cache?:Cacher) {
	const url = fillEggsSearchParams("search/search/artists", {
		...options,
		searchWord
	});
	return eggsRequest(url, {}, {cache}) as Promise<{totalCount:number, data: ArtistData[]}>;
}

const currySearchArtists = (searchWord:string) => async(options: {offset:number, limit:number}) => searchArtists(searchWord, options);

export const currySearchArtistsWrapped = (searchWord:string) => async(offset:string, limit:number) => 
	await createEggsWrappedGetter(currySearchArtists(searchWord))(offset, limit);

export const curryEggsArtistSearchPlayback = (query:string, trackFunc: (artistID:string, cache?:Cacher) => Promise<SongData[]>) =>
	createEggsWrappedGetterCached(currySearchArtists(query), trackFunc);
