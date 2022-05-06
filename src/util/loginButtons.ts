import { getToken } from "./util";
import { profile } from "./wrapper/eggs/users";

function getLoginDisplayClass(shouldDisplay:boolean) {
  return shouldDisplay ? "login-button-display" : "login-button-hide";
}

export async function initializeLoginButtons() {
  const LOGIN_BUTTON = document.getElementById("gn_login")!;
  const SIGNUP_BUTTON = document.getElementById("gn_signin")!;
  const LOGIN_DISPLAY = document.getElementById("loggedin")!;

  const isLoggedIn = (await getToken()).token !== undefined;

  if (isLoggedIn) {
    const username = (await profile()).data.displayName;
    LOGIN_DISPLAY.getElementsByClassName("m-artist_txt")[0].textContent = username;
  }

  LOGIN_BUTTON.classList.add(getLoginDisplayClass(!isLoggedIn));
  SIGNUP_BUTTON.classList.add(getLoginDisplayClass(!isLoggedIn));
  LOGIN_DISPLAY.classList.add(getLoginDisplayClass(isLoggedIn));
}