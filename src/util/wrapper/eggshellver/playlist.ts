import Cacher from "../eggs/cacher";
import { eggshellverRequest } from "./request";
import { fillEggshellverSearchParams, UserStub } from "./util";

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

export async function getEggshellverPlaylists(options:{
  eggsIDs?: string[],
  playlistIDs?: string[],
  limit?: number,
  offset?: number,
}, cache?:Cacher):Promise<Playlists> {
	const url = fillEggshellverSearchParams("playlists", options);
	const playlists = await eggshellverRequest(url, {}, {method: "GET", cache}) as rawPlaylists;
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
	const playlists = await getEggshellverPlaylists({
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

export const postPlaylists = async(playlists:PlaylistWrapper[]) =>
	eggshellverRequest("playlists", playlists, {method: "POST"}) as unknown as Promise<number>;

export const putPlaylists = async(playlists:PlaylistWrapper[]) =>
	eggshellverRequest("playlists", playlists, {method: "PUT"}) as unknown as Promise<number>;

export async function deletePlaylists(playlistIDs:string[]) {
	const url = fillEggshellverSearchParams("playlists", {
		target: playlistIDs
	});
	return eggshellverRequest(url, {}, {method: "DELETE"});
}


export interface PlaylistWrapper {
  playlistID:string,
  lastModified:Date,
}
