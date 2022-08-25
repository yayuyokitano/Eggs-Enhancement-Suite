import { getEggshellverToken } from "../../util";
import { baseURL, fillUrlSearchParams, UserStub } from "./util";

interface rawPlaylists {
  playlists: {
    playlistID: string;
    user: UserStub;
    timestamp: string;
  }[];
  total: number;
}
interface Playlists {
  playlists: {
    playlistID: string;
    user: UserStub;
    timestamp: Date;
  }[];
  total: number;
}

export async function getPlaylists(options:{
  eggsIDs?: string[],
  playlistIDs?: string[],
  limit?: number,
  offset?: number,
}):Promise<Playlists> {
	const url = fillUrlSearchParams(new URL(`${baseURL}/playlists`), options);
	const res = await fetch(url);
	if (!res.ok) throw new Error(await res.text());
	const playlists = (await (await fetch(url)).json()) as rawPlaylists;
	return {
		playlists: playlists.playlists.map(playlist => ({
			playlistID: playlist.playlistID,
			user: playlist.user,
			timestamp: new Date(playlist.timestamp)
		})),
		total: playlists.total
	};
}

export async function getEggshellverPlaylistsWrapped(eggsID:string) {
	const playlists = await getPlaylists({
		eggsIDs: [eggsID],
		limit: 1,
	});
	return {
		item: {
			playlistID: playlists.playlists[0]?.playlistID,
			lastModified: playlists.playlists[0]?.timestamp,
		},
		totalCount: playlists.total,
	};
}

export async function postPlaylists(playlists:PlaylistWrapper[]) {
	const res = await fetch(`${baseURL}/playlists`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(playlists)
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}

export async function putPlaylists(playlists:PlaylistWrapper[]) {
	const res = await fetch(`${baseURL}/playlists`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(playlists)
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}

export async function deletePlaylists(playlistIDs:string[]) {
	const url = fillUrlSearchParams(new URL(`${baseURL}/playlists`), {
		target: playlistIDs
	});
	const res = await fetch(url, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(playlistIDs)
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}


export interface PlaylistWrapper {
  playlistID:string,
  lastModified:Date,
}
