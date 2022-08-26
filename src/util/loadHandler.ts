import { updateSpa } from "../App/player/spa";
import Cacher from "./wrapper/eggs/cacher";

export const cache = new Cacher();

export function loadPageDetails() {
	callUpdateSpa();
}

function callUpdateSpa() {
	window.parent.postMessage({
		type: "navigate",
		url: window.location.href
	}, "*");
}

export function addLoadHandler() {
	window.addEventListener("message", async(event) => {
		if (event.origin !== window.location.origin || event.data.type !== "navigate") return;
		updateSpa(event.data.url);
	});
}

export {};