/**
 * 相当于服务注册中心,不同的模块都可以向site注册服务,并调用其他模块注册的服务
 * 主要目的为从webView进行调用,并返回
 */

const { info, error } = console;

const serviceReturn = 'serviceReturn';
const callService = 'callService';
const allServiceNames = 'allServiceNames';
const ready = 'ready';

function undef(v) {
    return typeof v === 'undefined' || v === null;
}
/**
 * @param {String} str 
 */
function deserialize(str) {
    if (undef(str)) return null;
    str = str.trim();
    if (str.length === 0) return null;
    return JSON.parse(str);
}


const base = {
    /**
     * 注册一个或多个方法(或属性)
     * @param {Object} opt 
     * @param {any} value 
     */
    register(opt, value = null) {
        if (typeof opt === 'string') {
            opt = {[opt]: value }
        }

        for (let n in opt) {
            if (!this[n]) {
                this[n] = opt[n];
            } else {
                error('重复注册:' + n);
            }
        }
    },


    /**
     * 
     * @param {Object} message 
     * @param {import("vscode").WebviewPanel} fromPanel 
     * @returns {Boolean} 是否是调用服务
     */
    callByWebView(message, fromPanel) {
        if (message['__targetId__'] === callService) {
            let { service, callId, args } = message;
            //有字符串转换成数组
            try{
                args = deserialize(args);
            }catch(e){
                console.error(e);
            }
           
            const _return = (result, error) => {
                //对象或者数组类型,就转成json
                typeof result === 'object' && (result = JSON.stringify(result));
                fromPanel.webview.postMessage({
                    '__targetId__': serviceReturn,
                    callId,
                    result,
                    //错误转字符串
                    error: error ? '' + error : undefined
                });
            }

            try {
                //调用方法
                const result = this[service].apply(null, args);
                if (result && result instanceof Promise) {
                    result.then(res => {
                        _return(res);
                    }, error => {
                        _return(null, '' + error);
                    });
                } else {
                    //result可能是undefined
                    _return(result);
                }
            } catch (e) {
                _return(null, e);
            }

            return true;
        }

        return false;
    }


}

module.exports = Object.assign({}, base);