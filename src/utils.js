const path = require('path');
const fs = require('fs');


const fileSplitter = path.sep;

/**
 * 在创建文件之前,确保文件夹被创建了
 * @param {String} filePath 
 */
 function confirmDir(filePath) {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        const ss = dirPath.split(fileSplitter);
        let dir = ss.shift();
        ss.forEach(s => {
            dir += fileSplitter + s;
            !fs.existsSync(dir) && fs.mkdirSync(dir);
        });
    }
}


module.exports = {confirmDir};