import { ThenableWebDriver } from "selenium-webdriver";

const { loadDrivers, runTest, enterFrame, attemptLogout, login } = require("./selenium") as typeof import("./selenium");
const { By, until } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");
const config = require("../config.json") as typeof import("../config.json");
 

describe("login", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  it("should have login and register buttons that are visible", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/");
      await enterFrame(driver);
      const loginButton = await driver.findElement(By.css(`#ees-login :first-child`));
      const registerButton = await driver.findElement(By.css(`#ees-login :nth-child(2)`));
      expect(await loginButton.getText(), browser).to.equal("Login");
      expect(await registerButton.getText(), browser).to.equal("Register");
      expect(await loginButton.isDisplayed(), browser).to.be.true;
      expect(await registerButton.isDisplayed(), browser).to.be.true;
    })).to.not.throw;
  });

  it("should go to login screen when button clicked and have redirect url", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const loginButton = await driver.findElement(By.css("#ees-login :first-child"));
      await loginButton.click();
      await driver.wait(until.urlIs("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/"), 20000);
      expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/");
    })).to.not.throw;
  });

  it("should have disclaimer", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const disclaimer = await driver.findElement(By.css(".form-control.pt30p.pb50p p"));
      expect(await disclaimer.getText(), browser).to.equal("By logging in, you also log in with Eggs Enhancement Suite. Note that EES is not endorsed by nor affiliated with Eggs.mu, and that you are logging in at your own risk.");
      expect(await disclaimer.isDisplayed(), browser).to.be.true;
    })).to.not.throw;
  });

  it("should login and redirect to previous page", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await login(driver, browser);
      expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/artist/IG_LiLySketch/");
    })).to.not.throw;
  });

  it("should be logged in", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      const username = await driver.findElement(By.className("ees-username"));
      expect(await username.getText(), browser).to.equal(config.username + browser.split(" ").slice(-1)[0].toLowerCase());
    })).to.not.throw;
  });

  it("should log out and remain on the same page", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      const loginButton = await attemptLogout(driver);
      expect(loginButton.length, browser).to.equal(1);
      expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/artist/IG_LiLySketch/");
    })).to.not.throw;
  });

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  })
});
export {};