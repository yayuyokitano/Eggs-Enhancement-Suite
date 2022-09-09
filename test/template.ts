import { ThenableWebDriver, By, until } from "selenium-webdriver";
import { loadDrivers, runTest, isMobileDriver, navigate, enterFrame } from "./selenium";
import { expect } from "chai";
 

describe("login", function() {
	before(async function() {
		this.drivers = await loadDrivers();
	});

	let i = 0;

	do{

		it("should navigate", async function() {
			expect(await runTest(this.drivers, async (driver, browser) => {

				await navigate(driver, "https://eggs.mu/search?searchKeyword=%E9%82%A6");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4)")), 30000);
				expect("a", browser).to.equal("a");
				
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