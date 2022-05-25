import { ThenableWebDriver } from "selenium-webdriver";

const { loadDrivers, runTest, enterFrame } = require("./selenium") as typeof import("./selenium");
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");
 

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
      expect(await loginButton.isDisplayed()).to.be.true;
      expect(await registerButton.isDisplayed()).to.be.true;
    })).to.be.true;
  })

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  })
});
export {};