const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { launchStaticServer, bindWSServer } = require('./devServer');

const { info } = console;
const isWin = os.platform().startsWith('win');

/**
 * webview使用的文件所在的路径
 */
let webViewResPath;

function getWebViewContent3() {
    const entranceHTML = path.join(webViewResPath, 'test3.html');
    //文件系统直接读插件目录中的文件
    let html = fs.readFileSync(entranceHTML, 'utf-8');

    return html;
}

/**
 * webIDE部署的相对路径
 */
const webview = '/resources/webview/';

/**
 * @type vscode.WebviewPanel
 */
let panel, httpServer;

/**
 * 
 * @param {vscode.ExtensionContext} context 
 */
module.exports = function (context) {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('当前工作目录为空，请在工作目录下重新打开vs code!');
    }

    /**
     * 插件内的资源加载路径
     */
    webViewResPath = path.join(context.extensionPath, webview);
    info(webViewResPath);


    //取出来为/d:/testWorkspace/vue/noCli,注意前面有一个/,在windows系统上需要去掉
    let folder0Path = vscode.workspace.workspaceFolders[0].uri.path;

    //windows系统要去掉前面的/
    if (isWin) {
        if (folder0Path.startsWith('/')) folder0Path = folder0Path.substring(1);
    }

    //mxDev根目录
    const basePath = path.join(folder0Path, './.mxDev/');

    /**
     * 创建服务对象
     */
    const services = require('./services.js')(basePath);

    if (!httpServer) {
        try {
            httpServer = launchStaticServer({ guard: 'webview', port: 23331, baseDirInFileSystem: webViewResPath });
        } catch (e) {
            vscode.window.showErrorMessage('创建web服务器出错' + e);
        }
    }
    /**
     * 创建websocket服务
     */
    const chTemplates = bindWSServer('service', httpServer, services);

    /**
     * 创建打开webview的命令
     */
    context.subscriptions.push(vscode.commands.registerCommand('mxdev.openWebview', function (uri) {
        /**
         * 创建webview或者显示
         */
        if (!panel) {
            //创建webView
            panel = vscode.window.createWebviewPanel(
                'testWebview', // viewType
                "mxDev", // 视图标题
                vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                {
                    enableScripts: true, // 启用JS，默认禁用
                    retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
                }
            );
            //设置webview内容
            panel.webview.html = getWebViewContent3();
            //被用户手动关闭
            panel.onDidDispose(_ => {
                panel = null;
            });
        } else {
            panel.reveal(vscode.ViewColumn.One);
        }

    }));

    //vscode.commands.executeCommand('mxdev.openWebview');

    return services;

};