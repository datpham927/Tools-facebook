const { Builder, By, until, Key: SeleniumKey } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { keyboard, Key, mouse, Point, straightTo, Button } = require('@nut-tree-fork/nut-js');
const fs = require('fs');
const clipboardy = require('clipboardy');
const { createPost } = require('./create');
const { CAPTION, VIDEO } = require('./video');

async function scheduleFacebookReel() {
    const options = new firefox.Options();
    options.setProfile('C:\\Users\\lenovo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\znsysbsu.default-release-1740999483576');

    let driver;
    try {
        driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .build();
        scheduleVideos(driver, VIDEO, CAPTION)
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


async function scheduleVideos(driver, VIDEO, CAPTION) {
    // Giờ bắt đầu (6h sáng) và giờ kết thúc (19h tối)
    const START_HOUR = 6;
    const END_HOUR = 19;
    const HOURS_PER_DAY = END_HOUR - START_HOUR + 1; // 13 giờ mỗi ngày

    // Ngày bắt đầu (ví dụ: 04/03/2025)
    let startDate = new Date("2025-03-13"); // Date object để dễ tăng ngày

    for (let i = 0; i < VIDEO.length; i++) {
        await driver.sleep(1000);
        const videoPath = VIDEO[i];
        if (!fs.existsSync(videoPath)) {
            throw new Error(`Video file not found at: ${videoPath}`);
        }
        // Chọn caption (lặp lại nếu hết caption)
        const caption = CAPTION[i % CAPTION.length];
        // Tính ngày và giờ dựa trên chỉ số video
        const daysOffset = Math.floor(i / HOURS_PER_DAY); // Số ngày tăng thêm
        const hourIndex = i % HOURS_PER_DAY; // Giờ trong ngày (0-12 tương ứng 6h-19h)
        const targetHour = START_HOUR + hourIndex;
        // Tạo ngày mục tiêu
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + daysOffset);
        const formattedDate = targetDate.toLocaleDateString('en-GB')
            .split('/')
            .map(num => num.padStart(2, '0'))
            .join('/'); // Định dạng DD/MM/YYYY

        console.log(`Scheduling video ${i + 1}: ${formattedDate} at ${targetHour}:00`);
        // Gọi hàm createPost để lên lịch
        await createPost(driver, formattedDate, targetHour, videoPath, caption);
    }
    console.log("All videos have been scheduled!");
}
scheduleFacebookReel();