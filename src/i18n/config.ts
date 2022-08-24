import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import globalen from "./en/global.json";
import loginen from "./en/login.json";
import homeen from "./en/home.json";

import globalja from "./ja/global.json";
import loginja from "./ja/login.json";
import homeja from "./ja/home.json";
const resources = {
  en: {
    global: globalen,
    login: loginen,
    home: homeen,
  },
  ja: {
    global: globalja,
    login: loginja,
    home: homeja,
  }
}

i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
  ns: ["global", "login", "home"],
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  resources
});

export const languageList = {
  en: "English",
  ja: "日本語",
}

export default i18n;