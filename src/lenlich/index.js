const { Builder, By, until, Key: SeleniumKey } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const { createPost } = require('./create');
const { CAPTION, VIDEO } = require('./video');

async function scheduleFacebookReel() {
    const options = new firefox.Options();
    options.setProfile('C:\\Users\\lenovo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\n74kstic.default-release');
    // options.addArguments('-headless');
    let driver;
    try {
        driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .build();

        await scheduleVideos(driver, VIDEO, CAPTION);
    } catch (error) {
        console.error("Error during scheduling:", error);

        if (driver) {
            try {
                const pageSource = await driver.getPageSource();
                fs.writeFileSync('page_source.html', pageSource);
                console.log("Page source saved to 'page_source.html' for debugging.");
            } catch (saveError) {
                console.error("Failed to save page source:", saveError);
            }
        }
    } finally {
        if (driver) {
            try {
                await driver.quit();
                console.log("Browser session ended.");
            } catch (quitError) {
                console.error("Error closing browser:", quitError);
            }
        }
    }
}
async function scheduleVideos(driver, VIDEO, CAPTION) {
    const START_HOUR = 7;  // Start at 7 AM
    const END_HOUR = 19;   // End at 7 PM
    const HOURS_INTERVAL = 1;  // Schedule every 2 hours

    const SLOTS_PER_DAY = Math.floor((END_HOUR - START_HOUR) / HOURS_INTERVAL) + 1; // Number of 2-hour slots in a day

    let startDate = new Date("2025-03-20");

    for (let i = 0; i < VIDEO.length; i++) {
        try {
            await driver.sleep(1000);
            const videoPath = VIDEO[i];
            // Skip if video file doesn't exist
            if (!fs.existsSync(videoPath)) {
                console.warn(`Video file not found, skipping: ${videoPath}`);
                continue;
            }
            // Select caption (cycle through captions if needed)
            const caption = CAPTION[i % CAPTION.length];

            // Calculate date and time based on video index
            const daysOffset = Math.floor(i / SLOTS_PER_DAY);
            const slotIndex = i % SLOTS_PER_DAY;
            const targetHour = START_HOUR + (slotIndex * HOURS_INTERVAL);

            // Create target date
            const targetDate = new Date(startDate);
            targetDate.setDate(startDate.getDate() + daysOffset);

            const formattedDate = targetDate.toLocaleDateString('en-GB')
                .split('/')
                .map(num => num.padStart(2, '0'))
                .join('/');

            console.log(`Scheduling video ${i + 1}: ${formattedDate} at ${targetHour}:00`);
            // Schedule post
            
            await createPost(driver, formattedDate, targetHour, videoPath);
        } catch (videoError) {
            console.error(`Error scheduling video ${i + 1}:`, videoError);
            // Continue to next video on error
            continue;
        }
    }

    console.log("All videos have been scheduled!");
}
scheduleFacebookReel();