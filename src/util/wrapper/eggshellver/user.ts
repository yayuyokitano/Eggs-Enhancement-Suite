import { getEggsID, getMemberId, prefectures, queryAsync, SocialMedia } from "../../util";
import Cacher from "../eggs/cacher";
import { eggshellverRequest } from "./request";
import { AwaitingUserStub, fillEggshellverSearchParams, UserStub } from "./util";

export async function getUsers(options:{
	eggsids?: string[],
  userids?: number[],
}, cache?:Cacher):Promise<UserStub[]> {
	const url = fillEggshellverSearchParams("users", options);
	return eggshellverRequest(url, {}, {method: "GET", cache}) as Promise<UserStub[]>;
}

export async function postAuthenticatedUser(auth:{
  deviceId: string,
  deviceName: string,
  "User-Agent": string,
  Apversion: string,
  Authorization: string,
}) {
	return eggshellverRequest("users", auth, {method: "POST"});
}

export async function deleteUser() {
	const eggsID = await getEggsID();
	if (!eggsID) {
		throw new Error("Not logged in");
	}
	return eggshellverRequest(`users?eggsid=${eggsID}`, {}, {method: "DELETE"});
}

export async function crawlUser():Promise<AwaitingUserStub> {
	const header = await queryAsync(".header_inner");
	if (!header) throw new Error("cannot find header");
	const userName = header.getElementsByClassName("eggsid")[0].textContent?.slice(7);
	if (!userName) throw new Error("cannot find username");
	const displayName = header.getElementsByClassName("artist_name")[0].textContent;
	if (!displayName) throw new Error("cannot find display name");
	const imageDataPath = header.getElementsByTagName("img")[0]?.getAttribute("src") ?? "";
	const prefectureCode = prefectures.indexOf(header.querySelector(".area a")?.textContent || "") + 1;
	const profile = header.querySelector(".description .textOverFlow span")?.textContent || "";
	const genres = [...header.querySelectorAll(".genre a")].map(a => a.hasAttribute("href") && ({
		title: a.textContent,
		href: a.getAttribute("href")
	})).filter(a => a && a.title !== null && a.href !== null) as SocialMedia[];

	return {
		userName,
		displayName,
		isArtist: window.location.href.startsWith("https://eggs.mu/artist/"),
		imageDataPath,
		prefectureCode,
		profile,
		genres,
		userId: getMemberId(),
	};
}

export async function resolveAwaitingUser(user:AwaitingUserStub):Promise<UserStub> {
	const userId = await user.userId;
	return {
		...user,
		userId,
	};
}
