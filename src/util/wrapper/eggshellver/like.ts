import Cacher from "../eggs/cacher";
import { eggshellverRequest } from "./request";
import { fillEggshellverSearchParams, UserStub } from "./util";

interface rawLikes {
  likes: {
    id: string;
    user: UserStub;
    timestamp: string;
    type: "track" | "playlist";
  }[];
  total: number;
}
interface Likes {
  likes: {
    id: string;
    user: UserStub;
    timestamp: Date;
    type: "track" | "playlist";
  }[];
  total: number;
}

export async function getLikes(options:{
  eggsIDs?: string,
  targetIDs?: string[],
  targetType?: "track" | "playlist",
  limit?: number,
  offset?: number,
}, cache?:Cacher):Promise<Likes> {
	const url = fillEggshellverSearchParams("likes", options);
	const likes = await eggshellverRequest(url, {}, {method: "GET", cache}) as rawLikes;

	return {
		likes: likes.likes.map(like => ({
			id: like.id,
			user: like.user,
			timestamp: new Date(like.timestamp),
			type: like.type
		})),
		total: likes.total
	};
}

export async function getEggshellverTrackLikesWrapped(eggsID:string) {
	const likes = await getLikes({
		eggsIDs: eggsID,
		limit: 1,
		targetType: "track"
	});
	return {
		item: likes.likes[0]?.id,
		totalCount: likes.total,
	};
}

export async function getEggshellverPlaylistLikesWrapped(eggsID:string) {
	const likes = await getLikes({
		eggsIDs: eggsID,
		limit: 1,
		targetType: "playlist"
	});
	return {
		item: likes.likes[0]?.id,
		totalCount: likes.total,
	};
}

export const postLikes = async(targetIDs:string[], type:"track"|"playlist") =>
	eggshellverRequest("likes", targetIDs.map(id => ({
		id,
		type,
	})), {method: "POST"}) as unknown as Promise<number>;

export const putLikes = async(targetIDs:string[], type:"track"|"playlist") =>
	eggshellverRequest("likes", {
		targets: targetIDs.map(id => ({
			id,
			type,
		})),
		type
	}, {method: "PUT"}) as unknown as Promise<number>;

export async function deleteLikes(trackIDs:string[]) {
	const url = fillEggshellverSearchParams("likes", {
		target: trackIDs
	});
	return eggshellverRequest(url, {}, {method: "DELETE"});
}

export const toggleLike = async(targetID:string, targetType:"track"|"playlist") => {
	return eggshellverRequest(`like/${targetType}/${targetID}`, {}, {method: "POST"});
};