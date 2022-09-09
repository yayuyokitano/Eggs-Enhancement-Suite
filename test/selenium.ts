import { ThenableWebDriver, WebElement, Builder, By, until } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import * as firefox from "selenium-webdriver/firefox";
import * as safari from "selenium-webdriver/safari";
import * as path from "path";
import * as config from "../config.json";
import { expect } from "chai";
const getExtension = (browser:string) => path.resolve(__dirname, "..", "build", browser);

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
		await driver.switchTo().defaultContent();
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
	await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
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
	await navigate(driver, "https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/");
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

export async function navigate(driver:ThenableWebDriver, url:string) {
	await driver.switchTo().defaultContent();
	await driver.get(url);
	await driver.wait(until.elementLocated(By.id("ees-spa-iframe")), 30000);
	await driver.sleep(3000);
}

export async function refresh(driver:ThenableWebDriver) {
	await driver.switchTo().defaultContent();
	await driver.navigate().refresh();
	await driver.wait(until.elementLocated(By.id("ees-spa-iframe")), 30000);
	await driver.sleep(3000);
}


export const getTrackInfo = async (e:WebElement) => ({
	title: await e.findElement(By.className("ees-track-title")).getText(),
	artist: await e.findElement(By.className("ees-artist-name")).getText(),
	imageDataPath: await e.findElement(By.className("ees-track-thumb")).getAttribute("src"),
});

export const getCurrentTrack = async (driver:ThenableWebDriver) => ({
	title: await driver.findElement(By.id("ees-player-title")).getText(),
	artist: await driver.findElement(By.id("ees-player-artist")).getText(),
	imageDataPath: await driver.findElement(By.id("ees-player-thumbnail")).getAttribute("src"),
});

export const getTopTrack = async (tracks:WebElement[]) => tracks.reduce(async (max, track) => {
	const playcount = parseInt(await track.findElement(By.className("ees-track-playcount")).getText());
	if (playcount > (await max).playcount) {
		return {
			track,
			playcount
		};
	}
	return max;
}, Promise.resolve({ track: tracks[0], playcount: 0 }));

export async function toggleFollow(driver:ThenableWebDriver, browser:string) {
	const following = (await driver.findElements(By.css("#ees-follow-button.ees-following"))).length === 1;
	await driver.findElement(By.id("ees-follow-button")).click();
	const newFollowing = (await driver.findElements(By.css("#ees-follow-button.ees-following"))).length === 1;
	expect(newFollowing, browser).to.not.equal(following);
	await refresh(driver);
	await enterFrame(driver);
	await driver.wait(until.elementLocated(By.id("ees-follow-button")));
	const newFollowing2 = (await driver.findElements(By.css("#ees-follow-button.ees-following"))).length === 1;
	expect(newFollowing2, browser).to.equal(newFollowing);
}
