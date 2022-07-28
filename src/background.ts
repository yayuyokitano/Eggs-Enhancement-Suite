import { Browser, Runtime } from "webextension-polyfill";

//yes, this is stupid and janky, but parcel does not play well with manifest V2 background scripts so too bad.
//replace with a normal import asap
const browser = require("./util/browser-polyfill.js") as Browser;

browser.runtime.onMessage.addListener(async (message:any, sender:Runtime.MessageSender) => {
  console.log(message, sender);
  if (!sender?.tab?.id) return;
  if (message.type === "test") {
    browser.tabs.sendMessage(sender.tab.id, {
      type: "test",
      content: message
    });
  }
});

export {};