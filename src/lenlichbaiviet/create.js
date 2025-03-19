const { Builder, By, until, Key: SeleniumKey } = require("selenium-webdriver");
const { keyboard, Key, mouse, Point, straightTo, Button, sleep } = require("@nut-tree-fork/nut-js");
const fs = require("fs");
const clipboardy = require("clipboardy");

const navigateToComposer = async (driver) => {
  await driver.get("https://business.facebook.com/latest/composer/?asset_id=560473253819665&nav_ref=internal_nav");
};

const addCaption = async (txt) => {
  try {
    const textContent = fs.readFileSync(txt, "utf8").trim();
    clipboardy.writeSync(textContent);
    console.log("📋 Đã sao chép nội dung vào clipboard");
    const inputPosition = { x: 285, y: 537 };
    await mouse.move(straightTo(inputPosition));
    await mouse.click(Button.LEFT);
    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.releaseKey(Key.LeftControl, Key.V);
    console.log("✅ Đã dán nội dung vào ô nhập");
  } catch (error) {
    console.error("Lỗi khi thêm caption:", error);
  }
};
const uploadImages = async (driver, images) => {
  for (const image of images) {
    const addImageButton = await driver.findElement(By.xpath("//div[text()='Thêm ảnh']"));
    await addImageButton.click();
    await clipboardy.write(image);
    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.releaseKey(Key.LeftControl, Key.V);
    await keyboard.pressKey(Key.Enter);
    await keyboard.releaseKey(Key.Enter);
    console.log(`📂 Đang tải lên: ${image}`);
    await driver.sleep(500);
  } 
};

const schedulePost = async (driver, targetDate, targetHour) => {
  const scheduleButton = await driver.wait(
    until.elementLocated(By.xpath("//div[@role='button' and contains(., 'Lên lịch')]")),
    10000
  );
  await scheduleButton.click();
  await driver.sleep(2000);

  const dateInput = await driver.findElement(By.xpath('//input[@placeholder="dd/mm/yyyy"]'));
  await dateInput.click();
  await dateInput.sendKeys(SeleniumKey.chord(SeleniumKey.CONTROL, "a"), SeleniumKey.BACK_SPACE);
  await dateInput.sendKeys(targetDate, SeleniumKey.ENTER);
  console.log(`📅 Đã đặt ngày: ${targetDate}`);
  const timeInputPosition = new Point(430, 250);
  await mouse.move(straightTo(timeInputPosition));
  console.log(`Đã di chuyển chuột đến (${timeInputPosition.x}, ${timeInputPosition.y})`);
  await mouse.click(Button.LEFT);

  // Xóa nội dung cũ
  await keyboard.pressKey(Key.Delete);
  await keyboard.pressKey(Key.Backspace);
  
  // Gõ số "6"
  await keyboard.type("6");
  
  // Điều chỉnh thời gian bắt đầu từ 6
  const startValue = 6;
  for (let i = startValue; i < targetHour; i++) {
      await keyboard.pressKey(Key.Up);
      await keyboard.releaseKey(Key.Up);
  }
  await keyboard.pressKey(Key.Enter);
  await keyboard.releaseKey(Key.Enter);
  console.log(`⏰ Đã đặt giờ: ${targetHour}h`);
  const confirmPosition = new Point(611, 615);
  await mouse.move(straightTo(confirmPosition));
  await mouse.click(Button.LEFT);
  console.log("✅ Đã lên lịch bài viết thành công!");
};

const createPost = async (driver, targetDate, targetHour, images, txt) => {
    await navigateToComposer(driver)
    await addCaption(txt);
    await uploadImages(driver, images);
    await schedulePost(driver, targetDate, targetHour);
//     try { 
//         console.log("Nhấp chuột để lấy tọa độ...");
//         while (true) {
//           await new Promise((resolve) => setTimeout(resolve, 1000)); // Kiểm tra mỗi giây
//           const position = await mouse.getPosition();
//           console.log(`📍 Tọa độ hiện tại: x = ${position.x}, y = ${position.y}`);
//         }
//   } catch (error) {
//     console.error("Lỗi trong quá trình tạo bài viết:", error);
//   }
};

module.exports = {
  createPost,
};
