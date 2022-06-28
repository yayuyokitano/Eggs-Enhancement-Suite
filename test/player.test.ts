import { Key, ThenableWebDriver, until } from "selenium-webdriver";
import { elementTextContains } from "selenium-webdriver/lib/until";
import { awaitYoutubeVolumeChange, findTrackByDetails, findTrackByIndex, generateRepeatQueue, Player, Queue, Repeat } from "./player";
const { loadDrivers, runTest, enterFrame, isMobileDriver } = require("./selenium") as typeof import("./selenium");
const { By } = require("selenium-webdriver") as typeof import("selenium-webdriver");
const { expect } = require("chai") as typeof import("chai");

describe("player", function() {
  before(async function() {
    this.drivers = await loadDrivers();
  });

  let i = 0;

  do {

  it("should play song, play/pause/next/prev should work", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await enterFrame(driver);
      await driver.wait(until.elementLocated(By.className("ees-track")), 5000);
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const player = new Player(driver);
      const queue = new Queue(driver);
      await queue.setShuffle(false);
      await queue.setRepeat(Repeat.None);
      
      await player.waitForDuration("6:02");
      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      expect(await driver.findElement(By.id("ees-play")).isDisplayed(), browser).to.be.false;
      expect(await driver.findElement(By.id("ees-pause")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-next")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-prev")).isDisplayed(), browser).to.be.true;
      
      await player.pause();
      const currentTime = await player.getCurrentTime();
      await driver.sleep(2000);
      expect(await player.getCurrentTime(), browser).to.equal(currentTime);
      
      await player.play();
      await driver.sleep(2000);
      expect(await player.getCurrentTime(), browser).to.not.equal(currentTime);

      const progress = await driver.findElement(By.css("#ees-player-controls-time>progress"));
      expect(await progress.getAttribute("value"), browser).to.not.equal("0");
      expect((await progress.getAttribute("max")).slice(0,5), browser).to.equal("362.9");
      expect((await progress.getAttribute("value")).slice(0,5), browser).to.not.equal("362.9");

      await player.next();
      
      await player.waitForDuration("4:54");
      expect(await player.getTitle(), browser).to.equal("サーチロック");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/8091b959-6939-4e0b-9803-0d37c83e4913.jpeg");

      await player.prev();
      await player.waitForDuration("6:02");
      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");

      //dont go prev if we are at the start
      await player.prev();
      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect(await player.getArtist(), browser).to.equal("Lily Sketch");
      expect(await player.getThumbnail(), browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      expect(await player.getDuration(), browser).to.equal("6:02");
    })).to.not.throw;
  });

  it("should have queue that shows on click and hides on click", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      const width = (await driver.manage().window().getRect()).width;

      await driver.wait(until.elementLocated(By.id("ees-player-queue-inner")), 5000);
      const queueInner = await driver.findElement(By.id("ees-player-queue-inner"));
      expect((await queueInner.getRect()).x, browser).to.be.greaterThanOrEqual(width);

      await driver.wait(until.elementLocated(By.id("ees-player-queue-button")), 5000);
      await driver.findElement(By.id("ees-player-queue-button")).click();
      await driver.sleep(250);
      expect((await queueInner.getRect()).x, browser).to.be.lessThan(width);

      await driver.findElement(By.id("ees-player-queue-button")).click();
      await driver.sleep(250);
      expect((await queueInner.getRect()).x, browser).to.be.greaterThanOrEqual(width);
    })).to.not.throw;
  });

  it("should behave properly with no shuffle and no repeat", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      const player = new Player(driver);
      await queue.setShuffle(false);
      await queue.setRepeat(Repeat.None);
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["サーチロック", "Black Lily", "灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch", "Lily Sketch", "Lily Sketch"]);

      await player.next();
      
      expect((await queue.priorityQueue()), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["Black Lily", "灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch", "Lily Sketch"]);

      await player.prev();

      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(["サーチロック"]);
      expect((await queue.priorityQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch"]);
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["Black Lily", "灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch", "Lily Sketch"]);

      await queue.playTrackByIndex(1);

      expect(await player.getTitle(), browser).to.equal("Black Lily");
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);

      await player.prev();
      await player.prev();

      expect(await player.getTitle(), browser).to.equal("night smoke");
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(["サーチロック", "Black Lily"]);
      expect((await queue.priorityQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);

      await (await findTrackByDetails(driver, {title:"Black Lily"})).play();
      await driver.switchTo().defaultContent();

      expect(await player.getTitle(), browser).to.equal("Black Lily");
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);

      await player.prev();

      expect(await player.getTitle(), browser).to.equal("Black Lily");
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(["灰青", "青十六歳"]);
      expect((await queue.mainQueue()).map(t => t.artistData.displayName), browser).to.deep.equal(["Lily Sketch", "Lily Sketch"]);
    })).to.not.throw;
  });

  it("should behave properly with shuffle and no repeat", async function() {
    this.retries(10); //additional retries to handle randomness.
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      const player = new Player(driver);
      await queue.setShuffle(true);
      await queue.setRepeat(Repeat.None);
      expect(await queue.priorityQueue(), browser).to.be.empty;

      const tracks = (await queue.mainQueue()).map(t => t.musicTitle);
      //~1 in 8 million chance to fail 5 times in a row if functioning properly.
      expect(tracks, browser).to.not.deep.equal(["サーチロック", "Black Lily", "灰青", "青十六歳"]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(1));
      expect(await player.getTitle(), browser).to.equal(tracks[0]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(2));
      expect(await player.getTitle(), browser).to.equal(tracks[1]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(3));
      expect(await player.getTitle(), browser).to.equal(tracks[2]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[3]);

      await player.next();
      expect(await queue.priorityQueue(), browser).to.be.empty;
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[3]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(3));
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[2]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(2));
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[1]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks.slice(1));
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal(tracks[0]);

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks);
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal("night smoke");

      await player.prev();
      expect((await queue.priorityQueue()).map(t => t.musicTitle), browser).to.deep.equal(tracks);
      expect(await queue.mainQueue(), browser).to.be.empty;
      expect(await player.getTitle(), browser).to.equal("night smoke");
    })).to.not.throw;
  });

  it("should behave properly with repeat and no shuffle", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      const player = new Player(driver);
      await queue.setShuffle(false);
      await queue.setRepeat(Repeat.All);
      expect(await queue.priorityQueue(), browser).to.be.empty;

      const tracks = ["night smoke", "サーチロック", "Black Lily", "灰青", "青十六歳"];
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 0, Repeat.All));
      player.next();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 1, Repeat.All));
      player.next();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 2, Repeat.All));
      player.next();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 3, Repeat.All));
      player.next();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 4, Repeat.All));
      player.next();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 0, Repeat.All));

      await (await findTrackByIndex(driver, 4)).play();
      await driver.switchTo().defaultContent();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 4, Repeat.All));
    })).to.not.throw;
  });

  it("should behave properly with repeat and shuffle", async function() {
    this.retries(10);
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      await queue.setShuffle(true);
      await queue.setRepeat(Repeat.All);
      expect(await queue.priorityQueue(), browser).to.be.empty;

      const tracks = ["night smoke", "サーチロック", "Black Lily", "灰青", "青十六歳"];
      const curQueue = (await queue.mainQueue()).map(t => t.musicTitle);
      expect(curQueue, browser).to.not.deep.equal(generateRepeatQueue(tracks, 0, Repeat.All));
      expect(curQueue.length, browser).to.be.greaterThanOrEqual(50);
      expect(curQueue.slice(0, 4).sort(), browser).to.deep.equal(tracks.slice(1).sort());
      expect(curQueue.slice(4, 9).sort(), browser).to.deep.equal(tracks.sort());
      expect(curQueue.slice(9, 14).sort(), browser).to.deep.equal(tracks.sort());
      expect(curQueue.slice(14, 19).sort(), browser).to.deep.equal(tracks.sort());
    })).to.not.throw;
  });

  it("should behave properly with repeat one", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const queue = new Queue(driver);
      await queue.setShuffle(true);
      await queue.setRepeat(Repeat.One);
      expect(await queue.priorityQueue(), browser).to.be.empty;

      const tracks = ["night smoke", "サーチロック", "Black Lily", "灰青", "青十六歳"];
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 0, Repeat.One));
      await (await findTrackByIndex(driver, 1)).play();
      await driver.switchTo().defaultContent();
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 1, Repeat.One));
      await queue.setShuffle(false);
      expect((await queue.mainQueue()).map(t => t.musicTitle), browser).to.deep.equal(generateRepeatQueue(tracks, 1, Repeat.One));
    })).to.not.throw;
  });

  it("should have a toggleable track info page", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      
      expect(async() => { await driver.findElement(By.id("ees-player-details")).click(); }, browser).to.throw;

      await driver.findElement(By.id("ees-track-expander")).click();
      await driver.sleep(250);

      expect(async() => { await driver.findElement(By.id("ees-player-details")).click(); }, browser).to.not.throw;

      const title = await driver.findElement(By.id("ees-player-details-title"));
      expect(await title.isDisplayed(), browser).to.be.true;
      expect(await title.getText(), browser).to.equal("night smoke");

      const artist = await driver.findElement(By.id("ees-player-details-artist"));
      expect(await artist.isDisplayed(), browser).to.be.true;
      expect(await artist.getText(), browser).to.equal("Lily Sketch");

      const lyricHeader = await driver.findElement(By.id("ees-player-details-lyrics"));
      expect(await lyricHeader.isDisplayed(), browser).to.be.true;
      expect(await lyricHeader.getText(), browser).to.equal("Lyrics");

      const lyricCredits = await driver.findElement(By.css("#ees-player-details-lyrics-wrapper>p"));
      expect(await lyricCredits.isDisplayed(), browser).to.be.true;
      expect((await lyricCredits.getText()).replaceAll("\n", ""), browser).to.equal("Composer: 上田優衣Lyricist: 上田優衣、加藤岡あや");

      const lyric = await driver.findElement(By.id("ees-player-details-lyrics-text"));
      expect(await lyric.isDisplayed(), browser).to.be.true;
      //sorry if you have some text wrapping stuff going on
      //the replacealls are needed because there are some inconsistencies between browsers on how whitespace is handled in getText()
      expect((await lyric.getText()).replaceAll("\r\n", "").replaceAll("\n", ""), browser).to.equal("夜の街を泳ぐ魚の群れ鮮やかな街頭の下目を閉じて私を閉じ込めた暗闇孤独を感じた冷気が肌に触れた夜夜に置き去りにされた私は何ができるのか行かないで行かないで行かないでと縋って嫌だ嫌だ嫌だ嫌だ嫌だと願ってもまた　独りになる私は私を誰かに殺してほしくて私は私に生まれたくはなかったもういっそいっそのこと夜の闇に紛れて消えたらいいのに燻らせた煙草　溶けて混じった空気声高に叫ぶ心を濁らせて消えはしない様にずっとずっと愛してる苦しささえも夜の闇に沈めるように骨が軋む度心が締め付けられるから血肉は痛まないはずなのにどうして絶とうとした命は痛みを訴えるの夜に置き去りにされた闇が私を駆り立てた苦しくて苦しくて苦しいから憎んで痛い痛い痛い痛い痛いよと叫んでもまた　惨めになる全てを歌ったつもりでいた認めてもらえるはずもないのに夜に置き去りにされた切り取ったはずの景色も見えないよ見えないよ見たくないよこんな世界暗い暗い暗い暗い暗い中静かに　また夜に置き去りにされた私は何ができるのか行かないで行かないで行かないでと縋って嫌だ嫌だ嫌だ嫌だ嫌だと願ってもまた　独りになる夜の闇が後を引く終ぞ陽は差し込まない");

      await driver.findElement(By.id("ees-track-expander")).click();
      await driver.sleep(250);

      expect(async() => { await driver.findElement(By.id("ees-player-details")).click(); }, browser).to.throw;
    })).to.not.throw;
  });

  it("details image should work properly", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      
      expect(async() => { await driver.findElement(By.id("ees-player-details")).click(); }, browser).to.throw;

      await driver.findElement(By.id("ees-track-expander")).click();
      await driver.sleep(250);

      expect(await driver.findElement(By.id("ees-player-details")).isDisplayed(), browser).to.be.true;
      expect(await driver.findElement(By.id("ees-cover-expanded")).isDisplayed(), browser).to.be.false;

      const image = await driver.findElement(By.css("#ees-player-details-cover>img"));
      expect(await image.isDisplayed(), browser).to.be.true;
      expect((await image.getAttribute("src")).split("?")[0]).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");
      
      await driver.findElement(By.id("ees-player-details-cover")).click();

      expect(await driver.findElement(By.id("ees-cover-expanded")).isDisplayed(), browser).to.be.true;
      expect((await driver.findElement(By.css("#ees-cover-expanded>img")).getAttribute("src")).split("?")[0], browser).to.equal("https://recoeggs.hs.llnwd.net/flmg_img_p/jacket/e9eb3673-3553-462e-8b63-7abb1478d98a.jpeg");

      await driver.findElement(By.id("ees-cover-expanded-buttons-close")).click();

      expect(await driver.findElement(By.id("ees-cover-expanded")).isDisplayed(), browser).to.be.false;
    })).to.not.throw;
  });

  /*

  TODO: finish volume tests.
  These are unlikely to break and if they break its probably noticeable.
  There are multiple issues making this hard to test.
  Youtube testing is cursed.
  Safari does not support using the volume slider with keyboard.
  idk what to do.

  it("should adjust volume of audio tracks", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/IG_LiLySketch/");
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      const player = new Player(driver);
      await driver.findElement(By.id("ees-volume")).click();
      await driver.wait(until.elementIsVisible(driver.findElement(By.id("ees-volume-slider"))), 5000);
      
      let volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      for (let i = 0; i < 100; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("1");

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      for (let i = 0; i < 50; i++) {
        await volumeSlider.sendKeys(Key.ARROW_DOWN);
      }
      await driver.sleep(50);
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("0.5");

      await player.next();
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("0.5");

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      for (let i = 0; i < 10; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      await driver.sleep(50);
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("0.6");

      await driver.navigate().refresh();
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      await driver.findElement(By.id("ees-volume")).click();
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("0.6");


      await (await findTrackByIndex(driver, 2)).play();
      await driver.switchTo().defaultContent();
      await driver.findElement(By.id("ees-volume")).click();
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("0.6");

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      for (let i = 0; i < 40; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      await driver.sleep(50);
      expect(await driver.findElement(By.css("audio")).getAttribute("volume"), browser).to.equal("1");
    })).to.not.throw;
  });

  it("should adjust volume of youtube tracks", async function() {
    expect(await runTest(this.drivers, async(driver, browser) => {
      await driver.get("https://eggs.mu/artist/Osage_band/");
      await (await findTrackByDetails(driver, {title: "エンドロール MV"})).play();
      await driver.switchTo().defaultContent();
      const player = new Player(driver);
      const queue = new Queue(driver);
      queue.setShuffle(false);
      queue.setRepeat(Repeat.None);
      await driver.findElement(By.id("ees-volume")).click();
      await driver.wait(until.elementIsVisible(driver.findElement(By.id("ees-volume-slider"))), 5000);
      
      let volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      let volume = awaitYoutubeVolumeChange(driver, 100);
      for (let i = 0; i < 100; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      expect(await volume, browser).to.equal(100);

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      volume = awaitYoutubeVolumeChange(driver, 50);
      for (let i = 0; i < 50; i++) {
        await volumeSlider.sendKeys(Key.ARROW_DOWN);
      }
      expect(await volume, browser).to.equal(50);

      await player.next();

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      volume = awaitYoutubeVolumeChange(driver, 60);
      for (let i = 0; i < 10; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      expect(await volume, browser).to.equal(60);

      await driver.navigate().refresh();
      await (await findTrackByIndex(driver, 0)).play();
      await driver.switchTo().defaultContent();
      await driver.findElement(By.id("ees-volume")).click();
      
      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      volume = awaitYoutubeVolumeChange(driver, 50);
      for (let i = 0; i < 10; i++) {
        await volumeSlider.sendKeys(Key.ARROW_DOWN);
      }
      expect(await volume, browser).to.equal(50);


      await (await findTrackByIndex(driver, 2)).play();
      await driver.switchTo().defaultContent();
      await driver.findElement(By.id("ees-volume")).click();

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      volume = awaitYoutubeVolumeChange(driver, 60);
      for (let i = 0; i < 10; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      expect(await volume, browser).to.equal(60);

      volumeSlider = await driver.findElement(By.id("ees-volume-slider"));
      volume = awaitYoutubeVolumeChange(driver, 100);
      for (let i = 0; i < 40; i++) {
        await volumeSlider.sendKeys(Key.ARROW_UP);
      }
      expect(await volume, browser).to.equal(100);
    })).to.not.throw;
  });

  */

  it("should set viewport size", async function() {
    expect(await runTest(this.drivers, async (driver, browser) => {
      await driver.manage().window().setRect({ width: 390, height: 844 });
      expect(await isMobileDriver(driver), browser).to.be.true;
    })).to.not.throw;
  });

  } while (i++ < 1);

  after(async function() {
    let closeFuncs:Promise<void>[] = [];
    this.drivers.forEach((driver:ThenableWebDriver) => closeFuncs.push(driver.close()));
    await Promise.all(closeFuncs);
  });
});
export {};