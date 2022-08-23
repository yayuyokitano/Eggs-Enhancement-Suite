export const baseURL = "http://localhost:10000";

export interface UserStub {
  userName: string;
  displayName: string;
  isArtist: boolean;
  imageDataPath: string;
  prefectureCode: number;
  profile: string;
}

export function fillUrlSearchParams(url: URL, params: { [key: string]: string|number|string[] }): URL {
  for (let [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value = value.join(",");
    }
    if (typeof value === "number") {
      value = value.toString();
    }
    url.searchParams.set(key, value);
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
