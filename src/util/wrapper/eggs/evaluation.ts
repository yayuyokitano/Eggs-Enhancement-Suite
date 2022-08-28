import Cacher from "./cacher";
import { eggsRequest } from "./request";
import { createEggsWrappedGetter, fillEggsSearchParams, List, offsetListMap } from "./util";


interface Like {
	isLike: boolean;
	numberOfLikes: number;
}
interface MusicLike extends Like {
	musicId: string;
	numberOfComments: number;
}

interface PlaylistLike {
	userId: number;
	playlistId: string;
}

export async function songLikeInfo(musicIds: (string|undefined)[], cache?:Cacher) {
	musicIds = musicIds.filter((id) => id !== undefined);
	if (musicIds.length === 0) return {
		totalCount: 0,
		data: [],
	};
	return eggsRequest(`evaluation/evaluation/musics/like_info?musicIds=${musicIds.join(",")}`, {}, { isAuthorizedRequest: true, cache }) as Promise<List<MusicLike>>;
}

export async function playlistLikeInfo(playlistIds: (string|undefined)[]) {
	playlistIds = playlistIds.filter((id) => id !== undefined);
	if (playlistIds.length === 0) return {
		totalCount: 0,
		data: [],
	};
	return eggsRequest(`evaluation/evaluation/playlists/like_info?playlistIds=${playlistIds.join(",")}`, {}, { isAuthorizedRequest: true }) as Promise<List<PlaylistLike>>;
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

export async function musicLikes(options: {
  limit: number,
  offset: number,
}) {
	const url = fillEggsSearchParams("evaluation/evaluation/musics/like", {
		...options,
		sortByUpdateAtOfLikes: "desc",
	});
	return eggsRequest(url, {}, { isAuthorizedRequest: true }) as Promise<List<MusicLike>>;
}

export const eggsTrackLikesWrapped = async(offset:string, limit:number) =>
	offsetListMap(await createEggsWrappedGetter(musicLikes)(offset, limit), track => track.musicId);

export async function playlistLikes(options: {
  limit: number,
  offset: number,
}) {
	const url = fillEggsSearchParams("evaluation/evaluation/playlists/like", {
		...options, sortByUpdateAtOfLikes: "desc",
	});
	return eggsRequest(url, {}, { isAuthorizedRequest: true }) as Promise<List<PlaylistLike>>;
}

export const eggsPlaylistLikesWrapped = async(offset:string, limit:number) =>
	offsetListMap(await createEggsWrappedGetter(playlistLikes)(offset, limit), playlist => playlist.playlistId);
