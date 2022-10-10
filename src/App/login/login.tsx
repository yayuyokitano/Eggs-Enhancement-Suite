import { TFunction } from "react-i18next";
import { cache, forceNavigate } from "../../util/loadHandler";
import { postAuthenticatedUser } from "../../util/wrapper/eggshellver/user";
import browser from "webextension-polyfill";
import { login } from "../../util/wrapper/eggs/auth";
import { profile } from "../../util/wrapper/eggs/users";
import { vanillaLogin } from "../../util/util";
import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./login.scss";

async function mobileLogin() {
	const [userInput, passwordInput] = document.getElementsByClassName("w-variable") as HTMLCollectionOf<HTMLInputElement>;
	const { access_token } = await login(userInput.value, passwordInput.value);
	const token = await postAuthenticatedUser({
		...await cache.getEggsHeaders(false),
		Authorization: `Bearer ${access_token}`,
	});
	if (access_token && token) {
		browser.storage.sync.set({
			token: access_token,
			eggshellvertoken: token,
		});
	}
	cache.reset();
	const user = await profile();
	if (user) {
		await browser.storage.sync.set({
			eggsid: user.data.userName,
			loginType: "eggs",
			password: passwordInput.value,
		});
		window.parent.postMessage({
			type: "login"
		}, "*");
		vanillaLogin();
	}

	window.location.href = new URLSearchParams(window.location.search).get("location") ?? "https://eggs.mu/";
	return;
}

function TwitterLogin(props: { t: TFunction }) {
	const { t } = props;
	return (
		<div id="ees-twitter-login-wrapper">
			<a
				id="ees-twitter-login"
				onClick={() => {
					forceNavigate(`https://eggs.mu/twitter_login?location=${window.location.href}`);
				}}>{t("global:general.twitterlogin")}</a>
			<p><Disclaimer raw={t("disclaimer")} /></p>
		</div>
	);
}

export default function Login(t:TFunction) {

	useEffect(() => {
		const formWrapper = document.getElementById("form-register") as HTMLElement;
		if (!formWrapper) return;
		const rootElement = document.createElement("div");
		rootElement.id = "ees-twitter-login";
		formWrapper.insertBefore(rootElement, formWrapper.firstChild);
		
		const root = ReactDOM.createRoot(rootElement);
		root.render(<TwitterLogin t={t} />);
		
		return () => {
			root.unmount();
			formWrapper.removeChild(rootElement);
		};
	}, [t]);

	return (
		<div
			id="ees-login-form"
			className="form-control pt30p pb50p">
			<button
				type="button"
				onClick={mobileLogin}
				className="button w100">{t("global:general.login")}</button>
			<p><Disclaimer raw={t("disclaimer")} /></p>
		</div>
	);
}

function Disclaimer(props: {raw:string}) {
	const { raw } = props;
	const groups = raw.match(/(.*)\|(.*)\|(.*)/);
	if (!groups) return <span>{raw}</span>;
	return (
		<span className="ees-disclaimer-text">
			{groups[1]}
			<a
				className="ees-disclaimer-link"
				href="https://eggshellver.com/privacy.html"
				target="_blank"
				rel="noreferrer noopener">{groups[2]}</a>
			{groups[3]}
		</span>
	);
}
