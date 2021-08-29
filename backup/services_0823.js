const path = require('path');
const fs = require('fs');
const { confirmDir } = require('./utils.js');
const vscode = require('vscode');

const { info } = console;

const Defer = require('./defer.js');

/**
 * 
 * @param {*} basePath  项目根目录/.mxDev/ 
 * @returns 
 */
function createServices(basePath) {
    const w = vscode.window, ws = vscode.workspace;

    /**
    * @type {vscode.TextEditor}
    */
    let activeEditor = vscode.window.activeTextEditor;
    /**
     * @type {vscode.TextEditor}
     */
    let lastActiveEditor;
    let willCloseFile;

    let closeDefer;
    /**
     * 关闭一个mx dev打开的editor
     * @param {vscode.TextEditor} editor 
     */
    function closeMxEditor(editor) {
        closeDefer = new Defer();
        if (activeEditor && activeEditor === editor) {
            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            closeDefer.resolve();
        } else if (editor) {
            /**
             * 先active这个editor,再关闭,这样操作会造成闪烁
             * mx dev打开的editor都在vscode.ViewColumn.Two的位置
             */
            vscode.commands.executeCommand('vscode.open', editor.document.uri, vscode.ViewColumn.Two);
            willCloseFile = editor.document.fileName;
        }

        return closeDefer;
    }

    
    w.onDidChangeActiveTextEditor(function (textEditor) {
        lastActiveEditor = activeEditor;
        activeEditor = textEditor;

        /**
         * 切换editor或者editor blur都关闭mxDevEditingEditor
         * 这样不好,万一是切换到别处找资料呢?
         */
        // if (mxDevEditingEditor && mxDevEditingEditor !== activeEditor) {
        //     closeMxEditor(mxDevEditingEditor);
        //     mxDevEditingEditor = null;
        //     editingCb = null;
        // }

        /**
         * 查看是否有需要关闭的editor
         */
        if (willCloseFile && willCloseFile === textEditor.document.fileName) {
            willCloseFile = null;
            vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(_ => {
                if (closeDefer) {
                    closeDefer.resolve();
                }
            })
        }
    });


    /** 
    * 
    * @type {vscode.TextEditor}
    */
    let mxDevEditingEditor;
    /**
     * @type {Function}
     */
    let editingCb;


  
    ws.onDidSaveTextDocument(textDocument => {
        /** 
         * 回调对editAndCloseWhenSave的请求
         */
        if (mxDevEditingEditor && mxDevEditingEditor.document === textDocument) {
            if (editingCb) {
                /** 
                 * 向ws客户端返回编辑的结果 
                 */
                try {
                    editingCb(mxDevEditingEditor.document.getText());
                    //现在改成允许多次保存,多次调用
                    //editingCb();
                } catch (e) {
                    console.error(e);
                }
                //关闭这个editor
                //closeMxEditor(mxDevEditingEditor);
                //mxDevEditingEditor = null;
                //editingCb = null;
            }

        }
    });

    /**
     * @param {String} targetFile 
     */
    // function mxOpenEditor(targetFile) {
    //     let defer;
    //     /**
    //      * 先关闭上一个,也就是最多只能有一个editor
    //      */
    //     if (mxDevEditingEditor) {
    //         defer = closeMxEditor(mxDevEditingEditor);
    //     } else {
    //         defer = new Defer();
    //         defer.resolve();
    //     }


    //     defer.then(_ => {
    //         setTimeout(() => {
    //             /**
    //              * 设置layout为左7右三
    //              */
    //             vscode.commands.executeCommand(
    //                 'vscode.setEditorLayout',
    //                 { orientation: 0, groups: [{ groups: [{}], size: 0.7 }, { groups: [{}], size: 0.3 }] }
    //             );

    //             vscode.workspace.openTextDocument(vscode.Uri.file(targetFile).with({ scheme: 'file' })).then(document => {
    //                 return vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
    //             }).then(editor => {
    //                 mxDevEditingEditor = editor;
    //             })
    //         }, 100);
    //     });
    // }

    function mxOpenEditor(targetFile) {
        const oldMxDevEditingEditor = mxDevEditingEditor;
        setTimeout(() => {
            /**
             * 设置layout为左7右三
             */
            vscode.commands.executeCommand(
                'vscode.setEditorLayout',
                { orientation: 0, groups: [{ groups: [{}], size: 0.7 }, { groups: [{}], size: 0.3 }] }
            );

            vscode.workspace.openTextDocument(vscode.Uri.file(targetFile).with({ scheme: 'file' })).then(document => {
                /**
                 * vscode对于同一个文件,使用同一个editor对象
                 * 不同的文件,使用不同的editor
                 * 但都在vscode.ViewColumn.Two这个位置切换,不会新打开一个editor,
                 * 这样程序也更稳定,用旧的mxOpenEditor方法,webview panel很容易崩溃
                 */
                return vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
            }).then(editor => {
                mxDevEditingEditor = editor;
                if (oldMxDevEditingEditor) {
                    //info(oldMxDevEditingEditor === mxDevEditingEditor);
                    //closeMxEditor(oldMxDevEditingEditor);
                }
            })
        }, 0);
    }

    /**
     * 定义开放给webview的方法
     */
    let s = {
        /** 
         * 展示vue代码 
         */
        showCode(code, cb) {
            const targetFile = path.join(basePath, 'result.vue');
            info(targetFile);
            try {
                //确保文件所在目录已经创建
                confirmDir(targetFile);
                //写入文件
                fs.writeFileSync(targetFile, code);
                //展示此文件
                mxOpenEditor(targetFile);
                //vscode.commands.executeCommand('vscode.open', vscode.Uri.file(targetFile).with({ scheme: 'file' }), vscode.ViewColumn.Two);
            } catch (e) {
                console.error(e);
            }

            /**
             * 空参数调用,表示多次返回结束
             */
            cb();
        },
        /**
         * 编辑代码片段,一旦editor保存,就关闭editor,并返回结果
         * @param {String} code 
         * @param {String} type 
         * @param {function} cb 
         */
        editAndCloseWhenSave(code, type, cb) {
            /**
             * 客户端每回调一次,就结束上一次的调用
             */
            if (editingCb != null) {
                try {
                    //结束上一次的调用
                    editingCb();
                } catch (e) {
                    console.info(e);
                }
            }

            info('type:', type);
            type = type.toLowerCase();
            let targetFile;
            if (type === 'object' || type === 'function' || type === 'array') {
                targetFile = path.join(basePath, 'editing.js');
            } else if (type === 'css' || type === 'style') {
                targetFile = path.join(basePath, 'editing.css');
            } else if (type === 'html' || type === 'template') {
                targetFile = path.join(basePath, 'editing.html');
            }

            confirmDir(targetFile);
            fs.writeFileSync(targetFile, code);

            //将editingCb这次为这一次调用
            editingCb = cb;

            mxOpenEditor(targetFile);
        },

        test0() {
            if (lastActiveEditor) {
                info(lastActiveEditor.document.fileName);
                closeMxEditor(lastActiveEditor).then(_ => {
                    info('closed');
                })
            }
        }
    }

    /**
     * 将所有的服务方法改成异步的
     */
    for (let n in s) {
        const f = s[n];
        s[n] = function () {
            setTimeout(() => {
                f.apply(null, [...arguments]);
            }, 0);
        }
    }

    info(s);

    return s;
}


module.exports = createServices;