import { ThenableWebDriver } from "selenium-webdriver";
const { loadDrivers, runTest, enterFrame, attemptLogout, login } = require("./selenium") as typeof import("./selenium");
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");

describe("artist", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  it("should display the tracks while logged out", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const trackTitles = (await driver.findElements(By.className("ees-track-title"))).map(async (track) => await track.getText());
      expect(await Promise.all(trackTitles), browser).to.deep.equal([
        "night smoke",
        "サーチロック",
        "Black Lily",
        "灰青",
        "青十六歳",

      ]);
    })).to.be.true;
  });

  it("should login", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await enterFrame(driver);
      await login(driver);
      expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/artist/IG_LiLySketch/");
    })).to.be.true;
  });

  it("should display the tracks while logged in", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const trackTitles = (await driver.findElements(By.className("ees-track-title"))).map(async (track) => await track.getText());
      expect(await Promise.all(trackTitles), browser).to.deep.equal([
        "night smoke",
        "サーチロック",
        "Black Lily",
        "灰青",
        "青十六歳",
      ]);
    })).to.be.true;
  });

  it("should log out", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      const loginButton = await attemptLogout(driver);
      expect(loginButton.length, browser).to.equal(1);
    })).to.be.true;
  });

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  });
});
export {};