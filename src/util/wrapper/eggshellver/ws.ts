import Cacher from "../eggs/cacher";
import { eggshellverRequest } from "./request";
import { fillEggshellverSearchParams, UserStub } from "./util";

interface SongStub {
	title: string;
	artist: string;
	musicImageDataPath: string;
	artistImageDataPath: string;
}

export interface ListeningParty {
	owner: UserStub;
	title: string;
	song: SongStub;
	listeners: number;
}

export async function getEggshellverHubs(cache?:Cacher):Promise<ListeningParty[]> {
	const url = fillEggshellverSearchParams("ws/list", {});
	const listeningParties = await eggshellverRequest(url, {}, {method: "GET", cache}) as ListeningParty[];
	return listeningParties.sort((a, b) => b.listeners - a.listeners);
}

export const getEggshellverHubsWrapped = async() => {
	const listeningParties = await getEggshellverHubs();
	return {
		data: listeningParties,
		totalCount: listeningParties.length,
		offset: "0"
	};
};
