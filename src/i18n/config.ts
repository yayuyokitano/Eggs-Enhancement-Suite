import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import popupen from "./en/popup.json";
import popupja from "./ja/popup.json";
const resources = {
  en: {
    popup: popupen
  },
  ja: {
    popup: popupja,
  }
}

i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
  ns: ["popup"],
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  resources
});

export default i18n;