import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { loadDrivers, runTest, isMobileDriver, navigate, enterFrame, refresh, login, attemptLogout } from "./selenium";
import { expect } from "chai";

async function toggleLike(driver:ThenableWebDriver, browser:string) {
	const liked = (await driver.findElements(By.css("#ees-playlist-like-button.ees-liked"))).length === 1;
	const likeCount1 = parseInt(await driver.findElement(By.id("ees-playlist-like-count")).getText());
	await driver.findElement(By.id("ees-playlist-like-button")).click();
	await driver.sleep(1000);
	const newLiked = (await driver.findElements(By.css("#ees-playlist-like-button.ees-liked"))).length === 1;
	expect(parseInt(await driver.findElement(By.id("ees-playlist-like-count")).getText()), browser).to.equal(likeCount1 + (newLiked ? 1 : -1));
	expect(newLiked, browser).to.not.equal(liked);

	await refresh(driver);
	await enterFrame(driver);
	await driver.wait(until.elementLocated(By.id("ees-playlist-like-button")));
	const newLiked2 = (await driver.findElements(By.css("#ees-playlist-like-button.ees-liked"))).length === 1;
	expect(newLiked2, browser).to.equal(newLiked);
}

describe("playlist", function() {
	before(async function() {
		this.drivers = await loadDrivers();
	});

	let i = 0;

	do{

		it("should log out", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				const loginButton = await attemptLogout(driver);
				expect(loginButton.length, browser).to.equal(1);
			})).to.not.throw;
		});

		it("should have playlist info", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/?playlist=95e0508e-8ab4-4692-bcf0-32fe798ee6c1");
				await enterFrame(driver);

				await driver.wait(until.elementLocated(By.css("h1")), 30000);
				expect(await driver.findElement(By.css("h1")).isDisplayed(), browser).to.be.true;
				expect(await driver.findElement(By.css("h1")).getText(), browser).to.equal("復旧したe");

				await driver.wait(until.elementLocated(By.id("ees-playlist-creator")), 30000);
				expect(await driver.findElement(By.id("ees-playlist-creator")).isDisplayed(), browser).to.be.true;
				expect(await driver.findElement(By.id("ees-playlist-creator")).getText(), browser).to.equal("yayuyokitano");

				await driver.wait(until.elementLocated(By.id("ees-playlist-date")), 30000);
				expect(await driver.findElement(By.id("ees-playlist-date")).isDisplayed(), browser).to.be.true;
				expect(await driver.findElement(By.id("ees-playlist-date")).getText(), browser).to.equal("2021/07/22");


				await driver.wait(until.elementLocated(By.className("ees-playlist-cover")), 30000);
				const cover = driver.findElement(By.className("ees-playlist-cover"));
				expect(await cover.isDisplayed(), browser).to.be.true;
				expect(await cover.getCssValue("width"), browser).to.equal("210px");
				expect(await cover.getCssValue("height"), browser).to.equal("210px");

				const images = await cover.findElements(By.css("img"));
				expect(images.length, browser).to.equal(9);
				expect(await images[0].getCssValue("width"), browser).to.equal("70px");
				expect(await images[0].getCssValue("height"), browser).to.equal("70px");
				expect(await images[0].getAttribute("src"), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/profile/1667.JPG?updated_at=2021-09-07T12%3A18%3A15%2B09%3A00");
				
			})).to.not.throw;
		});

		it("should have track container", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/?playlist=95e0508e-8ab4-4692-bcf0-32fe798ee6c1");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css("h2")), 30000);
				
				expect(await driver.findElement(By.className("ees-track-container")).isDisplayed(), browser).to.be.true;
				expect((await driver.findElements(By.css(".ees-track-container .ees-track"))).length, browser).to.be.greaterThan(40);
				expect(await driver.findElement(By.css(".ees-track-container .ees-track")).isDisplayed(), browser).to.be.true;
				expect(await driver.findElement(By.css(".ees-track-container .ees-track .ees-track-title")).isDisplayed(), browser).to.be.true;
				expect(await driver.findElement(By.css(".ees-track-container .ees-track .ees-track-title")).getText(), browser).to.equal("シャタード");

			})).to.not.throw;
		});

		it("should display heart, should not be interactable", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/?playlist=95e0508e-8ab4-4692-bcf0-32fe798ee6c1");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.id("ees-playlist-like-button")), 5000);
				const liked = (await driver.findElements(By.css("#ees-playlist-like-button.ees-liked"))).length === 1;
				expect(liked, browser).to.be.false;
				await driver.findElement(By.id("ees-playlist-like-button")).click();
				const liked2 = (await driver.findElements(By.css("#ees-playlist-like-button.ees-liked"))).length === 1;
				expect(liked2, browser).to.be.false;
			})).to.not.throw;
		});

		it("should login", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await enterFrame(driver);
				await login(driver, browser);
				expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/artist/IG_LiLySketch/");
			})).to.not.throw;
		});

		it("should be possible to like and unlike playlist", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				
				await navigate(driver, "https://eggs.mu/?playlist=95e0508e-8ab4-4692-bcf0-32fe798ee6c1");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.id("ees-playlist-like-button")), 30000);

				await toggleLike(driver, browser);
				await toggleLike(driver, browser);

			})).to.not.throw;
		});

		it("should set viewport size", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				await driver.manage().window().setRect({ width: 390, height: 844 });
				expect(await isMobileDriver(driver), browser).to.be.true;
			})).to.not.throw;
		});

	} while (i++ < 1);

	after(async function() {
		const closeFuncs:Promise<void>[] = [];
		this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
		await Promise.all(closeFuncs);
	});
});
export {};