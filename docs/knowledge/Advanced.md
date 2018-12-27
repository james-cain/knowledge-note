# 进阶学习

## 重点项

性能 安全 视频 linux 算法 编译原理

## 前端方向

界面展现用户体验和可访问性方向、偏后的js/nodejs开发方向、audio/video音视频富媒体方向、SVG/canvas/webGL动效创意表现与数据可视化方向、工具建设文档管理内部站建设的前端运维方向、会议预定团建组织对外品牌宣传的前端运营方向

## 代码类：

https://github.com/james-cain/samples

1.PWA

- workbox（持续学习）

- BoardcastChannel workbox.broadcastUpdate  <https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel>  依赖于webworker（完成）
- Notification 通知 <https://developer.mozilla.org/zh-CN/docs/Web/API/notification>（完成）
- PushManager 消息推送  <https://developer.mozilla.org/zh-CN/docs/Web/API/PushManager>  https://github.com/web-push-libs/web-push（完成）
- https://lavas.baidu.com/ready兼容性列表
- ServiceWorker  涉及到Cache、CacheStorage、ServiceWorkerContainer、ServiceWorkerRegistration、ServiceWorker、ServiceWorkerGlobalScope、Clients、NavigationPreloadManager （完成）
- <https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker> （完成）
- <https://w3c.github.io/ServiceWorker/> （完成）
- <https://github.com/w3c/ServiceWorker> （完成）
- background sync（还不在W3C中） workbox.backgroundSync  https://wicg.github.io/BackgroundSync/spec/（完成）
- <https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps>
- <https://developers.google.com/web/progressive-web-apps/desktop>
- https://so-pwa.firebaseapp.com/

2.性能优化处理

- lighthouse（持续学习）
- <https://webpagetest.org/easy>
- <https://developers.google.com/speed/pagespeed/insights/>
- <https://web.dev/>
- <https://wpostats.com/>
- https://github.com/davidsonfellipe/awesome-wpo
- <https://csstriggers.com/> - css列表，性能相关
- <https://daniel.haxx.se/blog/2018/11/11/http-3/>
- https://duoani.github.io/HTTP-RFCs.zh-cn/
- 骨架屏 https://github.com/michalsnik/vue-content-placeholders（完成）
- lazyload（完成）
- 内存分析

- https://developers.google.com/web/tools/chrome-devtools/memory-problems/

- 性能分析

- <https://developers.google.com/web/tools/chrome-devtools/speed/get-started>
- <https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/>
- <https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference>

- 网络分析

- <https://developers.google.com/web/tools/chrome-devtools/network-performance/>
- https://developers.google.com/web/tools/chrome-devtools/network-performance/reference

- CSP  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP（完成）
- DNS提前解析（完成）
- purifycss（完成）
- <https://github.com/w3c/web-performance>
- https://github.com/jsdom/jsdom
- https://tc39.github.io/ecma262/
- <https://w3c.github.io/preload/>（完成）
- <https://w3c.github.io/resource-hints/>（完成）
- <https://www.w3.org/TR/appmanifest/>
- <https://github.com/indutny/common-shake>
- <https://github.com/JacksonTian/anywhere>
- <https://github.com/developit/microbundle>

- Performance

- <https://w3c.github.io/hr-time/>
- https://github.com/mrdoob/stats.js
- https://github.com/you-dont-need/You-Dont-Need-Momentjs

3.Typescript

- Typescript-Vue-Starter（完成）
- <https://ts.xcatliu.com/>（完成）
- <https://zhongsp.gitbooks.io/typescript-handbook/content/>(完成）
- <https://www.tslang.cn/docs/home.html>（持续学习）
- Js标准自建对象 <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects>
- <https://github.com/DefinitelyTyped/DefinitelyTyped>
- <https://github.com/TypeStrong/ts-loader>
- <https://github.com/vuejs/vue-class-component>（完成）
- <https://github.com/kaorun343/vue-property-decorator>（完成）
- https://github.com/ktsn/vuex-class/（完成）
- https://github.com/jkchao/typescript-book-chinese

4.IntersectionObserver、IntersectionObserverEntry

- <https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver>（完成）
- <https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback>（完成）
- [Window.cancelIdleCallback()](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/cancelIdleCallback)（完成）
- <https://github.com/Akryum/vue-observe-visibility#installation>（完成）
- <https://github.com/russellgoldenberg/scrollama>
- https://github.com/w3c/IntersectionObserver/tree/master/polyfill（完成）

