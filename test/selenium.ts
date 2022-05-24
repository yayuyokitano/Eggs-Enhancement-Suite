import { Builder, ThenableWebDriver } from "selenium-webdriver";
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
  await chromeDriver.manage().setTimeouts( { implicit: 10000 } );

  await chromeDriver.get("https://eggs.mu/");

  const firefoxDriver = new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(new firefox.Options()
    .addExtensions(getExtension("firefox.zip"))
    .setProfile("/Users/User/Library/Application Support/Firefox/Profiles/zlf02h2j.testing"))
    .build();
  await firefoxDriver.manage().setTimeouts( { implicit: 10000 } );

  //ok actually do the things now
  await firefoxDriver.get("https://eggs.mu/");

  const safariDriver = new Builder()
    .forBrowser("safari")
    .setSafariOptions(new safari.Options())
    .build();
  await safariDriver.manage().setTimeouts( { implicit: 10000 } );
  
  await safariDriver.get("https://eggs.mu/");
  
  return [chromeDriver, firefoxDriver, safariDriver];
}

export async function runTest(drivers:ThenableWebDriver[], test:(driver:ThenableWebDriver) => Promise<void>) {
  let tests:Promise<void>[] = [];
  for (let driver of drivers) {
    tests.push(test(driver));
  }
  await Promise.all(tests);
  return;
}