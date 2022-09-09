import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { enterFrame, loadDrivers, runTest, isMobileDriver, navigate } from "./selenium";
import { expect } from "chai";
 

describe("home", function() {
	before(async function() {
		this.drivers = await loadDrivers();
	});

	let i = 0;

	do{

		it("should have a news carousel", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:first-child")), 30000);

				const carousel = await driver.findElement(By.css(".ees-carousel-outer:first-child"));
				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect(await carousel.findElement(By.css("h2")).getText(), browser).to.equal("News");
				expect(await carousel.findElement(By.className("ees-article")).isDisplayed(), browser).to.be.true;
				
			})).to.not.throw;
		});

		it("should have a recommended by eggs carousel", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(2)")), 30000);

				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(2)"));
				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect(await carousel.findElement(By.css("h2")).getText(), browser).to.equal("Recommended by Eggs");
				expect(await carousel.findElement(By.className("ees-carousel-artist-introduction")).isDisplayed(), browser).to.be.true;
				
			})).to.not.throw;
		});

		it("should have a new playlists carousel", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(3)")), 30000);

				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(3)"));
				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect(await carousel.findElement(By.css("h2")).getText(), browser).to.equal("New Playlists");
				expect(await carousel.findElement(By.className("ees-carousel-playlist")).isDisplayed(), browser).to.be.true;
				
			})).to.not.throw;
		});

		it("should have a popular playlists carousel", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4)")), 30000);

				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(4)"));
				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect(await carousel.findElement(By.css("h2")).getText(), browser).to.equal("Popular Playlists");
				expect(await carousel.findElement(By.className("ees-carousel-playlist")).isDisplayed(), browser).to.be.true;
				
			})).to.not.throw;
		});

		it("should have new tracks list", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-dynamic-track-container-wrapper")), 30000);

				const list = await driver.findElement(By.className("ees-dynamic-track-container-wrapper"));
				expect(await list.isDisplayed(), browser).to.be.true;
				expect(await list.findElement(By.css("h2")).getText(), browser).to.equal("New Tracks");
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