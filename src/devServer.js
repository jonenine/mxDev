const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const zlib = require('zlib');

const WebSocket = require('ws');

const { info, travelDir } = require('./utils.js');

/**
 * @typedef serverParams
 * @property {String} guard guard必须是baseDirInFileSystem的最后一层目录
 * @property {number} port
 * @property {String} baseDirInFileSystem
 */


const contentTypeMap = {
    ".css": "text/css",
    ".gif": "image/gif",
    ".html": "text/html;charset=UTF-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tiff": "image/tiff",
    ".txt": "text/plain",
    ".wav": "audio/x-wav",
    ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv",
    ".xml": "text/xml"
};


/**
 * open static http server
 * todo:这个有一定安全问题,应该限制访问ip为127.0.0.1,防止远程访问,还应该加一个动态随机token,防止本机浏览器访问
 * @param {serverParams} params
 */
function launchStaticServer(params) {
    const baseDirInFileSystem = params.baseDirInFileSystem;

    /**
     * 对一个小项目而言,将资源完全缓冲起来也是没问题的
     */
    const bufferMap = {};
    travelDir(baseDirInFileSystem, file => {
        let data = fs.readFileSync(file);
        if (file.endsWith('.zip')) {
            data = zlib.gunzipSync(data);
            file = file.substring(0, file.length - 4);
        }
        bufferMap[file] = data;
    });

    const server = http.createServer(function (request, response) {
        const url0 = url.parse(request.url);

        const pathName = url0.pathname;
        //去掉前面的guard,也就是guard需要是文件目录真正的一层
        let requestPath = path.relative('/' + params.guard, path.normalize(pathName));
        //不再本应用的guard下面
        if (requestPath.startsWith('..')) {
            response.writeHead(401);
            response.end('401 Unauthorized');
        } else {
            //注意这里实际上又把guard给加上了
            let filePath = path.join(baseDirInFileSystem, requestPath);
            /**
             * {@type Buffer}
             */
            const data = bufferMap[filePath];
            if (data) {
                const extname = path.extname(requestPath);
                const contentType = contentTypeMap[extname];
                if (contentType) {
                    const headers = { "Content-Type": contentType, 'Cache-Control': 'max-age=1' };
                    if (extname === '.html') {
                        headers['X-Frame-Options'] = 'ALLOWALL';
                    }
                    response.writeHead(200, headers);
                } else {
                    response.writeHead(200);
                }
                //todo:不知道node的buffer能否重复使用
                response.end(data);
            } else {
                response.writeHead(404);
                response.end('404 Not Found');
            }
        }
    });

    server.listen(params.port);

    info('server start!');

    return server;
}



function undef(v) {
    return typeof v === 'undefined' || v === null;
}

function deserialize(str) {
    if (undef(str)) return null;
    str = str.trim();
    if (str.length === 0) return null;
    return JSON.parse(str);
}


/**
 * 对于每一个connection,都会创建一个WSListener对象
 */
class ConnectionListener {
    /** 
     * @param {WebSocket} ws websocket connection
     * @param serviceHandlers 
     * 注册服务方法
     * serviceName => service function的映射.
     * 在被调时,框架接受serviceName和参数数组,在参数数组后面加入一个回调方法,在使用这个参数数组调用注册的service function
     * 回调方法为的内容为将回调方法接受到的参数+callId,回传给调用端
     * @param channelTemplates
     */
    constructor(ws, serviceHandlers, channelTemplates) {
        this.ws = ws;
        this.serviceHandlers = serviceHandlers;
        this.channelTemplates = channelTemplates;
        this.channelHandlers = {};
    }

    /**
     * 发送消息
     * @param {String} msg 
     */
    send(msg) {
        if (this.ws != null) {
            try {
                this.ws.send(msg);
            } catch (e) {
                this.connectionClose();
                console.error('broken pipe!');
            }
        } else {
            console.error('can\'t send because connection closed!');
        }
    }

    /**
     * 接受消息
     * @param {String} msg 
     */
    onmessage(msg) {
        const data = deserialize(msg);

        const __targetId__ = data['__targetId__'];
        if (__targetId__ === 'callService') {

            const { service: serviceName, callId, args } = data;
            let service = this.serviceHandlers[serviceName];
            if (service) {
                const me = this;
                args.push(function () {
                    let res = [...arguments];
                    !res.length && (res = null);
                    const str = JSON.stringify({ res, callId });
                    me.send(str);
                });
                try {
                    service.apply(null, args);
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.error(serviceName + '并不存在!');
            }

        } else if (__targetId__ === 'channel') {
            const { channelId, args } = data;
            const template = this.channelTemplates[channelId];
            if (template && template.onmessage) {
                let chHandler = this.channelHandlers[channelId];
                if (!chHandler) {
                    /**
                     * 创建一个新对象作为handler,并将template方法都拷贝过去
                     */
                    chHandler = Object.assign({}, template);
                    const me = this;
                    /**
                     * 添加send方法,也就是在server端,channelHandler要先接受一个消息,才能向channel发送消息
                     * 接受的第一个消息是不可避免的,因为第一个消息是用来定位是哪个channel,也标识着channel的建立
                     */
                    chHandler.send = function () {
                        const args = [...arguments];
                        const str = JSON.stringify({ args, channelId });
                        me.send(str);
                    };

                    chHandler.ws = this.ws;

                    this.channelHandlers[channelId] = chHandler;
                }

                try {
                    chHandler.onmessage.apply(chHandler, args);
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.error("channelId:" + channelId + '不存在,或者没有onmessage方法');
            }
        }
    }//~onmessage

    /**
     * connection连接关闭的时候调用
     */
    connectionClose() {
        try {
            this.ws.terminate();
        } catch (e) {
            console.error(e);
        }

        this.ws = null;

        for (let serviceName in this.serviceHandlers) {
            let service = this.serviceHandlers[serviceName];
            if (service.onconnectionclose) {
                try {
                    service.onconnectionclose();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        this.serviceHandlers = null;

        for (let channelId in this.channelHandlers) {
            const chHandler = this.channelHandlers[channelId];
            if (chHandler.onconnectionclose) {
                try {
                    chHandler.onconnectionclose();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        this.channelHandlers = null;

        this.channelTemplates = null;
    }
}

/**
 * 在http server基础上创建ws server
 * @param  {String} guard
 * @param  {*} httpServer
 * @param  {*} serviceHandlers
 * @return {*}
 */
function bindWSServer(guard, httpServer, serviceHandlers) {
    if (!guard.startsWith("/")) guard = '/' + guard;
    const wss = new WebSocket.Server({ path: guard, server: httpServer });
    const channelTemplates = {};

    wss.on('connection', function (ws) {
        /**
         * 对于每一个connection.都有一个唯一的listener
         */
        const listener = new ConnectionListener(ws, serviceHandlers, channelTemplates);
        ws.on('message', listener.onmessage.bind(listener));
        ws.on('close', listener.connectionClose.bind(listener))
    });

    info('websocket server bind!');

    return channelTemplates;
}



module.exports = { launchStaticServer, bindWSServer };