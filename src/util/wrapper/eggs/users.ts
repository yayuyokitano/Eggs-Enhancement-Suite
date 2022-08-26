import { UserStub } from "../eggshellver/util";
import { ArtistData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";

export interface Profile {
  data: {
    birthDate: string,
    displayName: string,
    displayNameKatakana: string,
    gender: string,
    genreId1: number|null,
    genreId2: number|null,
    genreOther: number|null,
    imageDataPath: string|null,
    isDeliveryNews: number,
    isPublished: number,
    mail: string,
    prefectureCode: number|null,
    profile: string|null,
    reliability: number,
    totalToken: number,
    userId: number,
    userName: string
  }
}

export async function profile(cache?:Cacher) {
	return eggsRequest("users/users/profile", {}, {
		isAuthorizedRequest: true,
		cache,
	}) as Promise<Profile>;
}

export async function getFollows(limit:number, offset?:number) {
	let qs = `?limit=${limit}`;
	if (offset) qs += `&offset=${offset}`;
	return eggsRequest("users/users/follow" + qs, {}, {
		isAuthorizedRequest: true,
	}) as Promise<{
    data: ArtistData[],
    totalCount: number,
  }>;
}

export async function getEggsFollowsWrapped(offset:string, limit:number) {
	const offsetNum = offset === "" ? 0 : Number(offset);
	const follows = await getFollows(limit, offsetNum);
	return {
		syncItems: follows.data.map(follow => artistToUserStub(follow)),
		totalCount: follows.totalCount,
		offset: (offsetNum + limit).toString()
	};
}

function artistToUserStub(artist:ArtistData):UserStub {
	return {
		userName: artist.artistName,
		displayName: artist.displayName,
		isArtist: true,
		imageDataPath: artist.imageDataPath ?? "",
		prefectureCode: artist.prefectureCode ?? 0,
		profile: artist.profile ?? "",
	};
}
