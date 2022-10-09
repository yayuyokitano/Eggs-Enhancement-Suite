import { Param, SocialMedia, stringifyParam } from "../../../util/util";

export const baseURL = "://eggshellver.com/api/";

export interface BaseUserStub {
  userName: string;
  displayName: string;
  isArtist: boolean;
  imageDataPath: string;
  prefectureCode: number;
  profile: string;
}

export interface StrictUserStub extends BaseUserStub {
	userId: number;
}

export interface AwaitingUserStub extends BaseUserStub {
	userId: Promise<number>;
	genres?: SocialMedia[];
}

export interface UserStub extends StrictUserStub {
	genres?: SocialMedia[];
}

export function fillEggshellverSearchParams(urlStr:string, params: { [key: string]: Param|undefined }): URL {
	const url = new URL(`https${baseURL}${urlStr}`);
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
	artistId: number;
}|{
  userName: string;
  displayName: string;
  profile: string|null;
  prefectureCode: number|null;
  imageDataPath: string|null;
	userId: number;
}): UserStub {
	if ("userName" in user) return {
		userName: user.userName,
		displayName: user.displayName,
		isArtist: false,
		imageDataPath: user.imageDataPath ?? "",
		prefectureCode: user.prefectureCode ?? 0,
		profile: user.profile ?? "",
		userId: user.userId,
	};
	return {
		userName: user.artistName,
		displayName: user.displayName,
		isArtist: user.profile !== null,
		imageDataPath: user.imageDataPath ?? "",
		prefectureCode: user.prefectureCode ?? 0,
		profile: user.profile ?? "",
		userId: user.artistId,
	};
}
