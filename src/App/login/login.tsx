import { TFunction } from "react-i18next";
import { cache } from "../../util/loadHandler";
import { postAuthenticatedUser } from "../../util/wrapper/eggshellver/user";
import browser from "webextension-polyfill";
import { login } from "../../util/wrapper/eggs/auth";
import { profile } from "../../util/wrapper/eggs/users";

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
		browser.storage.sync.set({
			eggsid: user.data.userName,
		});
	}

	window.location.href = new URLSearchParams(window.location.search).get("location") ?? "https://eggs.mu/";
	return;
}

export default function Login(t:TFunction) {
	return (
		<div
			id="ees-login-form"
			className="form-control pt30p pb50p">
			<button
				type="button"
				onClick={mobileLogin}
				className="button w100">{t("global:general.login")}</button>
			<p>{t("disclaimer")}</p>
		</div>
	);
}