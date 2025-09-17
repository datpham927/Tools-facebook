const { By, until, Key: SeleniumKey } = require("selenium-webdriver");
const {
  keyboard,
  Key,
  mouse,
  Point,
  straightTo,
  Button,
} = require("@nut-tree-fork/nut-js");
const fs = require("fs");
const clipboardy = require("clipboardy");

const createPost = async (driver, targetDate, targetHour, videoPath, title) => {
  try {
    await driver.get(
      "https://business.facebook.com/latest/reels_composer/?ref=biz_web_home_create_reel&asset_id=344114672109406&context_ref=HOME"
    );
    await driver.sleep(2000);
    // Step 1: Upload Video
    const addVideoButton = await driver.findElement(
      By.xpath("//div[text()='Thêm video']")
    );
    await addVideoButton.click();
    await driver.sleep(1000);
    await clipboardy.write(videoPath);
    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.pressKey(Key.Enter);
    await keyboard.releaseKey(Key.Enter);
    console.log("Video path pasted, uploading...");
    // Step 2: Add Caption
    // Lấy tên file không có đuôi mở rộng0
    try {
      console.log("Caption added:", title);
      const captionInput = await driver.findElement(
        By.xpath('//div[@role="textbox" and @contenteditable="true"]'),
        1000
      );
      await captionInput.sendKeys(title);
    } catch (error) {
      console.log("Caption added:", error);
    }
    await driver.sleep(1000);
    // Step 3: Click Share
    const shareButton = await driver.wait(
      until.elementLocated(
        By.xpath('//div[@role="button" and contains(., "Chia sẻ")]')
      ),
      10000
    );
    await driver.wait(until.elementIsEnabled(shareButton), 1000);
    await shareButton.click();
    console.log("Clicked 'Chia sẻ', proceeding to schedule...");
    await driver.sleep(1000);

    // Step 4: Click Schedule
    // Step 4: Đợi và nhấp vào nút "Lên lịch"
    let scheduleButton;
    let retry = true;
    let maxRetries = 3; // Số lần thử lại tối đa

    while (retry && maxRetries > 0) {
      try {
        // Đợi nút "Lên lịch" xuất hiện
        scheduleButton = await driver.wait(
          until.elementLocated(
            By.xpath("//div[@role='button' and contains(., 'Lên lịch')]")
          ),
          10000 // Timeout 10 giây để tìm nút
        );
        // Đợi nút "Lên lịch" hiển thị
        await driver.wait(until.elementIsVisible(scheduleButton), 5000);
        retry = false; // Thoát vòng lặp nếu thành công
      } catch (error) {
        console.log("Nút 'Lên lịch' không hiển thị, thử nhấp lại 'Chia sẻ'...");
        maxRetries--;
        if (maxRetries > 0) {
          // Nhấp lại nút "Chia sẻ" nếu còn lượt thử
          await driver.wait(until.elementIsEnabled(shareButton), 5000);
          await shareButton.click();
          console.log(
            "Đã nhấp lại 'Chia sẻ', thử tìm nút 'Lên lịch' lần nữa..."
          );
        } else {
          throw new Error("Không thể tìm thấy nút 'Lên lịch' sau khi thử lại.");
        }
      }
    }

    // Nhấp vào nút "Lên lịch" khi đã hiển thị
    await scheduleButton.click();
    console.log("Clicked 'Lên lịch', setting date and time...");
    await driver.sleep(1000);
    await keyboard.pressKey(Key.Home);
    await keyboard.releaseKey(Key.Home);
    await driver.sleep(1000);
    // Step 5: Set Date
    const dateInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@placeholder="dd/mm/yyyy"]')),
      10000
    );
    await driver.wait(until.elementIsVisible(dateInput), 1000);
    await dateInput.click();

    // Kiểm tra giá trị hiện tại trong ô input
    let dateValue = await dateInput.getAttribute("value");
    console.log(`Initial date value: ${dateValue}`);

    // **Cách 1: Dùng CTRL + A + BACKSPACE để xóa nhanh**
    if (dateValue) {
      console.log("Clearing with CTRL + A + BACKSPACE...");
      await dateInput.sendKeys(
        SeleniumKey.chord(SeleniumKey.CONTROL, "a"),
        SeleniumKey.BACK_SPACE
      );
      await driver.sleep(300);
      dateValue = await dateInput.getAttribute("value");
      console.log(`After clearing: ${dateValue || "empty"}`);
    }

    // **Cách 2: Nếu vẫn chưa xóa được, dùng JavaScript**
    if (dateValue) {
      console.log("CTRL + A clearing failed, using JavaScript...");
      await driver.executeScript("arguments[0].value = '';", dateInput);
      await driver.sleep(300);
      dateValue = await dateInput.getAttribute("value");
      console.log(`After JavaScript clearing: ${dateValue || "empty"}`);
    }

    // **Cách 3: Nếu vẫn còn giá trị, thử chọn một ngày khác rồi xóa lại**
    if (dateValue) {
      console.log("JavaScript clearing failed, resetting via date picker...");
      await dateInput.click();
      await driver.sleep(500);

      // Chọn ngày 1 trong DatePicker để reset
      const firstDay = await driver.wait(
        until.elementLocated(By.xpath('//div[@role="button" and text()="1"]')),
        5000
      );
      await firstDay.click();
      await driver.sleep(500);

      // Kiểm tra lại giá trị và xóa bằng CTRL + A + BACKSPACE
      dateValue = await dateInput.getAttribute("value");
      console.log(`After selecting first day: ${dateValue}`);
      await dateInput.sendKeys(
        SeleniumKey.chord(SeleniumKey.CONTROL, "a"),
        SeleniumKey.BACK_SPACE
      );
      await driver.sleep(300);
    }

    // **Nhập giá trị mới vào ô input**
    await dateInput.sendKeys(targetDate);
    await dateInput.sendKeys(SeleniumKey.ENTER);
    await driver.sleep(500);
    dateValue = await dateInput.getAttribute("value");
    console.log(`Date after direct input: ${dateValue}`);

    // 1. Đợi input xuất hiện
    const timeInput = await driver.wait(
      until.elementLocated(
        By.xpath('//input[@role="spinbutton" and @aria-label="giờ"]')
      ),
      10000
    );

    // 2. Click để focus
    await timeInput.click();
    await driver.sleep(500);

    // 3. Xóa nội dung cũ
    await driver
      .actions()
      .sendKeys(SeleniumKey.CONTROL, "a", SeleniumKey.BACK_SPACE)
      .perform();
    await driver.sleep(500);

    // 4. Gõ giá trị mới
    await driver.actions().sendKeys(`${targetHour}`).perform();
    await driver.sleep(500);

    // 5. Nhấn Enter để xác nhận
    await driver.actions().sendKeys(SeleniumKey.ENTER).perform();
    await driver.sleep(500);

    // Step 7: Confirm Scheduling
    const submitPosition = new Point(1198, 613); // Tọa độ ô nhập
    await mouse.move(straightTo(submitPosition));
    // 2. Nhấp chuột trái để kích hoạt ô nhập
    await mouse.click(Button.LEFT);
    await driver.sleep(1000);
    console.error(`Lên lịch thành công ${targetDate} - ${targetHour}h`, error);
  } catch (error) {}
};

module.exports = {
  createPost,
};
