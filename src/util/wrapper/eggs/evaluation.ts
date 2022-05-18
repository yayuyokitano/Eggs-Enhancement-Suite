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

export async function likeInfo(musicIds: (string|undefined)[]) {
  musicIds = musicIds.filter((id) => id !== undefined);
  if (musicIds.length === 0) return {
    totalCount: 0,
    data: [],
  };
  return eggsRequest(`evaluation/evaluation/musics/like_info?musicIds=${musicIds.join(",")}`, {}, { isAuthorizedRequest: true }) as Promise<LikeInfo>;
}

export async function like(musicId: string) {
  return eggsRequest(`evaluation/evaluation/musics/${musicId}/like`, {}, { isAuthorizedRequest: true, isPostRequest: true }) as Promise<{}>;
}