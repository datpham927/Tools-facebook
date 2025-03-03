const { Builder, By, until, Key: SeleniumKey } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { keyboard, Key, mouse, Point, straightTo, Button } = require('@nut-tree-fork/nut-js');
const fs = require('fs');
const clipboardy = require('clipboardy');
const { createPost } = require('./create');
const { CAPTION } = require('./video');

async function scheduleFacebookReel(targetDate) {
    const options = new firefox.Options();
    options.setProfile('C:\\Users\\lenovo\\AppData\\Roaming\\Mozilla\\Firefox');
    let driver;
    try {
        driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .build();
        const videoPath = "D:\\Page\\b\\Cuộc Sống Của Anh Chồng Sợ Vợ Sẽ Như Thế Nào! #mukbang #food #anuong #anvat #shorts.mp4";
        if (!fs.existsSync(videoPath)) throw new Error(`Video file not found at: ${videoPath}`);
        const caption = CAPTION[0];
        const targetDate = "04/03/2025"
        const targetHour = 11
        await createPost(driver, targetDate, targetHour, videoPath, caption)

    } catch (error) {
        console.error("Error during scheduling:", error);
        if (error.name === 'TimeoutError') {
            const pageSource = await driver.getPageSource();
            fs.writeFileSync('page_source.html', pageSource);
            console.log("Page source saved to 'page_source.html' for debugging.");
        }
    }
    // finally {
    //     if (driver) {
    //         await driver.quit(); // Uncomment to close browser
    //         console.log("Browser session ended.");
    //     }
    // }
}

scheduleFacebookReel();