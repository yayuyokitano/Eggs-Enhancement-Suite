import { ThenableWebDriver } from "selenium-webdriver";
const { loadDrivers, runTest } = require("./selenium") as typeof import("./selenium");
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");
 

describe("test", function() {
  before(async function() {
    this.drivers = await loadDrivers();
    return;
  })

  it("should display hello world on front page", async function() {
    runTest(this.drivers, async(driver) => {
      await driver.get("https://eggs.mu/");
      const element = driver.findElement(By.css(".ttl_side>p"));
      expect(await element.getText()).to.equal("hello world");
    });
  })

  after(async function() {
    this.drivers[0].close();
    this.drivers[1].close();
  })
});