5.sticky

- <https://github.com/dollarshaveclub/stickybits>（完成）

6.storage、vuex持久化

- <https://github.com/james-cain/irondb>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API>（完成）
- https://github.com/james-cain/vue-offline
- <https://github.com/localForage/localForage>
- <https://github.com/dfahlander/Dexie.js>
- <https://github.com/erikolson186/zangodb>
- <https://github.com/jakearchibald/idb-keyval>（完成）
- <https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB>
- <https://www.w3.org/TR/IndexedDB/#introduction>（完成）
- <https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto> 使用加密存储
- <https://github.com/google/leveldb>
- <https://github.com/google/lovefield>
- <https://github.com/kripken/sql.js/> — sqlite数据库
- <https://github.com/mapbox/node-sqlite3>
- https://github.com/mapbox/node-sqlite3/wiki
- <https://github.com/kriasoft/node-sqlite>

- vuex持久化

- <https://github.com/robinvdvleuten/vuex-persistedstate>（完成）
- https://github.com/amark/gun

7.图片处理

- <https://github.com/naptha/tesseract.js>
- <https://www.zhangxinxu.com/wordpress/2018/05/canvas-png-transparent-background-detect/>（完成）
- <https://www.zhangxinxu.com/wordpress/2017/07/html5-canvas-image-compress-upload/>（完成）
- <https://github.com/antimatter15/ocrad.js>
- <https://github.com/muwoo/Matting>（完成）
- <https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement>（完成）
- https://github.com/nimoat/photo-edit

8.Vue长列表

- vue-virtual-scroller（完成）
- Clusterize.js
- <https://github.com/valdrinkoshi/virtual-scroller>

9.vue-hooks

- <https://github.com/yyx990803/vue-hooks>（完成）
- <https://mp.weixin.qq.com/s/CcV1BV0UWdv-Lw7csFpcEw>（完成）
- <https://juejin.im/post/5bfa929551882524cb6f413b>

10.WebWorker

- <https://github.com/mchaov/WebWorkers>（完成）
- <https://github.com/developit/greenlet>（完成）
- https://github.com/ampproject/worker-dom
- https://github.com/satya164/web-worker-proxy
- https://github.com/developit/stockroom
- <https://github.com/GoogleChromeLabs/comlink>
- <http://javascript.ruanyifeng.com/stdlib/arraybuffer.html>
- <http://www.ruanyifeng.com/blog/2018/07/web-worker.html>（完成）
- <https://github.com/webpack-contrib/worker-loader>
- <https://whatwg-cn.github.io/html/#workers>（完成）
- <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API>（完成）
- <https://html.spec.whatwg.org/multipage/workers.html#workers>（完成）
- <https://github.com/dt-fe/weekly/blob/master/76.%E7%B2%BE%E8%AF%BB%E3%80%8A%E8%B0%88%E8%B0%88%20Web%20Workers%E3%80%8B.md>（完成）
- SharedWorker、SharedWorkerGlobalScope（完成）
- <https://nodejs.org/dist/latest-v10.x/docs/api/worker_threads.html> — nodejs worker实现

11.nodejs/deno/puppeteer

- Nodejs

- <https://nodejs.org/dist/latest-v10.x/docs/api/>
- <https://github.com/GoogleChromeLabs/carlo>
- <https://github.com/JacksonTian/anywhere>
- Child Processes/fs/event/net/path
- <https://archiverjs.com/docs/>
- https://github.com/chyingp/nodejs-learning-guide
- <https://github.com/webtorrent/webtorrent>
- https://github.com/mhzed/wstunnel

- Deno

- <https://github.com/denoland/deno>
- <https://deno.land/typedoc/index.html>

- Puppeteer

- <https://github.com/james-cain/puppeteer-deep>
- <https://github.com/checkly/puppeteer-examples>
- <https://github.com/GoogleChromeLabs/puppeteer-examples>
- https://github.com/dhamaniasad/HeadlessBrowsers

12.设计模式、js要点、microfrontends、网络

- microfrontends 微前端

- <https://github.com/phodal/microfrontends>
- <https://micro-frontends.org/>
- https://www.webcomponents.org/polyfills/
- https://github.com/w3c/webcomponents
- <https://github.com/webcomponents/custom-elements>
- https://github.com/Tencent/omi
- <https://github.com/palmerhq/the-platform>

- 设计模式

