/**
 * 此脚本不经webpack打包,不依赖webpack,通过<script>直接加载在html中
 * 此脚本的载入要放在页面的下部
 */

/**
 * 在页面动态加载js封装的组件方法,组件被封装成window[viewPath]()方法
 * 这样加载的组件,访问的所有资源都是以index.html为基础路径的,也就是解决了项目资源访问路径混乱的问题
 * 此页面的url为 aa/bb/cc?viewPath=ee/ff
 */

/**
 * 不同的框架,采取不同的html模板
 * 比如v2Element.html,v2Ant.html,rAnt.html
 * 在不同的模板中,会域加载不同的资源
 *
 */

(function () {
    class Defer {
        constructor() {
            const me = this;
            /**
             * @type {Promise}
             */
            this.promise = new Promise((resolve, reject) => {
                me._resolve = resolve;
                me._reject = reject;
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
    }

    function loadScript(url) {
        const script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", url);
        const defer = new Defer();
        script.onload = function () {
            defer.resolve();
        };
        script.onerror = function (e) {
            defer.reject(e);
        };
        document.body.insertBefore(script, document.body.lastChild);
        return defer;
    }

    function createLinkTag(url) {
        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        const defer = new Defer();
        link.onload = function () {
            defer.resolve();
        };
        link.onerror = function (e) {
            defer.reject(e);
        };
        document.head.appendChild(link);

        return defer;
    }

    /**
     * 从url中得到参数
     */
    function getParams(url) {
        url = url || window.location.href;
        const params = {};
        url.substring(url.indexOf('?') + 1).split('&').forEach(function (seg) {
            const kv = seg.split("=");
            params[kv[0]] = kv[1];
        });
        return params;
    }


    function getViewPath() {
        //通过url中的get参数指定或是在html页面通过<script>标签指定viewPath
        let viewPath = getParams()['viewPath'] || window['viewPath'];
        if (viewPath) {
            const lastIndex = viewPath.length - 1;
            //去掉url后面的#,页面使用a标签后,有时候会在浏览器的url后面加上一个#
            if (viewPath.charAt(lastIndex) === '#') viewPath = viewPath.substring(0, lastIndex);
            //去掉最前面的"/"
            if (viewPath.charAt(0) === '/') viewPath = viewPath.substring(1);
            return viewPath;
        }
    }


    function loadApp() {
        /**
         * @type {String}
         */
        let viewPath = getViewPath();
        if (viewPath) {
            return loadScript(viewPath.endsWith('.js') ? viewPath : viewPath + '.js').then(function () {
                const defer = new Defer();
                try {
                    //调用entrance页面的window[viewPath]方法
                    window[viewPath].call(null, '#app', defer);
                } catch (e) {
                    defer.reject(e);
                } finally {
                    delete window[viewPath];
                }

                return defer.promise;
            })
        } else {
            throw 'viewPath不能为空';
        }
    }

    loadApp();

})();


