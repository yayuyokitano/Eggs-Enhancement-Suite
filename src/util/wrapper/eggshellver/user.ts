import { prefectures } from "../../util";
import { baseURL, fillUrlSearchParams, UserStub } from "./util";

export async function getUsers(options:{
  users: string[],
}):Promise<UserStub[]> {
	const url = fillUrlSearchParams(new URL(`${baseURL}/users`), options);
	return (await fetch(url)).json();
}

export async function postAuthenticatedUser(auth:{
  deviceId: string,
  deviceName: string,
  "User-Agent": string,
  Apversion: string,
  Authorization: string,
}) {
	const res = await fetch(`${baseURL}/users`, {
		method: "POST",
		body: JSON.stringify(auth)
	});
	if (!res.ok) throw new Error(await res.text());
	return res.text();
}

export async function crawlUser():Promise<UserStub> {
	const header = document.getElementsByClassName("header_inner")[0];
	if (!header) throw new Error("cannot find header");
	const userName = header.getElementsByClassName("eggsid")[0].textContent?.slice(7);
	if (!userName) throw new Error("cannot find username");
	const displayName = header.getElementsByClassName("artist_name")[0].textContent;
	if (!displayName) throw new Error("cannot find display name");
	const imageDataPath = header.getElementsByTagName("img")[0]?.getAttribute("src") ?? "";
	const prefectureCode = prefectures.indexOf(header.querySelector(".area a")?.textContent || "") + 1;
	const profile = header.querySelector(".description .textOverFlow span")?.textContent || "";

	return {
		userName,
		displayName,
		isArtist: window.location.href.startsWith("https://eggs.mu/artist/"),
		imageDataPath,
		prefectureCode,
		profile,
	};
}
