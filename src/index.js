const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
 const {createFacebookPost}=require("./createFacebookPost")
 const readGroupUrls = require('./docfile');
 const contents = require('./content');
 

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
     
    const groupUrls = await readGroupUrls();
    let number =6;

    for (const groupUrl of groupUrls) {
      number-=1;
      console.log("==== ",groupUrl,"====")
      const postContent = contents[number].text;
      const imagePaths = contents[number].images;
      if(number===0){
        number=6
      }
      await driver.get(groupUrl);
      await createFacebookPost(driver, postContent, imagePaths);
    }
    
  } catch (err) {
    console.error("Có lỗi xảy ra:", err);
  } finally {
    // await driver.quit();
  }
}

postToFacebook();