import { ThenableWebDriver } from "selenium-webdriver";
const { loadDrivers, runTest, enterFrame, attemptLogout, login, isMobileDriver } = require("./selenium") as typeof import("./selenium");
const { By, until } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");

const opposite = {
  "true": "false",
  "false": "true",
}

describe("artist", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  let i = 0;

  do {

  it("should log out", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      const loginButton = await attemptLogout(driver);
      expect(loginButton.length, browser).to.equal(1);
    })).to.not.throw;
  });

  it("should display artist info", async function() {
    expect (await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const artistName = await driver.findElement(By.className("artist_name")).getText();
      expect(artistName, browser).to.equal("Lily Sketch");
      const eggsID = await driver.findElement(By.className("eggsid")).getText();
      expect(eggsID, browser).to.equal("EggsID：IG_LiLySketch");
      const area = await driver.findElement(By.className("area")).getText();
      expect(area, browser).to.equal("CHIBA");
      const genre = await driver.findElement(By.className("genre")).getText();
      expect(genre, browser).to.equal("ロック");
      if (await isMobileDriver(driver)) {
        await driver.findElement(By.css(".btn_profile")).click();
        await driver.wait(until.elementLocated(By.id("profile-box")), 1000);
        expect(await driver.findElement(By.id("profile-box")).getText()).to.equal("スリーピースガールズバンド\nVo .&Ba.ゆい　Gt.なつみ　Dr.あや");
        await driver.findElement(By.className("fancybox-close")).click();
      } else {
        const description = await driver.findElement(By.className("description")).getText();
        //String may end with "more". We don't care, cut it off.
        expect(description.slice(0,37), browser).to.equal("スリーピースガールズバンド\nVo .&Ba.ゆい　Gt.なつみ　Dr.あや");
      }
      const areahref = await driver.findElement(By.css(".area a")).getAttribute("href");
      expect(areahref, browser).to.equal("https://eggs.mu/search/area/CHIBA");
      const genrehref = await driver.findElement(By.css(".genre a")).getAttribute("href");
      expect(genrehref, browser).to.equal("https://eggs.mu/search/genre/fg3");
      const img = await driver.findElement(By.css(".header_mypage_img img")).getAttribute("src");
      expect(img, browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/profile/5637.jpeg?updated_at=2021-08-31T15%3A48%3A07%2B09%3A00");
    })).to.not.throw;
  })

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
    })).to.not.throw;
  });

  it("should display hearts, should not be interactable", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const like = await driver.findElement(By.className("ees-track-like"));
      expect(await like.getAttribute("data-liked"), browser).to.equal("false");
      await like.click();
      expect(await like.getAttribute("data-liked"), browser).to.equal("false");
    })).to.not.throw;
  });

  it("should login", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await enterFrame(driver);
      await login(driver, browser);
      expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/artist/IG_LiLySketch/");
    })).to.not.throw;
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
    })).to.not.throw;
  });

  it("should display hearts, should be interactable, should send request", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await driver.sleep(1000);
      await enterFrame(driver);
      const like = await driver.findElement(By.className("ees-track-like"));
      const likeAttr = await like.getAttribute("data-liked");
      if (likeAttr !== "true" && likeAttr !== "false") {
        throw new Error("data-liked is not a boolean");
      }
      await like.click();
      await enterFrame(driver);
      driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${opposite[likeAttr]}"]`)), 5000);
      const like2 = await driver.findElement(By.className("ees-track-like"));
      expect(await like2.getAttribute("data-liked"), browser).to.equal(opposite[likeAttr]);
      await driver.sleep(2000);

      await driver.navigate().refresh();
      await enterFrame(driver);
      driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${opposite[likeAttr]}"]`)), 5000);
      const like3 = await driver.findElement(By.className("ees-track-like"));
      expect(await like3.getAttribute("data-liked"), browser).to.equal(opposite[likeAttr]);

      await like3.click();
      await enterFrame(driver);
      driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${likeAttr}"]`)), 5000);
      const like4 = await driver.findElement(By.className("ees-track-like"));
      expect(await like4.getAttribute("data-liked"), browser).to.equal(likeAttr);
      await driver.sleep(2000);

      await driver.navigate().refresh();
      await enterFrame(driver);
      driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${likeAttr}"]`)), 5000);
      const like5 = await driver.findElement(By.className("ees-track-like"));
      expect(await like5.getAttribute("data-liked"), browser).to.equal(likeAttr);
    })).to.not.throw;
  });

  it("should log out", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      const loginButton = await attemptLogout(driver);
      expect(loginButton.length, browser).to.equal(1);
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