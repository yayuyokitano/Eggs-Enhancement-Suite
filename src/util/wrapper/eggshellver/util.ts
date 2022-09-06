import { Param, SocialMedia, stringifyParam } from "../../../util/util";

export const baseURL = "https://localhost:10000/";

export interface StrictUserStub {
  userName: string;
  displayName: string;
  isArtist: boolean;
  imageDataPath: string;
  prefectureCode: number;
  profile: string;
}

export interface UserStub extends StrictUserStub {
	genres?: SocialMedia[];
}

export function fillEggshellverSearchParams(urlStr:string, params: { [key: string]: Param|undefined }): URL {
	const url = new URL(`${baseURL}${urlStr}`);
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		url.searchParams.set(key, stringifyParam(value));
	}
	return url;
}

export function createUserStub(user:{
  artistName: string;
  displayName: string;
  profile: string|null;
  prefectureCode: number|null;
  imageDataPath: string|null;
}|{
  userName: string;
  displayName: string;
  profile: string|null;
  prefectureCode: number|null;
  imageDataPath: string|null;
}): UserStub {
	if ("userName" in user) return {
		userName: user.userName,
		displayName: user.displayName,
		isArtist: false,
		imageDataPath: user.imageDataPath ?? "",
		prefectureCode: user.prefectureCode ?? 0,
		profile: user.profile ?? "",
	};
	return {
		userName: user.artistName,
		displayName: user.displayName,
		isArtist: user.profile !== null,
		imageDataPath: user.imageDataPath ?? "",
		prefectureCode: user.prefectureCode ?? 0,
		profile: user.profile ?? "",
	};
}
