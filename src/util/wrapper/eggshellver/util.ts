export const baseURL = "http://localhost:10000";

export interface UserStub {
  userName: string;
  displayName: string;
  isArtist: boolean;
  imageDataPath: string;
  prefectureCode: number;
  profile: string;
}

type Param = string|number|string[];

function stringifyParam(param:Param) {
	if (Array.isArray(param)) {
		return param.join(",");
	}
	if (typeof param === "number") {
		return param.toString();
	}
	return param;
}

export function fillUrlSearchParams(url: URL, params: { [key: string]: Param }): URL {
	for (const [key, value] of Object.entries(params)) {
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
