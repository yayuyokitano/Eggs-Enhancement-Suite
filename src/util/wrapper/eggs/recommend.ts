import { ArtistData, SongData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";

interface ArtistList {
	data: ArtistData[];
	totalCount: number;
}

export async function recommendedArtists(options?:{
		limit?:number,
		offset?:number,
		cache?:Cacher,
}) {
	const params = new URLSearchParams();
	if (options?.limit) params.set("limit", options.limit.toString());
	if (options?.offset) params.set("offset", options.offset.toString());
	return eggsRequest(`recommend/recommend/artists?${params.toString()}`, {}, {cache: options?.cache}) as Promise<ArtistList>;
}

export async function getEggsRecommendedArtistsWrapped(offset:string, limit:number) {
	const offsetNum = offset === "" ? 0 : Number(offset);
	const artists = await recommendedArtists({
		limit,
		offset: offsetNum,
	});
	return {
		data: artists.data,
		totalCount: artists.totalCount,
		offset: (offsetNum + limit).toString()
	};
}

export function curryEggsRecommendedArtistsWrapped(trackFunc: (artistID:string, cache?:Cacher) => Promise<SongData[]>) {

	return async(offset:string) => {

		// normalize inputs to make use of caching
		const internalLimit = 50;
		const adjOffset = offset || "0";
		const offsetNumber = parseInt(adjOffset);
		const offsetRounded = offsetNumber - (offsetNumber % internalLimit);
		const artists = await recommendedArtists({ limit: internalLimit, offset: offsetRounded });
		const artist = artists.data[offsetNumber % internalLimit];

		// return the actual tracks
		return {
			data: await trackFunc(artist.artistName),
			offset: (offsetNumber + 1).toString(),
			totalCount: artists.totalCount,
		};
			
	};

}