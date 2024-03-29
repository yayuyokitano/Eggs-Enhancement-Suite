import browser from "webextension-polyfill";
import { apiKey, apiSecret, userAgent } from "./scrobbler";
import LastFM from "./wrapper/lastfm";

export async function runScripts() {
	const search = new URLSearchParams(window.location.search);
	if (!search.has("script")) return;
	switch(search.get("script")) {
	case "lastfm-auth":
		await lastfmAuth(search.get("token"));
		break;
	}
}

async function lastfmAuth(token:string|null) {
	if (!token) return;
	const lastfm = new LastFM(apiKey, {
		apiSecret,
		userAgent
	});
	const session = await lastfm.auth.getSession(token);
	if (!session.key) return;
	if ((await browser.storage.sync.get("lastfmToken")).lastfmToken === session.key) return;
	await browser.storage.sync.set({lastfmToken: session.key});
}
