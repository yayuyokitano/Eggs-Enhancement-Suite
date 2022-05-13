import { getToken } from "./util";
import { profile } from "./wrapper/eggs/users";
import ReactDOM from 'react-dom/client';
import arrive from "arrive";
import { TFunction } from "react-i18next";
arrive

function HeaderSubmenu(t:TFunction) {
  return <></>;
}

export async function initializeLoginButtons(t:TFunction) {

  const rootSelector = ".m-header_submenu";
  document.arrive(rootSelector, {onceOnly: true, existing: true}, function() {
    const root = ReactDOM.createRoot(this);
    root.render(HeaderSubmenu(t));
  });
  const isLoggedIn = (await getToken()).token !== undefined;
  const username = (await profile()).data.displayName;
}