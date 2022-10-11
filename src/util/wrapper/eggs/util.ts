import { Param, stringifyParam } from "../../../util/util";
import { SongData } from "./artist";
import Cacher from "./cacher";

export interface List<T> {
	data: T[],
	totalCount: number,
}

export function fillEggsSearchParams(urlStr: string, params: { [key: string]: Param|undefined }): URL {
	const url = new URL(`${eggsRoot}${urlStr}`);
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		url.searchParams.set(key, stringifyParam(value));
	}
	return url;
}

export function offsetListMap<T, K>(l:OffsetList<T>, fn:(item:T) => K) {
	return {
		...l,
		data: l.data.map(fn)
	};
}

export interface OffsetList<T> extends List<T> {
	offset: string,
}

export interface OffsetHashList<T> extends List<T> {
	offsetHash: string,
}

export type ListUnion<T> = List<T> | OffsetHashList<T> | OffsetList<T>;

export const eggsRoot = "https://api-flmg.eggs.mu/v1/";

export type TrackFunc = (artistID:string, options?:{
	canPlaySong?:(track:SongData) => Promise<boolean>,
	cache?:Cacher
}) => Promise<SongData[]>

export type TrackFuncWrapped = (artistID: string) => Promise<SongData[]>

export const curryTrackFunc = (trackFunc:TrackFunc, options?:{
	canPlaySong?:(track:SongData) => Promise<boolean>,
	cache?:Cacher
}) =>
	async(artistID:string) => await trackFunc(artistID, options);

export const createEggsWrappedGetter = <T>(fn:(options:{offset:number, limit:number}) => Promise<ListUnion<T>>) => 
	async(offset:string, limit:number) => {
		const offsetNum = offset === "" ? 0 : Number(offset);
		const items = await fn({
			limit,
			offset: offsetNum,
		});
		return {
			...items,
			offset: (offsetNum + limit).toString()
		} as OffsetList<T>;
	};

export const createEggsWrappedGetterHash = <T>(fn:(limit:number, options?:{offsetHash?:string}) => Promise<OffsetHashList<T>>) =>
	async(limit:number, options?:{offsetHash?:string}) => {
		const res = await fn(
			limit,
			{offsetHash: options?.offsetHash}
		);
		return {
			data: res.data,
			totalCount: res.totalCount,
			offset: res.offsetHash
		} as OffsetList<T>;
	};

interface objWithArtistName {
	artistName: string;
}

export const createEggsWrappedGetterCached = <T extends objWithArtistName>(
	fn:(options:{limit:number, offset:number}) => Promise<List<T>>,
	trackFunc: TrackFuncWrapped
) => async(offset:string) => {
		// normalize inputs to make use of caching
		const internalLimit = 50;
		const adjOffset = offset || "0";
		const offsetNumber = parseInt(adjOffset);
		const offsetRounded = offsetNumber - (offsetNumber % internalLimit);
		const items = await fn({ limit: internalLimit, offset: offsetRounded });
		const item = items.data[offsetNumber % internalLimit];

		// return the actual tracks
		return {
			data: await trackFunc(item.artistName),
			totalCount: items.totalCount,
			offset: (offsetNumber + 1).toString(),
		};
	};

export interface Toggle {
	data:boolean;
}
