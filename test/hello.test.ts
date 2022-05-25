import { ThenableWebDriver } from "selenium-webdriver";

const { loadDrivers, runTest, enterFrame } = require("./selenium") as typeof import("./selenium");
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");
 

describe("test", function() {
  before(async function() {
    this.drivers = await loadDrivers();
    return;
  });

  it("should display hello world on front page", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/");
      await enterFrame(driver);
      const element = await driver.findElement(By.css(".ttl_side>p"));
      expect(await element.getText(), browser).to.equal("hello world");
    })).to.be.true;
  })

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  })
});
export {};