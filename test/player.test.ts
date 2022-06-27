import { ThenableWebDriver, until } from "selenium-webdriver";
import { findTrackByDetails, findTrackByIndex, Player, Queue, Repeat } from "./player";
const { loadDrivers, runTest, enterFrame, isMobileDriver } = require("./selenium") as typeof import("./selenium");
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");

describe("player", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  let i = 0;

  do {

  it("should play song, play/pause/next/prev should work", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      await driver.wait(until.elementLocated(By.className("ees-track")), 5000);
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const player = new Player(driver);
      const queue = new Queue(driver);
      await queue.setShuffle(false);
      await queue.setRepeat(Repeat.None);
      
      await player.waitForDuration("6:02");
      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      expect(await driver.findElement(By.id("ees-play")).isDisplayed(), browser).to.be.false;
      expect(await driver.findElement(By.id("ees-pause")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-next")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-prev")).isDisplayed(), browser).to.be.true;
      
      await player.pause();
      const currentTime = await player.getCurrentTime();
      await driver.sleep(2000);
      expect(await player.getCurrentTime(), browser).to.equal(currentTime);
      
      await player.play();
      await driver.sleep(2000);
      expect(await player.getCurrentTime(), browser).to.not.equal(currentTime);

      const progress = await driver.findElement(By.css("#ees-player-controls-time>progress"));
      expect(await progress.getAttribute("value"), browser).to.not.equal("0");
      expect((await progress.getAttribute("max")).slice(0,5), browser).to.equal("362.9");
      expect((await progress.getAttribute("value")).slice(0,5), browser).to.not.equal("362.9");

      await player.next();
      
      await player.waitForDuration("4:54");
      expect(await player.getTitle(), browser).to.equal("サーチロック");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/8091b959-6939-4e0b-9803-0d37c83e4913.jpeg");

      await player.prev();
      await player.waitForDuration("6:02");
      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");

      //dont go prev if we are at the start
      await player.prev();
      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      expect(await player.getDuration(), browser).to.equal("6:02");
    })).to.not.throw;
  });

  it("should have queue that shows on click and hides on click", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      const width = (await driver.manage().window().getRect()).width;

      await driver.wait(until.elementLocated(By.id("ees-player-queue-inner")), 5000);
      const queueInner = await driver.findElement(By.id("ees-player-queue-inner"));
      expect((await queueInner.getRect()).x, browser).to.be.greaterThanOrEqual(width);

      await driver.wait(until.elementLocated(By.id("ees-player-queue-button")), 5000);
      await driver.findElement(By.id("ees-player-queue-button")).click();
      await driver.sleep(250);
      expect((await queueInner.getRect()).x, browser).to.be.lessThan(width);

      await driver.findElement(By.id("ees-player-queue-button")).click();
      await driver.sleep(250);
      expect((await queueInner.getRect()).x, browser).to.be.greaterThanOrEqual(width);
    })).to.not.throw;
  });

  it("should behave properly with no shuffle and no repeat", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      const player = new Player(driver);
      await queue.setShuffle(false);
      await queue.setRepeat(Repeat.None);
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["サーチロック", "Black Lily", "灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch", "Lily Sketch", "Lily Sketch"]);

      await player.next();
      
      expect((await queue.priorityQueue()), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["Black Lily", "灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch", "Lily Sketch"]);

      await player.prev();

      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(["サーチロック"]);
      expect((await queue.priorityQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch"]);
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["Black Lily", "灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch", "Lily Sketch"]);

      await queue.playTrackByIndex(1);

      expect(await player.getTitle(), browser).to.equal("Black Lily");
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);

      await player.prev();
      await player.prev();

      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(["サーチロック", "Black Lily"]);
      expect((await queue.priorityQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);

      await (await findTrackByDetails(driver, {title:"Black Lily"})).play();
      await driver.switchTo().defaultContent();

      expect(await player.getTitle(), browser).to.equal("Black Lily");
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);

      await player.prev();

      expect(await player.getTitle(), browser).to.equal("Black Lily");
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);
    })).to.not.throw;
  });

  it("should behave properly with shuffle and no repeat", async function() {
    this.retries(10); //additional retries to handle randomness.
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      const player = new Player(driver);
      await queue.setShuffle(true);
      await queue.setRepeat(Repeat.None);
      expect(await queue.priorityQueue(), browser).to.be.empty;

      const tracks = (await queue.mainQueue()).map(t => t.musicTitle);
      //~1 in 8 million chance to fail 5 times in a row if functioning properly.
      expect(tracks, browser).to.not.deep.equal(["サーチロック", "Black Lily", "灰青", "青十六歳"]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(1));
      expect(await player.getTitle(), browser).to.equal(tracks[0]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(2));
      expect(await player.getTitle(), browser).to.equal(tracks[1]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(3));
      expect(await player.getTitle(), browser).to.equal(tracks[2]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[3]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[3]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(3));
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[2]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(2));
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[1]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(1));
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[0]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks);
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal("night smoke");

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks);
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal("night smoke");
    })).to.not.throw;
  });

  it("should set viewport size", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      await driver.manage().window().setRect({ width: 390, height: 844 });
      expect(await isMobileDriver(driver), browser).to.be.true;
    })).to.not.throw;
  });

  } while (i++ < 1);

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  });
});
export {};