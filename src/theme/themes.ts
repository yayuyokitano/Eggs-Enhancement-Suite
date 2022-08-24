import browser from "webextension-polyfill";

export async function initializeThemes() {
  const theme = (await browser.storage.sync.get("theme")).theme;
  console.log("a");
  if (theme) {
    console.log("b");
    document.body.classList.add(theme);
    return;
  }
  console.log("c");

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-light");
  }
  console.log(document.body.classList);
}