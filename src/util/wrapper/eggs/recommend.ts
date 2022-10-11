import { ArtistData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, createEggsWrappedGetterCached, fillEggsSearchParams, List, TrackFuncWrapped } from "./util";

export interface RecommendedArtist extends ArtistData {
	introduction:string;
}

export async function recommendedArtists(options?:{
		limit?:number,
		offset?:number,
		cache?:Cacher,
}) {
	const url = fillEggsSearchParams("recommend/recommend/artists", {
		limit: options?.limit,
		offset: options?.offset,
	});
	return eggsRequest(url, {}, {cache: options?.cache}) as Promise<List<RecommendedArtist>>;
}

export const eggsRecommendedArtistsWrapped = async(offset:string, limit:number) =>
	await createEggsWrappedGetter(recommendedArtists)(offset, limit);

export const curryEggsRecommendedArtistsPlayback = (trackFunc:TrackFuncWrapped) =>
	createEggsWrappedGetterCached(recommendedArtists, trackFunc);
