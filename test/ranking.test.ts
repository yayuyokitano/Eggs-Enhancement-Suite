import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { loadDrivers, runTest, isMobileDriver, navigate, enterFrame, attemptLogout } from "./selenium";
import { expect } from "chai";
 

describe("ranking", function() {
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

		it("daily artist ranking should have carousel, should have navigation buttons", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/ranking/artist/daily");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-carousel-outer")), 30000);
				
				expect(await driver.findElement(By.css(".ees-ranking-wrapper h1")).getText(), browser).to.equal("Ranking");
				expect(await driver.findElement(By.className("ees-carousel-outer")).isDisplayed(), browser).to.be.true;

				expect(await driver.findElement(By.css(".dayweekNav a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/artist/weekly");
				expect(await driver.findElement(By.css(".dayweekNav span")).getText(), browser).to.equal("Daily");

				// no idea why this makes it less flaky
				await enterFrame(driver);

				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(2) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/song/daily");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(3) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/youtube/daily");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category span")).getText(), browser).to.equal("Artists");

				
			})).to.not.throw;
		});

		it("weekly artist ranking should have carousel, should have navigation buttons", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/ranking/artist/weekly");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-carousel-outer")), 30000);
				
				expect(await driver.findElement(By.css(".ees-ranking-wrapper h1")).getText(), browser).to.equal("Ranking");
				expect(await driver.findElement(By.className("ees-carousel-outer")).isDisplayed(), browser).to.be.true;

				expect(await driver.findElement(By.css(".dayweekNav a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/artist/daily");
				expect(await driver.findElement(By.css(".dayweekNav span")).getText(), browser).to.equal("Weekly");

				// no idea why this makes it less flaky
				await enterFrame(driver);

				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(2) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/song/weekly");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(3) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/youtube/weekly");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category span")).getText(), browser).to.equal("Artists");

				
			})).to.not.throw;
		});

		it("daily song ranking should have list, should have navigation buttons", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/ranking/song/daily");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-rank-track-container")), 30000);
				
				expect(await driver.findElement(By.css(".ees-ranking-wrapper h1")).getText(), browser).to.equal("Ranking");
				expect(await driver.findElement(By.className("ees-rank-track-container")).isDisplayed(), browser).to.be.true;

				expect(await driver.findElement(By.css(".dayweekNav a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/song/weekly");
				expect(await driver.findElement(By.css(".dayweekNav span")).getText(), browser).to.equal("Daily");

				// no idea why this makes it less flaky
				await enterFrame(driver);

				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:first-child > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/artist/daily");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(3) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/youtube/daily");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category span")).getText(), browser).to.equal("Songs");

				
			})).to.not.throw;
		});

		it("weekly song ranking should have list, should have navigation buttons", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/ranking/song/weekly");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-rank-track-container")), 30000);
				
				expect(await driver.findElement(By.css(".ees-ranking-wrapper h1")).getText(), browser).to.equal("Ranking");
				expect(await driver.findElement(By.className("ees-rank-track-container")).isDisplayed(), browser).to.be.true;

				expect(await driver.findElement(By.css(".dayweekNav a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/song/daily");
				expect(await driver.findElement(By.css(".dayweekNav span")).getText(), browser).to.equal("Weekly");

				// no idea why this makes it less flaky
				await enterFrame(driver);

				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:first-child > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/artist/weekly");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(3) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/youtube/weekly");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category span")).getText(), browser).to.equal("Songs");

				
			})).to.not.throw;
		});

		it("daily youtube ranking should have list, should have navigation buttons", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/ranking/youtube/daily");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-rank-track-container")), 30000);
				
				expect(await driver.findElement(By.css(".ees-ranking-wrapper h1")).getText(), browser).to.equal("Ranking");
				expect(await driver.findElement(By.className("ees-rank-track-container")).isDisplayed(), browser).to.be.true;

				expect(await driver.findElement(By.css(".dayweekNav a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/youtube/weekly");
				expect(await driver.findElement(By.css(".dayweekNav span")).getText(), browser).to.equal("Daily");

				// no idea why this makes it less flaky
				await enterFrame(driver);

				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:first-child > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/artist/daily");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(2) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/song/daily");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category span")).getText(), browser).to.equal("YouTube");

				
			})).to.not.throw;
		});

		it("weekly youtube ranking should have list, should have navigation buttons", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/ranking/youtube/weekly");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.className("ees-rank-track-container")), 30000);
				
				expect(await driver.findElement(By.css(".ees-ranking-wrapper h1")).getText(), browser).to.equal("Ranking");
				expect(await driver.findElement(By.className("ees-rank-track-container")).isDisplayed(), browser).to.be.true;

				expect(await driver.findElement(By.css(".dayweekNav a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/youtube/daily");
				expect(await driver.findElement(By.css(".dayweekNav span")).getText(), browser).to.equal("Weekly");

				// no idea why this makes it less flaky
				await enterFrame(driver);

				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:first-child > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/artist/weekly");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category > li:nth-child(2) > a")).getAttribute("href"), browser).to.equal("https://eggs.mu/ranking/song/weekly");
				expect(await driver.findElement(By.css(".ees-ranking-wrapper .ranking_category span")).getText(), browser).to.equal("YouTube");

				
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
