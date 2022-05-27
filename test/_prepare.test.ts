import { ThenableWebDriver } from "selenium-webdriver";

const { loadDrivers, runTest, enterFrame } = require("./selenium") as typeof import("./selenium");
const { By, until } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");
 

describe("test preparations", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  it("log out if logged in", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      await driver.get("https://eggs.mu/");
      await enterFrame(driver);
      try {
        const user = await driver.findElement(By.id(`ees-user`));
        await user.click();

        await enterFrame(driver);
        const logoutButton = await driver.findElement(By.css("#ees-user-container a:last-child>li"));
        await logoutButton.click();
      } catch(_) {
        //do nothing
      }
      await driver.sleep(5000);
      await enterFrame(driver);
      const loginButton = await driver.findElements(By.id("ees-login"));
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