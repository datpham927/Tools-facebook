const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
 const {createFacebookPost}=require("./createFacebookPost")
 

async function postToFacebook() {
  const options = new firefox.Options();
  options.set('moz:firefoxOptions', {
    args: ['-profile', 'C:\\Users\\lenovo\\AppData\\Roaming\\Mozilla\\Firefox']
  });

  let driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();
  
  try {
    // await loginToFacebook(driver);
    const postContent = `Hi cả nhà! Hôm nay mình chia sẻ hình ảnh phòng trọ sau khi trang trí lại.`;
    const imagePaths = ["D:\\shoppe\\8\\4.jpg", "D:\\shoppe\\8\\1.jpg"];

    const groupUrls=["https://www.facebook.com/groups/4844951782221599"]
    for (const groupUrl of groupUrls) {
      await driver.get(groupUrl);
      await createFacebookPost(driver, postContent, imagePaths);
    }
  } catch (err) {
    console.error("Có lỗi xảy ra:", err);
  } finally {
    await driver.quit();
  }
}

postToFacebook();