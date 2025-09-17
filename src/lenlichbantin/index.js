const { Builder } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const fs = require("fs");
const { createPost } = require("./create");
const { VIDEO } = require("./data/video");

async function scheduleFacebookReel() {
  const options = new firefox.Options();
  options.setProfile(
    "C:\\Users\\lenovo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\n74kstic.default-release"
  );
  // options.addArguments('-headless');
  let driver;
  try {
    driver = await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();
    await scheduleVideos(driver, VIDEO);
  } catch (error) {
    console.error("Error during scheduling:", error);
    if (driver) {
      try {
        const pageSource = await driver.getPageSource();
        fs.writeFileSync("page_source.html", pageSource);
        console.log("Page source saved to 'page_source.html' for debugging.");
      } catch (saveError) {
        console.error("Failed to save page source:", saveError);
      }
    }
  } finally {
    if (driver) {
      try {
        await driver.quit();
        console.log("Browser session ended.");
      } catch (quitError) {
        console.error("Error closing browser:", quitError);
      }
    }
  }
}

async function scheduleVideos(driver, VIDEO) {
  const START_HOUR = 7; // Start at 7 AM
  const END_HOUR = 19; // End at 7 PM
  const HOURS_INTERVAL = 1; // every 1 hour
  const SLOTS_PER_DAY =
    Math.floor((END_HOUR - START_HOUR) / HOURS_INTERVAL) + 1;

  let startDate = new Date("2025-09-18");
  const urlFb =
    "https://business.facebook.com/latest/story_composer/?ref=biz_web_home_stories&asset_id=101578714819192&context_ref=HOME";
  const links = [
    "https://s.shopee.vn/9KYgF8x4ye",
    "https://s.shopee.vn/112jwpYTB",
    "https://s.shopee.vn/3VauuOtUiR",
    "https://s.shopee.vn/2g1nut4zfP",
    "https://s.shopee.vn/6Kv6Hdcsje",
    "https://s.shopee.vn/5pypgk4mQ7",
    "https://s.shopee.vn/VxJKxYIt7",
    "https://s.shopee.vn/20m77j5dn8",
    "https://s.shopee.vn/9AFHeuRIxA",
    "https://s.shopee.vn/5Aj8tZkBUp",
    "https://s.shopee.vn/6Abg5RWQVL",
    "https://s.shopee.vn/qa9jedKil",
    "https://s.shopee.vn/9pUySDCVJ3",
    "https://s.shopee.vn/VxJL4n4hk",
    "https://s.shopee.vn/2B5XK9Wq5n",
    "https://s.shopee.vn/50PihNvSux",
    "https://s.shopee.vn/4VTS6TjQEJ",
    "https://s.shopee.vn/9pUySJA52G",
    "https://s.shopee.vn/6prMso8rP5",
    "https://s.shopee.vn/5L2Z65wAkt",
    "https://s.shopee.vn/1g9GjMezw9",
    "https://s.shopee.vn/3qDlJRXcrE",
    "https://s.shopee.vn/5VLzIWMtE4",
    "https://s.shopee.vn/30eeJwA0Kw",
    "https://s.shopee.vn/10tZwH7eu3",
  ];
  for (let i = 0; i < VIDEO.length; i++) {
    try {
      await driver.sleep(3000);
      const videoPath = VIDEO[i];
      if (!fs.existsSync(videoPath)) {
        console.warn(`Video file not found, skipping: ${videoPath}`);
        continue;
      }
      // Tính toán ngày/giờ
      const daysOffset = Math.floor(i / SLOTS_PER_DAY);
      const slotIndex = i % SLOTS_PER_DAY;
      const targetHour = START_HOUR + slotIndex * HOURS_INTERVAL;
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + daysOffset);
      const formattedDate = targetDate
        .toLocaleDateString("en-GB")
        .split("/")
        .map((num) => num.padStart(2, "0"))
        .join("/");
      console.log(
        `Scheduling video ${i + 1}: ${formattedDate} at ${targetHour}:00`
      );
      const link = links[i % links.length];
      await createPost(
        driver,
        formattedDate,
        `${targetHour < 10 ? `0${targetHour}` : targetHour}`,
        urlFb,
        videoPath,
        link
      );
    } catch (videoError) {
      console.error(`Error scheduling video ${i + 1}:`, videoError);
      continue;
    }
  }

  console.log("All videos have been scheduled!");
}

scheduleFacebookReel();
