import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { loadDrivers, runTest, enterFrame, attemptLogout, login, isMobileDriver, navigate, refresh, toggleFollow } from "./selenium";
import { expect } from "chai";

const opposite = {
	"true": "false",
	"false": "true",
};

describe("artist", function() {
	before(async function() {
		this.drivers = await loadDrivers();
	});

	let i = 0;

	do {

		it("should log out", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				const loginButton = await attemptLogout(driver);
				expect(loginButton.length, browser).to.equal(1);
			})).to.not.throw;
		});

		it("should display artist info", async function() {
			expect (await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-banner-user-details h1")), 5000);
				const artistName = await driver.findElement(By.css(".ees-banner-user-details h1")).getText();
				expect(artistName, browser).to.equal("Lily Sketch");
				const eggsID = await driver.findElement(By.id("ees-eggs-id")).getText();
				expect(eggsID, browser).to.equal("EggsID：IG_LiLySketch");
				const area = await driver.findElement(By.id("ees-banner-prefecture")).getText();
				expect(area, browser).to.equal("Chiba");
				const genre = await driver.findElement(By.className("ees-genre-wrapper")).getText();
				expect(genre, browser).to.equal("Rock");
				const description = await driver.findElement(By.id("ees-banner-profile")).getText();
				//browser inconsistencies
				expect(["スリーピースガールズバンド Vo .&Ba.ゆい　Gt.なつみ　Dr.あや", "スリーピースガールズバンド\nVo .&Ba.ゆい　Gt.なつみ　Dr.あや"], browser).to.include(description);
				const areahref = await driver.findElement(By.css("#ees-banner-prefecture")).getAttribute("href");
				expect(areahref, browser).to.equal("https://eggs.mu/search/area/CHIBA");
				const genrehref = await driver.findElement(By.css(".ees-genre-wrapper a")).getAttribute("href");
				expect(genrehref, browser).to.equal("https://eggs.mu/search/genre/fg3");
				const img = await driver.findElement(By.css("#ees-profile-picture")).getAttribute("src");
				expect(img, browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/profile/5637.jpeg?updated_at=2021-08-31T15%3A48%3A07%2B09%3A00");
				const socials = await driver.findElements(By.css(".ees-sns-link"));
				expect(socials.length, browser).to.equal(1);
				expect(await socials[0].getText(), browser).to.equal("Twitter");
				expect(await socials[0].getAttribute("href"), browser).to.equal("https://twitter.com/IG_LiLySketch");
			})).to.not.throw;
		});

		it("should display playlists featuring artist", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-carousel-outer")), 5000);

				const playlists = await driver.findElement(By.className("ees-carousel-outer"));
				expect(await playlists.isDisplayed(), browser).to.be.true;
				expect((await playlists.findElement(By.css("h2")).getText()).startsWith("Playlists featuring this artist ("), browser).to.be.true;
			})).to.not.throw;
		});

		it("should display the tracks while logged out", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-track-title")), 5000);
				const trackTitles = (await driver.findElements(By.className("ees-track-title"))).map(async (track) => await track.getText());
				expect(await Promise.all(trackTitles), browser).to.deep.equal([
					"night smoke",
					"サーチロック",
					"Black Lily",
					"灰青",
					"青十六歳",

				]);
			})).to.not.throw;
		});

		it("should display hearts, should not be interactable", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-track-like")), 5000);
				const like = await driver.findElement(By.className("ees-track-like"));
				expect(await like.getAttribute("data-liked"), browser).to.equal("false");
				await like.click();
				expect(await like.getAttribute("data-liked"), browser).to.equal("false");
			})).to.not.throw;
		});

		it("should not have a follow button while signed out", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css("h1")), 30000);
				expect((await driver.findElements(By.id("ees-follow-button"))).length, browser).to.equal(0);
			})).to.not.throw;
		});

		it("should login", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await enterFrame(driver);
				await login(driver, browser);
				expect(await driver.getCurrentUrl(), browser).to.equal("https://eggs.mu/artist/IG_LiLySketch/");
			})).to.not.throw;
		});

		it("should be possible to follow and unfollow user", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.id("ees-follow-button")), 30000);

				await toggleFollow(driver, browser);
				await toggleFollow(driver, browser);

			})).to.not.throw;
		});

		it("should display the tracks while logged in", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-track-title")), 5000);
				const trackTitles = (await driver.findElements(By.className("ees-track-title"))).map(async (track) => await track.getText());
				expect(await Promise.all(trackTitles), browser).to.deep.equal([
					"night smoke",
					"サーチロック",
					"Black Lily",
					"灰青",
					"青十六歳",
				]);
			})).to.not.throw;
		});

		it("should display hearts, should be interactable, should send request", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/artist/IG_LiLySketch/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-track-like")), 5000);
				await driver.sleep(1000);
				const like = await driver.findElement(By.className("ees-track-like"));
				const likeAttr = await like.getAttribute("data-liked");
				if (likeAttr !== "true" && likeAttr !== "false") {
					throw new Error("data-liked is not a boolean");
				}
				await like.click();
				await driver.sleep(1000);
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${opposite[likeAttr]}"]`)), 5000);
				const like2 = await driver.findElement(By.className("ees-track-like"));
				expect(await like2.getAttribute("data-liked"), browser).to.equal(opposite[likeAttr]);

				await refresh(driver);
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${opposite[likeAttr]}"]`)), 5000);
				await driver.sleep(1000);
				const like3 = await driver.findElement(By.className("ees-track-like"));
				expect(await like3.getAttribute("data-liked"), browser).to.equal(opposite[likeAttr]);

				await like3.click();
				await driver.sleep(1000);
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${likeAttr}"]`)), 5000);
				const like4 = await driver.findElement(By.css(`.ees-track:first-child .ees-track-like[data-liked="${likeAttr}"]`));
				expect(await like4.getAttribute("data-liked"), browser).to.equal(likeAttr);

				await refresh(driver);
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(`.ees-track:first-child .ees-track-like[data-liked="${likeAttr}"]`)), 5000);
				await driver.sleep(1000);
				const like5 = await driver.findElement(By.className("ees-track-like"));
				expect(await like5.getAttribute("data-liked"), browser).to.equal(likeAttr);
			})).to.not.throw;
		});

		it("should log out", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				const loginButton = await attemptLogout(driver);
				expect(loginButton.length, browser).to.equal(1);
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