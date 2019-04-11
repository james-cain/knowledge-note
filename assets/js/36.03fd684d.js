(window.webpackJsonp=window.webpackJsonp||[]).push([[36],{202:function(t,e,r){"use strict";r.r(e);var n=r(0),a=Object(n.a)({},function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"content"},[t._m(0),t._v(" "),t._m(1),t._v(" "),r("p",[t._v("Nexus:"),r("a",{attrs:{href:"https://help.sonatype.com/repomanager3",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://help.sonatype.com/repomanager3"),r("OutboundLink")],1)]),t._v(" "),r("p",[t._v("Verdaccio:"),r("a",{attrs:{href:"https://help.sonatype.com/repomanager3",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://github.com/verdaccio/verdaccio"),r("OutboundLink")],1)]),t._v(" "),r("p",[t._v("Cnpm:"),r("a",{attrs:{href:"https://github.com/cnpm/cnpmjs.org",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://github.com/cnpm/cnpmjs.org"),r("OutboundLink")],1)]),t._v(" "),r("p",[t._v("Sinopia:"),r("a",{attrs:{href:"https://github.com/cnpm/cnpmjs.org",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://github.com/rlidwka/sinopia"),r("OutboundLink")],1)]),t._v(" "),t._m(2),t._v(" "),t._m(3),t._v(" "),r("p",[t._v("Nexus具有三种代理方式：")]),t._v(" "),r("p",[t._v("代理（Proxying npm Registries）")]),t._v(" "),r("p",[t._v("内部私服（Private npm Registries）")]),t._v(" "),r("p",[t._v("混合式（Grouping npm Registries）")]),t._v(" "),t._m(4),t._v(" "),r("ol",[r("li",[r("p",[t._v("下载tar包： "),r("a",{attrs:{href:"https://help.sonatype.com/repomanager3/download",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://help.sonatype.com/repomanager3/download"),r("OutboundLink")],1)])]),t._v(" "),t._m(5),t._v(" "),t._m(6),t._v(" "),r("li",[r("p",[t._v("浏览器访问 "),r("a",{attrs:{href:"http://localhost:8081/",target:"_blank",rel:"noopener noreferrer"}},[t._v("http://localhost:8081/"),r("OutboundLink")],1)])]),t._v(" "),t._m(7)]),t._v(" "),t._m(8),t._v(" "),r("ol",[t._m(9),t._v(" "),r("li",[r("p",[t._v("终端设置npm代理，cmd中： npm config set registry "),r("a",{attrs:{href:"http://localhost:8081/repository/npm-all/",target:"_blank",rel:"noopener noreferrer"}},[t._v("http://localhost:8081/repository/npm-all/"),r("OutboundLink")],1),t._v(" 也可以npm config edit，编辑npm的配置文件，添加： registry = "),r("a",{attrs:{href:"http://localhost:8081/repository/npm-all/",target:"_blank",rel:"noopener noreferrer"}},[t._v("http://localhost:8081/repository/npm-all/"),r("OutboundLink")],1)])]),t._v(" "),t._m(10),t._v(" "),r("li",[r("p",[t._v("方法一：用户登录认证 npm login --registry=http://localhost:8081/repository/npm-internal/。更多关于此点的可以查看npm的文档： "),r("a",{attrs:{href:"https://docs.npmjs.com/cli/adduser",target:"_blank",rel:"noopener noreferrer"}},[t._v("https://docs.npmjs.com/cli/adduser"),r("OutboundLink")],1)]),t._v(" "),r("p",[t._v("方法二：授权认证。 echo -n ‘admin:admin123’ | openssl base64（windows中： c:\\certutil /encode in.txt out.txt ），得到一串base64字符串。在npm配置中，添加：")]),t._v(" "),t._m(11)]),t._v(" "),t._m(12)]),t._v(" "),t._m(13),t._v(" "),r("p",[t._v("除了install、publish、deprecate等功能外，可以自己创建权限，用户统一管理")]),t._v(" "),r("p",[t._v("以上资料参照：")]),t._v(" "),r("p",[t._v("https://help.sonatype.com/repomanager3/quick-start-guide---proxying-maven-and-npm")]),t._v(" "),r("p",[t._v("https://help.sonatype.com/repomanager3/node-packaged-modules-and-npm-registries")])])},[function(){var t=this.$createElement,e=this._self._c||t;return e("h1",{attrs:{id:"用sonatype3搭建npm私服"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#用sonatype3搭建npm私服","aria-hidden":"true"}},[this._v("#")]),this._v(" 用sonatype3搭建npm私服")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"先安利几个不同方案的私服方案"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#先安利几个不同方案的私服方案","aria-hidden":"true"}},[this._v("#")]),this._v(" 先安利几个不同方案的私服方案")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"接下来介绍nexus方式搭建私服"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#接下来介绍nexus方式搭建私服","aria-hidden":"true"}},[this._v("#")]),this._v(" 接下来介绍Nexus方式搭建私服")])},function(){var t=this.$createElement,e=this._self._c||t;return e("blockquote",[e("p",[this._v("Nexus是一个私服创建系统，支持跨平台，可以创建maven、docker、npm、gradle等多种私服库。目前有version 2和3两个版本，3版本自带支持npm库创建。")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"nexus安装（以macos为例）"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#nexus安装（以macos为例）","aria-hidden":"true"}},[this._v("#")]),this._v(" Nexus安装（以macos为例）")])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("解压tar –xzvf nexus-3.12.1-01-mac.tgz 解压成功后会生成两个文件夹，一个是nexus- 3.12.1-01 另外一个是sonatyoe-work，记得对这两个文件做一些授权处理")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("cd nexus- 3.12.1-01  执行： ./bin/nexus run")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("登录以及改密码")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"私服使用"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#私服使用","aria-hidden":"true"}},[this._v("#")]),this._v(" 私服使用")])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("Nexus服务器上，创建三种仓库")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("npm --loglevel info install async")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("email=you@example.com\n\nalways-auth=true\n\n_auth=base64字符串\n\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("发布包 npm publish --registry http://localhost:8081/repository/npm-internal/或者在package.json中，增加配置：")]),this._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v('"publishConfig" : { \n\t"registry" : "http://localhost:8081/repository/npm-internal/" \n},\n')])])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"更多复杂的功能可以看官网"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#更多复杂的功能可以看官网","aria-hidden":"true"}},[this._v("#")]),this._v(" 更多复杂的功能可以看官网")])}],!1,null,null,null);e.default=a.exports}}]);