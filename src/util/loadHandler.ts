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

export function navigateSafely(target:string) {
	const iframe = document.getElementById("ees-spa-iframe") as HTMLIFrameElement;
	if (!iframe) {
		window.location.assign(target);
		return;
	}
	iframe.contentWindow?.postMessage({
		type: "navigateIframe",
		url: target
	}, "*");
}

export function addLoadHandler() {
	window.addEventListener("message", async(event) => {
		if (event.origin !== window.location.origin || event.data.type !== "navigate") return;
		updateSpa(event.data.url);
	});
}

export function addIframeURLLoader() {
	window.addEventListener("message", async(event) => {
		if (event.origin !== window.location.origin || event.data.type !== "navigateIframe") return;
		window.location.href = event.data.url;
	});
}

export {};