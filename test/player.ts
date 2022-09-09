import { SongDataWIndex } from "App/components/track/track";
import { ThenableWebDriver, until, WebElement, By } from "selenium-webdriver";
import { SongData } from "util/wrapper/eggs/artist";
import { enterFrame } from "./selenium";

export async function findTrackByIndex(driver:ThenableWebDriver, index:number):Promise<Song> {
	await enterFrame(driver);
	await driver.wait(until.elementLocated(By.className("ees-track")), 5000);
	const tracks = await driver.findElements(By.className("ees-track"));
	return new Song(tracks[index]);
}

interface details {
  title?:string;
  artist?:string;
}

export async function findTrackByDetails(driver:ThenableWebDriver, details:details):Promise<Song> {
	await enterFrame(driver);
	await driver.wait(until.elementLocated(By.className("ees-track")), 5000);
	const tracks = await driver.findElements(By.className("ees-track"));
	for (const track of tracks) {
		const trackData = JSON.parse(await track.getAttribute("data-track")) as SongData;
		if (details.title && details.title !== trackData.musicTitle) continue;
		if (details.artist && details.artist !== trackData.artistData.artistName) continue;
		return new Song(track);
	}
	throw new Error("Track not found");
}

export function generateRepeatQueue(titles:string[], index:number, repeat:Repeat) {
	if (repeat === Repeat.None) throw new Error("repeat is None when generating queue");
	if (repeat === Repeat.One) {
		return new Array<string>(50).fill(titles[index]);
	}
	let unshuffledQueue = titles.slice(index + 1);
	while (unshuffledQueue.length < 50) {
		unshuffledQueue = unshuffledQueue.concat(titles);
	}
	return unshuffledQueue;
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

export enum Repeat {
  None = 0,
  All,
  One
}

const oppositeBool = (bool:boolean) => String(!bool);

export class Player {
	private driver:ThenableWebDriver;
	constructor(driver:ThenableWebDriver) {
		this.driver = driver;
	}

	private getDurationElement = async() => this.driver.findElement(By.id("ees-player-duration"));

	public play = async() => this.driver.findElement(By.id("ees-play")).click();
	public pause = async() => this.driver.findElement(By.id("ees-pause")).click();
	public next = async() => this.driver.findElement(By.id("ees-next")).click();
	public prev = async() => this.driver.findElement(By.id("ees-prev")).click();

	public getCurrentTime = async() => this.driver.findElement(By.id("ees-player-current-time")).getText();
	public getDuration = async() => (await this.getDurationElement()).getText();

	public getTitle = async() => this.driver.findElement(By.id("ees-player-title")).getText();
	public getArtist = async() => this.driver.findElement(By.id("ees-player-artist")).getText();
	public getThumbnail = async() => (await this.driver.findElement(By.id("ees-player-thumbnail")).getAttribute("src")).split("?")[0];

	public waitForDuration = async(duration:string) => this.driver.wait(until.elementTextIs(await this.getDurationElement(), duration), 10000);
}

export class Queue {
	private driver:ThenableWebDriver;
	constructor(driver:ThenableWebDriver) {
		this.driver = driver;
	}

	private innerQueue = async() =>  this.driver.findElement(By.id("ees-player-queue-inner"));
	private queueToggle = async() => this.driver.findElement(By.id("ees-player-queue-button"));

	public async setShuffle(shuffle:boolean) {
		const shuffleElement = await this.driver.findElement(By.id("ees-shuffle"));
		if (await shuffleElement.getAttribute("data-state") === oppositeBool(shuffle)) {
			await shuffleElement.click();
		}
	}

	public async setRepeat(repeat:Repeat) {
		const repeatElement = await this.driver.findElement(By.id("ees-repeat"));
		while (await repeatElement.getAttribute("data-state") !== String(repeat)) {
			await repeatElement.click();
		}
	}

	public async priorityQueue() {
		const queue = await (await this.innerQueue()).findElements(By.id("ees-player-queue-manuallyadded"));
		if (queue.length === 0) return [];
		const tracks = await queue[0].findElements(By.className("ees-track"));
		return Promise.all(tracks.map(async(track) => JSON.parse(await track.getAttribute("data-track")) as SongDataWIndex));
	}

	public async mainQueue() {
		const container = (await (await this.innerQueue()).findElements(By.className("ees-track-container"))).at(-1);
		const tracks = await container?.findElements(By.className("ees-track"));
		if (!tracks) return [];
		return Promise.all(tracks.map(async(track) => JSON.parse(await track.getAttribute("data-track")) as SongDataWIndex));
	}

	public async fullQueue() {
		return [
			...(await this.priorityQueue()),
			...(await this.mainQueue())
		];
	}

	public async playTrackByIndex(index:number) {
		await (await this.queueToggle()).click();
		await this.driver.sleep(250);
		(await (await this.innerQueue()).findElements(By.className("ees-track")))[index].click();
		await (await this.queueToggle()).click();
		await this.driver.sleep(250);
	} 
}

export async function awaitYoutubeVolumeChange(driver:ThenableWebDriver, target:number):Promise<number> {
	return driver.executeAsyncScript(`
    const targetVolume = arguments[0];
    const callback = arguments[1];
    window.addEventListener("message", function onVolumeChange(event) => {
      const data = JSON.parse(event.data);
      if (data.info && data.info.volume && data.info.volume === targetVolume) {
        window.removeEventListener("message", onVolumeChange);
        callback(data.info.volume);
      }
    });
  `, target);
}
