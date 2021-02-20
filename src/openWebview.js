const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


const { info } = console;
/**
 * @param {vscode.ExtensionContext} context 
 * @param {String} templatePath 
 */
function getWebViewContent(context, templatePath) {
    const resourcePath = path.join(context.extensionPath, templatePath);
    //文件系统直接读插件目录中的文件
    let html = fs.readFileSync(resourcePath, 'utf-8');
    const dirPath = path.dirname(resourcePath);
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    info(html);

    return html;
}

module.exports = function (context) {

    // 注册命令，可以给命令配置快捷键或者右键菜单
    // 回调函数参数uri：当通过资源管理器右键执行命令时会自动把所选资源URI带过来，当通过编辑器中菜单执行命令时，会将当前打开的文档URI传过来
    context.subscriptions.push(vscode.commands.registerCommand('mxdev.openWebview', function (uri) {
        const panel = vscode.window.createWebviewPanel(
            'testWebview', // viewType
            "mxDev", // 视图标题
            vscode.ViewColumn.One, // 显示在编辑器的哪个部位
            {
                enableScripts: true, // 启用JS，默认禁用
                retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
            }
        );

        panel.webview.html = getWebViewContent(context, '/resources/webview/test.html');
    }));

    vscode.commands.executeCommand('mxdev.openWebview');

};