- <https://github.com/kamranahmedse/design-patterns-for-humans>

- Js要点

- <https://github.com/leonardomso/33-js-concepts>
- <https://github.com/stephentian/33-js-concepts>
- <https://github.com/qiu-deqing/FE-interview>
- https://github.com/yangshun/front-end-interview-handbook/blob/master/Translations/Chinese/questions/css-questions.md
- 《高性能Javascript》（完成）
- 《你不知道的Javascript》
- http://2ality.com/
- https://github.com/MostlyAdequate/mostly-adequate-guide
- <https://github.com/llh911001/mostly-adequate-guide-chinese>
- https://github.com/Tencent/vConsole
- <https://github.com/kamranahmedse/developer-roadmap>
- <https://github.com/ziishaned/learn-regex>
- <https://tc39.github.io/ecma262/#sec-intro>
- <https://tc39.github.io/process-document/>
- https://github.com/tc39/proposals
- <https://github.com/iliakan/javascript-tutorial-en>
- http://asmjs.org/
- <http://kripken.github.io/emscripten-site/>
- <https://github.com/Qquanwei/trackpoint-tools> — 无痕埋点
- <https://github.com/Autarc/optimal-select> — 生成元素标识
- https://github.com/rowthan/whats-element — 生成元素标识
- 跨域

- 网络

- 《图解TCP/IP》
- 《图解HTTP》
- https://daniel.haxx.se/http2/
- <https://daniel.haxx.se/http3-explained/>
- https://http3-explained.haxx.se/zh/
- 《web性能权威指南》

13.编译原理

- <https://www.youtube.com/watch?v=yPZdbL84QHg&index=1&list=PLe68gYG2zUeXCCJBewCrWYCKGQc24ialj>
- 《现代编译原理》

14.web安全/密码学

- web安全

- 《白帽子讲web安全》
- 《web安全深度剖析》
- <https://github.com/james-cain/Web-Security-Learning>
- https://tech.meituan.com/fe_security.html
- <https://github.com/leizongmin/js-xss>
- <https://github.com/Hacker0x01/hacker101>
- <https://github.com/evilcos/xssor>
- <https://github.com/zhansingsong/js-leakage-patterns>
- <https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto>
- <https://github.com/chriso/validator.js>
- <https://github.com/infoslack/awesome-web-hacking>

- 密码学

- 《图解密码技术》
- <https://github.com/nakov/practical-cryptography-for-developers-book>
- <https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto>

15.video、audio、RTC

- 视频

- <https://github.com/videojs/video.js>
- <https://github.com/surmon-china/vue-video-player>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement>（完成）
- <https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLVideoElement>（完成）
- <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video>（完成）
- <https://chimee.org/docs/chimee_player_preface.html>
- https://github.com/Chimeejs/chimee-player
- <https://github.com/video-dev/hls.js>
- 编解码相关知识点
- <https://www.cnblogs.com/xkfz007/archive/2012/08/12/2613690.html>
- <https://cloud.tencent.com/developer/article/1013506>
- <https://github.com/Xinrea/Learn/wiki/%E8%A7%86%E9%A2%91%E7%BC%96%E7%A0%81>
- https://github.com/Kagami/ffmpeg.js
- <http://ffmpeg.org/ffmpeg-all.html>
- <https://github.com/xdsnet/other-doc-cn-ffmpeg>
- <http://ffmpeg.org/documentation.html>
- <https://trac.ffmpeg.org/>
- <https://blog.csdn.net/leixiaohua1020/article/list/49>
- <http://www.rosoo.net/a/index_av.html>
- <http://bbs.chinaffmpeg.com/forum.php>
- Utf-8 utf-16原理理
- 《FFmpeg从入门到精通》
- 渲染相关
- 《OpenGL ES 3.0编程指南》
- https://www.khronos.org/registry/OpenGL-Refpages/es3.0/
- webGL
- <https://webglfundamentals.org/webgl/lessons/zh_cn/>
- http://taobaofed.org/blog/2018/12/17/webgl-texture/index.html

- 音频

- <https://blog.csdn.net/baidu_zhongce/article/details/50393254>
- https://github.com/pdeschen/pcm.js/blob/master/test.js
- <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio>
- https://github.com/abysshal/WAVHelper/

- RTC

- https://github.com/webrtc/samples
- https://github.com/muaz-khan/WebRTC-Experiment

16.算法编写

- 基础算法

