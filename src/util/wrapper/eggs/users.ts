import { UserStub } from "../eggshellver/util";
import { ArtistData } from "./artist";
import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, fillEggsSearchParams, List, offsetListMap, Toggle } from "./util";

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

export async function getFollows(options:{limit:number, offset?:number}) {
	const url = fillEggsSearchParams("users/users/follow", {...options});
	return eggsRequest(url, {}, {
		isAuthorizedRequest: true,
	}) as Promise<List<ArtistData>>;
}

export const eggsFollowsWrapped = async(offset:string, limit:number) => 
	offsetListMap(await createEggsWrappedGetter(getFollows)(offset, limit), artist => artistToUserStub(artist));

function artistToUserStub(artist:ArtistData):UserStub {
	return {
		userId: artist.artistId,
		userName: artist.artistName,
		displayName: artist.displayName,
		isArtist: true,
		imageDataPath: artist.imageDataPath ?? "",
		prefectureCode: artist.prefectureCode ?? 0,
		profile: artist.profile ?? "",
	};
}

export function follow(artistName:string) {
	return eggsRequest("users/users/follow", {artistName}, {
		isPostRequest: true,
		isAuthorizedRequest: true,
	}) as Promise<Toggle>;
}
