/**
 * 在页面动态加载js封装的组件方法,组件被封装成window[viewPath]()方法
 * 这样加载的组件,访问的所有资源都是以index.html为基础路径的,也就是解决了项目资源访问路径混款的问题
 * 此页面的url为 aa/bb/cc?viewPath=ee/ff
 */
(function () {
    /**
     * 从url中得到参数
     */
    function getParams(url) {
        url = url || window.location.href;
        var params = {};
        url.substring(url.indexOf('?') + 1).split('&').forEach(function (seg) {
            var kv = seg.split("=");
            params[kv[0]] = kv[1];
        });
        return params;
    }

    /**
     * 获取url中的get参数,得到view的路径进行加载
     * 还可以使用预定义的方式来定义viewPath
     */
    var viewPath = getParams()['viewPath']||window['viewPath'];
    if (viewPath) {
        var lastIndex = viewPath.length-1;
        /**
         * 去掉url后面的#,页面使用a标签后,有时候会在浏览器的url后面加上一个#
         */
        if(viewPath.charAt(lastIndex)==='#') viewPath = viewPath.substring(0,lastIndex);
        /**
         * 创建简单Deferred对象
         * then和pipe都只能调用一次,而且是互斥的
         */
        function Deferred(doSomething,checkFunc){
            var checked,callback;
            this.then = function(_callback){
                if(checked){
                    _callback()
                }else{
                    callback = _callback;
                }

                return this;
            };

            this.pipe = function(newDeferred){
                this.then(function(){
                    newDeferred.doAndCheck();
                });

                return newDeferred;
            };

            this.doAndCheck = function(){
                doSomething();
                var count = 0;
                /**
                 * 脚本加载完毕后,不一定就完成了初始化
                 * 比如有的脚本在自己加载之后还需要载入其他资源完成初始化
                 */
                var timer = window.setInterval(function () {
                    //超时处理
                    if (++count > 1000) {
                        window.clearInterval(timer);
                        console.error('checkMethod:' , checkFunc ,' does not validate always');
                        return;
                    }

                    try {
                        checked = checkFunc();
                    } catch (e) {
                        console.error(e);
                    }

                    if (typeof checked !== 'undefined' && checked !== null) {
                        window.clearInterval(timer);
                        if (callback) {
                            callback();
                        }
                    }
                }, 16);
            };
        }


        function createScriptTag(url){
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", url);
            return script;
        }

        function createLinkTag(url){
            var link=document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", url);
            return link;
        }

        /**
         * 加载script并判断是否加载成功
         */
        function loadScript(viewPath) {
            return new Deferred(function(){
                //view代码载入时加一个random参数,防止浏览器缓存影响调试,一般而言view的代码是业务代码,变化最频繁
                var script = createScriptTag(viewPath+'.js?r='+Math.random());
                //index.js是defer载入的,所以可以直接操作document
                document.body.insertBefore(script, document.body.lastChild);
            },function(){
                return window[viewPath];
            });
        }

        /**
         * 动态加载element ui这个的库的脚本和样式
         */
        function loadElementUILib() {
            return new Deferred(function(){
                var mxScript = document.head.getElementsByTagName('script')[1];

                //添加link css
                var linkCss = createLinkTag('../node_modules/element-ui/lib/theme-chalk/index.css');
                document.head.appendChild(linkCss);

                //添加脚本
                var elementScript = createScriptTag('../node_modules/element-ui/lib/index.js');
                document.head.insertBefore(elementScript,mxScript);
            },function(){
                return Vue && Vue.component('ElPopconfirm');
            });

        }

        function loadApp() {
            if (viewPath.charAt(0) === '/') viewPath = viewPath.substring(1);
            function callLoadApp(){
                //将vue的组件mount到#app上
                window[viewPath].call(null, '#app');
                //了然无痕迹
                delete window[viewPath];
            }
            //如果view path的路径中出现element,就加载element ui这个库
            if(viewPath.toLowerCase().indexOf('element')>=0){
                //动态加载,在webStorm自带的服务器上比静态的还要快
                var load0 = loadElementUILib();
                load0.pipe(loadScript(viewPath)).then(callLoadApp);
                load0.doAndCheck();
            }else{
                loadScript(viewPath).then(callLoadApp).doAndCheck();
            }
        }

        loadApp();

    } else {//如果没有viewPath参数,在开发模式下,是索引所有文件进行调试用的
        var as = document.getElementsByTagName('a');
        if (as && as.length) {
            //取当前url地址
            var hrefBase = window.location.href;
            //如果已经有其他参数了,就加一个&
            if (hrefBase.indexOf('?') >= 0) {
                hrefBase += '&';
            }else{
                hrefBase += '?';
            }
            var i;
            for (i = 0; i < as.length; i++) {
                as[i].setAttribute('href', hrefBase + 'viewPath=' + as[i].innerText);
                //console.info(as[i].innerText)
            }
        }

        document.getElementById('app').style.display = 'block';

    }

})();


