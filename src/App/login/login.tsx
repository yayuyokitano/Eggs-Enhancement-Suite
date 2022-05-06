import { TFunction } from "react-i18next";
import browser from "webextension-polyfill";
import { login } from "../../util/wrapper/eggs/auth";

async function mobileLogin() {
  const [userInput, passwordInput] = document.getElementsByClassName("w-variable") as HTMLCollectionOf<HTMLInputElement>;
  const { access_token } = await login(userInput.value, passwordInput.value);
  if (access_token) {
    browser.storage.local.set({
      token: access_token
    });
  }

  window.location.href = new URLSearchParams(window.location.search).get("location") ?? "https://eggs.mu/";
  return;
}

export function Login(t:TFunction) {
  return (
    <div className="form-control pt30p pb50p">
      <button type="button" onClick={mobileLogin} className="button w100">{t("login")}</button>
      <p>{t("disclaimer")}</p>
    </div>
  )
}