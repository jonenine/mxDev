
/**
 * 可以用来验证vscode的各种功能
 */

const vscode = require('vscode');
/**
 *  
 * @param {vscode.ExtensionContext} context 
 * @param {*} services
 */
module.exports = function (context,services) {
	context.subscriptions.push(vscode.commands.registerCommand('mxdev.test', function () {
		//vscode.window.showInformationMessage('测试一下');

        services.test0();
	}));
}