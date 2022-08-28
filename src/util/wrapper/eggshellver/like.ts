import { getEggshellverToken } from "../../util";
import { baseURL, fillEggshellverSearchParams, UserStub } from "./util";

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
}):Promise<Likes> {
	const url = fillEggshellverSearchParams("likes", options);
	const res = await fetch(url);
	if (!res.ok) throw new Error(await res.text());

	const likes = (await res.json()) as rawLikes;
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

export async function postLikes(targetIDs:string[], type:"track"|"playlist") {
	const res = await fetch(`${baseURL}/likes`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(targetIDs.map(e => ({
			id: e,
			type,
		})))
	});
	return res.text();
}

export async function putLikes(targetIDs:string[], type:"track"|"playlist") {
	const res = await fetch(`${baseURL}/likes`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify({
			targets: targetIDs.map(e => ({
				id: e,
				type,
			})),
			type,
		}),
	});
	return res.text();
}

export async function deleteLikes(trackIDs:string[]) {
	const url = fillEggshellverSearchParams("likes", {
		target: trackIDs
	});
	const res = await fetch(url, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(trackIDs)
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}
