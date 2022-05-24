import { ThenableWebDriver } from "selenium-webdriver";
const { Builder, By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome") as typeof import("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox") as typeof import("selenium-webdriver/firefox");
const safari = require("selenium-webdriver/safari") as typeof import("selenium-webdriver/safari");
const path = require("path") as typeof import("path");
const getExtension = (browser:string) => path.resolve(__dirname, "..", "build", browser);

export async function loadDrivers() {

  const chromeDriver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options()
    .addArguments(`--load-extension=${getExtension("chrome")}`))
    .build();
  await chromeDriver.manage().setTimeouts( { implicit: 20000 } );

  const firefoxDriver = new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(new firefox.Options()
    .addExtensions(getExtension("firefox.zip"))
    .setProfile("/Users/User/Library/Application Support/Firefox/Profiles/zlf02h2j.testing"))
    .build();
  await firefoxDriver.manage().setTimeouts( { implicit: 20000 } );

  const safariDriver = new Builder()
    .forBrowser("safari")
    .setSafariOptions(new safari.Options())
    .build();
  await safariDriver.manage().setTimeouts( { implicit: 20000 } );
  
  return [chromeDriver, firefoxDriver, safariDriver];
}

export async function enterFrame(driver:ThenableWebDriver) {
  const iframe = await driver.findElement(By.id("ees-spa-iframe"));
  await driver.switchTo().frame(iframe);
}

export async function exitFrame(driver:ThenableWebDriver) {
  await driver.switchTo().defaultContent();
}

export async function runTest(drivers:ThenableWebDriver[], test:(driver:ThenableWebDriver, browser:string) => Promise<void>) {
  let tests:Promise<void>[] = [];
  for (let driver of drivers) {
    const browser = `Errored in ${(await driver.getCapabilities()).getBrowserName() ?? "unknown"}`;
    tests.push(test(driver, browser));
  }
  let noError = true;
  for (let test of (await Promise.all(tests))) {
    if (test !== undefined) {
      noError = false;
    }
  }
  return noError;
}