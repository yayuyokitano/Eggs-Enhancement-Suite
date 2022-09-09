import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { loadDrivers, runTest, isMobileDriver, navigate, enterFrame, attemptLogout, login, toggleFollow } from "./selenium";
import { expect } from "chai";

describe("user", function() {
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

		it("should have user info, public playlists", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/user/yayuyokitano/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css("h1")), 30000);

				expect(await driver.findElement(By.css("h1")).getText(), browser).to.equal("yayuyokitano");
				expect(await driver.findElement(By.id("ees-eggs-id")).getText(), browser).to.equal("EggsID：yayuyokitano");
				expect(await driver.findElement(By.id("ees-profile-picture")).isDisplayed(), browser).to.be.true;
				expect(await driver.findElement(By.id("ees-profile-picture")).getAttribute("src"), browser).to.equal("https://eggs.mu/wp-content/themes/eggs/assets/img/common/signin.png");
				
				await driver.wait(until.elementLocated(By.className("ees-carousel-playlist")), 30000);
				const carousel = await driver.findElement(By.className("ees-carousel-outer"));
				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect(await carousel.findElement(By.css("h2")).getText(), browser).to.equal("Playlist");
				const playlist = await carousel.findElement(By.className("ees-carousel-playlist"));
				expect(await playlist.isDisplayed(), browser).to.be.true;
				expect(await playlist.getAttribute("href"), browser).to.equal("https://eggs.mu/?playlist=95e0508e-8ab4-4692-bcf0-32fe798ee6c1");
				expect(await playlist.findElement(By.css("h3")).getText(), browser).to.equal("復旧したe");
				
			})).to.not.throw;
		});

		it("should not have a follow button while signed out", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {
				await navigate(driver, "https://eggs.mu/user/yayuyokitano/");
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

				await navigate(driver, "https://eggs.mu/user/yayuyokitano/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.id("ees-follow-button")), 30000);

				await toggleFollow(driver, browser);
				await toggleFollow(driver, browser);

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