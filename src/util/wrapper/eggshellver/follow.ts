import { sleep } from "../../util";
import Cacher from "../eggs/cacher";
import { eggshellverRequest } from "./request";
import { postUserStubs } from "./userstub";
import { fillEggshellverSearchParams, UserStub } from "./util";

interface rawFollows {
  follows: {
    follower: UserStub;
    followee: UserStub;
    timestamp: string;
  }[];
  total: number;
}
interface Follows {
  follows: {
    follower: UserStub;
    followee: UserStub;
    timestamp: Date;
  }[];
  total: number;
}

export async function getEggshellverFollows(options:{
  followerIDs?: string[],
  followeeIDs?: string[],
  limit?: number,
  offset?: number,
}, cache?:Cacher):Promise<Follows> {
	const url = fillEggshellverSearchParams("follows", options);
	const res = await eggshellverRequest(url, {}, {method: "GET", cache}) as rawFollows;
	return {
		follows: res.follows.map(follow => ({
			follower: follow.follower,
			followee: follow.followee,
			timestamp: new Date(follow.timestamp)
		})),
		total: res.total
	};
}

export async function getEggshellverFollowsWrapped(eggsID:string) {
	const follows = await getEggshellverFollows({
		followerIDs: [eggsID],
		limit: 1,
	});
	return {
		item: follows.follows[0]?.followee,
		totalCount: follows.total,
	};
}

export async function postFollows(followees:UserStub[]) {
	await postUserStubs(followees);
	await sleep(2000);
	return eggshellverRequest("follows", followees.map(user => user.userName), {method: "POST"}) as unknown as Promise<number>;
}

export async function putFollows(followees:UserStub[]) {
	await postUserStubs(followees);
	await sleep(2000);
	return eggshellverRequest("follows", followees.map(user => user.userName), {method: "PUT"}) as unknown as Promise<number>;
}

export async function deleteFollows(followeeIDs:string[]) {
	const url = fillEggshellverSearchParams("follows", {
		target: followeeIDs
	});
	return eggshellverRequest(url, {}, {method: "DELETE"});
}

export async function eggshellverFollow(followee:UserStub) {
	await postUserStubs([followee]);
	return eggshellverRequest(`follow/${followee.userName}`, {}, {method: "POST"});
}
