import browser from "webextension-polyfill";
import { eggsHeaders, eggsSelector } from "../util/util";

console.log("hello world!");

browser.webRequest.onBeforeSendHeaders.addListener((details) => {
	requestHeaders: details.requestHeaders?.map((header) => {
		if (header.name === "User-Agent") {
			header.value = eggsHeaders["User-Agent"];
		}
		return header;
	})
},
{urls: [eggsSelector]})

export {};