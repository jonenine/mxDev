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

function undef(v) {
    return typeof v === 'undefined' || v === null;
}


function _debug(cb) {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) { return stack; };
    const err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    const stack = err.stack;
    Error.prepareStackTrace = orig;
    //取索引位置为1的栈
    const stack1 = stack[1];
    const _line = stack1.getLineNumber();
    const _file = stack1.getFileName();
    cb(_file, _line);
}

/**
 * 打印调试信息
 */
function info(...a) {
    _debug((_file, _line) => {
        console.info(_file + ':' + _line, ...a);
    })
}

/**
 * 打印错误调试信息
 */
function errorInfo(...a) {
    _debug((_file, _line) => {
        console.error(_file + ':' + _line, ...a);
    })
}

/**
 * 遍历文件夹
 * @param {string} filePath 
 * @param {function(String):any} callback 
 */
function travelDir(filePath, callback) {
    let state = fs.statSync(filePath);
    if (state.isFile()) {
        callback(filePath)
    } else if (state.isDirectory()) {
        fs.readdirSync(filePath).forEach(file => {
            const subFilePath = path.join(filePath, file);
            //先序
            travelDir(subFilePath, callback);
        });
    }
}


/**
 * 不想引入jquery,直接写一个defer,实现内转外的控制
 */
class Defer {
    constructor() {
        /**
         * @type {Promise}
         */
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

    }

    then(cb) {
        return this.promise.then(cb);
    }

    catch(cb) {
        return this.promise.catch(cb);
    }

    resolve(res) {
        this._resolve.apply(null, [...arguments]);
    }

    reject(e) {
        this._reject.apply(null, [...arguments]);
    }

    static reslovedDefer() {
        const defer = new Defer();
        defer.resolve(...arguments)
        return defer;
    }
}

/**
 * thenable+超时转Promise
 * @param {Promise} thenable 
 * @param {number} millionSeconds 默认是5秒
 * @return {Promise}
 */
function thenOrUntil(thenable, millionSeconds = 5000) {
    const defer = new Defer();
    thenable.then((...args) => {
        defer.resolve(...args);
    }, e => {
        defer.reject(e);
    });
    //thenable本身可能是promise
    thenable.catch && thenable.catch(e => {
        defer.reject(e);
    });

    setTimeout(() => {
        defer.reject(new Error("已超时" + millionSeconds));
    }, millionSeconds);

    return defer.promise;
}

async function asyncSleep(millionSeconds = 1000) {
    const defer = new Defer();
    setTimeout(() => { defer.resolve();}, millionSeconds);
    return defer.promise;
}

module.exports = { Defer, confirmDir, undef, info, errorInfo, travelDir, thenOrUntil, asyncSleep };