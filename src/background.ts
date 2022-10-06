import { Browser } from "webextension-polyfill";

//yes, this is stupid and janky, but parcel does not play well with manifest V2 background scripts so too bad.
//replace with a normal import asap
const browser = require("./util/browser-polyfill.js") as Browser;

browser.webRequest.onBeforeRequest.addListener((e) => {
	if (e.url.includes("eggs.mu/twitter_callback")) {
		handleTwitter(e.url, e.tabId);
	}
}, {urls: ["*://*.eggs.mu/*"]});

async function handleTwitter(url:string, tabId:number) {
	if (await isLoggedIn()) return;
	const urlParams = new URLSearchParams(url.split("?")[1]);
	const token = urlParams.get("oauth_token");
	const verifier = urlParams.get("oauth_verifier");
	if (!token || !verifier) return;
	console.error("reached login");
	try {
		const res = await (await twitterLogin(token, verifier)).text();
		handleToken(res, tabId);
	} catch(err) {
		browser.storage.sync.remove(["token", "eggshellvertoken", "eggsid", "loginType", "password"]); //prevent infinite looping
	}
}

async function handleToken(res:string, tabId:number) {
	const urlParams = new URLSearchParams(res);
	const oauth_token = urlParams.get("oauth_token");
	const oauth_token_secret = urlParams.get("oauth_token_secret");
	if (!oauth_token || !oauth_token_secret) {
		restartAuth(tabId);
		return;
	}
	try {
		const headers = {
			"User-Agent": "flamingo/7.1.00 (Android; 11)",
			Apversion: "7.1.00",
			"Content-Type": "application/json; charset=utf-8",
			deviceId: await getDeviceID(),
			deviceName: "SM-G977N",
		};
		const eggsRes = await twitterEggsLogin(oauth_token, oauth_token_secret, headers);
		const accessToken = (await eggsRes.json()).access_token;

		const authedHeaders = {
			...headers,
			Authorization: `Bearer ${accessToken}`,
		};
		
		const userRes = await fetch("https://localhost:10000/users", {
			method: "POST",
			body: JSON.stringify(authedHeaders),
		});
		const token = await userRes.json();

		if (!accessToken || !token) return;
		const user = await (await fetch("https://api-flmg.eggs.mu/v1/users/users/profile", {
			headers: authedHeaders,
		})).json();
		
		if (user) {
			await browser.storage.sync.set({
				eggsid: user.data.userName,
				loginType: "twitter",
				token: accessToken,
				eggshellvertoken: token,
			});
			window.parent.postMessage({
				type: "login"
			}, "*");
		}
		browser.tabs.sendMessage(tabId, {
			type: "twitterlogin",
		});
	} catch(err) {
		restartAuth(tabId);
	}
}

const generateRandomHex = (size:number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

async function getDeviceID() {
	const deviceID = await browser.storage.sync.get("deviceID");
	if (deviceID.deviceID) {
		return deviceID.deviceID as string;
	}
	const newDeviceID = generateRandomHex(16);
	await browser.storage.sync.set({deviceID: newDeviceID});
	return newDeviceID;
}

async function isLoggedIn() {
	const token = await browser.storage.sync.get("token");
	return Boolean(token.token);
}

async function twitterEggsLogin(oauth_token:string, oauth_token_secret:string, headers:Record<string, string>) {
	return fetch("https://api-flmg.eggs.mu/v1/auth/auth/login", {
		method: "POST",
		body: JSON.stringify({
			twitterToken: oauth_token,
			twitterSecret: oauth_token_secret,
			type: "2",
		}),
		headers
	});
}

async function twitterLogin(oauth_token:string, oauth_verifier:string) {
	return fetch("https://localhost:10000/twitterauth", {
		method: "POST",
		body: JSON.stringify({
			oauth_token,
			oauth_verifier,
		}),
	});
}

async function restartAuth(tabId:number) {
	await browser.storage.sync.set({
		loginType: "twitterFailed",
	});
	browser.tabs.sendMessage(tabId, {
		type: "twitterlogin",
	});
}

export {};