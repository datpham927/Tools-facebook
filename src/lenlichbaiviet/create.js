const { Builder, By, until, Key: SeleniumKey } = require("selenium-webdriver");
const {
  keyboard,
  Key,
  mouse,
  Point,
  straightTo,
  Button,
  sleep,
} = require("@nut-tree-fork/nut-js");
const fs = require("fs");
const clipboardy = require("clipboardy");

/**
 * 🧭 Điều hướng đến Facebook Composer
 */
const navigateToComposer = async (driver) => {
  console.log("🌐 Đang mở Facebook Composer...");
  await driver.get(
    "https://business.facebook.com/latest/composer/?asset_id=101578714819192&nav_ref=internal_nav&ref=biz_web_home_create_post&context_ref=HOME"
  );
  await driver.sleep(5000);
  console.log("✅ Đã vào trang tạo bài viết.");
};

/**
 * 📝 Thêm caption từ file TXT
 */
const addCaption = async (txtPath) => {
  try {
    const textContent = fs.readFileSync(txtPath, "utf8").trim();
    clipboardy.writeSync(textContent);
    console.log("📋 Đã sao chép nội dung vào clipboard.");

    const inputPosition = { x: 285, y: 537 };
    await mouse.move(straightTo(inputPosition));
    await mouse.click(Button.LEFT);
    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.releaseKey(Key.LeftControl, Key.V);
    console.log("✅ Đã dán caption vào ô nhập nội dung.");
  } catch (error) {
    console.error("❌ Lỗi khi thêm caption:", error);
  }
};

/**
 * 🖼️ Tải lên ảnh
 */
const uploadImages = async (driver, images) => {
  for (const image of images) {
    try {
      console.log(`📂 Đang tải lên hình: ${image}`);

      // Tìm nút "Thêm ảnh" hoặc "Add photo"
      const addImageButton = await driver.wait(
        until.elementLocated(
          By.xpath(
            "//div[contains(text(), 'Thêm ảnh') or contains(text(), 'Ảnh') or contains(text(), 'photo') or contains(text(), 'Photo')]"
          )
        ),
        20000
      );

      await addImageButton.click();
      await driver.sleep(1000);

      // Paste đường dẫn ảnh vào hộp thoại
      await clipboardy.write(image);
      await keyboard.pressKey(Key.LeftControl, Key.V);
      await keyboard.releaseKey(Key.LeftControl, Key.V);
      await keyboard.pressKey(Key.Enter);
      await keyboard.releaseKey(Key.Enter);

      console.log(`✅ Đã gửi ảnh: ${image}`);
      await driver.sleep(2000);
    } catch (error) {
      console.error(`❌ Lỗi khi tải ảnh ${image}:`, error.message);
    }
  }
};

/**
 * ⏰ Lên lịch đăng bài
 */
const schedulePost = async (driver, targetDate, targetHour) => {
  try {
    console.log("🕓 Đang bật tùy chọn Lên lịch...");

    const scheduleButton = await driver.wait(
      until.elementLocated(
        By.xpath("//div[@role='button' and contains(., 'Lên lịch')]")
      ),
      15000
    );
    await scheduleButton.click();
    await driver.sleep(3000);

    // Chọn ngày
    const dateInput = await driver.findElement(
      By.xpath(
        '//input[@placeholder="dd/mm/yyyy" or @placeholder="DD/MM/YYYY"]'
      )
    );
    await dateInput.click();
    await dateInput.sendKeys(
      SeleniumKey.chord(SeleniumKey.CONTROL, "a"),
      SeleniumKey.BACK_SPACE
    );
    await dateInput.sendKeys(targetDate, SeleniumKey.ENTER);
    console.log(`📅 Đã chọn ngày: ${targetDate}`);

    // Chọn giờ (thủ công qua tọa độ)
    const timeInputPosition = new Point(430, 250);
    await mouse.move(straightTo(timeInputPosition));
    await mouse.click(Button.LEFT);

    // Xóa giờ cũ
    await keyboard.pressKey(Key.Delete);
    await keyboard.releaseKey(Key.Delete);
    await keyboard.pressKey(Key.Backspace);
    await keyboard.releaseKey(Key.Backspace);

    // Gõ giờ mới
    await keyboard.type(targetHour.toString());
    await keyboard.pressKey(Key.Enter);
    await keyboard.releaseKey(Key.Enter);

    console.log(`⏰ Đã đặt giờ: ${targetHour}h`);

    // Xác nhận
    const confirmPosition = new Point(611, 615);
    await mouse.move(straightTo(confirmPosition));
    await mouse.click(Button.LEFT);
    console.log("✅ Đã lên lịch bài viết thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi lên lịch bài viết:", error.message);
  }
};

/**
 * 🚀 Tạo và lên lịch bài viết
 */
const createPost = async (driver, targetDate, targetHour, images, txtPath) => {
  try {
    console.log("🚀 Bắt đầu quy trình tạo bài viết...");
    await navigateToComposer(driver);
    await addCaption(txtPath);
    await uploadImages(driver, images);
    await schedulePost(driver, targetDate, targetHour);
    console.log("🎉 Hoàn tất quy trình đăng bài!");
  } catch (error) {
    console.error("💥 Lỗi trong quá trình tạo bài viết:", error.message);
  }
};

module.exports = {
  createPost,
};
