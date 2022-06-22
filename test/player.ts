import { SongDataWIndex } from "App/components/track/track";
import { ThenableWebDriver, WebElement, WebElementPromise } from "selenium-webdriver";
import { SongData } from "util/wrapper/eggs/artist";
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");

export async function findTrackByIndex(driver:ThenableWebDriver, index:number):Promise<Song> {
  const tracks = await driver.findElements(By.className("ees-track"));
  return new Song(tracks[index]);
}

interface details {
  title?:string;
  artist?:string;
}

export async function findTrackByDetails(driver:ThenableWebDriver, details:details):Promise<Song> {
  const tracks = await driver.findElements(By.className("ees-track"));
  for (let track of tracks) {
    const trackData = JSON.parse(await track.getAttribute("data-track")) as SongData;
    if (!details.title || details.title !== trackData.musicTitle) continue;
    if (!details.artist || details.artist !== trackData.artistData.artistName) continue;
    return new Song(track);
  }
  throw new Error("Track not found");
}

class Song {
  private element:WebElement;
  constructor(element:WebElement) {
    this.element = element;
  }

  public play() {
    return this.element.click();
  }
}

export class Queue {
  private element:WebElementPromise;
  constructor(driver:ThenableWebDriver) {
    this.element = driver.findElement(By.id("ees-queue-inner"));
  }

  public async priorityQueue() {
    const queue = await this.element.findElements(By.id("ees-player-queue-manuallyadded"));
    if (queue.length === 0) return [];
    const tracks = await queue[0].findElements(By.className("ees-track"));
    return Promise.all(tracks.map(async(track) => JSON.parse(await track.getAttribute("data-track")) as SongDataWIndex));
  }

  public async mainQueue() {
    const container = (await this.element.findElements(By.className("ees-track-container"))).at(-1);
    const tracks = await container?.findElements(By.className("ees-track"));
    if (!tracks) return [];
    return Promise.all(tracks.map(async(track) => JSON.parse(await track.getAttribute("data-track")) as SongDataWIndex));
  }

  public async fullQueue() {
    return [
      ...(await this.priorityQueue()),
      ...(await this.mainQueue())
    ]
  }
}
