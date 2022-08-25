import { getEggshellverToken } from "../../util";
import { postUserStubs } from "./userstub";
import { baseURL, fillUrlSearchParams, UserStub } from "./util";

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

export async function getFollows(options:{
  followerIDs?: string[],
  followeeIDs?: string[],
  limit?: number,
  offset?: number,
}):Promise<Follows> {
	const url = fillUrlSearchParams(new URL(`${baseURL}/follows`), options);
	const res = (await (await fetch(url)).json()) as rawFollows;
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
	const follows = await getFollows({
		followerIDs: [eggsID],
		limit: 1,
	});
	return {
		item: follows.follows[0]?.followee,
		totalCount: follows.total,
	};
}

export async function postFollows(followees:UserStub[]) {
	const userStubRes = await postUserStubs(followees);
	if (!userStubRes.ok) {
		throw new Error("userStubs:"+await userStubRes.text());
	}
	const res = await fetch(`${baseURL}/follows`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(followees.map((e) => e.userName))
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}

export async function putFollows(followees:UserStub[]) {
	const userStubRes = await postUserStubs(followees);
	if (!userStubRes.ok) {
		throw new Error("userStubs:"+await userStubRes.text());
	}
	const res = await fetch(`${baseURL}/follows`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		},
		body: JSON.stringify(followees.map((e) => e.userName))
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}

export async function deleteFollows(followeeIDs:string[]) {
	const url = fillUrlSearchParams(new URL(`${baseURL}/follows`), {
		target: followeeIDs
	});
	const res = await fetch(url, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${await getEggshellverToken()}`,
		}
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}
