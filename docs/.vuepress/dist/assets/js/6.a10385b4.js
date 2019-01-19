(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{189:function(e,t,a){"use strict";a.r(t);var r=a(0),s=Object(r.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"content"},[a("h1",{attrs:{id:"browser"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#browser","aria-hidden":"true"}},[e._v("#")]),e._v(" Browser")]),e._v(" "),a("h2",{attrs:{id:"浏览器内核"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#浏览器内核","aria-hidden":"true"}},[e._v("#")]),e._v(" 浏览器内核")]),e._v(" "),a("p",[e._v("浏览器内核可以分成两部分：渲染引擎(layout engineer 或者 Rendering Engine)和JS引擎。主要负责取得网页内容(HTML，XML，图像等)、整理讯息(如加入CSS等)")]),e._v(" "),a("p",[e._v("JS引擎是解析Javscript语言，执行Javascript语言来实现网页的动态效果。随着JS引起越来越独立，内核慢慢倾向于只指渲染引擎。")]),e._v(" "),a("p",[e._v("常见的浏览器内核分为四种：Trident、Gecko、Blink、Webkit")]),e._v(" "),a("ul",[a("li",[e._v("IE：Trident内核，俗称IE内核")]),e._v(" "),a("li",[e._v("Opera：早期用Presto内核，之后转为Webkit内核，现在用Blink内核")]),e._v(" "),a("li",[e._v("Safari：Webkit内核")]),e._v(" "),a("li",[e._v("firefox：Gecko内核，俗称Firefox内核")]),e._v(" "),a("li",[e._v("Chrome：Chromium内核或者Chrome内核（fork自开源引擎Webkit内核）2013年后改为Blink内核")]),e._v(" "),a("li",[e._v("360、猎豹：IE+Chrome双内核")]),e._v(" "),a("li",[e._v("搜狗、遨游、QQ浏览器：Trident（兼容模式）+Webkit（高速模式）")])]),e._v(" "),a("h2",{attrs:{id:"事件机制"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#事件机制","aria-hidden":"true"}},[e._v("#")]),e._v(" 事件机制")]),e._v(" "),a("h3",{attrs:{id:"事件触发三阶段"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#事件触发三阶段","aria-hidden":"true"}},[e._v("#")]),e._v(" 事件触发三阶段")]),e._v(" "),a("ul",[a("li",[e._v("document往事件触发处传播，遇到注册的捕获事件会触发")]),e._v(" "),a("li",[e._v("传播到事件触发处时触发注册事件")]),e._v(" "),a("li",[e._v("从事件触发处往document传播，遇到注册的冒泡事件会触发")])]),e._v(" "),a("h2",{attrs:{id:"注册事件"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#注册事件","aria-hidden":"true"}},[e._v("#")]),e._v(" 注册事件")]),e._v(" "),a("p",[e._v("第三个参数可以是布尔值，也可以是对象。对于布尔值useCapture参数来说，该参数默认是false。")]),e._v(" "),a("p",[e._v("若为false，表示在"),a("strong",[e._v("事件冒泡阶段")]),e._v("调用事件处理函数，如果参数为true，表示在"),a("strong",[e._v("事件捕获阶段")]),e._v("调用")]),e._v(" "),a("p",[e._v("对于对象来说，可以是几个属性")]),e._v(" "),a("ul",[a("li",[e._v("capture，布尔值，和useCapture一样")]),e._v(" "),a("li",[e._v("once，布尔值")]),e._v(" "),a("li",[e._v("passive，布尔值，表示永远不会调用preventDefault")])]),e._v(" "),a("p",[e._v("只触发在目标上，可以使用stopPropagation来组织事件的传播。")]),e._v(" "),a("h2",{attrs:{id:"eventloop"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#eventloop","aria-hidden":"true"}},[e._v("#")]),e._v(" EventLoop")]),e._v(" "),a("p",[e._v("setTimeout延时为0，一样还是异步。原因是html5规定该函数的第二参数不得小于4毫秒，不足会自动增加。")]),e._v(" "),a("p",[e._v("不同的任务源会被分配到不同的Task队列中，任务源可以分为微任务(microTask)和宏任务(macroTask)。在ES6中，microTask称为jobs，macroTask称为task")]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v("console.log('script start');\n\nsetTimeout(function (){\n    console.log('setTimeout');\n}, 0);\n\nnew Promise((resolve) => {\n    console.log('Promise');\n    resolve();\n}).then(function () {\n    console.log('promise1');\n}).then(function () {\n    console.log('promise2');\n});\n\nconsole.log('script end');\n// 执行顺序\n// script start => Promise => promise1=> promise2 => script end => setTimeout\n")])])]),a("p",[e._v("微任务包括process.nextTick，promise，Object.observe，MutationObserver")]),e._v(" "),a("p",[e._v("宏任务包括setTimeout，setInterval，setImmediate，script，I/O，UI rendering")]),e._v(" "),a("p",[e._v("**但是并不是微任务就快宏任务，**因为宏任务中包括了script，浏览器会先执行一个宏任务，接下来有一步代码，就会先执行微任务")]),e._v(" "),a("p",[e._v("正确的一次EventLoop顺序是")]),e._v(" "),a("ol",[a("li",[e._v("执行同步代码，这属于宏任务")]),e._v(" "),a("li",[e._v("执行栈为空，查询是否有微任务需要执行")]),e._v(" "),a("li",[e._v("执行所有微任务")]),e._v(" "),a("li",[e._v("必要的话渲染UI")]),e._v(" "),a("li",[e._v("然后执行下一轮EventLoop，执行宏任务中的异步代码")])]),e._v(" "),a("h2",{attrs:{id:"浏览器缓存"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#浏览器缓存","aria-hidden":"true"}},[e._v("#")]),e._v(" 浏览器缓存")]),e._v(" "),a("h3",{attrs:{id:"缓存分类"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#缓存分类","aria-hidden":"true"}},[e._v("#")]),e._v(" 缓存分类")]),e._v(" "),a("ol",[a("li",[e._v("强缓存(200)")]),e._v(" "),a("li",[e._v("协商缓存(304)")])]),e._v(" "),a("p",[e._v("他们的匹配流程：")]),e._v(" "),a("ol",[a("li",[e._v("浏览器发送请求前，根据请求头的expires和cache-control判断是否命中强缓存策略，如果命中，直接从缓存获取资源，并"),a("strong",[e._v("不会发送请求，直接使用浏览器缓存")]),e._v("。如果没有命中，进入下一步。")]),e._v(" "),a("li",[e._v("没有命中强缓存规则，浏览器会发送请求，根据请求头的last-modified和etag判断是否命中协商缓存，如果命中，直接从缓存中获取资源。如果没有命中，进入下一步。")]),e._v(" "),a("li",[e._v("如果前两步没有命中，直接从服务端获取资源。")])]),e._v(" "),a("h3",{attrs:{id:"详述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#详述","aria-hidden":"true"}},[e._v("#")]),e._v(" 详述")]),e._v(" "),a("ul",[a("li",[e._v("强缓存")])]),e._v(" "),a("h4",{attrs:{id:"原理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#原理","aria-hidden":"true"}},[e._v("#")]),e._v(" 原理")]),e._v(" "),a("p",[e._v("强缓存需要服务端设置expires和cache-control")]),e._v(" "),a("p",[e._v("nginx代码参考，设置一年的缓存时间：")]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v("location ~ .*\\.(ico|svg|ttf|eot|woff)(.*) {\n  proxy_cache               pnc;\n  proxy_cache_valid         200 304 1y;\n  proxy_cache_valid         any 1m;\n  proxy_cache_lock          on;\n  proxy_cache_lock_timeout  5s;\n  proxy_cache_use_stale     updating error timeout invalid_header http_500 http_502;\n  expires                   1y;\n}\n")])])]),a("p",[a("img",{attrs:{src:"http://reyshieh.com/assets/StrongCache.jpg",alt:"强缓存"}})]),e._v(" "),a("p",[e._v("（1）expires（"),a("strong",[e._v("http1.0")]),e._v("）：从图可以看出，expires的值是一个绝对时间，是http1.0的功能。如果浏览器的时间没有超过这个expires的时间，代表缓存还有效，命中强缓存，直接从缓存读取资源。不过由于存在浏览器和服务端时间可能出现较大误差，所以在之后http1.1提出了cache-control。")]),e._v(" "),a("p",[e._v("（2）cache-control("),a("strong",[e._v("http1.1")]),e._v(")：从图可以看出，cache-control的值是类似于"),a("code",[e._v("max-age=31536000")]),e._v("这样的，是一个相对时间，31536000是秒数，正好是一年的时间。当浏览器第一次请求资源的时候，会把response header的内容缓存下来。之后的请求会先从缓存检查该response header，通过第一次请求的date和cache-control计算出缓存有效时间。如果浏览器的时间没有超过这个缓存有效的时间，代表缓存还有效，命中强缓存，直接从缓存读取资源。")]),e._v(" "),a("blockquote",[a("p",[e._v("两者可以同时设置，但是优先级cache-control>expires")])]),e._v(" "),a("h4",{attrs:{id:"from-disk-cache（磁盘缓存）和from-memory-cache（内存缓存）"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#from-disk-cache（磁盘缓存）和from-memory-cache（内存缓存）","aria-hidden":"true"}},[e._v("#")]),e._v(" from disk cache（磁盘缓存）和from memory cache（内存缓存）")]),e._v(" "),a("blockquote",[a("p",[e._v("Chrome employs two caches — an on-disk cache and a very fast in-memory cache. The lifetime of an in-memory cache is attached to the lifetime of a render process, which roughly corresponds to a tab. Requests that are answered from the in-memory cache are invisible to the web request API. If a request handler changes its behavior (for example, the behavior according to which requests are blocked), a simple page refresh might not respect this changed behavior. To make sure the behavior change goes through, call handlerBehaviorChanged() to flush the in-memory cache. But don't do it often; flushing the cache is a very expensive operation. You don't need to call handlerBehaviorChanged() after registering or unregistering an event listener.")])]),e._v(" "),a("ul",[a("li",[e._v("memory cache简介")])]),e._v(" "),a("p",[e._v("MemoryCache顾名思义，就是将"),a("strong",[e._v("资源缓存到内存")]),e._v("中，等待下次访问时不需要重新下载资源，而直接从内存中获取。Webkit早已支持memoryCache。  目前Webkit资源分成两类，一类是"),a("strong",[e._v("主资源")]),e._v("，比如HTML页面，或者下载项，一类是"),a("strong",[e._v("派生资源")]),e._v("，比如HTML页面中内嵌的图片或者脚本链接，分别对应代码中两个类：MainResourceLoader和SubresourceLoader。虽然"),a("strong",[e._v("Webkit支持memoryCache，但是也只是针对派生资源")]),e._v("，它对应的类为CachedResource，用于"),a("strong",[e._v("保存原始数据（比如CSS，JS等），以及解码过的图片数据")]),e._v("。")]),e._v(" "),a("ul",[a("li",[e._v("disk cache简介")])]),e._v(" "),a("p",[e._v("diskCache顾名思义，就是将"),a("strong",[e._v("资源缓存到磁盘")]),e._v("中，等待下次访问时不需要重新下载资源，而直接从磁盘中获取，它的直接操作对象为CurlCacheManager。它与memoryCache"),a("strong",[e._v("最大的区别")]),e._v("在于，"),a("strong",[e._v("当退出进程时，内存中的数据会被清空，而磁盘的数据不会")]),e._v("，所以，当下次再进入该进程时，该进程仍可以从diskCache中获得数据，而memoryCache则不行。")]),e._v(" "),a("p",[e._v("diskCache与memoryCache"),a("strong",[e._v("相似之处")]),e._v("就是也"),a("strong",[e._v("只能存储一些派生类资源文件")]),e._v("。它的存储形式为一个index.dat文件，"),a("strong",[e._v("记录存储数据的url")]),e._v("，然后"),a("strong",[e._v("再分别存储该url的response信息和content内容")]),e._v("。Response信息最大作用就是用于判断服务器上该url的content内容是否被修改。")]),e._v(" "),a("p",[e._v("在命中强缓存的情况下，进程初次渲染会从磁盘读取缓存资源。chrome会将部分资源保存在内存中。")]),e._v(" "),a("p",[e._v("由于内存缓存是直接从内存中读取的，所以速度更快。而磁盘缓存需要从磁盘中读取，速度还和磁盘的I/O有关，时间大概在2~10ms，也是相当快的。")]),e._v(" "),a("h4",{attrs:{id:"强缓存作用"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#强缓存作用","aria-hidden":"true"}},[e._v("#")]),e._v(" 强缓存作用")]),e._v(" "),a("p",[e._v("强缓存作为性能优化中缓存方面最有效的手段，能够极大的提高性能。由于强缓存不会向服务端发送请求，对服务端的压力也是大大减小。")]),e._v(" "),a("p",[e._v("对于一些不太经常变更的资源，可以设置一个超长时间的缓存时间，比如一年。")]),e._v(" "),a("p",[e._v("但是由于不会向服务端发送请求，那么如果资源有更改的时候，解决方法是加一个?v=xx的后缀，在更新静态资源版本的时候，更新v值，相当于向服务端发起一个新的请求，从而达到更新静态资源的目的。")]),e._v(" "),a("h4",{attrs:{id:"三级缓存原理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#三级缓存原理","aria-hidden":"true"}},[e._v("#")]),e._v(" 三级缓存原理")]),e._v(" "),a("ol",[a("li",[e._v("先去内存看，如果有，命中")]),e._v(" "),a("li",[e._v("若内存没有，择取硬盘获取，如果有命中")]),e._v(" "),a("li",[e._v("若硬盘没有，那么就进行网络请求")]),e._v(" "),a("li",[e._v("加载到的资源缓存到硬盘和内存")])]),e._v(" "),a("p",[e._v("因此，有以下几种现象")]),e._v(" "),a("ol",[a("li",[a("p",[e._v("访问->200->退出浏览器")]),e._v(" "),a("p",[e._v("再进入->200（from disk cache）->刷新->200(from memory cache)")]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v("总结：似乎chrome可以判断既然已经从disk拿了，第二次就内存里拿\n")])])])]),e._v(" "),a("li",[a("p",[e._v("图片、base64都是from memory cache")]),e._v(" "),a("p",[e._v("总结：解析渲染图片直接就放在内存，用的时候直接拿")])]),e._v(" "),a("li",[a("p",[e._v("js、css为例，都是直接disk cache")]),e._v(" "),a("p",[e._v("总结：似乎太占位置，直接就放硬盘得了")])]),e._v(" "),a("li",[a("p",[e._v("隐私模式下，几乎都是from memory cache")]),e._v(" "),a("p",[e._v("总结：隐私模式，不能暴露，那就放在内存中")])])]),e._v(" "),a("h3",{attrs:{id:"协商缓存"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#协商缓存","aria-hidden":"true"}},[e._v("#")]),e._v(" 协商缓存")]),e._v(" "),a("h4",{attrs:{id:"原理-2"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#原理-2","aria-hidden":"true"}},[e._v("#")]),e._v(" 原理")]),e._v(" "),a("p",[e._v("在强缓存没有命中的时候，就会触发协商缓存。协商缓存会根据**[last-modified/if-modified-since]"),a("strong",[e._v("或者")]),e._v("[etag/if-none-match]**来进行判断缓存是否过期。")]),e._v(" "),a("p",[e._v("nginx代码参考：")]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v("location ~ .*\\.(ico|svg|ttf|eot|woff)(.*) {\n  proxy_cache               pnc;\n  proxy_cache_valid         200 304 1y;\n  proxy_cache_valid         any 1m;\n  proxy_cache_lock          on;\n  proxy_cache_lock_timeout  5s;\n  proxy_cache_use_stale     updating error timeout invalid_header http_500 http_502;\n  etag                                       on;\n}\n")])])]),a("p",[a("img",{attrs:{src:"http://reyshieh.com/assets/NegotiateCache.jpg",alt:"协商缓存"}})]),e._v(" "),a("p",[e._v("（1）last-modified/if-modified-since：浏览器"),a("strong",[e._v("首先发送一个请求，让服务端在response header 中返回请求的资源带上上次更新时间，就是last-modified，浏览器会缓存下这个时间")]),e._v("。然后浏览器在下次请求中，request header中带上if-modified-since**[保存的last-modified值]"),a("strong",[e._v("。根据浏览器发送的修改时间和服务端的修改时间进行对比，一致代表资源没有改变，服务端返回正文为空的响应，让浏览器的缓存中读取资源，大大减小了请求的耗时。由于")]),e._v("last-modified依赖的是保存的绝对时间，还是会出现误差的情况**：一是保存的时间是以秒为单位的，1秒内多次修改是无法捕捉到的；二是各机器读取到的时间不一致，就有出现误差的可能性。为了改善这个问题，提出了使用Etag。")]),e._v(" "),a("p",[e._v("（2）etag/if-none-match:etag是http协议提供的若干机制中的一种web缓存验证机制，并且允许客户端进行缓存协商。生成etag常用的方法包括"),a("strong",[e._v("对资源内容使用抗碰撞散列函数")]),e._v("、"),a("strong",[e._v("使用最近修改的时间戳的哈希值")]),e._v("，甚至"),a("strong",[e._v("只是一个版本号")]),e._v("。和last-modified一样，浏览器会先发送一个请求得到etag的值，然后再下一次请求在request header 中带上if-none-match[保存的etag值]。通过发送的etag的值和服务端重新生成的etag的值进行比对，如果一直代表资源没有改变，服务端返回正文为空的响应，告诉浏览器从缓存中读取资源。")]),e._v(" "),a("blockquote",[a("p",[e._v("Etag值是由服务端计算生成，并在相应客户端请求时将它返回给客户端。")]),e._v(" "),a("p",[e._v("http1.1协议中并没有规范如何计算Etag。Etag值可以是唯一标识资源的任何东西，如持久化存储中的某个资源关联的版本、一个或多个文件属性、实体头信息和校验值、（CheckSum），也可以计算实体信息的散列值。有时候为了计算一个Etag值可能有比较大的代价，此时可以采用生成唯一值等方式（如常见的GUID）。客户端不用关心Etag值如何产生，只要服务在资源状态发生变更的情况下将Etag值发送给它。")]),e._v(" "),a("p",[e._v("在MSDN中，OutgoingResponse类中设置Etag值：")]),e._v(" "),a("p",[a("img",{attrs:{src:"http://reyshieh.com/assets/EtagInterface.jpg",alt:"Etag接口"}})]),e._v(" "),a("p",[e._v("在上图可以看出，在REST架构下，Etag值可以通过Guid，整数，长整数，字符串四种类型的参数传入SetETag方法。另外OutgoingResponse类也有字符串属性：ETag直接给它赋值也能在HTTP响应头中写入ETag值。")])]),e._v(" "),a("p",[a("strong",[e._v("etag能解决last-modified的一些缺点，但是etag每次服务端生成都需要进行读写操作，而last-modified只需要读取操作")]),e._v("，从而etag的消耗是更大的。")]),e._v(" "),a("h4",{attrs:{id:"协商缓存作用"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#协商缓存作用","aria-hidden":"true"}},[e._v("#")]),e._v(" 协商缓存作用")]),e._v(" "),a("p",[e._v("协商缓存是无法减少请求数的开销的，但是可以减少返回的正文大小。一般来说，"),a("strong",[e._v("对于改变频繁的html文件，使用协商缓存是一种不错的选择")]),e._v("。")]),e._v(" "),a("h3",{attrs:{id:"刷新缓存方法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#刷新缓存方法","aria-hidden":"true"}},[e._v("#")]),e._v(" 刷新缓存方法")]),e._v(" "),a("p",[e._v("刷新"),a("strong",[e._v("强缓存")]),e._v("可以使用**?v=xxx**")]),e._v(" "),a("p",[e._v("刷新"),a("strong",[e._v("协商缓存")]),e._v("可以直接"),a("strong",[e._v("修改文件内容")])])])}],!1,null,null,null);s.options.__file="Damn-hole-of-Browser.md";t.default=s.exports}}]);