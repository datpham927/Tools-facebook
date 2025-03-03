const fs = require('fs');

async function readFileContent(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = async function docTxt(filePath) {
  try {
    const content = await readFileContent(filePath);
    // Xóa tất cả các dòng trống trong nội dung file
    const modifiedContent = content.replace(/\r\n/g, '\n');
    return modifiedContent;
  } catch (err) {
    console.error('Có lỗi xảy ra khi đọc file:', err);
    return null; // Trả về null nếu có lỗi
  }
};
