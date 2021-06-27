const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const serviceSite = require('./serviceSite.js');

const { info } = console;
const isWin = os.platform().startsWith('win');


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

    if (!httpServer) {
        try {
            const {launchStaticServer} = require('../devServer');
            httpServer = launchStaticServer({ guard: 'webview', port: 23331, baseDirInFileSystem: webViewResPath });
        } catch (e) {
            vscode.window.showErrorMessage('创建web服务器出错' + e);
        }
    }


    //取出来为/d:/testWorkspace/vue/noCli,注意前面有一个/,在windows系统上需要去掉
    let folder0Path = vscode.workspace.workspaceFolders[0].uri.path;

    //windows系统要去掉前面的/
    if (isWin) {
        if (folder0Path.startsWith('/')) folder0Path = folder0Path.substring(1);
    }

    //mxDev根目录
    const basePath = path.join(folder0Path, './.mxDev/');

    /**
     * 向serviceSite注册方法showCode
     */
    serviceSite.register('showCode', function (code) {
        //文件路径
        const targetFile = path.join(basePath, 'result.vue');
        info(targetFile);
        try {
            //确保文件所在目录已经创建
            confirmDir(targetFile);
            //写入文件
            fs.writeFileSync(targetFile, code);
            //展示此文件
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(targetFile).with({ scheme: 'file' }), vscode.ViewColumn.Two);
        } catch (e) {
            console.error(e);
        }

    });

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

            //接受webView的调用
            panel.webview.onDidReceiveMessage(message => {
                //调用注册在serviceSite上的方法
                serviceSite.callByWebView(message, panel);
            },
                undefined,
                context.subscriptions
            );

            //用户关掉webview时的销毁
            panel.onDidDispose(
                () => {
                    panel = undefined;
                },
                undefined,
                context.subscriptions
            );

        } else {
            panel.reveal(vscode.ViewColumn.One);
        }


    }));

    //vscode.commands.executeCommand('mxdev.openWebview');

};