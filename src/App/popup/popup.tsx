import React from 'react';
import ReactDOM from 'react-dom/client';

import "../../i18n/config";

import { useTranslation } from "react-i18next";
import { languageList } from '../../i18n/config';
import { i18n } from 'i18next';
import browser from 'webextension-polyfill';

import "./popup.scss";

async function changeLanguage(lang:string, i18n:i18n) {
  i18n.changeLanguage(lang);
  browser.storage.local.set({
    i18nlang: lang
  });
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  if (tabs && tabs.length > 0) {
    if (tabs[0].id) {
      browser.tabs.sendMessage(tabs[0].id, {type: "changeLanguage", lang});
    }
  }
}

function LanguageRadio(props: {lang:"en"|"ja", i18n:i18n}) {

  const isSelected = (props.lang === props.i18n.resolvedLanguage);
  return (
    <label htmlFor={`language-${props.lang}`}><input
      type="radio"
      name="language"
      id={`language-${props.lang}`}
      value={props.lang}
      defaultChecked={isSelected}
      onClick={() => changeLanguage(props.lang, props.i18n)}
      />{languageList[props.lang]}</label>
  )
}

function App() {

  const { t, i18n } = useTranslation(["global"]);
  if (localStorage.getItem("language")) {
    i18n.changeLanguage(localStorage.getItem("language") as string);
  }
	return (
    <div>
      <div className="language-selector">
        <h2>{t("popup.language")}</h2>
        {Object.keys(languageList).map(lang => <LanguageRadio key={lang} lang={lang as "en"|"ja"} i18n={i18n} />)}
      </div>
      <h2>{t("popup.helloWorld")}</h2>
    </div>
	)
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);