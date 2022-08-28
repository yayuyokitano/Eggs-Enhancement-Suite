import { ArtistData, SongData } from "./artist";
import Cacher from "./cacher";
import { PlaylistPartialList } from "./playlists";
import { eggsRequest } from "./request";

export async function searchPlaylists(searchWord:string, options: {
  limit: number,
  offset: number,
}, cache?:Cacher) {
	const qs = new URLSearchParams();
	qs.set("playlistName", searchWord);
	qs.set("limit", options.limit.toString());
	qs.set("offset", options.offset.toString());
	return eggsRequest("search/search/playlists?" + qs.toString(), {}, {cache}) as Promise<PlaylistPartialList>;
}

export function curryEggsPlaylistSearchWrapped(searchWord:string) {
	return async(offset:string, limit:number) => {
		const offsetNum = offset === "" ? 0 : Number(offset);
		const playlists = await searchPlaylists(searchWord, {
			limit,
			offset: offsetNum,
		});
		return {
			...playlists,
			offset: (offsetNum + limit).toString()
		};
	};
}

export async function searchArtists(searchWord:string, options: {
  limit: number,
  offset: number,
}, cache?:Cacher) {
	const qs = new URLSearchParams();
	qs.set("searchWord", searchWord);
	qs.set("limit", options.limit.toString());
	qs.set("offset", options.offset.toString());
	return eggsRequest("search/search/artists?" + qs.toString(), {}, {cache}) as Promise<{totalCount:number, data: ArtistData[]}>;
}

export function curryEggsArtistSearchWrapped(searchWord:string) {
	return async(offset:string, limit:number) => {
		const offsetNum = offset === "" ? 0 : Number(offset);
		const artists = await searchArtists(searchWord, {
			limit,
			offset: offsetNum,
		});
		return {
			...artists,
			offset: (offsetNum + limit).toString()
		};
	};
}

export function curryEggsArtistSearchPlayback(searchWord:string, trackFunc: (artistID:string, cache?:Cacher) => Promise<SongData[]>) {

	return async(offset:string) => {

		// normalize inputs to make use of caching
		const internalLimit = 50;
		const adjOffset = offset || "0";
		const offsetNumber = parseInt(adjOffset);
		const offsetRounded = offsetNumber - (offsetNumber % internalLimit);
		const artists = await searchArtists(searchWord, { limit: internalLimit, offset: offsetRounded });
		const artist = artists.data[offsetNumber % internalLimit];

		// return the actual tracks
		return {
			data: await trackFunc(artist.artistName),
			offset: (offsetNumber + 1).toString(),
			totalCount: artists.totalCount,
		};
			
	};

}