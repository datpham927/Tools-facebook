const { By, until } = require('selenium-webdriver');

async function createFacebookPost(driver, content, imagePaths) {
    try {
        const postButtonSelector = "div.x1i10hfl.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xmjcpbm.x107yiy2.xv8uw2v.x1tfwpuw.x2g32xy.x78zum5.x1q0g3np.x1iyjqo2.x1nhvcw1.x1n2onr6.xt7dq6l.x1ba4aug.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou";
        const postButton = await driver.wait(
            until.elementLocated(By.css(postButtonSelector)),
            3000
        );

        await driver.wait(until.elementIsVisible(postButton), 3000);
        await postButton.click();
        await driver.sleep(1000);

        // Lặp lại quá trình đăng bài nếu gặp lỗi StaleElementReferenceError
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const postBox = await driver.wait(
                    until.elementLocated(By.xpath("//div[@aria-label='Tạo bài viết công khai...'][@role='textbox']")),
                   3000
                );
                await postBox.click();
                await postBox.sendKeys(content);

                const uploadButton = await driver.wait(
                    until.elementLocated(By.css("div[aria-label='Ảnh/video']")),
                    3000
                );

                await driver.executeScript("arguments[0].scrollIntoView(true);", uploadButton);
                await driver.wait(until.elementIsVisible(uploadButton), 3000);
                await uploadButton.click();

                const fileInput = await driver.wait(
                    until.elementLocated(By.css("input[type='file']")),
                    3000
                );

                // Lặp qua từng đường dẫn hình ảnh và tải lên từng tệp
                for (const imagePath of imagePaths) {
                    await fileInput.sendKeys(imagePath);
                    await driver.sleep(2000); // Đợi một chút để tải lên tệp
                }
                await driver.sleep(3000);

                const postButtonElements = await driver.wait(
                    until.elementsLocated(By.css("div[aria-label='Đăng']")),
                    3000
                );
                for (let postButtonElement of postButtonElements) {
                    const text = await postButtonElement.getText();
                    if (text === "Đăng") {
                        await driver.executeScript("arguments[0].scrollIntoView(true);", postButtonElement);
                        await driver.wait(until.elementIsVisible(postButtonElement), 3000);
                        await driver.wait(until.elementIsEnabled(postButtonElement), 3000);
                        await postButtonElement.click();
                        console.log("Bài viết đang được đăng...");
                        await driver.sleep(3000);
                        return;
                    }
                }
                break; // Nếu không có lỗi, thoát khỏi vòng lặp
            } catch (error) {
                if (error.name === 'StaleElementReferenceError') {
                    console.warn("Lỗi StaleElementReferenceError, đang thử lại...");
                    continue; // Thử lại nếu gặp lỗi
                }
                console.error("Có lỗi khi đăng bài:", error);
                break; // Thoát vòng lặp nếu lỗi khác
            }
        }
    } catch (err) {
        console.error("Có lỗi khi đăng bài:", err);
    }
}

// Xuất hàm để sử dụng ở nơi khác
module.exports = {
    createFacebookPost,
};
