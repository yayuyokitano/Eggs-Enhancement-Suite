import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import "../i18n/config";
import { TFunction, useTranslation } from 'react-i18next';
import "../App/home/home.scss";
import "../App/global/global.scss"
import browser from 'webextension-polyfill';
import { initializeLoginButtons } from '../util/loginButtons';
import { Login } from '../App/login/login';
import arrive from "arrive";
import { createSpa } from '../App/player/spa';
arrive

const endpointInfo:{[key:string]:{
  rootSelector: string;
  Element: (t:TFunction) => JSX.Element;
  translations:string[];
}|undefined} = {
  "/login": {
    rootSelector: ".form-main>.form-control.pt30p.pb50p",
    Element: Login,
    translations: ["login"]
  },
  "/": {
    rootSelector: ".ttl_side",
    Element: () => <p>hello</p>,
    translations: []
  }
}

function App() {

  const Element = endpointInfo[window.location.pathname]?.Element;
  const translations = endpointInfo[window.location.pathname]?.translations;
  if (typeof Element === "undefined" || typeof translations === "undefined") {
    return <p>An error occurred while loading Eggs Enhancement Suite, please try refreshing.</p>;
  }

  const { t, i18n } = useTranslation([...translations, "global"]);

  useEffect(() => {
    function handleMessage(message:any) {
      if (message.type === "changeLanguage") {
        console.log("change language to " + message.lang);
        i18n.changeLanguage(message.lang);
      }
    }
    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    }
  });

  initializeLoginButtons();

  return Element(t);

	/*return (
		<h1 id="eggs-es-test">{t("popup:helloWorld")}</h1>
	)*/
}

function loadContent() {
  // Create SPA if top level or top level within cypress
  if (window.frameElement === null || window.frameElement.classList.contains("aut-iframe")) {
    createSpa();
  }
  const rootSelector = endpointInfo[window.location.pathname]?.rootSelector;
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