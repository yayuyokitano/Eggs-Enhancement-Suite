import ReactDOM from "react-dom/client";

import "../../i18n/config";

import { TFunction, useTranslation } from "react-i18next";
import { languageList } from "../../i18n/config";
import { i18n } from "i18next";
import browser from "webextension-polyfill";

import "./popup.scss";
import { themeList } from "../../theme/themes";
import { useEffect, useState } from "react";

async function changeLanguage(lang:string, i18n:i18n) {
	i18n.changeLanguage(lang);
	browser.storage.sync.set({
		i18nlang: lang
	});
	const tabs = await browser.tabs.query({active: true, currentWindow: true});
	if (tabs && tabs.length > 0) {
		if (tabs[0].id) {
			browser.tabs.sendMessage(tabs[0].id, {type: "changeLanguage", lang});
		}
	}
}

async function changeTheme(theme:string) {
	localStorage.setItem("theme", theme);
	const tabs = await browser.tabs.query({active: true, currentWindow: true});
	if (tabs && tabs.length > 0) {
		if (tabs[0].id) {
			browser.tabs.sendMessage(tabs[0].id, {type: "changeTheme", theme: `theme-${theme}`});
		}
	}
}

function SettingRadioList(props: {t:TFunction, type: string, names:string[], cur:string, onChange:(name:string) => void}) {
	const {t, type, names, cur, onChange} = props;
  
	return (
		<div className={`${type}-selector`}>
			<h2>{t(`popup.${type}`)}</h2>
			{names.map(name => <SettingRadio
				key={name}
				t={t}
				type={type}
				name={name}
				cur={cur}
				onChange={onChange} />)}
		</div>
	);
}

function SettingRadio(props: {t:TFunction, type: string, name:string, cur:string, onChange:(name:string) => void}) {

	const {t, type, name, cur, onChange} = props;

	const isSelected = (name === cur);
	return (
		<label htmlFor={`${type}-${name}`}><input
			type="radio"
			name={type}
			id={`${type}-${name}`}
			value={name}
			defaultChecked={isSelected}
			onClick={() => onChange(name)}
		/>{t(`options.${type}.${name}`)}</label>
	);
}

function App() {

	const { t, i18n } = useTranslation(["popup"]);
	const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "system");

	useEffect(() => {
		changeTheme(theme);
	}, [theme]);


	if (localStorage.getItem("language")) {
		i18n.changeLanguage(localStorage.getItem("language") ?? undefined);
	}
	return (
		<div>
			<SettingRadioList
				t={t}
				type="language"
				names={languageList}
				cur={i18n.resolvedLanguage}
				onChange={(name:string) => changeLanguage(name, i18n)} />
			<SettingRadioList
				t={t}
				type="theme"
				names={themeList}
				cur={theme}
				onChange={setTheme} />
			<h2>{t("popup.helloWorld")}</h2>
		</div>
	);
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
