import React from 'react';
import ReactDOM from 'react-dom/client';

import "../../i18n/config";

import { useTranslation } from "react-i18next";

function App() {

  const { t } = useTranslation(["popup"]);
	return (
		<h2>{t("popup:helloWorld")}</h2>
	)
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);