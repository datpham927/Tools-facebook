// index.js

const { Builder, By, Key, until } = require('selenium-webdriver');
const config = require('./config');
require('chromedriver'); // Đảm bảo ChromeDriver đã được cài đặt

async function loginToFacebook(driver) {
  try {
    // Mở trang Facebook
    await driver.get('https://www.facebook.com/');
    await driver.sleep(2000); // Đợi 2 giây để trang tải

    // Đăng nhập
    await driver.findElement(By.id('email')).sendKeys(config.USERNAME);
    await driver.findElement(By.id('pass')).sendKeys(config.PASSWORD, Key.RETURN);
    await driver.sleep(5000); // Đợi 5 giây để hoàn tất đăng nhập
    console.log("Đăng nhập thành công!");

  } catch (err) {
    console.error("Có lỗi khi đăng nhập:", err);
  }
}

async function createFacebookPost(driver, content, imagePaths) {
  try {
 // Nhấp vào khu vực đăng bài
const postButton = await driver.wait(
  until.elementLocated(By.css("div.x1i10hfl.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xmjcpbm.x107yiy2.xv8uw2v.x1tfwpuw.x2g32xy.x78zum5.x1q0g3np.x1iyjqo2.x1nhvcw1.x1n2onr6.xt7dq6l.x1ba4aug.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou")), // CSS selector
  10000
);


    await driver.wait(until.elementIsVisible(postButton), 10000);
    await driver.wait(until.elementIsEnabled(postButton), 10000);
    await postButton.click();
    await driver.sleep(2000); // Đợi hộp nhập xuất hiện

    // Nhập nội dung bài viết
    const postBox = await driver.wait(until.elementLocated(By.css("div[role='textbox']")), 10000);
    await postBox.click();
    await postBox.sendKeys(content);

    // Nhấp vào nút chọn hình ảnh
    const uploadButton = await driver.wait(
      until.elementLocated(By.css("div[aria-label='Ảnh/video']")), // CSS selector có thể cần thay đổi tùy vào ngôn ngữ giao diện
      10000
    );

    await driver.wait(until.elementIsVisible(uploadButton), 10000);
    await driver.wait(until.elementIsEnabled(uploadButton), 10000);
    await uploadButton.click();

    // Đợi cho input file xuất hiện
    const fileInput = await driver.wait(
      until.elementLocated(By.css("input[type='file']")),
      10000
    );

    // Tải nhiều hình ảnh lên
    await fileInput.sendKeys(imagePaths.join('\n')); // Gửi tất cả đường dẫn hình ảnh cùng một lúc
    await driver.sleep(5000); // Đợi 5 giây để đảm bảo tất cả hình ảnh được tải lên

    // Xác định nút đăng bài
    const postButtonSelector = "div[aria-label='Đăng']"; // Thay đổi selector tùy theo ngôn ngữ và cấu trúc giao diện

    console.log("Đang chờ nút đăng bài xuất hiện...");
    const postButtonElements = await driver.wait(
      until.elementsLocated(By.css(postButtonSelector)),
      10000
    );

    console.log(`${postButtonElements.length} nút đăng bài đã tìm thấy.`);

    for (let i = 0; i < postButtonElements.length; i++) {
      const postButtonElement = postButtonElements[i];
      const text = await postButtonElement.getText();
      console.log(`Nút đăng bài ${i + 1}: ${text}`);

      if (text === "Đăng") { // Kiểm tra văn bản của nút để đảm bảo đó là nút đăng bài
        await driver.wait(until.elementIsVisible(postButtonElement), 10000);
        await driver.wait(until.elementIsEnabled(postButtonElement), 10000);

        await driver.executeScript("arguments[0].scrollIntoView(true);", postButtonElement);

        console.log("Đang nhấn nút đăng bài...");
        await postButtonElement.click();

        console.log("Bài viết đang được đăng...");
        await driver.sleep(3000); // Đợi để đảm bảo bài viết được đăng
        return;
      }
    }

  } catch (err) {
    console.error("Có lỗi khi đăng bài:", err);
  }
}

async function postToFacebook() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await loginToFacebook(driver);

    const postContent = `Hi cả nhà! Hôm nay mình chia sẻ hình ảnh phòng trọ sau khi trang trí lại.
Tham khảo những món decor ở đây nhé:`;

    const imagePaths = [
      "D:\\shoppe\\8\\4.jpg",
      "D:\\shoppe\\8\\1.jpg",
      "D:\\shoppe\\8\\2.jpg",
      "D:\\shoppe\\8\\3.jpg"
    ];

    await createFacebookPost(driver, postContent, imagePaths);
  } catch (err) {
    console.error("Có lỗi xảy ra:", err);
  } finally {
    // await driver.quit(); // Bỏ comment dòng này nếu muốn đóng trình duyệt sau khi hoàn tất
  }
}

postToFacebook();
