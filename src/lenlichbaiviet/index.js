const { Builder, By, until, Key: SeleniumKey } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const fs = require("fs");
const { createPost } = require("./create");
const { CAPTION, VIDEO, content } = require("./video");

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

    await scheduleVideos(driver, VIDEO, CAPTION);
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
        // await driver.quit();
        console.log("Browser session ended.");
      } catch (quitError) {
        console.error("Error closing browser:", quitError);
      }
    }
  }
}
async function scheduleVideos(driver, VIDEO, CAPTION) {
  //   const POST_SCHEDULE = {
  //     weekdays: [7, 12, 18, 21], // Khung giờ vàng trong ngày thường (Thứ 2 - Thứ 6)
  //     weekend: [9, 14, 19], // Khung giờ vàng cuối tuần (Thứ 7, Chủ nhật)
  //   };
  const POST_SCHEDULE = {
    weekdays: [12, 18], // Khung giờ vàng trong ngày thường (Thứ 2 - Thứ 6)
    weekend: [12, 18], // Khung giờ vàng cuối tuần (Thứ 7, Chủ nhật)
  };
  let startDate = new Date("2025-11-18"); // Ngày bắt đầu đăng bài

  for (let i = 0; i < content.length; i++) {
    try {
      await driver.sleep(1000);

      const currentDay = startDate.getDay(); // 0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy
      const scheduleHours =
        currentDay === 0 || currentDay === 6
          ? POST_SCHEDULE.weekend
          : POST_SCHEDULE.weekdays;
      const slotIndex = i % scheduleHours.length; // Lặp lại các khung giờ nếu hết bài
      const targetHour = scheduleHours[slotIndex];

      // Tính toán ngày đăng
      const daysOffset = Math.floor(i / scheduleHours.length);
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + daysOffset);

      const formattedDate = targetDate
        .toLocaleDateString("en-GB")
        .split("/")
        .map((num) => num.padStart(2, "0"))
        .join("/");

      const txt = content[i].txt;
      const images = content[i].images;

      console.log(
        `📅==== Đang lên lịch bài viết ${
          i + 1
        }: ${formattedDate} lúc ${targetHour}:00`
      );

      await createPost(driver, formattedDate, targetHour, images, txt);
    } catch (error) {
      console.error(`🚨 Lỗi khi lên lịch bài viết ${i + 1}:`, error);
      continue; // Tiếp tục bài tiếp theo nếu có lỗi
    }
  }

  console.log("✅ Tất cả bài viết đã được lên lịch thành công!");
}

scheduleFacebookReel();
