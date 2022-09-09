import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { enterFrame, loadDrivers, runTest, isMobileDriver, navigate, attemptLogout } from "./selenium";
import { expect } from "chai";
 

describe("search", function() {
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

		it("should have a title", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/search?searchKeyword=%E9%82%A6");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-search-wrapper h1")), 30000);

				const header = await driver.findElement(By.css(".ees-search-wrapper h1"));

				expect(await header.isDisplayed(), browser).to.be.true;
				expect(await header.getText(), browser).to.equal("Search results for 邦");
				
			})).to.not.throw;
		});

		it("should have artist results", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/search?searchKeyword=%E9%82%A6");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(2)")), 30000);

				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(2)"));

				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect((await carousel.findElement(By.css("h2")).getText()).startsWith("Artists ("), browser).to.be.true;
				expect(await carousel.findElement(By.className("ees-carousel-with-player")).isDisplayed(), browser).to.be.true;
				
			})).to.not.throw;
		});

		it("should have playlist results", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/search?searchKeyword=%E9%82%A6");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(3)")), 30000);

				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(3)"));

				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect((await carousel.findElement(By.css("h2")).getText()).startsWith("Playlists ("), browser).to.be.true;
				expect(await carousel.findElement(By.className("ees-carousel-playlist")).isDisplayed(), browser).to.be.true;
				
			})).to.not.throw;
		});

		it("should have track results", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/search?searchKeyword=%E9%82%A6");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-dynamic-track-container-wrapper")), 30000);

				const list = await driver.findElement(By.className("ees-dynamic-track-container-wrapper"));

				expect(await list.isDisplayed(), browser).to.be.true;
				expect((await list.findElement(By.css("h2")).getText()).startsWith("Tracks ("), browser).to.be.true;

				await driver.wait(until.elementLocated(By.className("ees-track-medium")), 30000);
				expect(await list.findElement(By.className("ees-track-medium")).isDisplayed(), browser).to.be.true;
				
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