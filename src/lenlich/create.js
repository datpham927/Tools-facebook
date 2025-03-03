const { Builder, By, until, Key: SeleniumKey } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { keyboard, Key, mouse, Point, straightTo, Button } = require('@nut-tree-fork/nut-js');
const fs = require('fs');
const clipboardy = require('clipboardy');


const createPost = async (driver, targetDate, targetHour, videoPath, caption) => {
    try {
        await driver.get('https://business.facebook.com/latest/reels_composer?ref=biz_web_home_create_reel&context_ref=HOME');
        await driver.sleep(5000);
        // Step 1: Upload Video
        const addVideoButton = await driver.findElement(By.xpath("//div[text()='Thêm video']"));
        await addVideoButton.click();
        await driver.sleep(500);
        await clipboardy.write(videoPath);
        await keyboard.pressKey(Key.LeftControl, Key.V);
        await keyboard.pressKey(Key.Enter);
        await keyboard.releaseKey(Key.Enter);
        console.log("Video path pasted, uploading...");


        // Step 2: Add Caption
        const captionInput = await driver.findElement(By.xpath('//div[@role="textbox" and @contenteditable="true"]'));
        await captionInput.sendKeys(caption);
        console.log("Caption added:", caption);
        await driver.sleep(10000);
        // Step 3: Click Share
        const shareButton = await driver.wait(
            until.elementLocated(By.xpath('//div[@role="button" and contains(., "Chia sẻ")]')),
            10000
        );
        await driver.wait(until.elementIsEnabled(shareButton), 5000);
        await shareButton.click();
        console.log("Clicked 'Chia sẻ', proceeding to schedule...");

        // Step 4: Click Schedule
        // Step 4: Đợi và nhấp vào nút "Lên lịch"
        let scheduleButton;
        let retry = true;
        let maxRetries = 3; // Số lần thử lại tối đa

        while (retry && maxRetries > 0) {
            try {
                // Đợi nút "Lên lịch" xuất hiện
                scheduleButton = await driver.wait(
                    until.elementLocated(By.xpath("//div[@role='button' and contains(., 'Lên lịch')]")),
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
                    console.log("Đã nhấp lại 'Chia sẻ', thử tìm nút 'Lên lịch' lần nữa...");
                } else {
                    throw new Error("Không thể tìm thấy nút 'Lên lịch' sau khi thử lại.");
                }
            }
        }

        // Nhấp vào nút "Lên lịch" khi đã hiển thị
        await scheduleButton.click();
        console.log("Clicked 'Lên lịch', setting date and time...");
        await driver.sleep(2000);

        // Step 5: Set Date
        const dateInput = await driver.wait(
            until.elementLocated(By.xpath('//input[@placeholder="dd/mm/yyyy"]')),
            10000
        );
        await driver.wait(until.elementIsVisible(dateInput), 5000);
        await dateInput.click();

        // Attempt 1: Clear using Backspace key presses
        let dateValue = await dateInput.getAttribute("value");
        console.log(`Initial date value: ${dateValue}`);
        if (dateValue) {
            console.log("Clearing with Backspace...");
            // Estimate length of current value and send Backspace for each character
            for (let i = 0; i < dateValue.length + 5; i++) {
                await dateInput.sendKeys(SeleniumKey.BACK_SPACE);
                await driver.sleep(100); // Small delay to allow UI to process
            }
            await driver.sleep(500);
            dateValue = await dateInput.getAttribute("value");
            console.log(`After Backspace clearing: ${dateValue || "empty"}`);
        }

        // Attempt 2: Clear using JavaScript if Backspace fails
        if (dateValue) {
            console.log("Backspace clearing failed, using JavaScript...");
            await driver.executeScript("arguments[0].value = '';", dateInput);
            await driver.sleep(500);
            dateValue = await dateInput.getAttribute("value");
            console.log(`After JavaScript clearing: ${dateValue || "empty"}`);
        }

        // Attempt 3: Reset via date picker if still not cleared
        if (dateValue) {
            console.log("JavaScript clearing failed, resetting via date picker...");
            await dateInput.click();
            await driver.sleep(1000);
            // Select any date to reset (e.g., 1st of the current month)
            const firstDay = await driver.wait(
                until.elementLocated(By.xpath('//div[@role="button" and text()="1"]')),
                5000
            );
            await firstDay.click();
            await driver.sleep(1000);
            dateValue = await dateInput.getAttribute("value");
            console.log(`After resetting via picker: ${dateValue}`);
            // Clear again
            await dateInput.sendKeys(SeleniumKey.chord(SeleniumKey.CONTROL, "a"));
            await dateInput.sendKeys(SeleniumKey.BACK_SPACE);
            await driver.sleep(500);
            dateValue = await dateInput.getAttribute("value");
        }
        // Set the new date via direct input 
        await dateInput.sendKeys(targetDate);
        await dateInput.sendKeys(SeleniumKey.ENTER);
        await driver.sleep(1000);
        dateValue = await dateInput.getAttribute("value");
        console.log(`Date after direct input: ${dateValue}`);


        await driver.sleep(1000);
        // dateValue = await dateInput.getAttribute("value");
        console.log(`Date after picker selection: ${dateValue}`);
        // Fallback to localized format 
        await dateInput.sendKeys(SeleniumKey.ENTER);
        dateValue = await dateInput.getAttribute("value");
        console.log(`Date updated to: ${dateValue}`);
        try {
            // Lấy tọa độ chuột hiện tại (tùy chọn, để kiểm tra)
            // const position = await mouse.getPosition();
            // console.log("Tọa độ chuột hiện tại:", position);

            // 1. Di chuyển chuột đến ô nhập thời gian
            const timeInputPosition = new Point(509, 363); // Tọa độ ô nhập
            await mouse.move(straightTo(timeInputPosition));

            // 2. Nhấp chuột trái để kích hoạt ô nhập
            await mouse.click(Button.LEFT);
            await new Promise(resolve => setTimeout(resolve, 500)); // Đợi 0.5 giây

            // Nhấp lần thứ hai để đảm bảo focus
            await mouse.click(Button.LEFT);
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Xóa nội dung hiện có trong ô
            const isMac = process.platform === "darwin";
            if (isMac) {
                await keyboard.pressKey(Key.LeftCommand, Key.A);
                await keyboard.releaseKey(Key.LeftCommand, Key.A);
            } else {
                await keyboard.pressKey(Key.Control, Key.A);
                await keyboard.releaseKey(Key.Control, Key.A);
            }

            await keyboard.pressKey(Key.Backspace);
            await keyboard.releaseKey(Key.Backspace);
            await new Promise(resolve => setTimeout(resolve, 500));

            // 4. Đảm bảo con trỏ nằm ở phần giờ
            await keyboard.pressKey(Key.Home); // Di chuyển con trỏ về đầu ô (phần giờ)
            await keyboard.releaseKey(Key.Home);
            await new Promise(resolve => setTimeout(resolve, 200));

            // 5. Điều chỉnh giờ thành 11 bằng phím Up Arrow (thay vì Page Up)
            // Giả sử sau khi xóa, giờ mặc định là 00:00 
            const steps = targetHour; // Từ 00 lên 11, nhấn 11 lần

            for (let i = 0; i < steps; i++) {
                await keyboard.pressKey(Key.Up); // Dùng phím Up Arrow thay vì Page Up
                await keyboard.releaseKey(Key.Up);
                await new Promise(resolve => setTimeout(resolve, 100)); // Tăng độ trễ lên 0.5 giây
            }

            // 6. Nhấn Enter để lưu
            await keyboard.pressKey(Key.Enter);
            await keyboard.releaseKey(Key.Enter);

            console.log("Đã nhập thời gian thành công!");
        } catch (error) {
            console.error("Lỗi khi nhập thời gian:", error);
        }
        // Step 7: Confirm Scheduling
        const submitPosition = new Point(1198, 613); // Tọa độ ô nhập
        await mouse.move(straightTo(submitPosition));
        // 2. Nhấp chuột trái để kích hoạt ô nhập
        await mouse.click(Button.LEFT);
        console.error(`Lên lịch thành công ${targetDate} - ${targetHour}h`, error);
    } catch (error) {

    }
}

module.exports = {
    createPost
};