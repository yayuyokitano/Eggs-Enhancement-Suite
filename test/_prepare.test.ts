import { ThenableWebDriver } from "selenium-webdriver";

const { loadDrivers, runTest, attemptLogout } = require("./selenium") as typeof import("./selenium");
const { expect } = require("chai") as typeof import("chai");
 

describe("test preparations", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  it("log out if logged in", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      const loginButton = await attemptLogout(driver);
      expect(loginButton.length, browser).to.equal(1);
    })).to.not.throw;
  });

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  });
});
export {};