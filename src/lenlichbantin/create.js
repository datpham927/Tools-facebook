const { Builder, By, until, Key: SeleniumKey } = require("selenium-webdriver");
const {
  keyboard,
  Key,
  mouse,
  Point,
  straightTo,
  Button,
} = require("@nut-tree-fork/nut-js");
const clipboardy = require("clipboardy");

/**
 * Lên lịch đăng tin (story) Facebook với video + link
 * @param {WebDriver} driver
 * @param {string} targetDate - Ngày đăng (dd/mm/yyyy)
 * @param {string} targetHour - Giờ đăng (HH:mm)
 * @param {string} urlFb - URL tạo story Facebook
 * @param {string} videoPath - Đường dẫn video
 * @param {string} link - Link đính kèm
 */
const createPost = async (
  driver,
  targetDate,
  targetHour,
  urlFb,
  videoPath,
  link
) => {
  // --- B1: Mở trang FB ---
  await driver.get(urlFb);
  await driver.sleep(4000);

  // --- B2: Upload video ---
  const addMediaBtn = await driver.findElement(
    By.xpath("//div[text()='Thêm ảnh/video' or text()='Thêm video']")
  );
  await addMediaBtn.click();
  await driver.sleep(2000);

  await clipboardy.write(videoPath);
  await keyboard.pressKey(Key.LeftControl, Key.V);
  await keyboard.releaseKey(Key.LeftControl, Key.V);
  await keyboard.pressKey(Key.Enter);
  await keyboard.releaseKey(Key.Enter);

  console.log(`🎬 Đang tải video: ${videoPath}`);
  await driver.sleep(7000); // chờ upload xong

  // --- B3: Thêm liên kết ---
  if (link) {
    const addLinkBtn = await driver.findElement(
      By.xpath("//div[@role='button' and contains(., 'Thêm liên kết')]")
    );
    await addLinkBtn.click();
    await driver.sleep(2000);

    const linkInput = await driver.findElement(
      By.xpath("//input[@placeholder='Nhập liên kết']")
    );
    await linkInput.sendKeys(link);

    const applyBtn = await driver.findElement(
      By.xpath("//div[@role='button' and contains(., 'Áp dụng')]")
    );
    await applyBtn.click();
  }

  // --- B4: Nhấn nút "Lên lịch" ---
  const scheduleBtn = await driver.findElement(
    By.xpath("//div[@role='button' and contains(., 'Lên lịch')]")
  );
  await scheduleBtn.click();
  await driver.sleep(2000);

  // --- B5: Nhập ngày ---
  const dateInput = await driver.findElement(
    By.xpath('//input[@placeholder="dd/mm/yyyy"]')
  );
  await dateInput.click();
  await dateInput.sendKeys(
    SeleniumKey.chord(SeleniumKey.CONTROL, "a"),
    SeleniumKey.BACK_SPACE
  );
  await driver.sleep(500);
  await dateInput.sendKeys(targetDate, SeleniumKey.ENTER);
  console.log(`📅 Đã đặt ngày: ${targetDate}`);

  // --- B6: Nhập giờ ---
  const timeInput = await driver.findElement(
    By.xpath('//input[@role="spinbutton" and @aria-label="giờ"]')
  );
  await timeInput.click();
  await driver.sleep(500);
  await timeInput.sendKeys(
    SeleniumKey.chord(SeleniumKey.CONTROL, "a"),
    SeleniumKey.BACK_SPACE
  );
  await driver.sleep(1000);
  await timeInput.sendKeys(targetHour, SeleniumKey.ENTER);
  console.log(`⏰ Đã đặt giờ: ${targetHour}`);
  await driver.sleep(1000);
  // --- B7: Xác nhận ---
  // Ví dụ: tọa độ của nút "Lên lịch" (bạn đo thử bằng log hoặc chụp màn hình)
  const submitPosition = new Point(1198, 613);

  // 1. Di chuyển chuột đến tọa độ
  await mouse.move(straightTo(submitPosition));

  // 2. Nhấp chuột trái
  await mouse.click(Button.LEFT);

  // 3. (tuỳ chọn) nghỉ 1s để chắc chắn hành động đã xảy ra
  await driver.sleep(1000);
};

module.exports = { createPost };
