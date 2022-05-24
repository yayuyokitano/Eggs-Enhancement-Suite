import browser from "webextension-polyfill";
import LastFM from "./wrapper/lastfm";

export const apiKey = "699d5028ab46ea5598785e3ada3db59b";
export const apiSecret = "742b3d74dfb267aae61ce2eaa3f0ded9";
export const userAgent = "eggs-enhancement-suite";

export class Scrobbler {

  private lastfm:LastFM;
  private _loggedIn = false;
  private sk:Promise<string> = new Promise((resolve, reject) => {
    browser.storage.local.get("lastfmToken").then((data) => {
      if (data.lastfmToken) {
        this._loggedIn = true;
        resolve(data.lastfmToken);
      } else {
        reject("No session key found");
      }
    });
  });

  constructor() {
    this.lastfm = new LastFM(apiKey, {
      apiSecret,
      userAgent,
    });
  }

  public async scrobble(info:{artist:string, track:string, album:string}, duration:number) {
    const timestamp = Math.floor(Number(new Date()) / 1000);
    this.lastfm.track.scrobble(await this.sk, [{
      ...info,
      duration,
      timestamp
    }]);
  }

  public async nowPlaying(info:{artist:string, track:string, album:string}, duration:number) {
    this.lastfm.track.updateNowPlaying({
      ...info,
      sk: await this.sk,
      duration
    });
  }

  get loggedIn() {
    return this._loggedIn;
  }
}