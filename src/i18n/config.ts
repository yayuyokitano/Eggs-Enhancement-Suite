import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import popupen from "./en/popup.json";
import loginen from "./en/login.json";

import popupja from "./ja/popup.json";
import loginja from "./ja/login.json";
const resources = {
  en: {
    popup: popupen,
    login: loginen
  },
  ja: {
    popup: popupja,
    login: loginja
  }
}

i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
  ns: ["popup", "login"],
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