- leetcode
- https://github.com/trekhleb/javascript-algorithms/blob/master/README.zh-CN.md
- <https://github.com/CyC2018/CS-Notes/blob/master/notes/%E7%AE%97%E6%B3%95.md>
- <https://github.com/apachecn/awesome-algorithm>
- 《算法导论》
- <https://github.com/josdejong/mathjs>
- <https://github.com/Jam3/math-as-code>
- <https://github.com/algorithm-visualizer/algorithm-visualizer>
- <https://github.com/pyloque/fastscan>
- <https://github.com/chihungyu1116/leetcode-javascript>
- <https://github.com/haoel/leetcode>
- <https://github.com/skyhee/Algorithms-Learning-With-Go>
- https://github.com/MisterBooo/LeetCodeAnimation

- AI

- <https://github.com/apachecn/AiLearning>
- 《AI未来》
- 《深度学习》
- https://github.com/BrainJS/brain.js

- tensorflow

17.linux

- 《鸟哥的私房菜》
- <http://www.study-area.org/network/network.htm>
- <http://www.study-area.org/compu/compu.htm>
- <http://www.study-area.org/network/networkfr.htm>
- <http://www.linux.org.tw/>
- <http://linux.vbird.org>/

18.V8

- <https://v8.dev/docs>
- <https://v8.js.cn/>
- https://github.com/thlorenz/v8-perf
- <https://github.com/bluezhan/v8>
- <https://github.com/ry/v8worker>
- https://github.com/ry/v8worker2

19.WebAssembly

- <https://webassembly.github.io/spec/core/>

20.TDD开发模式

- <https://jestjs.io/zh-Hans/>
- <https://github.com/dwyl/learn-tdd>

21.serverless

- <https://github.com/phodal/serverless>
- <https://github.com/serverless/serverless>
- <https://github.com/embark-framework/embark>
- <https://github.com/harijoe/serverless-boilerplate>

22.go

- <https://github.com/astaxie/beego>
- <https://golang.org/>
- <https://github.com/Unknwon/the-way-to-go_ZH_CN>
- <https://github.com/chai2010/advanced-go-programming-book>
- <https://github.com/golang-china/gopl-zh>

23.dart & flutter

- <https://www.dartlang.org/>
- <https://flutter.io/docs/>
- <https://github.com/james-cain/GSYGithubAppFlutter>

24.hybrid app

- <https://github.com/ionic-team/capacitor>
- <https://github.com/ionic-team/ionic>
- <https://github.com/ionic-team/ionic-native>
- <https://cordova.apache.org/>
- https://github.com/NativeScript/NativeScript

25.<https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way> 如何正确的提出技术问题

26.MutationObserver.js

27.通信

- MessageChannel、MessagePort（ChannelPlate.js）<https://whatwg-cn.github.io/html/#comms>

28.router（navaid）

- https://github.com/kevindurb/router

29.state（reworm）

30.搜索引擎

- https://github.com/olivernn/lunr.js

31.electron

- vue-electron

- - electron-quick-start

- guppy

- vue-design

- nativefier

- ram

- react-proto

- electronic-wechat

- vue-form-making

- <https://electronjs.org/docs>

- <https://simulatedgreg.gitbooks.io/electron-vue/content/cn/>

32.polymer

33.GraphQL

34.elm

- <https://elm-lang.org/>

## 知识类：

1.HTML标准

- 《whatwg/html》（优先级四）
- https://github.com/w3c/web-performance（优先级四）
- <https://tech.meituan.com/fe_tiny_spa.html>
- https://www.ampproject.org/zh_cn/docs/getting_started/visual_story

2.JS

- 《高性能Javascript》
- 《你不知道的Javascript》
- 《Mostly-adequate-guide》
- <https://github.com/kamranahmedse/developer-roadmap>
- <https://github.com/ziishaned/learn-regex>
- <https://tc39.github.io/ecma262/#sec-intro>
- https://tc39.github.io/process-document/

3.CSSTriggers/CSS参考手册  11月第一个星期

- <https://csstriggers.com/>
- <http://css.doyoe.com/>

4.类vue

- learn-vue
- vue-analysis
- vue-design
- vuera
- chao

5.类小程序

- tua-mp
- tina
- minapp
- taro
- acorn
- san
- weweb

6.类react

- preact
- react
- gooact
- learn-react-source-code
- anu
- nerv

7.类mvvm

- aoy
- virtual-dom
- v-dom
- snabbdom