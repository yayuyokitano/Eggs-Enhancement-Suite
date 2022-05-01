import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import "../i18n/config";
import { useTranslation } from 'react-i18next';
import "../App/home/home.scss";
import browser from 'webextension-polyfill';

console.log("hallo world");
function App() {
  const { t, i18n } = useTranslation(["popup"]);

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
  })

	return (
		<h1 id="eggs-es-test">{t("popup:helloWorld")}</h1>
	)
}

const root = ReactDOM.createRoot(document.getElementsByClassName("l-contents_wrapper")[0]);
root.render(<App />);



export {};