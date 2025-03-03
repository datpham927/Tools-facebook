const { By, Key } = require('selenium-webdriver');
const config = require('./config');

async function loginToFacebook(driver) {
    try {
        // Mở trang Facebook
        // await driver.get('https://www.facebook.com/');
        // await driver.sleep(2000); 
        // // Nhập thông tin đăng nhập
        // await driver.findElement(By.id('email')).sendKeys(config.USERNAME);
        // await driver.findElement(By.id('pass')).sendKeys(config.PASSWORD, Key.RETURN);
        // Điều hướng đến nhóm sau khi đăng nhập
        await driver.get('https://www.facebook.com/groups/361985526874834');
        await driver.sleep(5000);
        console.log("Đăng nhập thành công!");
    } catch (err) {
        console.error("Có lỗi khi đăng nhập:", err);
    }
}

// Xuất hàm để sử dụng ở nơi khác
module.exports = {
    loginToFacebook,
};
