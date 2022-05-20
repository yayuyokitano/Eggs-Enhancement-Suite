import LastFM from "lastfm-typed";
import browser from "webextension-polyfill";

export const apiKey = "699d5028ab46ea5598785e3ada3db59b";
export const apiSecret = "742b3d74dfb267aae61ce2eaa3f0ded9";
export const userAgent = "eggs-enhancement-suite";

export class Scrobbler {

  private lastfm:LastFM;

  private sk:Promise<string> = new Promise((resolve, reject) => {
    browser.storage.local.get("sk").then((data) => {
      if (data.sk) {
        resolve(data.sk);
      } else {
        reject("No session key found");
      }
    });
  });

  constructor () {
    this.lastfm = new LastFM(apiKey, {
      apiSecret,
      userAgent,
    });
  }
}