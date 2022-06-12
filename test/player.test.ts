import { ThenableWebDriver } from "selenium-webdriver";
const { loadDrivers, runTest, enterFrame, attemptLogout, login, isMobileDriver } = require("./selenium") as typeof import("./selenium");
const { By, until } = require("selenium-webdriver") as typeof import("selenium-webdriver");
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
      const topSong = await driver.findElement(By.className("ees-track"));
      await topSong.click();
      await driver.switchTo().defaultContent();
      const duration = await driver.findElement(By.id("ees-player-duration"));
      await driver.wait(until.elementTextIs(duration, "6:02"), 10000);
      expect(await driver.findElement(By.id("ees-player-title")).getText(), browser).to.equal("night smoke");
      expect(await driver.findElement(By.id("ees-player-artist")).getText(), browser).to.equal("Lily Sketch");
      expect((await driver.findElement(By.id("ees-player-thumbnail")).getAttribute("src")).split("?")[0], browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      expect(await driver.findElement(By.id("ees-play")).isDisplayed(), browser).to.be.false;
      expect(await driver.findElement(By.id("ees-pause")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-next")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-prev")).isDisplayed(), browser).to.be.true;
      
      await driver.findElement(By.id("ees-pause")).click();
      const currentTime = await driver.findElement(By.id("ees-player-current-time")).getText();
      await driver.sleep(2000);
      expect(await driver.findElement(By.id("ees-player-current-time")).getText(), browser).to.equal(currentTime);
      
      await driver.findElement(By.id("ees-play")).click();
      await driver.sleep(2000);
      expect(await driver.findElement(By.id("ees-player-current-time")).getText(), browser).to.not.equal(currentTime);

      const progress = await driver.findElement(By.css("#ees-player-controls-time>progress"));
      expect(await progress.getAttribute("value"), browser).to.not.equal("0");
      expect((await progress.getAttribute("max")).slice(0,5), browser).to.equal("362.9");
      expect((await progress.getAttribute("value")).slice(0,5), browser).to.not.equal("362.9");

      const shuffleElement = await driver.findElement(By.id("ees-shuffle"));
      if (await shuffleElement.getAttribute("data-state") === "true") {
        await shuffleElement.click();
        await driver.sleep(100);
      }

      await driver.findElement(By.id("ees-next")).click();
      const duration2 = await driver.findElement(By.id("ees-player-duration"));
      await driver.wait(until.elementTextIs(duration2, "4:54"), 10000);
      expect(await driver.findElement(By.id("ees-player-title")).getText(), browser).to.equal("サーチロック");
      expect(await driver.findElement(By.id("ees-player-artist")).getText(), browser).to.equal("Lily Sketch");
      expect((await driver.findElement(By.id("ees-player-thumbnail")).getAttribute("src")).split("?")[0], browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/8091b959-6939-4e0b-9803-0d37c83e4913.jpeg");

      await driver.findElement(By.id("ees-prev")).click();
      const duration3 = await driver.findElement(By.id("ees-player-duration"));
      await driver.wait(until.elementTextIs(duration2, "6:02"), 10000);
      expect(await driver.findElement(By.id("ees-player-title")).getText(), browser).to.equal("night smoke");
      expect(await driver.findElement(By.id("ees-player-artist")).getText(), browser).to.equal("Lily Sketch");
      expect((await driver.findElement(By.id("ees-player-thumbnail")).getAttribute("src")).split("?")[0], browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");

      //dont go prev if we are at the start
      await driver.findElement(By.id("ees-prev")).click();
      await driver.sleep(100);
      expect(await driver.findElement(By.id("ees-player-title")).getText(), browser).to.equal("night smoke");
      expect(await driver.findElement(By.id("ees-player-artist")).getText(), browser).to.equal("Lily Sketch");
      expect((await driver.findElement(By.id("ees-player-thumbnail")).getAttribute("src")).split("?")[0], browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      expect(await driver.findElement(By.id("ees-player-duration")).getText(), browser).to.equal("6:02");
    }));
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