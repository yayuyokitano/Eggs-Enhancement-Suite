import ReactDOM from "react-dom/client";
import "./i18n/config";
import { TFunction, useTranslation } from "react-i18next";
import "./rules/useragent.json";
import { runScripts } from "./util/scripts";
import { createSpa } from "./App/player/spa";
import { ensureLogin, processedPathname, queryAsync } from "./util/util";
import { endpoints } from "./util/endpoints";
import { initializeHeader } from "./util/loginButtons";

import "./theme/themes.scss";
import { initializeThemes } from "./theme/themes";
import { addForceNavigator, addIframeURLLoader, addLoadHandler, loadPageDetails } from "./util/loadHandler";

function App(props: {endpoint: {
  rootSelector: string;
  Element: (t: TFunction<"translation", undefined>) => JSX.Element;
  translations: string[];
} | undefined}) {
	const {endpoint} = props;
	const Element = endpoint?.Element;
	const translations = endpoint?.translations;
	if (typeof Element === "undefined" || typeof translations === "undefined") {
		return <p>An error occurred while loading Eggs Enhancement Suite, please try refreshing.</p>;
	}

	const { t } = useTranslation([...translations, "global"]);

	return Element(t);
}

async function bodyExists() {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (document.body) {
				clearInterval(interval);
				resolve(true);
			}
		}, 1);
	});
}

async function loadContent() {
	loadPageDetails();

	try {
		await runScripts();
	} catch {
		console.error("Failed to authenticate, invalid key");
	}

	// Create SPA if top level and not signup (third party auth doesn't like iframes and we do nothing with that page anyway)
	if (window.frameElement === null && processedPathname() !== "/signup") {
		addForceNavigator();
		createSpa();
		deleteNewElements(document.body, "#eggs-full-wrapper");
		addLoadHandler();
		await initializeThemes();
		setTimeout(ensureLogin, 100); // ensure chrome doesnt crash
		return;
	}

	await initializeHeader();
	addIframeURLLoader();
	
	const endpoint = endpoints[processedPathname()];
	if (!endpoint) return;

	const rootElement = await queryAsync(endpoint.rootSelector);
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App endpoint={endpoint} />);
	await initializeThemes();
	deleteNewElements(rootElement, endpoint.appendSelector);
}

async function waitForLoad() {
	await bodyExists();
	loadContent();
}
waitForLoad();

function deleteNewElements(target:Element, rootSelector:string) {
	const deleter = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node:Node|HTMLElement) => {
				if (!(node instanceof HTMLElement) || !node.matches(rootSelector)) {
					node.parentElement?.removeChild(node);
				}
			});
		});
	});
	deleter.observe(target, { childList: true });
}

export {};