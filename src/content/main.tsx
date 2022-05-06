import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import "../i18n/config";
import { TFunction, useTranslation } from 'react-i18next';
import "../App/home/home.scss";
import "../App/global/global.scss"
import browser from 'webextension-polyfill';
import { initializeLoginButtons } from '../util/loginButtons';
import { Login } from '../App/login/login';

const endpointInfo:{[key:string]:{
  rootSelector: string;
  Element: (t:TFunction) => JSX.Element;
  translations:string[];
}|undefined} = {
  "/login": {
    rootSelector: ".form-main>.form-control.pt30p.pb50p",
    Element: Login,
    translations: ["login","popup"]
  },
  "/": {
    rootSelector: ".ttl_side",
    Element: () => <p>hello</p>,
    translations: ["popup"]
  }
}

function App() {

  const Element = endpointInfo[window.location.pathname]?.Element;
  const translations = endpointInfo[window.location.pathname]?.translations;
  if (typeof Element === "undefined" || typeof translations === "undefined") {
    return <p>An error occurred while loading Eggs Enhancement Suite, please try refreshing.</p>;
  }

  const { t, i18n } = useTranslation(translations);

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
  const rootSelector = endpointInfo[window.location.pathname]?.rootSelector;
  if (typeof rootSelector === "undefined") {
    return;
  }
  const root = ReactDOM.createRoot(document.querySelector(rootSelector) as HTMLElement);
  root.render(<App />);
}
loadContent();

export {};