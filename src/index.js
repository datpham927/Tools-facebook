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

    await driver.get('https://www.facebook.com/groups/1858124761335989');
    await driver.sleep(5000);

  } catch (err) {
    console.error("Có lỗi khi đăng nhập:", err);
  }
}

async function createFacebookPost(driver, content, imagePaths) {
  try {
    // Nhấp vào khu vực đăng bài
    const postButton = await driver.wait(
      until.elementLocated(By.css("div.x1i10hfl.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xmjcpbm.x107yiy2.xv8uw2v.x1tfwpuw.x2g32xy.x78zum5.x1q0g3np.x1iyjqo2.x1nhvcw1.x1n2onr6.xt7dq6l.x1ba4aug.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou")),
      10000
    );

    // Kiểm tra xem phần tử có thể nhấp vào không
    await driver.wait(until.elementIsVisible(postButton), 10000);
    await driver.wait(until.elementIsEnabled(postButton), 10000);
    await postButton.click();

    await driver.sleep(2000); // Đợi hộp nhập xuất hiện

    // Nhập nội dung bài viết
    const postBox = await driver.wait(
      until.elementLocated(By.css("div[role='textbox']")),
      10000
    );
    await postBox.sendKeys(content);

    // Nhấp vào nút chọn hình ảnh
    const uploadButton = await driver.wait(
      until.elementLocated(By.css("div[aria-label='Ảnh/video']")),
      10000
    );

    await driver.wait(until.elementIsVisible(uploadButton), 10000);
    await driver.wait(until.elementIsEnabled(uploadButton), 10000);
    
    // Đợi cho input file xuất hiện
    const fileInput = await driver.wait(
      until.elementLocated(By.css("input[type='file']")),
      10000
    );

    // Tạo đường dẫn hình ảnh
    const imagePaths = [
      "D:\\shoppe\\8\\1.jpg", // Đường dẫn đến hình ảnh đầu tiên
      "D:\\shoppe\\8\\2.jpg", // Đường dẫn đến hình ảnh thứ hai
      // Thêm các đường dẫn hình ảnh khác tại đây
    ];

    // Tải nhiều hình ảnh lên
    await fileInput.sendKeys(imagePaths.join('\n')); // Gửi tất cả đường dẫn hình ảnh cùng một lúc
    await driver.sleep(5000);

    const postButtonSelector = "div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3";

    console.log("Đang chờ nút đăng bài xuất hiện...");

    // Chờ để các phần tử được tìm thấy
    const postButtonElements = await driver.wait(
      until.elementsLocated(By.css(postButtonSelector)),
      10000
    );

    console.log(`${postButtonElements.length} nút đăng bài đã tìm thấy.`);

    // In ra tất cả các phần tử tìm thấy
    for (let i = 0; i < postButtonElements.length; i++) {
      const postButtonElement = postButtonElements[i];

      // In ra thông tin về phần tử (ví dụ: thuộc tính innerText)
      const text = await postButtonElement.getText(); // Lấy nội dung văn bản của nút
      console.log(`Nút đăng bài ${i + 1}: ${text}`);

      // Kiểm tra xem phần tử có hiển thị và được kích hoạt hay không
      await driver.wait(until.elementIsVisible(postButtonElement), 10000);
      await driver.wait(until.elementIsEnabled(postButtonElement), 10000);

      // Cuộn đến nút trước khi nhấn (để tránh vấn đề chồng chéo)
      await driver.executeScript("arguments[0].scrollIntoView(true);", postButtonElement);
      
      console.log("Đang nhấn nút đăng bài...");
      
      // Nhấn nút đăng bài trực tiếp
      await postButtonElement.click(); // Chỉ click nếu đã kiểm tra được nút

      console.log("Bài viết đang được đăng...");
      await driver.sleep(3000); // Đợi một chút để đảm bảo bài viết được đăng
    }

  } catch (err) {
    console.error("Có lỗi khi đăng bài:", err);
  }
}

async function postToFacebook() {
  // Khởi tạo WebDriver và mở Chrome
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await loginToFacebook(driver);

    // Nội dung bài viết
    const postContent = "Nội dung bài viết tự động từ Selenium WebDriver với Node.js!";
    
    // Tạo bài viết trên Facebook
    await createFacebookPost(driver, postContent);
  } catch (err) {
    console.error("Có lỗi xảy ra:", err);
  } finally {
    // Đóng trình duyệt
    await driver.quit();
  }
}

postToFacebook();
