# mxDev
Interactive development tools for javascript web project ,such as vue react

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ui界面的开发设计，如果有可视化设计工具的帮助，无疑会起到事半功倍的效果。在web项目组件化的时代。一款优秀的可视化工具会在概要设计，网站总体设计，交互设计，业务逻辑实现，api测试等方面带来巨大的效率提升。MxDev辅助设计工具致力于帮助设计开发人员更好，更快的进行设计开发，为有效降低软件企业设计开发成本，提高软件质量稳定性，缩短软件交付时间贡献力量。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mxDev是一款面向vue和react技术的辅助设计工具，其重要特性有：

### 一．	特点 ###

1.	工具以vscode插件方式展现，和vscode编程无缝结合
2.  **任意拖拽，实时展示**
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;控件可由组件候选区拖拽到主编辑区，也可在主编辑区的不同父组件之间来回拖拽，将来更可和组件树之间进行拖拽。
主编辑器区的效果即真实页面的展示效果，不是模拟出来的，可以直接和组件进行人机交互。就目前来说，就已经非常适合进行页面原型设计，未来进一步完善后，更可以用来辅助业务细节实现。
3.	组件属性即时修改，视图效果即时生效。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因为采用了先进的组件显示技术，即使对层次较深的组件进行属性修改，视图刷新速度也会保持飞快。
4.	完善的组件属性编辑支持，包括属性类型及属性说明提示等
5.	支持html标签和vue第三方库标签<br>


### 二．	不同区域说明 ###

**1.	组件候选区**<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;主要支持将html和vue第三方库的组件以图表方式罗列展示，并支持拖拽到右边的主编辑器区。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目前只支持html &lt;DIV&gt;和element-ui绝大部分组件，未来还会完善html标签支持，支持slot，支持chart等第三方组件。

**2.	属性编辑区**<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当在主编辑区单击一个组件的时候，会选中这个组件，在状态条上会显示这个组件的编辑id，编辑id的结构为：“组件类型名-sequence”，属性编辑区也会展现其所有的属性和当前值，可以在属性表格上直接修改属性值。属性值被修改之后是处于dirty状态的，需要点击一下表格右上角的保存按钮才能将修改同步刷新到视图。注意处于dirty状态的属性在其名称后面会有一个*。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当单击属性名称的时候，会展示这个组件属性的相应帮助文档。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当前只支持number，string和boolean类型属性的编辑，其他类型会在下一个大版本中予以支持。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在近期计划中（1）还会陆续支持v-for，v-if，v-model等directive和组件内联样式表等特殊属性的编辑 （2）支持组件事件绑定。

**3.	主编辑器**<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;主编辑器就是展现页面的部分，MxDev在实现主编辑器的时候就是在每个组件外面做了一层薄薄的控件封装，所以主编辑区展现的效果基本上就是项目页面的实际效果。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;主编辑器的组件同样可以随意拖拽，拖拽时也需要和target进行匹配，如果不能匹配是无法激发黄色闪烁效果的。有的输入组件，输入焦点触发和拖拽控制相互冲突，所以在主编辑区要想直接输入某些组件，比如输入input，需要先双击这个组件以屏蔽拖拽并触发输入焦点。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*注意：当目前为止，因为尚不能绑定v-model，所以输入之后仍然是没有效果的*<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;有些组件比如el-table-column被拖拽到el-table后就无法被选中，有的组件比如el-divider本身就屏蔽click事件，也无法被选中，在即将出现的下一个版本中，会用组件树的形式来解决这个问题。<br>

**4.	操作按钮**<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;清空：清空主编辑器区所有组件<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;删除：删除当前选中组件及其子组件<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;code：生成vue文件，并使用vscode的editor来进行展示。这个文件可以手动拷贝到source文件夹下，并换名保存。

### 三．	拖拽说明 ###
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;拖拽是图形化设计工具进行人机交互时的灵魂，mxDev工具在拖拽控制上更是做到了细致贴心。<br>

1. 拖拽对象分为dragSource和dropTarget，source和target必须匹配。比如el-col图标只能拖拽到el-row组件内部或其他兄弟el-col组件旁边，其他组件内部是拖拽不进去的。
2. 拖拽分为“拖拽到内部”和“拖拽到旁边”<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;拖拽source到target内部时，被拖拽进入的target组件会呈现“黄色闪烁”的样式，当拖拽到target组件的任意一个边的时候，target的这个边会出现“黄色闪烁”的样式。
3. 拖拽到内部分为两种情况<br>
(1)  source图标比target要小，直接拖拽进内部即可<br>
(2)  source图标比target要大，可以使用“四角进入”拖拽，所谓四角进入，就是source图标或组件的任意一个角（corner）和target对应的角重合的方式(source的角进入到target的角)进行拖拽。<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;个别组件在编辑器区展示时尺寸比较狭窄，拖拽时要有耐心，直到目标父组件呈现黄色闪烁样式的时候，松开鼠标完成拖拽。     




