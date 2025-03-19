const fs = require('fs');

module.exports = function readGroupUrls() {
  return new Promise((resolve, reject) => {
    fs.readFile('src/dangbai/3.txt', 'utf8', (err, data) => {
      if (err) {
        console.error('Có lỗi xảy ra khi đọc file:', err);
        reject(err);
        return;
      }
      // Chuyển mỗi dòng thành một phần tử trong mảng
      const groupUrls = data.trim().split('\n');
      resolve(groupUrls);
    });
  });
};
