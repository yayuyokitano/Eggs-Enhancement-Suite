import { ThenableWebDriver } from "selenium-webdriver";
const { Builder, By, until } = require("selenium-webdriver") as typeof import("selenium-webdriver");
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
			.setChromeBinaryPath("/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary")
			.addArguments(`--load-extension=${getExtension("chrome")}`))
		.build();
	await chromeDriver.manage().window().setRect({ width: 1280, height: 720 });

	const firefoxDriver = new Builder()
		.forBrowser("firefox")
		.setFirefoxOptions(new firefox.Options()
			.addExtensions(getExtension("firefox.zip"))
		//.setPreference("extensions.lastAppBuildId", "1")
			.setProfile("/Users/User/Library/Application Support/Firefox/Profiles/zlf02h2j.testing"))
		.build();
	await firefoxDriver.manage().window().setRect({ width: 1280, height: 720 });

	const safariDriver = new Builder()
		.forBrowser("safari")
		.setSafariOptions(new safari.Options())
		.build();

	await safariDriver.manage().window().setRect({ width: 1280, height: 720 });
  
	return [chromeDriver, firefoxDriver, safariDriver];
}

export async function enterFrame(driver:ThenableWebDriver) {
	await driver.switchTo().defaultContent();
	await driver.wait(until.elementLocated(By.id("ees-spa-iframe")), 30000);
	await driver.sleep(300); //cursed but seems to be needed for reliability
	await driver.switchTo().frame(await driver.findElement(By.id("ees-spa-iframe")));
}

export async function exitFrame(driver:ThenableWebDriver) {
	await driver.switchTo().defaultContent();
}

export async function isMobileDriver(driver:ThenableWebDriver) {
	const windowSize = await driver.manage().window().getRect();
	return windowSize.width < 600;
}

export async function runTest(drivers:ThenableWebDriver[], test:(driver:ThenableWebDriver, browser:string) => Promise<void>) {
	const tests:Promise<void>[] = [];
	for (const driver of drivers) {
		let browser = `Errored in ${(await driver.getCapabilities()).getBrowserName() ?? "unknown"}`;
		browser += await isMobileDriver(driver) ? "mobile" : "";
		tests.push(test(driver, browser));
	}
	for (const test of (await Promise.all(tests))) {
		if (test !== undefined) {
			throw new Error("test failed");
		}
	}
	return true;
}

export async function attemptLogout(driver:ThenableWebDriver) {
	await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
	await enterFrame(driver);
	try {
		const waitRace = [
			driver.wait(until.elementLocated(By.id("ees-user")), 20000),
			driver.wait(until.elementLocated(By.id("ees-login")), 20000)
		];
		await Promise.race(waitRace);
		const user = await driver.findElement(By.id("ees-user"));
		await user.click();

		await enterFrame(driver);
		const logoutButton = await driver.findElement(By.css("#ees-user-container a:last-child>li"));
		await logoutButton.click();
	} catch(_) {
		//do nothing
	}
	await driver.wait(until.elementLocated(By.id("ees-login")), 20000);
	await enterFrame(driver);
	return driver.findElements(By.id("ees-login"));
}

export async function login(driver:ThenableWebDriver, browser:string) {
	await driver.get("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/");
	await enterFrame(driver);
	await driver.wait(until.elementLocated(By.css(".input-wrapper [placeholder=\"IDまたはメールアドレス\"]")), 5000);
	const username = await driver.findElement(By.css(".input-wrapper [placeholder=\"IDまたはメールアドレス\"]"));
	await username.sendKeys(config.username + browser.split(" ").slice(-1)[0].toLowerCase());
	const password = await driver.findElement(By.css(".input-wrapper [placeholder=\"パスワード\"]"));
	await password.sendKeys(config.password);
	const loginButton = await driver.findElement(By.css(".form-control>.form-control>.button"));
	await loginButton.click();
	await driver.wait(until.urlIs("https://eggs.mu/artist/IG_LiLySketch/"), 10000);
}
