import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, fillEggsSearchParams, List } from "./util";

export enum SourceType {
  Eggs = 1,
  YouTube,
}

export interface ArtistData {
  activityArea: string|null,
  artistId: number,
  artistName: string,
  displayName: string,
  displayNameHiragana: string,
  displayNameKatakana: string,
  genreId1: number|null,
  genreId2: number|null,
  genreOther: number|null,
  imageDataPath: string|null,
  isDeliveryNews: number,
  label: string|null,
  mail: string,
  officialSiteUrl: string|null,
  prefectureCode: number|null,
  production: string|null,
  profile: string|null,
  reliability: number,
  twitterScreenName: string|null,
}

export interface SongData {
  artistData: ArtistData,
  cmoComposer: string|null,
  cmoLyricist: string|null,
  cmoProductCode: string|null,
  composer: string|null,
  copyrightManagement: number
  explanation: string|null,
  genreId: number|null,
  imageDataPath: string|null,
  inspectionStatus: string,
  isFollowerOnly: number,
  isInstrumental: number,
  isPublished: number,
  lyricist: string,
  lyrics: string,
  musicDataPath: string,
  musicId: string,
  musicTitle: string,
  musicTitleHiragana: string|null,
  musicTitleKatakana: string|null,
  numberOfComments: number,
  numberOfLikes: number,
  numberOfMusicPlays: number,
  originalMusicFileName: string,
  releaseDate: string,
  releaseEndDate: string|null,
  sortNumber: number,
  sourceType: SourceType,
  tags: string[],
  youtubeUrl: string|null,
  youtubeVideoId: string|null,
}

export async function artistTracks(artistID:string, cache?:Cacher) {
	return eggsRequest(`artists/artists/${artistID}/musics`, {}, {cache}) as Promise<List<SongData>>;
}


export async function artistAllTracks(artistID:string, cache?:Cacher) {
	return (await artistTracks(artistID, cache)).data;
}

export async function artistNewTrack(artistID:string, cache?:Cacher) {
	return (await eggsRequest(`artists/artists/${artistID}/musics?limit=1`, {}, {cache}) as List<SongData>).data;
}

export async function artistTopTrack(artistID:string, cache?:Cacher) {
	const allTracks = await artistAllTracks(artistID, cache);
	if (allTracks.length === 0) {
		return [];
	}
	let topTrack = allTracks[0];
	for (const track of allTracks) {
		if (track.numberOfMusicPlays > topTrack.numberOfMusicPlays) {
			topTrack = track;
		}
	}
	return [topTrack];
}

export async function newTracks(options:{
	limit:number,
	offset:number,
}, cache?:Cacher) {
	const url = fillEggsSearchParams("artists/new/musics", {
		...options
	});
	return eggsRequest(url, {}, {cache}) as Promise<List<SongData>>;
}

export const eggsNewTracksWrapped = async(offset:string, limit:number) =>
	await createEggsWrappedGetter(newTracks)(offset, limit);
