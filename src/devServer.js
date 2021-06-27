const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const WebSocket = require('ws');

const { info } = console;

/**
 * @typedef serverParams
 * @property {String} guard
 * @property {number} port
 * @property {String} baseDirInFileSystem
 */


/**
 * 获取请求的参数,这个在静态服务器中是无用的
 * @param {String} query
 */
function getRequestParameter(query) {
    if (query) {
        const params = {};
        query.split('&').forEach(seg => {
            const kv = seg.split("=");
            params[kv[0]] = kv[1];
        });
        return params;
    }
}

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
 * @param {serverParams} params
 */
function launchStaticServer(params) {
    const server = http.createServer(function (request, response) {
        const url0 = url.parse(request.url);

        const pathName = url0.pathname;
        let requestPath = path.relative('/' + params.guard, path.normalize(pathName));
        //不再本应用的guard下面
        if (requestPath.startsWith('..')) {
            response.writeHead(401);
            response.end('401 Unauthorized');
        } else {
            const baseDirInFileSystem = params.baseDirInFileSystem;
            const filePath = path.join(baseDirInFileSystem, requestPath);
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    response.writeHead(404);
                    response.end('404 Not Found');
                } else {
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

                    response.end(data);
                }
            });
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

    constructor(ws, serviceHandlers, channelTemplates) {
        /**
         * @type {WebSocket}
         */
        this.ws = ws;
        this.serviceHandlers = serviceHandlers;
        this.channelTemplates = channelTemplates;
        this.channelHandlers = {};
    }

    send(str) {
        if (this.ws != null) {
            try {
                this.ws.send(str);
            } catch (e) {
                this.connectionClose();
                console.error('broken pipe!');
            }
        } else {
            console.error('can\'t send because connection closed!');
        }
    }

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