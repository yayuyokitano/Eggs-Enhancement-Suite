import { ThenableWebDriver } from "selenium-webdriver";
const { Builder, By, until, WebElementCondition } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome") as typeof import("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox") as typeof import("selenium-webdriver/firefox");
const safari = require("selenium-webdriver/safari") as typeof import("selenium-webdriver/safari");
const path = require("path") as typeof import("path");
const getExtension = (browser:string) => path.resolve(__dirname, "..", "build", browser);
const config = require("../config.json") as typeof import("../config.json");

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
  await driver.switchTo().defaultContent();
  await driver.wait(until.elementLocated(By.id("ees-spa-iframe")), 10000);
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
  for (let test of (await Promise.all(tests))) {
    if (test !== undefined) {
      throw new Error(`Test failed`);
    }
  }
  return true;
}

export async function attemptLogout(driver:ThenableWebDriver) {
  await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
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
  return driver.findElements(By.id("ees-login"));
}

export async function login(driver:ThenableWebDriver, browser:string) {
  await driver.get("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/");
  await enterFrame(driver);
  const username = await driver.findElement(By.css(`.input-wrapper [placeholder="IDまたはメールアドレス"]`));
  await username.sendKeys(config.username + browser.split(" ").slice(-1)[0].toLowerCase());
  const password = await driver.findElement(By.css(`.input-wrapper [placeholder="パスワード"]`));
  await password.sendKeys(config.password);
  const loginButton = await driver.findElement(By.css(`.form-control>.form-control>.button`));
  await loginButton.click();
  await driver.wait(until.urlIs("https://eggs.mu/artist/IG_LiLySketch/"), 10000);
}
