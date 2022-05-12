import { getToken } from "./util";
import { profile } from "./wrapper/eggs/users";
import arrive from "arrive";
arrive

function getLoginDisplayClass(shouldDisplay:boolean) {
  return shouldDisplay ? "login-button-display" : "login-button-hide";
}

export async function initializeLoginButtons() {

  //race condition on /artist pages. No idea why, but it is what it is.
  document.arrive("#gn_login", {onceOnly: true, existing: true}, async function() {

    const LOGIN_BUTTON = document.getElementById("gn_login");
    const SIGNUP_BUTTON = document.getElementById("gn_signin");
    const LOGIN_DISPLAY = document.getElementById("loggedin");

    const isLoggedIn = (await getToken()).token !== undefined;

    if (LOGIN_DISPLAY) {
      LOGIN_DISPLAY.classList.add(getLoginDisplayClass(isLoggedIn));
      
      if (isLoggedIn) {
        const username = (await profile()).data.displayName;
        LOGIN_DISPLAY.getElementsByClassName("m-artist_txt")[0].textContent = username;
      }
    }

    if (LOGIN_BUTTON) {
      LOGIN_BUTTON.classList.add(getLoginDisplayClass(!isLoggedIn));
    }

    if (SIGNUP_BUTTON) {
      SIGNUP_BUTTON.classList.add(getLoginDisplayClass(!isLoggedIn));
    }

  });
}