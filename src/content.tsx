import ReactDOM from 'react-dom/client';
import "./i18n/config";
import { TFunction, useTranslation } from 'react-i18next';
import "./rules/useragent.json";
import { runScripts } from "./util/scripts";
import { createSpa } from "./App/player/spa";
import { queryAsync } from "./util/util";
import { endpoints } from "./util/endpoints";
import { initializeHeader } from "./util/loginButtons";

import "./theme/themes.scss";
import { initializeThemes } from './theme/themes';

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

	/*return (
		<h1 id="eggs-es-test">{t("popup:helloWorld")}</h1>
	)*/
}

async function loadContent() {

  try {
    await runScripts();
  } catch {
    console.error("Failed to authenticate, invalid key");
  }
  await initializeThemes();
  // Create SPA if top level
  if (window.frameElement === null || window.frameElement.classList.contains("aut-iframe")) {
    createSpa();
    return;
  }

  await initializeHeader();

  const endpoint = endpoints[processedPathname()];
  const rootSelector = endpoint?.rootSelector;
  if (typeof rootSelector === "undefined") {
    return;
  }


  const rootElement = await queryAsync(rootSelector);
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App endpoint={endpoint} />);
}
loadContent();

function processedPathname() {
  const playlistConcat = new URLSearchParams(window.location.search).has("playlist") ? "playlist" : "";
  const processedPath = "/" + window.location.pathname.split("/").filter((_,i)=>i%2).join("/");
  if (processedPath !== "/") {
    return removeTrailingSlash(processedPath);
  }
  return processedPath + removeTrailingSlash(playlistConcat);
}

function removeTrailingSlash(path: string) {
  if (path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export {};