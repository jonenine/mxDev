const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const serviceSite = require('./serviceSite.js');

const { info } = console;


/**
 * 通过base标签加载资源，这种方式更好
 * @param {vscode.ExtensionContext} context 
 */
function getWebViewContent2(context) {
    const templatePath = '/resources/webview/dist/index.html'
    const resourcePath = path.join(context.extensionPath, templatePath);
    //文件系统直接读插件目录中的文件
    let html = fs.readFileSync(resourcePath, 'utf-8');
    const dirPath = path.dirname(resourcePath);
    let basePath = vscode.Uri.file(dirPath).with({ scheme: 'vscode-resource' }).toString();
    //后面不要忘记加/
    !basePath.endsWith('/') && (basePath += '/');
    //html不是从路径载入的，所以html中的资源在载入的时候也没有相对路径一说
    html = html.replace('${basePath}', basePath);
    //info(html);

    return html;
}

function confirmDir(filePath) {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        const ss = dirPath.split('\\');
        let dir = ss.shift();
        ss.forEach(s => {
            dir += '\\' + s;
            !fs.existsSync(dir) && fs.mkdirSync(dir);
        });
    }
}

/**
 * @type vscode.WebviewPanel
 */
let panel;

/**
 * 
 * @param {vscode.ExtensionContext} context 
 */
module.exports = function (context) {
    if(!vscode.workspace.workspaceFolders){
        vscode.window.showErrorMessage('当前工作目录为空，请在工作目录下重新打开vs code!');
    }
    //取出来为/d:/testWorkspace/vue/noCli,注意前面有一个/,在windows系统上需要去掉
    let foler0Path = vscode.workspace.workspaceFolders[0].uri.path;

    //windows系统要去掉前面的/
    if(os.platform().startsWith('win')){
        if(foler0Path.startsWith('/'))  foler0Path = foler0Path.substring(1);
    }
    
     //mxDev根目录
    const basePath = path.join(foler0Path, './.mxDev/');

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
            panel.webview.html = getWebViewContent2(context);

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


        if (1 == 1) return;
        /*--------------------------------------------------------------------------------*/

        const templatePath = '/resources/webview/test.html'
        const resourcePath = path.join(context.extensionPath, templatePath);
        const dirPath = path.dirname(resourcePath);
        path.resolve(dirPath, './test.html')

        //需要在当前项目下创建.mxDev和临时文件,将文件内容写入,再修改
        const fileUri = vscode.Uri.file('D:/openSource/mxDev/resources/webview/test.html').with({ scheme: 'file' });
        console.info('fileUri:', fileUri);
        //再另外一个column打开一个文件
        vscode.commands.executeCommand('vscode.open', fileUri, vscode.ViewColumn.Two).then(e => {
            info(vscode.window.activeTextEditor.document.getText());
            info('-------------------------------------------------')
            //如果用户不快速的切换editor,那么active editor就是编辑这个文件的editor
            //const editor = vscode.window.activeTextEditor;

            /**
             * workbench.action.closeActiveEditor是绑定的快捷键,结果是方法
             * https://code.visualstudio.com/docs/getstarted/keybindings
             */
            //vscode.commands.executeCommand('workbench.action.closeActiveEditor',vscode.window.activeTextEditor)
        });

        /**
         * 当前工作空间对象
         */
        const ws = vscode.workspace;

        try {
            const folders = ws.workspaceFolders;
            info('ws的folder:');
            folders.forEach(folder => {
                console.info(folder.uri.path)
            })
        } catch (error) {
            console.error(error);
        }


        //console.info(typeof ws.onDidSaveTextDocument,ws.onDidSaveTextDocument)
        /**
         * 保存工作目录下的文件,会进行回调
         * onDidSaveTextDocument 帮助文档里说是一个回调,其实是一个方法
         * 
         * 鼠标放在event上回显示类型,vscode知道你在做什么
         */
        ws.onDidSaveTextDocument(textDocument => {
            info(textDocument.fileName);
            info(textDocument.getText());
        })

        /**
         * 当前窗口ui控制对象
         */
        const w = vscode.window;
        w.onDidChangeActiveTextEditor(textEditor => {
            info("当前编辑的文件目录:" + textEditor.document.uri)
        })

    }));

    //vscode.commands.executeCommand('mxdev.openWebview');

};