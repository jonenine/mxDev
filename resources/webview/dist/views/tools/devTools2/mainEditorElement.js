!function(e){function t(t){for(var r,a,c=t[0],l=t[1],u=t[2],f=0,s=[];f<c.length;f++)a=c[f],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&s.push(o[a][0]),o[a]=0;for(r in l)Object.prototype.hasOwnProperty.call(l,r)&&(e[r]=l[r]);for(d&&d(t);s.length;)s.shift()();return i.push.apply(i,u||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],r=!0,c=1;c<n.length;c++){var l=n[c];0!==o[l]&&(r=!1)}r&&(i.splice(t--,1),e=a(a.s=n[0]))}return e}var r={},o={4:0},i=[];function a(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=r,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="";var c=window.webpackJsonp=window.webpackJsonp||[],l=c.push.bind(c);c.push=t,c=c.slice();for(var u=0;u<c.length;u++)t(c[u]);var d=l;i.push([222,0]),n()}({16:function(e,t,n){"use strict";n.d(t,"b",(function(){return h})),n.d(t,"j",(function(){return v})),n.d(t,"g",(function(){return y})),n.d(t,"i",(function(){return _})),n.d(t,"c",(function(){return b})),n.d(t,"a",(function(){return w})),n.d(t,"h",(function(){return T})),n.d(t,"e",(function(){return C})),n.d(t,"d",(function(){return D})),n.d(t,"f",(function(){return O}));var r=n(12),o=n.n(r),i=n(4),a=n.n(i),c=n(2),l=n.n(c),u=n(0),d=n.n(u),f=n(26),s=n(23),p=n(14);console.info;function h(e){return function(){var t=this,n=arguments,r=d.a.Deferred(),o=this.refreshRoot.allUIRefreshedDeferred;return o?o.then((function(){e.call.apply(e,[t,r].concat(Array.prototype.slice.call(n)))})):e.call.apply(e,[this,r].concat(Array.prototype.slice.call(arguments))),r}}function v(e){return null==e}var g=document.body;function y(e,t){for(var n=0,r=e.children.length;n<r;n++){if(!1===y(e.children[n],t))return!1}return t(e)}function m(e,t){for(var n=0,r=e.length;n<r;n++){var o=e[n];if(!t(o))return!1;if(!1===m(o.children,t))return!1}}function _(e){y(e,(function(e){!function(e){var t=d()(e.vue.$el).data("mx-dropTargetHandler");t&&t.unregister()}(e),function(e){try{e.vue.$destroy()}catch(e){console.error(e)}try{var t=e.vue.$el;g.contains(t)&&d()(t).remove()}catch(e){console.error(e)}delete e.vue,delete e.refreshRoot,delete e.allUIRefreshedDeferred}(e)}))}function b(e,t){var n=this;delete t.parent;var r=this.children.indexOf(t);if(r>=0){this.children.splice(r,1);var o=this.refreshRoot.vue;o.$forceUpdate(),o.$nextTick((function(){n.refreshRoot.allUIRefreshedDeferred.then((function(){e.resolve(t)}))}))}else e.resolve();return e}function w(e,t,n,r){for(var o=this,i=this;null!=i;){if(i===t)return console.warn("不能将"+t.refId+"appendTo自己的子代"+this.refId),e.resolve(),e;i=i.parent}"boolean"==typeof n&&(r=n,n=null),v(r)&&(r=!0);var a=-1;if(n&&(a=this.children.indexOf(n))<0)throw"要插入的前驱节点不存在";var c=this.children.indexOf(t);if(c>-1){var l=a<0?this.children.length-1:a+1;if(c===l)return console.warn("children"+t.refId+"已经在parent"+this.refId+"的位置"+l),e.resolve(),e}return(t.vue&&t.parent?t.parent.removeChild(t).then((function(){r&&t===t.refreshRoot||_(t)})):d.a.Deferred().resolve()).then((function(){a>-1&&(a=o.children.indexOf(n)),r&&t.isRefreshRoot?t.__renderAsRefreshRoot=!0:t.refreshRoot=o.refreshRoot,a>-1?o.children.splice(a+1,0,t):o.children.push(t);var i=o.refreshRoot.vue;i.$forceUpdate(),i.$nextTick((function(){o.refreshRoot.allUIRefreshedDeferred.then((function(){delete t.__renderAsRefreshRoot,m([t],(function(e){!function(e){var t=d()(e.vue.$el),n=t.data("mx-dropTargetHandler");if(!n||n.dropTargetSite.__proto__!==p.a)return!1;var r=t.data("mx-dragGroupNames");n.unregister();var o=e.parent,i=void 0,a=void 0;i=o.children.length&&(a=o.children.indexOf(e))?o.children[a-1]:o;var c=d()(i.vue.$el).data("mx-dropTargetHandler");n.dropTargetSite.registerDropTarget(n,r,c)}(e)})),e.resolve(t)}))}))})),e}function T(e,t){var n=e.options.props;for(var r in t=t?l()({},t):{},n)if(!t[r]){var o=n[r];if("object"===(void 0===o?"undefined":a()(o))){var i=o.default,c=o.type;if(c){c instanceof Array||(c=[c]);for(var u=0,d=c.length;u<d;u++){var f=c[u];if("function"==typeof i&&f!==Function&&(i=i.call()),i instanceof f){t[r]=i;break}}}else i&&(t[r]=i)}}return t.style=t.style||null,t.class=t.class||null,t}function C(e,t,n,r){var o=t.controlConfig;o.editorName=e.editorName,o.belongDropTargetSite=e.belongDropTargetSite;var i=void 0;if(t.state<10)i=e.appendChild(o,null,!0);else{var a=e.parent;if(a)if(12===t.state||13===t.state)o!==e&&(i=a.appendChild(o,e,!0));else{var c=a.children.indexOf(e);if(c>=1){var l=a.children[c-1];o!==l&&(i=a.appendChild(o,l,!0))}else i=a.appendChild(o,null,!0)}}return i||(i=d.a.Deferred()).resolve(),i.then((function(){m([o],(function(e){e.editorName=o.editorName,e.belongDropTargetSite=o.belongDropTargetSite}))})),i}function D(e,t){if(e.controlConfig&&e.controlConfig instanceof s.a)return e;if(e.createdInstance){var n=e.createdInstance,r=n.tag,o=n.initProps,i=n.otherConfig,a=n.dragDropConfig,c=t.createComponentControlConfig(r,o,i,a);return c.dragDropConfig=a,e.controlConfig=c,e}}function O(e,t,n){var r=e+"Editor",i=new s.a(r,{options:{name:"div"}},null,{renderVnode:function(e,i,a){var c=this,u=Object(f.a)({vue:function(){return c.vue},dropToTarget:function(e,t,r){e=D(e,n),C(c,e).then((function(){n.fireListener("configUpdate")}))},isComponent:!1,needInput:!1,isDragSource:!1,dropTargetFlag:1,belongDropTargetSite:t}).createControlAttr(),d=this.configData,s=l()({width:"100%",height:"100%",overflow:"auto"},d.style||{});return d.class&&(u.class=d.class),e("div",o()([u,{ref:r,key:r,style:s}]),[a])},class:"editor"});return i.editorName=e,i.belongDropTargetSite=t,i}},222:function(e,t,n){"use strict";n.r(t);var r=n(4),o=n.n(r),i=n(42);window["views/tools/devTools2/mainEditorElement"]=function(e){var t=arguments,n=Vue.extend(i.default),r=void 0;if(i&&(r=i.init))"object"===(void 0===r?"undefined":o()(r))?new n(r).$mount(e):"function"==typeof r&&(r=r.apply(null))instanceof Object&&(r.then&&r.catch?r.then((function(){(new(Function.prototype.bind.apply(n,[null].concat(Array.prototype.slice.call(t))))).$mount(e)})).catch((function(e){document.innerHTML=e+""})):new n(r).$mount(e));else(new n).$mount(e)}},24:function(e,t,n){var r=n(20),o=n(118);"string"==typeof(o=o.__esModule?o.default:o)&&(o=[[e.i,o,""]]);var i={insert:"head",singleton:!1};r(o,i);e.exports=o.locals||{}},3:function(e,t,n){"use strict";function r(e,t,n,r,o,i,a,c){var l,u="function"==typeof e?e.options:e;if(t&&(u.render=t,u.staticRenderFns=n,u._compiled=!0),r&&(u.functional=!0),i&&(u._scopeId="data-v-"+i),a?(l=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},u._ssrRegister=l):o&&(l=c?function(){o.call(this,(u.functional?this.parent:this).$root.$options.shadowRoot)}:o),l)if(u.functional){u._injectStyles=l;var d=u.render;u.render=function(e,t){return l.call(t),d(e,t)}}else{var f=u.beforeCreate;u.beforeCreate=f?[].concat(f,l):[l]}return{exports:e,options:u}}n.d(t,"a",(function(){return r}))},30:function(e,t,n){"use strict";t.__esModule=!0;var r=i(n(11)),o=i(n(83));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function e(t,n,i){null===t&&(t=Function.prototype);var a=(0,o.default)(t,n);if(void 0===a){var c=(0,r.default)(t);return null===c?void 0:e(c,n,i)}if("value"in a)return a.value;var l=a.get;return void 0!==l?l.call(i):void 0}},32:function(e,t,n){e.exports={default:n(46),__esModule:!0}},37:function(e,t,n){e.exports={default:n(84),__esModule:!0}},39:function(e,t,n){e.exports={default:n(45),__esModule:!0}},4:function(e,t,n){"use strict";t.__esModule=!0;var r=a(n(27)),o=a(n(28)),i="function"==typeof o.default&&"symbol"==typeof r.default?function(e){return typeof e}:function(e){return e&&"function"==typeof o.default&&e.constructor===o.default&&e!==o.default.prototype?"symbol":typeof e};function a(e){return e&&e.__esModule?e:{default:e}}t.default="function"==typeof o.default&&"symbol"===i(r.default)?function(e){return void 0===e?"undefined":i(e)}:function(e){return e&&"function"==typeof o.default&&e.constructor===o.default&&e!==o.default.prototype?"symbol":void 0===e?"undefined":i(e)}},42:function(e,t,n){"use strict";n.r(t),n.d(t,"mainEditorAgent",(function(){return y}));var r=function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticStyle:{height:"100%","background-color":"rgb(238, 238, 238)"}},[t("div",{ref:"mainEditor"})])};r._withStripped=!0;var o=n(2),i=n.n(o),a=n(0),c=n.n(a),l=n(33),u=n(34),d=n(14),f=n(23),s=n(1),p=n(9),h=n(60),v=n(61),g=n(15);Vue.directive("dragger",l.a),Vue.directive("customDragger",u.a),Vue.directive("drop-target",d.b);console.info;var y={props:{height:Number,width:Number},methods:{getFrameElement:function(){return this.$refs.frame0},changeResolution:function(e,t){c()(this.getFrameElement()).attr({width:e,height:t})},setPropsGridEditorToMainEditorAgent:function(e){Object(s.i)(e,"propsGridEditor",["updatePropGridEditorData"])},setCodeTreeToMainEditorAgent:function(e){Object(s.i)(e,"codeTree",["updateCodeTreeData"])}},mounted:function(){var e=this.getFrameElement();Object(s.n)(e,"mainEditorDropTargetSite","editorDropTargetSiteProxy").el=p.b,Object(s.n)(e,"mainEditor","mainEditorProxy"),Object(s.s)("mainEditorAgent",this),Object(s.n)(e,"coder","coderProxy")},data:function(){return{}},render:function(e){var t=this.width,n=this.height;return e("div",{class:"editorWrapper",style:"overflow:auto;border-top:1px solid darkgray;border-left:1px solid darkgray;"},[e("iframe",{attrs:{src:"./index.html?viewPath=views/tools/devTools2/mainEditorElement"+(g.a?"&remoteService="+g.a:""),height:n,width:t,id:"frame0",frameborder:"0"},ref:"frame0"},["this is iframe"])])}},m={mounted:function(){var e=this.$refs.mainEditor,t=new f.b("main",p.b,e);Object(s.i)(t,"mainEditor"),Object(s.i)(t.dropTargetSites[0],"mainEditorDropTargetSite"),Object(s.i)({code:function(){var e=new v.a(t.rootConfig);return e.parse(),e.vueText()}},"coder");var n=Object(s.n)(window.parent,"propsGridEditor");t.addListener("active",(function(e,t){var r=void 0;if(t&&t.vue&&(r=t.vue.$el)&&c()(r).removeClass("currentControl"),e&&c()(e.vue.$el).addClass("currentControl"),e&&n.updatePropGridEditorData){var o=function(e){if(null!=e){var t=void 0,n=e.componentConstructor.options.name;if(n){var r=Object(s.m)(n);if(t=h.a[r]){t=Object(s.f)(t);var o=e.propsData;t.forEach((function(t){var n=t.types;i()(t,{prop:t.name,propShow:t.name,type:n.join(","),editType:n[0]||"string",value:e.vue[t.name]||o[t.name]}),t.newValue=t.newValue||t.value}))}}return{refId:e.refId,gridData:t}}}(e);n.updatePropGridEditorData(o)}}));var r=Object(s.n)(window.parent,"codeTree");t.addListener("configUpdate",(function(){r.updateCodeTreeData&&r.updateCodeTreeData(t.rootCodeTreeNode)}))}},_=(n(71),n(3)),b=Object(_.a)(m,r,[],!1,null,null,null);b.options.__file="src/views/tools/devTools2/mainEditorElement.vue";t.default=b.exports},71:function(e,t,n){"use strict";var r=n(24);n.n(r).a},73:function(e,t,n){"use strict";n.d(t,"a",(function(){return w}));var r=n(30),o=n.n(r),i=n(8),a=n.n(i),c=n(11),l=n.n(c),u=n(17),d=n.n(u),f=n(18),s=n.n(f),p=n(37),h=n.n(p),v=n(6),g=n.n(v),y=n(5),m=n.n(y),_=(console.info,function(){function e(t,n,r){var o=this;g()(this,e),this.initDefer=null,this.ws=null;var i=new WebSocket(t);this.initDefer=new h.a((function(e,t){i.onopen=function(){o.ws=i,e(i),n&&n(i)},i.onclose=function(){o.close()},i.onmessage=r}))}return m()(e,[{key:"isClose",value:function(){return null===this.initDefer}},{key:"checkNotClose",value:function(){if(!this.initDefer)throw new Error("websocket connection已经关闭")}},{key:"close",value:function(){this.initDefer&&(this.initDefer.then((function(e){e.close(1e3)})),this.ws=null,this.initDefer=null,this.onclose())}},{key:"onclose",value:function(){}},{key:"send",value:function(e){var t=this;return this.checkNotClose(),this.initDefer.then((function(n){try{return t.ws.send(e),n}catch(e){console.error(e),t.close()}}))}}]),e}()),b=(function(e){function t(e,n){g()(this,t);var r=d()(this,(t.__proto__||l()(t)).call(this,e,(function(e){var t=a()({channelId:n});r.send(t)}),(function(e){var t=JSON.parse(e.data),n=t.args;t.channelId;r.onRead.apply(r,n)})));return r.channelId=n,r}s()(t,e),m()(t,[{key:"onRead",value:function(){}},{key:"write",value:function(){var e=a()({__targetId__:"channel",args:[].concat(Array.prototype.slice.call(arguments)),channelId:this.channelId});this.send(e)}}])}(_),new Error("connection closed")),w=function(e){function t(e){g()(this,t);var n=d()(this,(t.__proto__||l()(t)).call(this,e,null,(function(e){var t=JSON.parse(e.data),r=t.res,o=t.callId,i=n.callbackMap[o];i?(i.apply(null,r),r&&r.length||delete n.callbackMap[o]):console.error("callId can't get defer!")})));return n._callSeq=0,n.callbackMap={},n}return s()(t,e),m()(t,[{key:"getService",value:function(e){var t=this._callSeq++,n=this;return function(){var r=[].concat(Array.prototype.slice.call(arguments));n.callbackMap[t]=r.pop();var o=a()({__targetId__:"callService",service:e,args:r,callId:t});n.send(o)}}},{key:"close",value:function(){for(var e in o()(t.prototype.__proto__||l()(t.prototype),"close",this).call(this),this.callbackMap){var n=this.callbackMap[e];n&&n.call(null,b)}this.callbackMap=null}}]),t}(_)},85:function(e,t,n){e.exports={default:n(114),__esModule:!0}}});
//# sourceMappingURL=mainEditorElement.js.map