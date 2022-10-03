import { ArtistData, SongData, SourceType } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, createEggsWrappedGetterCached, fillEggsSearchParams, List } from "./util";

export type TimePeriod = "daily"|"weekly";
export type RankingType = "artist"|"song"|"youtube";
export type ComparedRank = "stay"|"up"|"down";

export interface RankingSong {
	aggregationStartDate:string;
	aggregationEndDate:string;
	comparedRank:ComparedRank;
	musicId:string;
	musicPlayNumCount:number;
	rank:number;
	reportDate:string;
	musicData:SongData;
}

export interface RankingArtist {
	aggregationStartDate:string;
	aggregationEndDate:string;
	comparedRank:ComparedRank;
	artistId:number;
	artistPlayNumCount:number;
	rank:number;
	reportDate:string;
	artistData:ArtistData;
}

export async function musicRanking(sourceType:SourceType, period:TimePeriod, options?: {
	genreId?: number;
	cache?: Cacher;
}) {
	const url = fillEggsSearchParams("ranking/ranking/musics", {
		sourceType,
		period,
		genreId: options?.genreId,
	});
	return eggsRequest(url, {}, {cache: options?.cache}) as Promise<List<RankingSong>>;
}

export async function artistRanking(period:TimePeriod, options: {
	limit:number,
	offset:number,
	genreId?: number;
	cache?:Cacher,
}) {
	const url = fillEggsSearchParams("ranking/ranking/artists", {
		period,
		limit: options.limit,
		offset: options.offset,
		genreId: options.genreId,
	});
	return eggsRequest(url, {}, {cache: options.cache}) as Promise<List<RankingArtist>>;
}

const curryArtistRanking = (period:TimePeriod) => async(options: {limit:number, offset:number}) => artistRanking(period, options);
const curryArtistRankingMapped = (period:TimePeriod) => async(options: {limit:number, offset:number}) => {
	const data = await artistRanking(period, options);
	return {
		data: data.data.map(artist => artist.artistData),
		totalCount: data.totalCount,
	};
};

const curryGenreArtistRanking = (period:TimePeriod, genreId:number) => async(options: {limit:number, offset:number}) => artistRanking(period, {...options, genreId});
const curryGenreArtistRankingMapped = (period:TimePeriod, genreId:number) => async(options: {limit:number, offset:number}) => {
	const data = await artistRanking(period, {...options, genreId});
	return {
		data: data.data.map(artist => artist.artistData),
		totalCount: data.totalCount,
	};
};


export const curryArtistRankingWrapped = (period:TimePeriod) => async(offset:string, limit:number) => 
	await createEggsWrappedGetter(curryArtistRanking(period))(offset, limit);

export const curryEggsArtistRankingPlayback = (period:TimePeriod, trackFunc: (artistID:string, cache?:Cacher) => Promise<SongData[]>) =>
	createEggsWrappedGetterCached(curryArtistRankingMapped(period), trackFunc);

export const curryGenreArtistRankingWrapped = (period:TimePeriod, genreId:number) => async(offset:string, limit:number) =>
	await createEggsWrappedGetter(curryGenreArtistRanking(period, genreId))(offset, limit);

export const curryEggsGenreArtistRankingPlayback = (payload:string, trackFunc: (artistID:string, cache?:Cacher) => Promise<SongData[]>) => {
	const payloadSplit = payload.split("//");
	const period = payloadSplit[0] as TimePeriod;
	const genreId = parseInt(payloadSplit[1]);
	if (period !== "daily" && period !== "weekly") throw new Error("Invalid period");
	if (isNaN(genreId)) throw new Error("Invalid genreId");
	return createEggsWrappedGetterCached(curryGenreArtistRankingMapped(period, genreId), trackFunc);
};
