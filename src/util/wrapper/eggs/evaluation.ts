import Cacher from "./cacher";
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

export async function songLikeInfo(musicIds: (string|undefined)[], cache?:Cacher) {
	musicIds = musicIds.filter((id) => id !== undefined);
	if (musicIds.length === 0) return {
		totalCount: 0,
		data: [],
	};
	return eggsRequest(`evaluation/evaluation/musics/like_info?musicIds=${musicIds.join(",")}`, {}, { isAuthorizedRequest: true, cache }) as Promise<LikeInfo>;
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
	return eggsRequest(`evaluation/evaluation/musics/${musicId}/like`, {}, { isAuthorizedRequest: true, isPostRequest: true }) as Promise<{data:boolean}>;
}

export async function likePlaylist(playlistId: string) {
	return eggsRequest(`evaluation/evaluation/playlists/${playlistId}/like`, {}, { isAuthorizedRequest: true, isPostRequest: true }) as Promise<{data:boolean}>;
}

/*interface EvaluationTrack {
  musicId: string;
  numberOfComments: number;
  numberOfLikes: number;
  userId: number;
  isLike: boolean;
  musicData: SongData;
}*/

export async function getMusicLikes(options: {
  limit: number,
  offset: number,
}) {
	const qs = new URLSearchParams();
	qs.set("limit", options.limit.toString());
	qs.set("offset", options.offset.toString());
	qs.set("sortByUpdateAtOfLikes", "desc");
	return eggsRequest("evaluation/evaluation/musics/like?" + qs.toString(), {}, { isAuthorizedRequest: true }) as Promise<{
    totalCount: number;
    data: {
      isLike: boolean;
      musicId: string;
      numberOfComments: number;
      numberOfLikes: number;
    }[];
  }>;
}

export async function getEggsTrackLikesWrapped(offset:string, limit:number) {
	const offsetNum = offset === "" ? 0 : Number(offset);
	const likes = await getMusicLikes({
		limit,
		offset: offsetNum,
	});
	return {
		data: likes.data.map(like => like.musicId),
		totalCount: likes.totalCount,
		offset: (offsetNum + limit).toString()
	};
}

export async function getPlaylistLikes(options: {
  limit: number,
  offset: number,
}) {
	const qs = new URLSearchParams();
	qs.set("limit", options.limit.toString());
	qs.set("offset", options.offset.toString());
	qs.set("sortByUpdateAtOfLikes", "desc");
	return eggsRequest("evaluation/evaluation/playlists/like?" + qs.toString(), {}, { isAuthorizedRequest: true }) as Promise<{
    totalCount: number;
    data: {
      isLike: boolean;
      playlistId: string;
      userId: number;
      numberOfLikes: number;
    }[];
  }>;
}

export async function getEggsPlaylistLikesWrapped(offset:string, limit:number) {
	const offsetNum = offset === "" ? 0 : Number(offset);
	const likes = await getPlaylistLikes({
		limit,
		offset: offsetNum,
	});
	return {
		data: likes.data.map(like => like.playlistId),
		totalCount: likes.totalCount,
		offset: (offsetNum + limit).toString()
	};
}

