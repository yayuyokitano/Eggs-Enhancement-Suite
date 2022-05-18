import { eggsRequest } from "./request";

type LikeInfo = {
  totalCount:number;
  data: {
    isLike: boolean;
    musicId: string;
    numberOfComments: number;
    numberOfLikes: number;
  }[];
}

export async function songLikeInfo(musicIds: (string|undefined)[]) {
  musicIds = musicIds.filter((id) => id !== undefined);
  if (musicIds.length === 0) return {
    totalCount: 0,
    data: [],
  };
  return eggsRequest(`evaluation/evaluation/musics/like_info?musicIds=${musicIds.join(",")}`, {}, { isAuthorizedRequest: true }) as Promise<LikeInfo>;
}

export async function playlistLikeInfo(playlistIds: (string|undefined)[]) {
  playlistIds = playlistIds.filter((id) => id !== undefined);
  if (playlistIds.length === 0) return {
    totalCount: 0,
    data: [],
  };
  return eggsRequest(`evaluation/evaluation/playlists/like_info?playlistIds=${playlistIds.join(",")}`, {}, { isAuthorizedRequest: true }) as Promise<LikeInfo>;
}

export async function likeSong(musicId: string) {
  return eggsRequest(`evaluation/evaluation/musics/${musicId}/like`, {}, { isAuthorizedRequest: true, isPostRequest: true }) as Promise<{}>;
}

export async function likePlaylist(playlistId: string) {
  return eggsRequest(`evaluation/evaluation/playlists/${playlistId}/like`, {}, { isAuthorizedRequest: true, isPostRequest: true }) as Promise<{}>;
}
