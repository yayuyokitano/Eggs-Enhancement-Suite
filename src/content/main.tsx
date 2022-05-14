import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import "../i18n/config";
import { useTranslation } from 'react-i18next';
import "../App/home/home.scss";
import "../App/global/global.scss"
import browser from 'webextension-polyfill';
import { initializeHeader } from '../util/loginButtons';
import arrive from "arrive";
import { createSpa } from '../App/player/spa';
import { endpoints } from '../util/endpoints';
import { processedPathname } from '../util/util';
arrive

function App() {

  const Element = endpoints[processedPathname()]?.Element;
  const translations = endpoints[processedPathname()]?.translations;
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
  // Create SPA if top level or top level within cypress
  if (window.frameElement === null || window.frameElement.classList.contains("aut-iframe")) {
    createSpa();
    return;
  }

  initializeHeader();

  const rootSelector = endpoints[processedPathname()]?.rootSelector;
  if (typeof rootSelector === "undefined") {
    return;
  }

  document.arrive(rootSelector, {onceOnly: true, existing: true}, function() {
    const root = ReactDOM.createRoot(this);
    root.render(<App />);
  });
}
loadContent();
export {};