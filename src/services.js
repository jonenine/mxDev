const path = require('path');
const fs = require('fs');
const { Defer, confirmDir, undef, info, thenOrUntil, asyncSleep } = require('./utils.js');
const vscode = require('vscode');

/**
 * 
 * @param {*} basePath  项目根目录/.mxDev/ 
 * @returns 
 */
function createServices(basePath) {
    const w = vscode.window, ws = vscode.workspace;

    /**
     * vscode当前active的editor,因为webview不属于editor的的原因,这个值可能是undev
     * @type {vscode.TextEditor}
     */
    let activeEditor = vscode.window.activeTextEditor;
    /**
     * 目前没用
     * @type {vscode.TextEditor}
     */
    let lastActiveEditor;


    let willCloseFile;
    let closeDefer;
    /**
     * 关闭一个mx dev打开的editor
     * @param {vscode.TextEditor} editor 
     */
    async function closeEditor(editor) {
        if (!editor) {
            return Defer.reslovedDefer().promise;
        }

        closeDefer = new Defer();
        if (activeEditor && activeEditor === editor) {
            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            closeDefer.resolve(true);
        } else {
            /**
             * 先active这个editor,再关闭,这样操作会造成闪烁
             * mx dev打开的editor都在vscode.ViewColumn.Two的位置
             */
            vscode.commands.executeCommand('vscode.open', editor.document.uri, vscode.ViewColumn.Two);
            willCloseFile = editor.document.fileName;
        }

        return closeDefer.promise;
    }

    /**
      * 配合{@link closeEditor}方法,将切换过来的willCloseFile editor关掉
      * 当切换到webview的时候,textEditor会返回undefined
      */
    w.onDidChangeActiveTextEditor(function (textEditor) {
        lastActiveEditor = activeEditor;
        activeEditor = textEditor;

        /**
         * 查看是否有需要关闭的editor
         */
        if (willCloseFile && willCloseFile === textEditor.document.fileName) {
            willCloseFile = null;
            vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(_ => {
                if (closeDefer) {
                    closeDefer.resolve(true);
                }
            })
        }
    });


    /** 
    * 
    * @type {vscode.TextEditor}
    */
    let editingEditor;
    /**
     * @type {Function}
     */
    let editingReply;

    /**
     * 结束上一次编辑请求的回调
     * @param {boolean} shouldCloseEditor
     */
    async function closeLastEditing(shouldCloseEditor = true) {
        let defer = Defer.reslovedDefer().promise;
        /**
         * 客户端每回调一次,就结束上一次的调用
         */
        if (editingReply != null) {
            try {
                //结束上一次的调用(空参数调用表示结束请求)
                editingReply();
            } catch (e) {
                console.info(e);
            }
            editingReply = null;
            /**
             * 结束上一个编辑器,否则用户可能会切换回上一个编辑器继续编辑,但这个编辑已经close是无效的
             */
            if (shouldCloseEditor) {
                defer = closeEditor(editingEditor)
            }
            editingEditor = null;
        }

        return defer;
    }

    /**
     * 当对vscode编辑的代码进行保存时,将修改过的代码回传到请求端(回调)
     */
    ws.onDidSaveTextDocument(textDocument => {
        if (editingEditor && editingEditor.document === textDocument) {
            /** 
             * 向ws客户端返回编辑的结果 
             */
            try {
                editingReply(editingEditor.document.getText());
            } catch (e) {
                console.error(e);
            }
        }
    });


    /**
     * 当关闭正在编辑的文档的时候,结束编辑请求
     * 这个只有手动打开的文件关闭时才可以相应
     * 同样判断不出来的还有docuemnt.isclose
     */
    ws.onDidCloseTextDocument(textDocument => {
        // info('----close-----', textDocument.fileName, editingEditor);
        // if (editingEditor && editingEditor.document === textDocument) {
        //     closeLastEditing(false);
        // }
    });

    function holdLayout() {
        /**
         * 设置layout为左7右三
         */
        return vscode.commands.executeCommand(
            'vscode.setEditorLayout',
            { orientation: 0, groups: [{ groups: [{}], size: 0.7 }, { groups: [{}], size: 0.3 }] }
        );
    }


    /**
     * 打开vscode编辑器
     */
    async function openEditor(targetFile) {
        const defer = new Defer();

        //代开指定文件到编辑器
        vscode.workspace.openTextDocument(vscode.Uri.file(targetFile).with({ scheme: 'file' })).then(document => {
            /**
             * vscode对于同一个文件,使用同一个editor对象
             * 不同的文件,使用不同的editor
             * 但都在vscode.ViewColumn.Two这个位置切换,不会新打开一个editor,
             */
            return vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
        }).then(editor => {
            defer.resolve(editor);
        });

        return defer.promise;
    }

    const services = {

        infoMessage() {
            const args = [...arguments];
            const reply = args.pop();
            w.showInformationMessage(args.join(''));
            reply();
        },

        errorMessage() {
            const args = [...arguments];
            const reply = args.pop();
            w.showErrorMessage(args.join(''));
            reply();
        },

        warningMessage() {
            const args = [...arguments];
            const reply = args.pop();
            w.showWarningMessage(args.join(''));
            reply();
        },

        /**
         * vscode输入框,这个视觉效果很差,不要使用
         * @param {*} value   值 
         * @param {*} prompt  提示
         * @param {*} reply 
         */
        inputBox(value, prompt, reply) {
            w.showInputBox({ value, prompt }).then(res => {
                res && reply(res + '');
                reply();
            });
        },

        /** 
         * 展示vue代码 
         * 将被扩展为1.写回文件 2.合并代码
         */
        async showCode(code, reply) {
            const targetFile = path.join(basePath, 'result.vue');
            //确保文件所在目录已经创建
            confirmDir(targetFile);
            //写入文件
            fs.writeFileSync(targetFile, code);
            //空参数调用,表示结束请求
            reply();
            await holdLayout();
            await asyncSleep(150);
            //打开一个editor用于展示此文件(编辑功能无效)
            await openEditor(targetFile);
            //vscode.commands.executeCommand('vscode.open', vscode.Uri.file(targetFile).with({ scheme: 'file' }), vscode.ViewColumn.Two);
        },

        /**
         * 请求编辑一段代码片段,插件会打开一个编辑器
         * @param {String} code 
         * @param {String} type 
         * @param {function} reply 
         */
        async requestForEdit(code, type, reply) {
            if (undef(code)) code = '';

            //info('type:', type, 'code', code);
            type = type.toLowerCase();
            let targetFile;
            if (type === 'object' || type === 'function' || type === 'array') {
                targetFile = path.join(basePath, 'editing.js');
            } else if (type === 'css' || type === 'style') {
                targetFile = path.join(basePath, 'editing.css');
            } else if (type === 'html' || type === 'template') {
                targetFile = path.join(basePath, 'editing.html');
            }
            //确保文件所在目录已经创建
            confirmDir(targetFile);
            //将要编辑的代码写入文件
            fs.writeFileSync(targetFile, code);

            //结束上一次的编辑
            await closeLastEditing();
            //确定layout
            await holdLayout();
            await asyncSleep(300);
            //设置当前返回函数
            editingReply = reply;
            //打开文件,待返回时设置当前编辑器
            editingEditor = await openEditor(targetFile);
            await asyncSleep(300);
            await holdLayout();
        },

        /**
         * propsGridEditor切换active control的时候
         */
        async onPropsGridEditorUpdated() {
            //属性编辑器已经刷新,当前editing已经无效,关闭
            const closeSomething = await closeLastEditing();
            if (closeSomething) {
                //保持layout
                await holdLayout();
            }
        },

        test0() {
            w.showInformationMessage("仅在内部测试使用");
        }
    }


    /**
     * 对服务的请求
     */
    class Request {
        /**
         * 重试次数
         */
        retryTime = 0;

        /**
         * @param {function} run 
         */
        constructor(run) {
            this.run = run;
        }
    }

    /**
     * 请求(任务)队列
     */
    const requestQueue = {
        /**
         * 任务队列
         */
        queue: [],

        /**
         * 运行状态
         */
        running: false,

        /**
         * 向队列添加一个请求
         * @param {function} func
         * @param  args
         */
        addRequest(func, args) {
            const me = this;
            this.queue.push(new Request(function () {
                try {
                    const res = func.apply(null, args);
                    if (res && res.then) {
                        thenOrUntil(res, 2000).catch(e => {
                            /**
                             * 注意这个this指向Request对象
                             */
                            me.handleError(this, e);
                        }).finally(() => {
                            me.execNextRequest();
                        });

                        return;
                    }

                    /**
                     * 返回非thennble
                     */
                    me.execNextRequest();
                } catch (e) {
                    me.handleError(this, e);
                    me.execNextRequest();
                }
            }));
            return this;
        },


        delay: 150,

        /**
         * 执行下一个任务
         */
        execNextRequest() {
            this.running = true;
            /**
             * @type {Request}
             */
            const request = this.queue.shift();
            if (request) {
                if (request.retryTime == 0 && this.queue.length > 1) {
                    /**
                     * 过多的请求直接cancel掉,极大的提高webview的稳定性
                     */
                    this.queue.length = 0;
                    this.running = false;

                    w.showWarningMessage("过多的请求!,已经取消");
                }else{
                    setTimeout(() => {
                        //指定了this为reuqest
                        request.run();
                        this.delay = 150;
                    }, this.delay);
                }
            } else {
                this.running = false;
            }
        },


        /**
         * @param {Error} e 
         */
        handleError(request, e) {
            w.showErrorMessage(e.message);
            /**
             * 出现错误时增加延时,减少webview崩溃几率
             */
            this.delay = 6000;
            /**
             * 小于最大重试次数就将任务重新放在队列前面
             */
            if (++request.retryTime < this.maxRetryTime) {
                this.queue.unshift(request);
            }
        },
        /**
         * 最大重试此时
         */
        maxRetryTime: 3,


        /**
         * 执行整个任务队列
         */
        tryStart() {
            /**
             * 如果没有运行,就运行起来
             */
            !this.running && this.execNextRequest();
        }
    }


    /**
     * 直接调用改成异步的任务队列模式
     * 一个任务在没有真正完成之前(promise.finally),是不会执行下一个任务的,没有得到执行的任务会在队列中排队
     */
    for (let n in services) {
        const f = services[n];
        services[n] = function () {
            requestQueue.addRequest(f, [...arguments]).tryStart();
        }
    }

    return services;
}


module.exports = createServices;