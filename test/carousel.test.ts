import { ThenableWebDriver, WebElement } from "selenium-webdriver";
import { getTopTrack } from "./selenium";
const { loadDrivers, runTest, enterFrame, attemptLogout, login, isMobileDriver, navigate, getTrackInfo, getCurrentTrack } = require("./selenium") as typeof import("./selenium");
const { By, until } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");

const scrollScript = `
	const e = arguments[0];
	const change = arguments[1];
	const callback = arguments[2];
	e.scrollLeft += change;
	Promise.resolve(new Promise((r) => setTimeout(r, 1000))).then(() => {
		callback(e.scrollLeft);
	});
`;


describe("login", function() {
	before(async function() {
		this.drivers = await loadDrivers();
	});

	let i = 0;

	do{
		it("should have a top playlist carousel in homepage", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4)")), 5000);
				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(4)"));
				expect(await carousel.isDisplayed(), browser).to.be.true;
				expect(await carousel.findElement(By.css("h2")).getText(), browser).to.equal("Popular Playlists");
			})).to.not.throw;
		});

		it("should have a playlist called Midnight 90's on top, it should link to the correct playlist", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {

				const jackets = [
					"https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/f35f3bc8-f97b-4ad7-841a-ddf7f3dee545.JPG?updated_at=2022-02-15T00%3A49%3A14%2B09%3A00",
					"https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/c83da44a-c0a8-4a14-91a5-260fa0c39c61.jpg?updated_at=2022-02-15T00%3A49%3A14%2B09%3A00",
					"https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/4f973e65-d90f-4a25-a8dc-4b9cf40e33c8.jpeg?updated_at=2022-02-15T00%3A49%3A14%2B09%3A00",
					"https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/cbff13bc-9886-47e5-843d-5a576942d153.jpg?updated_at=2022-02-15T00%3A49%3A31%2B09%3A00",
				];

				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4)")), 5000);
				const carouselItem = await driver.findElement(By.css(".ees-carousel-outer:nth-child(4) .ees-carousel-item:first-child"));
				expect(await carouselItem.findElement(By.className("ees-carousel-playlist-name")).getText(), browser).to.equal("Midnight 90's");
				expect(await carouselItem.findElement(By.className("ees-carousel-playlist")).getAttribute("href"), browser).to.equal("https://eggs.mu/?playlist=29dde43d-0b85-46f3-9a8f-1091fca63767");
				const playlistCover = await carouselItem.findElement(By.className("ees-playlist-cover"));

				expect(await playlistCover.getCssValue("height"), browser).to.equal("174px");
				expect(await playlistCover.getCssValue("width"), browser).to.equal("174px");
				const images = await playlistCover.findElements(By.css("img"));
				expect(images.length, browser).to.equal(4);
				
				for (const coverImage of images) {
					expect(await coverImage.isDisplayed(), browser).to.be.true;
					expect(await coverImage.getAttribute("src"), browser).to.be.oneOf(jackets);
					expect(await coverImage.getCssValue("height"), browser).to.equal("87px");
					expect(await coverImage.getCssValue("width"), browser).to.equal("87px");
				}
			})).to.not.throw;
		});

		it("should scroll with buttons and using scrollwheel, should load elements when appropriate", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4)")), 5000);
				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(4)"));
				const innerCarousel = await carousel.findElement(By.className("ees-carousel"));
				const getCarouselItems = () => innerCarousel.findElements(By.className("ees-carousel-item"));
				expect((await getCarouselItems()).length, browser).to.be.lessThanOrEqual(30);
				expect(await innerCarousel.isDisplayed(), browser).to.be.true;
				expect(await driver.executeScript("return arguments[0].scrollLeft;", innerCarousel), browser).to.equal(0);

				// skip firefox due to bug causing scrollLeft to be 0 even when scrolled
				// visually confirmed that the test is working as of writing this
				// the value just isnt properly returned
				if ((await driver.getCapabilities()).getBrowserName()?.startsWith("firefox")) {
					return;
				}

				expect(await driver.executeAsyncScript(scrollScript, innerCarousel, 300), browser).to.equal(204);
				expect(await driver.executeAsyncScript(scrollScript, innerCarousel, -150), browser).to.equal(0);

				const leftButton = await carousel.findElement(By.className("ees-carousel-prev"));
				const rightButton = await carousel.findElement(By.className("ees-carousel-next"));
				expect(await leftButton.isDisplayed(), browser).to.be.true;
				expect(await rightButton.isDisplayed(), browser).to.be.true;
				rightButton.click();
				await driver.sleep(1000);
				expect(await driver.executeScript("return arguments[0].scrollLeft;", innerCarousel), browser).to.equal(204);
				leftButton.click();
				await driver.sleep(1000);
				expect(await driver.executeScript("return arguments[0].scrollLeft;", innerCarousel), browser).to.equal(0);
				expect((await getCarouselItems()).length, browser).to.be.lessThanOrEqual(30);

				expect(await driver.executeAsyncScript(scrollScript, innerCarousel, 4692), browser).to.equal(4692);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4) .ees-carousel-item:nth-child(31)")), 5000);
				
				expect((await getCarouselItems()).length, browser).to.be.greaterThan(30);
			})).to.not.throw;
		});

		it("should have a modal with content and scrollable", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4)")), 5000);
				const carousel = await driver.findElement(By.css(".ees-carousel-outer:nth-child(4)"));
				expect (await carousel.isDisplayed(), browser).to.be.true;

				const carouselModal = await carousel.findElement(By.className("ees-modal"));
				expect(await carouselModal.isDisplayed(), browser).to.be.false;
				expect(await carouselModal.getAttribute("open"), browser).to.be.null;

				const modalButton = await carousel.findElement(By.className("ees-carousel-modal-btn"));
				expect(await modalButton.isDisplayed(), browser).to.be.true;
				modalButton.click();

				await driver.wait(until.elementIsVisible(carouselModal), 5000);
				expect(await carouselModal.getAttribute("open"), browser).to.equal("true");
				expect(await carouselModal.isDisplayed(), browser).to.be.true;

				const modalHeader = await carouselModal.findElement(By.className("ees-modal-header"));
				expect(await modalHeader.isDisplayed(), browser).to.be.true;
				expect(await modalHeader.getText(), browser).to.equal("Popular Playlists");

				const modalBody = await carouselModal.findElement(By.className("ees-modal-body"));
				const getModalItems = async() => modalBody.findElements(By.className("ees-modal-item"));
				expect((await getModalItems()).length, browser).to.be.lessThanOrEqual(30);

				await driver.executeScript("arguments[0].scrollTo(0, 200);", modalBody);
				await driver.sleep(1000);
				expect(await modalBody.getAttribute("scrollTop"), browser).to.equal("200");
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(4) .ees-modal-body .ees-modal-item:nth-child(31)")), 5000);
				expect((await getModalItems()).length, browser).to.be.greaterThan(30);
				await driver.executeScript("arguments[0].scrollTo(0, 0);", modalBody);
				await driver.sleep(1000);
				expect(await modalBody.getAttribute("scrollTop"), browser).to.equal("0");
				expect((await getModalItems()).length, browser).to.be.greaterThan(30);

				await driver.executeScript("arguments[0].scrollTo(0, 200);", modalBody);
				await driver.sleep(1000);
				expect(await modalBody.getAttribute("scrollTop"), browser).to.equal("200");
				await driver.sleep(2000);
				expect((await getModalItems()).length, browser).to.be.greaterThan(30);
				await driver.executeScript("arguments[0].scrollTo(0, 1000);", modalBody);
				expect(await modalHeader.isDisplayed(), browser).to.be.true;

				await carouselModal.findElement(By.className("ees-modal-close")).click();
				await driver.wait(until.elementIsNotVisible(carouselModal), 5000);
				expect(await carouselModal.getAttribute("open"), browser).to.be.null;
				expect(await carouselModal.isDisplayed(), browser).to.be.false;
			})).to.not.throw;
		});

		it("should play newest track of artists", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-play-new")), 5000);
				await driver.findElement(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-play-new")).click();

				driver.switchTo().defaultContent();
				await driver.wait(until.elementLocated(By.id("ees-player-queue-button")), 5000);
				await driver.findElement(By.id("ees-player-queue-button")).click();
				
				await driver.wait(until.elementLocated(By.css("#ees-player-queue-inner .ees-track:nth-child(2)")), 5000);
				const queueItems = await driver.findElements(By.css("#ees-player-queue-inner .ees-track"));
				expect(queueItems.length, browser).to.be.greaterThanOrEqual(2);

				const tracks = await Promise.all([
					getCurrentTrack(driver),
					...(queueItems.slice(0,2).map(getTrackInfo))
				]);

				await enterFrame(driver);
				const artists = await driver.findElements(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-item"));
				const urls = await Promise.all(artists.slice(0,3).map(a => a.findElement(By.className("ees-carousel-artist-introduction")).getAttribute("href")));

				for (let i = 0; i < 3; i++) {
					await navigate(driver, urls[i]);
					await enterFrame(driver);
	
					expect(await getTrackInfo(await driver.findElement(By.className("ees-track-large"))), browser).to.deep.equal(tracks[i]);
				}
			})).to.not.throw;
		});

		it("should play top track of artists", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-play-top")), 5000);
				await driver.findElement(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-play-top")).click();

				driver.switchTo().defaultContent();
				await driver.wait(until.elementLocated(By.id("ees-player-queue-button")), 5000);
				await driver.findElement(By.id("ees-player-queue-button")).click();

				await driver.wait(until.elementLocated(By.css("#ees-player-queue-inner .ees-track:nth-child(2)")), 5000);
				const queueItems = await driver.findElements(By.css("#ees-player-queue-inner .ees-track"));
				expect(queueItems.length, browser).to.be.greaterThanOrEqual(2);

				const tracks = await Promise.all([
					getCurrentTrack(driver),
					...(queueItems.slice(0,2).map(getTrackInfo))
				]);
				
				await enterFrame(driver);
				const artists = await driver.findElements(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-item"));
				const urls = await Promise.all(artists.slice(0,3).map(a => a.findElement(By.className("ees-carousel-artist-introduction")).getAttribute("href")));

				for (let i = 0; i < 3; i++) {
					await navigate(driver, urls[i]);
					await enterFrame(driver);

					const artistTracks = await driver.findElements(By.className("ees-track-large"));
	
					expect(await getTrackInfo((await getTopTrack(artistTracks)).track), browser).to.deep.equal(tracks[i]);
				}
			})).to.not.throw;
		});

		it("should play all tracks of artists", async function() {
			expect(await runTest(this.drivers, async(driver, browser) => {
				await navigate(driver, "https://eggs.mu/");
				await enterFrame(driver);
				await driver.wait(until.elementLocated(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-play-all")), 5000);
				await driver.findElement(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-play-all")).click();

				const artists = await driver.findElements(By.css(".ees-carousel-outer:nth-child(2) .ees-carousel-item"));
				const urls = await Promise.all(artists.slice(0,3).map(a => a.findElement(By.className("ees-carousel-artist-introduction")).getAttribute("href")));
				const lastArtistName = await artists[2].findElement(By.className("ees-carousel-artist-name")).getText();

				driver.switchTo().defaultContent();
				await driver.sleep(500);
				await driver.findElement(By.id("ees-player-queue-button")).click();

				await Promise.resolve(new Promise(resolve => setInterval(async() => {
					const curTrack = driver.findElement(By.css("#ees-player-queue-inner .ees-track:last-child"));
					const artist = await curTrack.findElement(By.className("ees-artist-name")).getText();
					if (artist === lastArtistName) {
						resolve(artist);
					}
				}, 300)));

				const queueItems = await driver.findElements(By.css("#ees-player-queue-inner .ees-track"));
				expect(queueItems.length, browser).to.be.greaterThanOrEqual(2);

				const tracks = await Promise.all([
					getCurrentTrack(driver),
					...(queueItems.map(getTrackInfo))
				]);

				let testedTracks = 0;
				for (let i = 0; i < 3; i++) {
					await navigate(driver, urls[i]);
					await enterFrame(driver);

					const artistTracks = await driver.findElements(By.className("ees-track-large"));
					
					expect(await Promise.all(artistTracks.map(getTrackInfo)), browser).to.deep.equal(tracks.slice(testedTracks, testedTracks + artistTracks.length));
					testedTracks += artistTracks.length;
				}
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