# PWA

Progressive Web App，简称PWA，是提升Web App的体验的一种新方法，能给用户原生应用的体验。

PWA能做到原生应用的体验不是靠特指某一项技术，而是经过应用一些新技术进行改进，在安全、性能和体验三个方面都有很大提升，PWA本质上是Web App，借助一些新技术具备了Native App的一些特性，兼具Web App和Native App的优点。

特点：

- **可靠**-即使在不稳定的网络环境下，也能瞬间加载并展现
- **体验**-快速响应了，并且有平滑的动画响应用户的操作
- **粘性**-像设备上的原生应用，具有沉浸式的用户体验，用户可以添加到桌面

## 离线和缓存

### Service Worker

#### 前提条件

- Service Worker**要求HTTPS的环境**，通常可以借助github page进行学习调试。或者用**localhost、127.0.0.1**浏览器也允许调试Service Worker
- Service Worker的**缓存机制**依赖于**Cache API**实现
- 依赖HTML5 **fetch API**
- 依赖**Promise**实现

#### 注册

要安装Service Worker，需要通过在js主线程（常规的页面里的js）注册Service Worker来启动安装，这个过程会通知浏览器Service Worker线程的javaScript文件在什么地方呆着

```js
if ('serviceWorker' in navigation) {
    window.addEventListener('load', function() {
        navigation.serviceWorker.register('/sw.js', {scope: '/'}).then(function(registration) {
            // 注册成功
            console.log('ServiceWorker registration successful with scope:' + registration.scope);
        }).catch(function(err) {
            // 注册失败
            console.log('ServiceWorker registration failed:' + err);
        });
    });
}
```

- 首先要判断ServiceWorker API在浏览器中是否可用，支持的话才继续实现
- 接下来在页面onload的时候注册位于./sw.js的Service Worker
- 每次页面加载成功后，就会调用register()方法，浏览器将会判断ServiceWorker线程是否已注册并作出相应的处理
- register方法的scope参数是可选的，用于指定让Service Worker控制的内容的子目录。以上demo服务工作线程文件位于根网域，意味着服务工作线程的作用域将是整个来源
- 说明register方法的**scope参数**：**ServiceWorker线程将接收scope指定网域目录上所有事项的fetch事件**，如果我们的ServiceWorker的JavaScript文件在/a/b/sw.js，不传scope值的情况下，scope的值就是/a/b
- scope的值得意义在于如果scope的值为/a/b，那么ServiceWorker线程只能捕获到path为/a/b开头的（/a/b/page1，/a/b/page2，…）页面的fetch事件。通过scope的意义也能看出ServiceWorker不是服务单个页面的，所以在ServiceWorker的js逻辑中全局变量需要慎用
- then()函数链式调用promise，当promise resolve的时候，里面的代码就会执行
- 最后链了一个catch()函数，当promise rejected才会执行

代码执行完成之后，就注册了一个Service Worker，它工作在worker context，所以**没有访问DOM的权限**。在正常的页面之外运行Service Worker的代码来控制他们的加载。

#### 查看是否注册成功

可以用[service-worker-inspect](chrome://inspect/#service-workers)

还可以通过[service-worker-internals](chrome://serviceworker-internals)来查看服务工作线程详情。如果只是很想了解服务工作线程的生命周期，这很有用，但很有可能被上者取代

#### 注册失败的原因

- 不是HTTPS环境，不是localhost或127.0.0.1
- Service Worker文件的地址没有写对，需要相对于origin
- Service Worker文件在不同的origin下而不是你的APP的，是不被允许的

#### 安装

注册成功后，就已经有了属于web app的worker context了。接下来浏览器会不停的尝试在站点里的页面安装并激活它，并且在这里可以把静态资源的缓存给办了

install事件会绑定在Service Worker文件中，在Service Worker安装成功后，install事件被触发。

install事件一般是被用来填充你的浏览器的离线缓存能力。Service Worker使用的是一个cache API的全局对象，它使我们可以存储网络响应发来的资源，并且根据他们的请求来生成key。这个API和浏览器的标准的缓存工作原理很相似，但是只对应在站点的域中。会一直持久存在直到告诉它不在存储

local storage是同步的用法在Service Worker中不允许使用

IndexedDB可以在Service Worker内做数据存储

```js
// 监听service worker的install事件
this.addEventListener('install', function(event) {
	// 如果监听到了service worker已经安装成功的话，就会调用event.waitUntil回调函数
	event.waitUtil(
		// 安装成功后操作CacheStorage缓存，使用之前需要caches.open()打开对应缓存空间
		caches.open('my-test-cache-v1').then(function(cache) {
            // 通过cache缓存对象的addAll方法添加precache缓存
            return cache.addAll([
                '/',
                '/index.html',
                '/main.css',
                '/main.js',
                '/image.jpg'
            ])
		})
	)
})
```

ExtendableEvent.waitUtil()方法—确保Service Worker不会再waitUtil()里面的代码执行之前安装完成

#### 自定义请求响应

每次任何被Service Worker控制的资源被请求时，都会触发fetch事件，这些资源包括了指定的scope内的html文档，和这些html文档内引用的其他任何资源。

```js
this.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {

                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果就好了。。
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }

                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open('my-test-cache-v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return httpRes;
            });
        })
    );
});
```

因此，缓存静态资源可以通过两种方式，在**install**的时候进行和在**fetch事件处理回调**的时候动态实现

两种方式可以比较一下：

- on install 的优点是第二次访问即可离线，缺点是需要将需要缓存的 URL 在编译时插入到脚本中，增加代码量和降低可维护性；
- on fetch 的优点是无需更改编译过程，也不会产生额外的流量，缺点是需要多一次访问才能离线可用。

#### service worker版本更新

若/sw.js缓存策略要更新该怎么处理？

如果/sw.js内容有更新，当访问网站页面时浏览器获取了新的文件，逐字节比对/sw.js文件发现不同时会认为有更新启动更新算法，于是会安装新的文件并触发install事件。但是此时已经处于激活状态的旧的Service Worker还在运行，新的Service Worker完成安装后会进入waiting状态。直到所有已打开的页面都关闭，旧的Service Worker自动停止，新的Service Worker才会在接下来重新打开的页面里生效。

#### 自动更新所有页面

可以在install事件中执行**self.skipWaiting()**方法跳过waiting状态，然后会直接进入activate阶段。接着在activate事件发生时，通过执行**self.clients.claim()**方法，更新所有客户端上的Service Worker。

```js
// 安装阶段跳过等待，直接进入 active
self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        Promise.all([

            // 更新客户端
            self.clients.claim(),

            // 清理旧版本
            caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (cacheName) {
                        if (cacheName !== 'my-test-cache-v1') {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});
```

另外要注意一点，**/sw.js文件可能会因为浏览器缓存问题，当文件有了变化时，浏览器里还是旧的文件**。这会导致更新得不到响应。因此，**在Web Server上添加对该文件的过滤规则，不缓存或设置较短的有效期**。

#### 手动更新Service Worker

在**页面**中，可以借助**Registration.update()更新**。

```js
var version='1.0.1';
navigator.serviceWorker.register('/sw.js').then(function(reg) {
    if (localStorage.getItem('sw_version') !== version) {
        reg.update().then(function () {
            localStorage.setItem('sw_version', version);
        });
    }
});
```

#### 生命周期

在页面脚本中注册Service Worker文件所在的URL。Worker就可以开始激活了，激活后的Service Worker可以监听当前域下的功能性事件，比如资源请求（fetch）、推送通知（push）、后台同步（sync）。

Service Worker基本步骤：

- 首先我们需要在页面的 JavaScript 主线程中使用 `serviceWorkerContainer.register()` 来注册 Service Worker ，在注册的过程中，浏览器会在后台启动尝试 Service Worker 的安装步骤。
- 如果注册成功，Service Worker 在 ServiceWorkerGlobalScope 环境中运行； 这是一个特殊的 worker context，与主脚本的运行线程相独立，同时也没有访问 DOM 的能力。
- 后台开始安装步骤， 通常在安装的过程中需要缓存一些静态资源。如果所有的资源成功缓存则安装成功，如果有任何静态资源缓存失败则安装失败，在这里失败的不要紧，会自动继续安装直到安装成功，如果安装不成功无法进行下一步 — 激活 Service Worker。
- 开始激活 Service Worker，必须要在 Service Worker 安装成功之后，才能开始激活步骤，当 Service Worker 安装完成后，会接收到一个激活事件（activate event）。激活事件的处理函数中，主要操作是清理旧版本的 Service Worker 脚本中使用资源。
- 激活成功后 Service Worker 可以控制页面了，但是只针对在成功注册了 Service Worker 后打开的页面。也就是说，页面打开时有没有 Service Worker，决定了接下来页面的生命周期内受不受 Service Worker 控制。所以，只有当页面刷新后，之前不受 Service Worker 控制的页面才有可能被控制起来。

![sw-lifecycle](http://reyshieh.com/assets/sw-lifecycle.png)

- **安装( installing )**：这个状态发生在 Service Worker 注册之后，表示开始安装，触发 install 事件回调指定一些静态资源进行离线缓存。

`install` 事件回调中有两个方法：

- `event.waitUntil()`：传入一个 Promise 为参数，等到该 Promise 为 resolve 状态为止。
- `self.skipWaiting()`：`self` 是当前 context 的 global 变量，执行该方法表示强制当前处在 waiting 状态的 Service Worker 进入 activate 状态。
- **安装后( installed )**：Service Worker 已经完成了安装，并且等待其他的 Service Worker 线程被关闭。
- **激活( activating )**：在这个状态下没有被其他的 Service Worker 控制的客户端，允许当前的 worker 完成安装，并且清除了其他的 worker 以及关联缓存的旧缓存资源，等待新的 Service Worker 线程被激活。

`activate` 回调中有两个方法：

- `event.waitUntil()`：传入一个 Promise 为参数，等到该 Promise 为 resolve 状态为止。
- `self.clients.claim()`：在 activate 事件回调中执行该方法表示取得页面的控制权, 这样之后打开页面都会使用版本更新的缓存。旧的 Service Worker 脚本不再控制着页面，之后会被停止。
- **激活后( activated )**：在这个状态会处理 `activate` 事件回调 (提供了更新缓存策略的机会)。并可以处理功能性的事件 `fetch (请求)`、`sync (后台同步)`、`push (推送)`。
- **废弃状态 ( redundant )**：这个状态表示一个 Service Worker 的生命周期结束。

这里特别说明一下，进入废弃 (redundant) 状态的原因可能为这几种：

- 安装 (install) 失败
- 激活 (activating) 失败
- 新版本的 Service Worker 替换了它并成为激活状态

#### 支持的事件

- **install**：Service Worker 安装成功后被触发的事件，在事件处理函数中可以添加需要缓存的文件
- **activate**：当 Service Worker 安装完成后并进入激活状态，会触发 activate 事件。通过监听 activate 事件你可以做一些预处理，如对旧版本的更新、对无用缓存的清理等。
- **message**：Service Worker 运行于独立 context 中，无法直接访问当前页面主线程的 DOM 等信息，但是通过 postMessage API，可以实现他们之间的消息传递，这样主线程就可以接受 Service Worker 的指令操作 DOM。
- **fetch (请求)**：当浏览器在当前指定的 scope 下发起请求时，会触发 fetch 事件，并得到传有 response 参数的回调函数，回调中就可以做各种代理缓存的事情了。
- **push (推送)**：push 事件是为推送准备的。不过首先需要了解一下 [Notification API](https://developer.mozilla.org/zh-CN/docs/Web/API/notification) 和 [PUSH API](https://developer.mozilla.org/zh-CN/docs/Web/API/Push_API)。通过 PUSH API，当订阅了推送服务后，可以使用推送方式唤醒 Service Worker 以响应来自系统消息传递服务的消息，即使用户已经关闭了页面。
- **sync (后台同步)**：sync 事件由 background sync (后台同步)发出。background sync 配合 Service Worker 推出的 API，用于为 Service Worker 提供一个可以实现注册和监听同步处理的方法。但它还不在 W3C Web API 标准中。在 Chrome 中这也只是一个实验性功能，需要访问 `chrome://flags/#enable-experimental-web-platform-features` ，开启该功能，然后重启生效。

### chrome浏览器debug

使用 Chrome 浏览器，可以通过进入控制台 `Application -> Service Workers` 面板查看和调试。

![chrome_debug](http://reyshieh.com/assets/chrome_debug.png)

选项含义：

- **offline**： 复选框可以将 DevTools 切换至离线模式。它等同于 Network 窗格中的离线模式。
- **Update on reload**：复选框可以强制 Service Worker 线程在每次页面加载时更新。
- **Bypass for network**：复选框可以绕过 Service Worker 线程并强制浏览器转至网络寻找请求的资源。
- **Update**：按钮可以对指定的 Service Worker 线程执行一次性更新。
- **Push**：按钮可以在没有负载的情况下模拟推送通知。
- **Sync**：按钮可以模拟后台同步事件。
- **Unregister**：按钮可以注销指定的 Service Worker 线程。
- **Source**：告诉您当前正在运行的 Service Worker 线程的安装时间。 链接是 Service Worker 线程源文件的名称。点击链接会将您定向至 Service Worker 线程来源。
- **Status**：告诉您 Service Worker 线程的状态。此行上的数字（上方屏幕截图中的 #1）指示 Service Worker 线程已被更新的次数。如果启用 `update on reload`复选框，您会注意到每次页面加载时此数字都会增大。在状态旁边，您将看到 `start` 按钮（如果 Service Worker 线程已停止）或 `stop` 按钮（如果 Service Worker 线程正在运行）。 Service Worker 线程设计为可由浏览器随时停止和启动。 使用 stop 按钮明确停止 Service Worker 线程可以模拟这一点。停止 Service Worker 线程是测试 Service Worker 线程再次重新启动时的代码行为方式的绝佳方法。它通常可以揭示由于对持续全局状态的不完善假设而引发的错误。
- **Clients**：告诉您 Service Worker 线程作用域的原点。 如果您已启用 `show all`复选框，`focus` 按钮将非常实用。 在此复选框启用时，系统会列出所有注册的 Service Worker 线程。 如果您点击正在不同标签中运行的 Service Worker 线程旁的 `focus` 按钮，Chrome 会聚焦到该标签。

#### 查看Service worker缓存内容

Service Worker 使用 Cache API 缓存只读资源，我们同样可以在 Chrome DevTools 上查看缓存的资源列表。

Cache Storage 选项卡提供了一个已使用（Service Worker 线程）Cache API 缓存的只读资源列表。

#### 网络跟踪

经过 Service Worker 的 `fetch` 请求 Chrome 都会在 Chrome DevTools Network 标签页里标注出来，其中：

- 来自 Service Worker 的内容会在 Size 字段中标注为 `from ServiceWorker`
- Service Worker 发出的请求会在 Name 字段中添加 ⚙ 图标。

## PWA的离线存储

对于网址可寻址的资源，使用[Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)（服务工作线程的一部分）。

对于所有其他的数据，使用 [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)（具有一个 Promise 包装器）。

以上两个API都是异步的（IndexedDB基于事件，CacheAPI基于Promise）。它们使用**网页工作线程**、**窗口**和**服务工作线程**。IndexedDB在每个位置都可用。服务工作线程（和CacheAPI）目前在Chrome、Firefox、Opera中可用，并正在针对Edge进行开发。IndexedDB的Promise包装器隐藏了IndexedDB库自带的一些强大但同时也非常复杂的machinery（如事务处理、架构版本）。IndexedDB将支持observers，可以轻松实现标签之间的同步。

#### 其他存储机制怎样？

Web Storage（如LocalStorage和SessionStorage）是同步的，**不支持网页工作线程**，并对大小和类型（仅限字符串）进行限制。

Cookie具有自身的用途，也是同步的，**缺少网页工作线程支持**，同时对大小进行限制。

WebSQL不具有广泛的浏览器支持，不建议使用。

File System API在Chrome以外的任意浏览器上都不受支持。

#### 能存储多少数据？

| 浏览器  | 限制                                                         |
| ------- | ------------------------------------------------------------ |
| Chrome  | 可用空间 <6%                                                 |
| Firefox | 可用空间 <10%（但在存储50M数据后将提示用户进行更多存储请求） |
| Safari  | <50MB                                                        |
| IE10    | <250MB（并在存储10MB后提示用户）                             |

#### 了解应用使用功能了多少存储空间？

在chrome中，可以使用[Quota Management API ](https://www.w3.org/TR/quota-api/)查询目前使用的存储空间大小

#### 缓存逐出是如何工作的？

| 浏览器  | 逐出政策                          |
| ------- | --------------------------------- |
| Chrome  | 在 Chrome 耗尽空间后采用 LRU 策略 |
| Firefox | 在整个磁盘已装满时采用 LRU 策略   |
| Safari  | 无逐出                            |
| Edge    | 无逐出                            |

## 添加到主屏幕

PWA提供了manifest.json配置文件，可以让开发者自定义添加至桌面时的图标、显示名称、启动方式等信息，并提供API方便开发者管理网络应用安装横幅，让用户可以方便快捷地将站点添加到主屏幕。

通过配置manifest.json进行相应配置，可以实现以下功能：

- 基本功能
  - 自定义名称
  - 自定义图标
  - 设置启动网址
  - 设置作用域
- 改善应用功能体验
  - 添加启动画面
  - 设置显示类型
  - 指定显示方向
  - 设置主题色
- 应用安装横幅
  - 引导用户添加应用
  - 引导用户安装原生应用

#### 自定义名称

- name：{string} 应用名称，用于安装横幅、启动画面显示
- short_name: {string} 应用短名称，用于主屏幕显示

> 目前如果修改了manifest.json的应用名称，已添加到主屏幕的名称并不会改变，只有当用户重新添加到桌面时，更改后的名称才会显示出来。但在未来版本的Chrome浏览器将支持名称自动更新

#### 自定义图标

- icons：{Array.< ImageObject >} 应用图标列表

其中ImageObject的属性值包括：

- src: {string} 图标url
- type {string} 图标的mime类型，非必填项，该字段可让浏览器快速忽略掉不支持的图标类型
- sizes {string} 图标尺寸，格式为width*height，宽高数值以css的px为单位。如果需要填写多个尺寸，则使用空格进行间隔，如“48X48 96X96 128X128”

当PWA添加到主屏幕时，浏览器会根据有效图标的 sizes 字段进行选择。首先寻找与显示密度相匹配并且尺寸调整到 **48dp 屏幕密度的图标**；如果未找到任何图标，则会查找与设备特性匹配度最高的图标；如果匹配到的图标路径错误，将会显示浏览器默认 icon。

> 需要注意的是
>
> 1. 在启动应用时，启动动画图像会从图标列表中提取最接近128dp的图标进行显示
> 2. 当PWA添加到主屏幕时，浏览器会根据有效图标的 sizes 字段进行选择。首先寻找与显示密度相匹配并且尺寸调整到 48dp 屏幕密度的图标；如果未找到任何图标，则会查找与设备特性匹配度最高的图标；如果匹配到的图标路径错误，将会显示浏览器默认 icon。

#### 设置启动网址

- start_url: {string} 应用启动地址

如果为空，则默认使用当前页面。如果start_url配置的相对地址，则基地址与manifest.json相同。

#### 设置作用域

有时仅仅对站点的某些模块进行PWA改造，其余部分还是普通的网页。因此超出范围的部分会以浏览器的方式显示。

- scope：{string} 作用域

scope应遵循如下规则：

- 如果没有在 manifest 中设置 scope，则默认的作用域为 manifest.json 所在文件夹；
- scope 可以设置为 `../` 或者更高层级的路径来扩大PWA的作用域；
- `start_url` 必须在作用域范围内；
- 如果 `start_url` 为相对地址，其根路径受 scope 所影响；
- 如果 `start_url` 为绝对地址（以 `/` 开头），则该地址将永远以 `/` 作为根地址；

#### 设置显示类型

可以设置display属性去指定PWA从主屏幕点击启动后的显示类型

- display {string} 显示类型

显示类型：

| 显示类型   | 描述                                                         | 降级显示类型 |
| ---------- | ------------------------------------------------------------ | ------------ |
| fullscreen | 应用的显示界面将占满整个屏幕                                 | standalone   |
| standalone | 浏览器相关UI（如导航栏、工具栏等）将会被隐藏                 | minimal-ui   |
| minimal-ui | 显示形式与standalone类似，浏览器相关UI会最小化为一个按钮，不同浏览器在实现上略有不同 | browser      |
| browser    | 浏览器模式，与普通网页在浏览器中打开的显示一致               | （None）     |

> CSS中可以通过display-mode媒体查询条件去指定在不同的显示类型下不同的显示形式

```css
@media all and (display-mode: fullscreen) {
    body {
        margin: 0;
    }
}

@media all and (display-mode: standalone) {
    body {
        margin: 1px;
    }
}

@media all and (display-mode: minimal-ui) {
    body {
        margin: 2px;
    }
}

@media all and (display-mode: browser) {
    body {
        margin: 3px;
    }
}
```

#### 指定页面显示方向

- orientation: {string} 应用显示方向

主要有几种：

- landscape-primary
- landscape-secondary
- landscape
- portrait-primary
- portrait-secondary
- portrait
- natural
- any

#### 设置主题颜色

控住浏览器UI的颜色。如PWA启动画面上状态栏、内容页中状态栏、地址栏的颜色，会被theme_color所影响

- theme_color：{color} css色值

> 在指定了theme_color的值之后，地址栏依然呈白色。可以在页面HTML里设置name为theme_color的meta标签
>
> ```html
> <meta name="theme_color" content="green">
> ```
>
> 这个标签的色值会覆盖manifest.json里设置的，

#### 引导用户添加应用至主屏幕

浏览器在PWA站点满足以下条件时会自动显示横幅：

- 站点部署manifest.json，该文件需配置如下属性：
  - short_name
  - name
  - icons(必须**包含一个mime类型为image/png的图标声明**)
  - start_url
  - display(必须为**standalone或fullscreen**)
- 站点注册Service Worker
- 站点支持HTTPS访问
- 站点在**同一浏览器中被访问至少两次**，**两次访问间隔至少为5分钟**

#### 引导用户安装原生应用

浏览器在PWA站点满足以下条件时会自动显示横幅：

- 站点部署manifest.json，该文件需配置如下属性：
  - short_name
  - name
  - icons(必须**包含一个192X192且mime类型为image/png的图标声明**)
  - 包含原生应用相关信息的**related_applications对象**
- 站点注册Service Worker
- 站点支持HTTPS访问
- 站点在**同一浏览器中被访问至少两次**，**两次访问间隔至少为2天**

其中related_applications的定义如下:

- related_applications: Array.< AppInfo >关联应用列表

  AppInfo的属性包括

  - platform：{string} 应用平台
  - id：{string} 应用id

如果只希望用户安装原生应用，不需要弹出横幅引导用户安装，可以设置："prefer_related_applications": true

## 网络推送通知

即使浏览器关闭的情况下，网络推送通知也可以像原生APP那样进行消息推送，并将推送的消息显示在通知栏里。



## 疑惑

1. 内容发生改变时，重新注册安装即Service Worker更新的最佳方案？

   为了最大化利用浏览器缓存service-worker.js，但又保证一旦项目更新时浏览器能够及时更新：

   - 将注册代码单独放置在sw-register.js中
   - 将sw-register.js中实际注册service-worker.js的部分，在后面添加？v=xxx，取值为编译时间。
   - 在HTML引用sw-register.js，同样在后面添加？v=xxx，但这里取值为当前时间，因为每次请求都在变化，避免浏览器对sw-register.js进行缓存。

2. sw.update 事件理解？

   > 注册的sw.update事件是在/components/UpdateToast.vue组件进行监听，并在更新时弹出提示，引导用户刷新页面。
   >
   > ```js
   > mounted() {
   >         window.addEventListener('sw.update', this.handleUpdate);
   >     },
   >     beforeDestroy() {
   >         window.removeEventListener('sw.update', this.handleUpdate);
   >     },
   >     
   > // UpdateToast.vue做监听，若事件发生，则执行handleUpdate方法
   > ```

3. App shell 和 skeleton最佳实践？

   在spa中，使用skeleton：

   - 在webpack中引入插件

     ```js
     //webpack.conf.js
     import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';
     plugins: [
         new SkeletonWebpackPlugin({
             webpackConfig: require('./webpack.skeleton.conf')
         })
     ]
     
     参数说明：
     webpackConfig必填，渲染skeleton的webpack配置对象
     insertAfter选填，渲染DOM结果插入位置，默认值为'<div id="app">'
     quiet选填，在服务端渲染时是否需要输出信息到控制台
     router选填，SPA下配置各个路由路径对应的Skeleton
       -mode 选填路由模式，两个有效值history|hash
       -routes 选填路由数组，其中每个路由对象包含两个属性：
       	-path路由路径
       	-skeletonId Skeleton DOM的id
     minimize选填，SPA下是否需要压缩注入HTML的JS代码
     ```

   - 自动插入路由规则

     ```js
     // webpack.dev.conf.js
     import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';
     module: {
         rules: [
             SkeletonWebpackPlugin.loader({
                 resource: resolve('src/entry.js'),
                 options: {
                     entry: 'skeleton',
                     routePathTemplate: '/skeleton',
                     importTmplate: 'import Skeleton from \'./Skeleton.vue\';'
                 }
             })
         ]
     }
     参数：
     1.webpack模块规则，skeleton对应的路由将被插入路由文件中，需要指定一个或多个路由文件，使用resource/include/test都可以指定loader应用的文件
     2.options将被传入loader中的参数对象，包含以下属性：
     	entry必填，支持字符串和数组类型，对应页面入口的名称
     	importTemplate选填，引入skeleton组件的表达式，默认值为'import [nameCap] from \'@/pages/[nameCap].vue\';'
     	routePathTemplate选填，默认值为'/skeleton-[name]'
     	insertAfter选填，路由插入位置，默认值为'routes: ['
     importTemplate和routePathTemplate中使用占位符：
     	[name]和entry一致
     	[nameCap]和entry首字母大写一致
     	[nameHash]和entry名称生成的Hash一致
     ```

   在ssr中，使用appShell：

   注意点：

   - 当修改完代码传到服务器上后，需要重启服务器，原因可能是因为缓存，虽然service-worker.js更新了js和css，但是第一次的服务端渲染的请求/appshell如果不重启服务器，会取上一次的cache，导致报内部的js、css找不到文件，接下来将这些错误的信息缓存到了service-worker中，就会一直报错。

   - 当使用了appshell以后，只有第一次会服务端渲染获取appshell的值。第二次请求后，取得是缓存中的appshell，通过body标签中的data-vue-meta="empty-appshell"做标识，存在这个标识，代表从缓存中读取，接下来的页面跳转就是和spa一样，前端获取数据渲染

   - lavas脚手架 在ssr:true有错，appshell加载完成后没有mount。原因是**异步加载了css，此时要把asyncCSS设置为false**；但在**skeleton时，应该使用true，让skeleton更早的出现，减少白屏时间**（修改lavas-config.js中的配置）

     ```
     // lavas.config.js
     // spa 用true，ssr用false
     cssExtract: false,
     ```

   - 在研究appshell时，产生了对ssr的原理理解思考？

     ssr实际上在第一次刷新整个url时，就把完整的html和js返回到前端做混合，后面做跳转实际是router局部刷新。这个非常重要

4. Workbox 参数swSrc、globDirectory、staticFileGlobs、swDest作用？

   > **swSrc**：模板的路径
   >
   > **swPath**：修改该配置可以指定service-worker.js的scope
   >
   > **swDest**：输出service-worker.js的路径
   >
   > globDirectory、staticFileGlobs决定需要缓存的静态文件，这两个参数存在默认值。插件会从compilation参数中获取开发者在webpack配置的output.path作为globDirectory的默认值，staticFileGlobs的默认设置是html，js，css文件，如果需要缓存一些界面必须的图片，这个地方需要自己配置
   >
   > **globDirectory** 指定需要预缓存的静态文件的目录
   >
   > **globPatterns** 相对于globDirectory指定的目录，指出哪些文件需要被预缓存。
   >
   > **globIgnores** 相对于globDirectory指定的目录，指出哪些文件不需要被预缓存
   >
   > **dontCacheBustUrlsMatching**  workbox会将符合上述glob开头的三个配置项条件的所有静态文件逐个生成一个版本号（称为revision）存入缓存，后续再面对同名文件时比较缓存中的版本号决定是否更新。可以通过这个参数的正则匹配，匹配成功的会过滤掉不在workbox中生成版本号，省略了生成和比较的过程提升构建速度。
   >
   > **以上参数都是workbox中的参数**
   >
   > 配置中globIgnores要配sw-register.js和** . *map。不能缓存sw-register，否则无法更新sw
   >
   > 另外，workbox返回生成的service-worker.js后，sw-register-webpack-plugin会通过sw-register.js的模板在路径后加上hash值，保证不会读浏览器的缓存。
   >
   > 插入在index.html中的引入sw-register.js的也要加上hash值，保证不会读缓存。
   >
   > **service-worker.js中WorkboxSW的配置项**：
   >
   > - cacheId：指定应用的缓存ID，会影响到缓存的名称。WorkBox还会将域名加载缓存ID中共同作为缓存名称，重名的几率会比较小
   > - ignoreUrlParametersMatching：指名什么样的请求参数应该被忽略。Service Worker的静态文件缓存会根据请求URL进行匹配。只要请求URL不同则认为是不同的资源。
   > - skipWaiting：在Service Worker的install阶段完成后无需等待，立即激活（activate）等同于self.skipWaiting()
   > - clientsClaim：activate阶段让所有没被控制的页面控制。等同于self.clients.claim()
   > - 同时使用skipWaiting和clientsClaim可以让Service Worker在下载完成后立即生效
   >
   > **strategies**
   >
   > ```js
   > // JS 请求：网络优先
   > workbox.routing.registerRoute(
   > 	new RegExp('.*\ .js'),
   > 	workbox.strategies.networkFirst({
   > 		cacheName: 'workbox:js',
   > 	})
   > );
   > // css 请求：缓存优先，同时后台更新后下次打开页面才会被页面使用
   > workbox.routing.registerRoute(
   > 	// cache css files
   > 	/.*\ .css/,
   > 	workbox.strategies.staleWhileRevalidate({
   >         cacheName: 'workbox:css'
   > 	})
   > );
   > // 图片请求：缓存优先
   > workbox.routing.registerRoute(
   > 	/.*\ .(?:png|jpg|jpeg|svg|gif)/,
   > 	workbox.strategies.cacheFirst({
   >         cacheName: 'workbox:image',
   >         plugins: [
   >             new workbox.expiration.plugin({
   >                 maxEntries: 20,
   >                 maxAgeSeconds: 7*24*60*60
   >             })
   >         ]
   > 	})
   > )
   > // demo页
   > <html>
   > <head>
   >   <link rel="stylesheet" href="./css/style.css">
   > </head>
   > <body>
   >   <h1>Workbox Get Started</h1>
   >   <img src="./images/google.local.png" alt="同域的文件">
   >   <script src="./js/index.js"></script>
   > </body>
   > </html>
   > ```
   >
   > 第一次访问时的效果：
   >
   > ![gs1](http://reyshieh.com/assets/gs1.png)
   >
   > fetch事件无法在这次访问被捕获
   >
   > 刷新页面的效果：
   >
   > ![gs2](http://reyshieh.com/assets/gs2.png)
   >
   > - 全部的css、png、js文件均被ServiceWorker拦截
   > - workbox-core在拦截后重新发起了fetch请求并返回页面，fetch后服务端**返回304依然使用浏览器本地缓存策略**
   > - 上述命中规则的请求都被缓存到cache storage中
   >
   > 更新css、js和png的内容，然后重新访问页面：
   >
   > ![gs4](http://reyshieh.com/assets/gs4.png)
   >
   > - 由于png是cache first，所以直接从service worker的cache返回，没有真正的网络请求发出
   > - js是network first，会产生fetch，且运行成功
   > - css虽然同样fetch了新的内容，但页面并没有生效，用的还是上次的cache（但新的文件内容已经放到cache storage中）
   >
   > 不做修改，再刷新页面：
   >
   > ![gs5](http://reyshieh.com/assets/gs5.png)
   >
   > - 新的css生效
   > - **css、js请求返回304，使用浏览器缓存**
   >
   > **离线功能**
   >
   > 要做到能够完全离线，要让主文档也能被缓存下来
   >
   > ```js
   > // 主文档: 网络优先
   > workbox.routing.registerRoute(
   >   /index\.html/,
   >   workbox.strategies.networkFirst({
   >     cacheName: 'workbox:html',
   >   })
   > );
   > ```
   >
   > 缓存成功后，即便断网，页面依旧可以访问及使用：
   >
   > ![ol1](http://reyshieh.com/assets/ol1.png)
   >
   > **跨域请求**
   >
   > 当请求是**跨域资源（不仅限于接口，也包括图片等）**并且目标服务器并**没有设置CORS**时，响应类型会被设置为‘**opaque**’并且HTTP**状态码会被设置为0**.出于安全考虑，workbox对于这类资源的信任度不高，在使用**CacheFirst策略时只缓存HTTP状态码为200的资源**。所以这类资源不会被缓存，当然在离线时也无法被展现
   >
   > ```html
   > <div>
   >   <p>不同域的文件</p>
   >   <p><img src="https://developers.google.com/web/tools/workbox/images/Workbox-Logo-Grey.svg" alt="不同域的文件"></p>
   > 
   >   <p>不同域的文件 且 <code>access-control-allow-origin: *</code></p>
   >   <img src="https://unpkg.com/resize-image@0.0.4/example/google.png" alt="不同域的文件 且 allow cross origin">
   > </div>
   > <!-- 不同域的js 且 access-control-allow-origin: * -->
   > <script src="https://unpkg.com/jquery@3.3.1/dist/jquery.js"></script>
   > ```
   >
   > Workbox可以用**networkFirst**和**staleWhileRevalidate**两种策略**Cache跨域资源**，而**cacheFirst**完全**不行**。**原因是Fetch跨域的请求是无法知道该请求是否成功，因此cacheFirst则有可能缓存下失败的请求，并从此以后都会接管页面的这个请求导致页面错误。**而networkFirst和staleWhileRevalidate是有更新机制，即使错了下次修复了就好了。cacheFirst例子即使**开启offline**也能浏览到页面是因为html是同域的，而**跨域资源有浏览器缓存**。如果同时开启**disable cache**就**无法看到相关跨域的静态资源**了
   >
   > 但如果执意要用cacheFirst缓存跨域资源，(cacheableResponse.Plugin)[https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.cacheableResponse.Plugin]
   >
   > ```js
   > // Force Caching of Opaque Responses
   > workbox.routing.registerRoute(
   >   new RegExp('https://developers\.google\.com/'),
   >   workbox.strategies.cacheFirst({
   >     cacheName: `${CACHE_NAME}:cache-first`,
   >     plugins: [
   >       // Force Cache
   >       new workbox.cacheableResponse.Plugin({
   >         statuses: [0, 200], // One or more status codes that a Response can have and be considered cacheable.这里允许状态码为0的情况也缓存，可以解决跨域不缓存的问题
   >       }),
   >     ]
   >   }),
   > );
   > ```
   >
   > 此时就可以看到https://developers.google.com/域名下的资源也缓存了：
   >
   > ![co1](http://reyshieh.com/assets/co1.png)
   >
   > **不难看出**，以上的routing需要**第三次访问才能真正从cache中将缓存返回（或者支持离线）**。如果要提前至第二次，那么就要使用precache，使用precache后，会在第一次就将资源全部cache下来了。
   >
   > **动态缓存的注册顺序**
   >
   > workbox的内部使用一个数组记录所有动态缓存的正则表达式。在开发者使用registerRoute时，内部调用数组的unshift方法进行扩充。因此，结论是 **越后注册的规则将越先匹配**

5. ```js
   navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
           reg.onupdatefound = function() {
               var installingWorker = reg.installing;
               installingWorker.onstatechange = function() {
                   switch (installingWorker.state) {
                       case 'installed':
                           if (navigator.serviceWorker.controller) {
                               var event = document.createEvent('Event');
                               event.initEvent('sw.update', true, true);
                               window.dispatchEvent(event);
                           }
                           break;
                   }
               };
           };
   其中 reg.onupdatefound/reg.installing/reg.installing.onstatechange的理解
   service-worker事件理解
   这里注册的sw.update事件是在/components/UpdateToast.vue组件进行监听，并在更新时弹出提示，引导用户刷新页面。
   ```

## IOS pwa

ios11版本已经全面兼容pwa，研究研究~

### 配置index.html文件

配置app的挑战在于理解ios和android的metas标签和web app manifest的不同，先要理解每个配置的作用。

糟糕的是，对于ios，要创建大量的标签适配各种屏幕和想要的方向，否则用户将会在你启动的app中看到白屏。

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <!-- The usual suspects -->
  <meta charset="utf-8">
  <meta name="description"
        content="My app is awesome because...">
  <title>My awesome app</title>
  <link rel="shortcut icon"
        href="%PUBLIC_URL%/favicon.ico">
  
  <!-- Use viewport-fit=cover to fill the iPhone X notch and also prevent content going under the status bar (if it's translucent) -->
  <!-- More info: https://css-tricks.com/the-notch-and-css/ -->
  <meta name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">

  <!-- More PWA settings are in the manifest: https://gist.github.com/sconstantinides/8181934ecf82acde62589bac379f6676 -->
  <link rel="manifest"
        href="%PUBLIC_URL%/manifest.json">
  
  <!-- Android: Define the nav bar color -->
  <!-- More info: https://developers.google.com/web/fundamentals/design-and-ux/browser-customization/#color_browser_elements -->
  <meta name="theme-color"
        content="#32324B">
  
  <!-- iOS specific styles -->
  
  <meta name="apple-mobile-web-app-capable"
        content="yes">
  
  <!-- Possible values include default, black, or black-translucent; only black-translucent is truly full screen -->
  <!-- More info: https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html -->
  <meta name="apple-mobile-web-app-status-bar-style"
        content="black-translucent">
  
  <!-- Home screen icon -->
  <link rel="apple-touch-icon"
        href="%PUBLIC_URL%/images/appIcon.png">

  <!-- iOS startup images -->
  <!-- More info and Sketch template: https://medium.com/@applification/progressive-web-app-splash-screens-80340b45d210 -->
  
  <!-- iPhone SE -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-640x1136.png"
        media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-640x1136-landscape.png"
        media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  
  <!-- iPhone 6/7/8 -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-750x1294.png"
        media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-750x1294-landscape.png"
        media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  
  <!-- iPhone 6+/7+/8+ -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1242x2148.png"
        media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1242x2148-landscape.png"
        media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  
  <!-- iPhone X -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1125x2436.png"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1125x2436-landscape.png"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  
  <!-- iPad 3/4/Pro 9.7" -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1536x2048.png"
        media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1536x2048-landscape.png"
        media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)">
  
  <!-- iPad Pro 10.5" -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1668x2224.png"
        media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-1668x2224-landscape.png"
        media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)">
  
  <!-- iPad Pro 12.9" -->
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-2048x2732.png"
        media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image"
        href="%PUBLIC_URL%/images/launch-2048x2732-landscape.png"
        media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)">
</head>

<body>
  <div id="root"></div>
</body>

</html>
```

### 设计一致性

可以在安装的pwas中使用css media queries

```css
/* Replace "standalone" with "fullscreen" depending on your manifest.json display mode */

@media (display-mode: standalone) {
  /* All installed PWAs */
}

@media (max-width: 576px) and (display-mode: standalone) {
  /* Installed PWAs on mobile devices */
  
  @supports (-webkit-overflow-scrolling: touch) {
    /* Installed PWAs on mobile Apple devices */
  }
  
  @supports not (-webkit-overflow-scrolling: touch) {
    /* Installed PWAs on mobile non-Apple devices */
  }
}
```

切换不同可视pwas的javascript

```js
if (window.matchMedia('(display-mode: standalone)').matches) {
  // Is installed in standalone display mode
}

if (window.matchMedia('(display-mode: fullscreen)').matches) {
  // Is installed in fullscreen display mode
}
```

## workbox

###定义动态路由前

在定义动态路由之前可以做一些配置，如

```js
// first
workbox.core.setCacheNameDetails({
    prefix: 'reyshieh-cache',
    suffix: 'v1',
    precache: 'install-time',
    runtime: 'run-time',
    googleAnalytics: 'ga'
});
// second
workbox.skipWaiting();
workbox.clientClaim();
// third
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);
```

####FIRST：

设置一些缓存名称的配置项。

- perfix - 指定应用的缓存前缀，同时应用于预缓存和动态缓存的名称，拼接在最前面
- suffix - 指定应用的缓存后缀，同时应用于预缓存和动态缓存的名称，拼接在最后面
- precache - 指明预缓存使用的缓存名称
- runtime - 指定预缓存使用的缓存名称
- googleAnalytics - `workbox-google-analytics`使用的缓存名称

####SECOND：

`workbox.skipWaiting()`和`workbox.clientsClaim()`一般共同使用，使得Service Worker可以在activate阶段让所有没被控制的页面受控，让Service Worker在下载完成后立即生效

####THIRD：

`workbox.precaching.precacheAndRoute(self.__precacheManifest || [])`使用到的`self.__precacheManifest`是定义在单独的一个预缓存文件列表中。

###设置动态缓存规则：

```
workbox.routing.registerRoute(/^https:\/\/query\.yahooapis\.com\/v1\/public\/yql/, workbox.strategies.networkFirst());
```

> Workbox提供的`registerRoute`方法接受两个参数，第一个是匹配请求URL的正则表达式，第二个是内置的缓存策略。除了networkFirst，workbox还提供了networkOnly、cacheFirst、cacheOnly、staleWhileRevalidate等
>
> 经过这条配置，每次请求的URL如果匹配这个正则（其实是雅虎天气获取接口），在返回数据时会将数据进行缓存。如果网络连接故障，则返回缓存内容。配合预缓存了所有静态文件，站点就拥有了离线访问能力。

#### 缓存策略的参数

实际上，除了直接使用`networkFirst()`没带参数，还可以做一些个性化的配置，对策略进行更精细化的控制。例如

1. 使用一个特定的缓存（指定一个不一样的缓存名称）
2. 设置缓存失效时间或者个数上限

这些都可以通过缓存的参数来实现。主要有两种：

1. `cacheName`：指定新的缓存名称，使得符合这条正则的请求的缓存全都存在一起
2. `plugins`：指定插件的数组。插件可以实现缓存失效时间或者个数上限，也包括其他的功能，甚至可以自定义

### 注册Service Worker技巧

以下为lavas中的实现方式：

Service worker编写完生效，必须要进行注册。但是在注册时，更新问题是需要考虑的，因为存在浏览器缓存，导致service-worker.js可能会存在因为缓存原因而没有更新的情况，解决这个问题又要最大化利用浏览器缓存，可以通过：

1. 将注册代码单独放置在`sw-register.js`中
2. `sw-register.js`中实际注册`service-worker.js`的部分，在后面添加`?=xxx`，取值为编译时间。因此一次编译后不会修改，`service-worker.js`可以被浏览器缓存
3. 在HTML中引用`sw-register.js`，同样在后面添加`?=xxx`，但这里取值为当前时间，因此每次请求都在变化，避免浏览器对`sw-register.js`进行缓存

以下是sw-register.js的实现代码

```js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js?v=xxx').then(function(reg) {
        reg.onupdatefound = function() {
            var installingWorker = reg.installing;
            installingWorker.onstatechange = function() {
                switch (installingWorker.state) {
                    case 'installed':
                    	if (navigator.serviceWorker.controller) {
                            var event = document.createEvent('Event');
                            event.initEvent('sw.update', true, true);
                            window.dispatchEvent(event);
                    	}
                    break;
                }
            };
        };
    }).catch(function(e) {
        console.error('Error during service worker registration:' + e);
    });
}
```

主要工作包括：

1. 调用`navigator.serviceWorker.register`注册Service Worker
2. 注册`updatefound`事件并监听Service Worker的更新，并在更新时分发`sw.update`事件

插入HTML文件的代码如下：

```html
<script>
window.onload = function() {
    var script = document.createElement('script');
    var firstScript = document.getElementByTagName('script')[0];
    script.type = 'text/javascript';
    script.async = true;
    script.src = '/sw-register.js?v=' + Date.now();
    firstScript.parentNode.insertBefore(script, firstScript);
}
</script>
```

### Workbox webpack Plugins

实现两个类：`GenerateSW`和`InjectManifest`。

#### GenerateSW Plugin

该插件会创建service worker文件并添加webpack asset管道。

**什么情况使用？**

- 期望预缓存文件
- 简单运行时配置需求(如，配置允许定义路由和策略)

**什么情况不使用？**

- 期望使用别的service worker特征(如，Web Push)
- 期望导入额外的脚本或添加额外的逻辑

**使用**

最简配置方式

```js
// Inside of webpack.config.js:
const {GenerateSW} = require('workbox-webpack-plugin');

module.exports = {
  // Other webpack config...
  plugins: [
    // Other plugins...
    new GenerateSW()
  ]
};
```

该配置会生成预缓所有webpack assets的service worker

[完整的配置](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)

```js
// Inside of webpack.config.js:
const {GenerateSW} = require('workbox-webpack-plugin');

module.exports = {
  // Other webpack config...
  plugins: [
    // Other plugins...
    new GenerateSW({
      option: 'value',
    })
  ]
};
```



#### InjectManifest Plugin

该插件将生成预缓存URLs列表，添加预缓存manifest到已存在service worker文件。否则文件将保持原样。

**什么情况使用？**

- 期望对service worker更多的控制
- 预缓存文件
- 对routing有更复杂的需求
- 期望使用service worker别的APIs（如 Web Push）

**什么情况不使用？**

- 期望通过最简单的方式添加service worker到站点中

**使用**

可以在webpack配置中如下

```js
// Inside of webpack.config.js
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
    // Other webpack config...
    plugins: [
        // Other plugins...
        new InjectManifest({
            swSrc: './src/sw.js',
        })
    ]
};
```

该配置会创建一个预缓存manifest，并注入service worker文件通过`importScripts()`

[更多配置](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)

以下配置为webpack compilation使用

- swDest：String,默认"service-worker.js"。build过程中会被创建，相对于webpack output路径

- importWorkboxFrom：String，默认‘cdn’。可以为‘cdn’，‘local’，‘disabled’
- chunks：Array或String，默认[]。默认情况，workbox将预缓存所有assets，不管是属于哪个块。如果想通过白名单来覆盖默认行为，可以通过该属性指定块名，只有属于指定中的块，才可以预缓存。
- excludeChunks：Array或String，默认[]。该属性和chunks恰好相反，设置黑名单来排除预缓存
- include：Array或RegExp或String。指定assets匹配规则，满足该匹配规则都将被写到预缓存manifest中
- exclude：与include相反
- importsDirectory：String，默认''。该属性到功能importWorkboxFrom为local时生效，可以通过指定该参数，来调整Workbox库默认拷贝到本地的路径。此选项不影响创建主服务工作者JavaScript文件的位置，它由swDest属性决定最终位置
- precacheManifestFilename：String，默认为precache-manifest.[manifestHash].js

以下配置和webpack compilation无关

- swSrc：自定义模板资源路径。
- globDirectory：String，默认undefined。配置该属性，需要确定同时也配置globPatterns，用来确定globPatterns匹配的文件路径位置，相对于当前工作文件
- globFollow：Boolean，默认true。决定是否需要在生成预缓存manifest时允许使用符号连接
- globIgnores：Array或String，默认['node_modules/* * /*']。排除匹配到的文件，不生成对应的预缓存
- globPatterns：Array或String，默认['** / *.{js,css,html}'] (workbox-build和workbox-cli使用)或[] (workbox-webpack-plugin使用)，匹配到的文件将生成对应的预缓存。但该属性当使用workbox-webpack-plugin时是没必要使用的，因为该plugin会自动预缓存文件
- globStrict：Boolean，默认true。为true，当生成预缓存manifest失败时会产生对应的错误信息；false，会自动跳过错误
- templatedUrls：带有String的Object或String数组，默认null。
- maximumFileSizeToCacheInBytes：Number，默认2097152，预缓存文件的最大值
- dontCacheBustUrlsMatching：RegExp，默认null。匹配此regex的assets将被认为是通过其URL进行唯一版本化的，并且免除了在填充预缓存时执行的正常HTTP缓存破坏。如`dontCacheBustUrlsMatching: /\.\w{8}\./`

### Libraries

- workbox

  `workbox-sw`模块提供了一个极简单的方式运行Workbox模块，简化Workbox模块的加载，并提供一些简单方法

  - CDN

    ```js
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');
    ```

    通过CDN调用后，您的service worker将拥有`workbox`命名空间，该空间将提供对所有Workbox模块的调用，如

    ```js
    workbox.precaching.*
    workbox.routing.*
    etc
    ```

    当首次引用一个模块时，`workbox-sw`将检测到并在使其生效之前加载该模块。可以在Devtools的network页签下看见变化

  - Local Workbox

    可以通过[`workbox-cli`'s `copyLibraries` command](https://developers.google.com/web/tools/workbox/modules/workbox-cli#copylibraries) 或者从 [GitHub Release](https://github.com/GoogleChrome/workbox/releases)中下载，然后通过`modulePathPrefix`配置属性查找文件

    ```js
    importScripts('/third_party/workbox/workbox-sw.js');
    
    workbox.setConfig({
        modulePathPrefix: '/third_party/workbox/'
    });
    ```

  **避免Async Imports**

  在底层，首次加载新模块涉及到调用`importScripts()`路径到相应的JavaScript文件(或托管在CDN上，或通过本地URL)。无论哪种情况，都有一个重要的限制：`importScripts()`的隐式调用只能发生在service worker的`install`处理器或在service worker脚本的同步、初始执行期间。

  为了避免违背约束，最佳实践是在任何处理器或者异步方法外部引用`workbox.*`命名空间

  例如，如果你没有引入`workbox.strategies`，代码将发生问题:

  ```js
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');
  
  self.addEventListener('fetch', (event) => {
    if (event.request.url.endsWith('.png')) {
      // Oops! This causes workbox-strategies.js to be imported inside a fetch handler,
      // outside of the initial, synchronous service worker execution.
      const cacheFirst = workbox.strategies.cacheFirst();
      event.respondWith(cacheFirst.makeRequest({request: event.request}));
    }
  });
  ```

  如果你需要编写与此限制冲突的代码，可以使用`workbox.loadModule()`方法在事件处理程序之外显式地触发`importScripts()`调用:

  ```js
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');
  
  // This will trigger the importScripts() for workbox.strategies and its dependencies:
  workbox.loadModule('workbox-strategies');
  
  self.addEventListener('fetch', (event) => {
    if (event.request.url.endsWith('.png')) {
      // Referencing workbox.strategies will now work as expected.
      const cacheFirst = workbox.strategies.cacheFirst();
      event.respondWith(cacheFirst.makeRequest({request: event.request}));
    }
  });
  ```

  或者，可以在事件处理程序之外创建对相关名称空间的引用，然后稍后使用该引用:

  ```js
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');
  
  // This will trigger the importScripts() for workbox.strategies and its dependencies:
  const {strategies} = workbox;
  
  self.addEventListener('fetch', (event) => {
    if (event.request.url.endsWith('.png')) {
      // Using the previously-initialized strategies will work as expected.
      const cacheFirst = strategies.cacheFirst();
      event.respondWith(cacheFirst.makeRequest({request: event.request}));
    }
  });
  ```

  **方法**

  - clientsClaim()，skipWaiting()
  - loadModule(moduleName)
  - setConfig(options)

- workbox.core

  workbox是模块化构建的，允许开发者选择他们想要使用的部分

  为了避免每个模块实现相同逻辑，`workbox-core`包含每个模块依赖的通用代码

  这个模块确实为开发人员提供了一些功能，但是除了日志级别和缓存之外，`workbox-core`为每个模块提供了内部逻辑，而不是终端开发人员

  - Log Level

    ```js
    // The most verbose - displays all logs.
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);
    
    // Shows logs, warnings and errors.
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.log);
    
    // Show warnings and errors.
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.warn);
    
    // Show *just* errors
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.error);
    
    // Silence all of the Workbox logs.
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.silent);
    ```

    可以通过以下方式查看当前log level:

    ```js
    console.log(workbox.core.logLevel);
    ```

    默认log level改变依靠构建类型：

    - debug build，`workbox-core.dev.js`，log level将设置`LOG_LEVELS.log`
    - production build，`workbox-core.prod.js`，log level将设置`LOG_LEVELS.warn`，意味着只能使用warnings和errors

  - 查看和改变默认Cache名称

    Workbox定义caches通过`workbox.core.cacheNames`：

    ```js
    console.log(workbox.core.cacheNames.precache);
    
    console.log(workbox.core.cacheNames.runtime);
    
    console.log(workbox.core.cacheNames.googleAnalytics);
    ```

    这些缓存名称通过prefix,name,suffix的格式构建

    ```
    <prefix>-<cache id (precache | runtime | googleAnalytics)>-<suffix>
    ```

    可以通过`setCacheNameDetails()`修改值

    ```js
    workbox.core.setCacheNameDetails({
      prefix: 'my-app',
      suffix: 'v1',
      precache: 'install-time',
      runtime: 'run-time',
      googleAnalytics: 'ga',
    });
    
    // Will print 'my-app-install-time-v1'
    console.log(workbox.core.cacheNames.precache);
    
    // Will print 'my-app-run-time-v1'
    console.log(workbox.core.cacheNames.runtime);
    
    // Will print 'my-app-ga-v1'
    console.log(workbox.core.cacheNames.googleAnalytics);
    ```

- workbox.precaching

  Service worker正在installing时，会缓存文件。通常被提及的就是"precaching"。

  当web应用第一次加载，workbox-precaching将查看你想要下载的所有assets，移除副本，并连接相关的service worker事件以下载和存储assets，保存有关indexedDB中asset的修订的信息

  **workbox-precaching只会在service worker的install事件期间执行**

  当用户重新浏览web应用，将有一个新的不同于预缓存assets的service worker。workbox-precaching将查看一个新的列表，决定哪些assets是新的，哪些是需要更新。在service worker sinstall事件期间，这些assets将在缓存中被更新，他们的修订信息将被更新或者添加到indexedDB中

  预缓存会在service worker每次安装和激活都执行，确保用户下载的文件都是最新的assets

  - workbox-precaching 期望得到字符串数组或者对象数组，就像以下

    ```js
    workbox.precaching.precacheAndRoute([
        'styles/example.ac29.css',
        {
            url: '/index.html',
            revision: 'as46',
        }
    ]);
    ```

    列表引用一组url，每个url都有自己的“修正”信息。上面例子的第一条"/styles/example.ac29.css"，修正信息已经在url上。这是浏览器允许将这些URLs安全缓存一段时间的最佳实践。像这样的assets，可以直接添加在预缓存列表中，不用使用revision

    对于那些URL中没有带修正信息的assets，只需要添加一个文件hash revision属性。让workbox-precaching知道哪些文件是改变和需要更新

    workbox可以通过工具生成这些list：

    - workbox-build
    - workbox-webpack-plugin
    - workbox-cli

  - 带有搜索参数的请求可以修改以移除特定值或所有值

    默认情况下，`utm_`值被移除，将改变`/?utm_=123`到`/`的请求

    可以通过`ignoreUrlParametersMatching`参数移除所有搜索参数或特定一组参数

    ```js
    workbox.precaching.precacheAndRoute(
    	[
            '/styles/index.0c9a31.css',
            '/scripts/main.0d5770.js',
        	{ url: '/index.html', revision: '383676' },
    	],
    	{
            ignoreUrlParametersMatching: [/.*/]
        }
    )
    ```

  - 一般情况，请求以`/`结尾都会带上`index.html`，因此请求`/`都会默认去预缓存`/index.html`

    可以通过设置`directoryIndex`属性设置成别的或者禁止该行为

    ```js
    workbox.precaching.precacheAndRoute(
      [
        '/styles/index.0c9a31.css',
        '/scripts/main.0d5770.js',
        { url: '/index.html', revision: '383676' },
      ],
      {
        directoryIndex: null,
      }
    );
    ```

  - 如果请求在预缓存中匹配失败，将在该请求URLs的最后加上`.html`。意味着像`/about`会匹配`/about.html`

    可以通过`cleanUrls`属性禁止这个行为

    ```js
    workbox.precaching.precacheAndRoute(
      [
        '/styles/index.0c9a31.css',
        '/scripts/main.0d5770.js',
        { url: '/index.html', revision: '383676' },
      ],
      {
        cleanUrls: false,
      }
    );
    ```

  - 如果想定义自定义匹配，可以通过`urlManipulation`属性配置。该属性必须是带有可能匹配的数组返回值的回调函数

    ```js
    workbox.precaching.precacheAndRoute(
      [
        '/styles/index.0c9a31.css',
        '/scripts/main.0d5770.js',
        { url: '/index.html', revision: '383676' },
      ],
      {
        urlManipulation: ({url}) => {
          ...
          return [alteredUrlOption1, alteredUrlOption2, ...];
        }
      }
    );
    ```

- workbox.routing

  service worker 拦截网络请求。它将返回浏览器响应，且方式可以是缓存内容，从网络中获取内容或通过service worker生成的内容

  ![workbox-routing-diagram](http://reyshieh.com/assets/workbox-routing-diagram.png)

  主要关注两个点：

  - 请求的类型

    默认情况，路由都以GET请求注册。如果想拦截别的类型，将指定方法

  - 路由注册顺序

    如果多个路由被注册用来处理同一个请求时，请求会采用第一个注册路由作为响应

  Routes方法：

  - matching

    matching必须是**同步**的，因为路由总是同步的调用fetch事件

    ```js
    const matchCb = ({url, event}) => {
      return (url.pathname === '/special/url');
    };
    ```

  - handling

    返回Response的Promise，Response取决于你，网络，缓存或者由service worker生成

    ```js
    // params值从match函数中返回
    const handlerCb = ({url, event, params}) => {
      return fetch(event.request)
      .then((response) => {
        return response.text();
      })
      .then((responseBody) => {
        return new Response(`${responseBody} <!-- Look Ma. Added Content. -->`);
      });
    };
    ```

  Workbox为执行matching和handling附带了一些helpers。但是如果想要不同的行为，编写自定义match和handler方法是最好的选择

  注册以上回调：

  ```
  workbox.routing.registerRoute(matchCb, handlerCb);
  ```

  通常handler会是[workbox-strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)中的其中一个策略，如

  ```js
  workbox.routing.registerRoute(
    matchCb,
    workbox.strategies.staleWhileRevalidate()
  );
  ```

  通常的实践是理由通用的表达式代替match回调，如

  ```js
  workbox.routing.registerRoute(
    new RegExp('/styles/.*\.css'),
    handlerCb
  );
  ```

  同域请求和跨域请求match匹配需要带上域名，若不写域名，service worker不会匹配成功

  **如何注册Navigation路由**

  如果站点是单页应用(SPA)，对于navigation请求，可以通过[NavigationRoute](https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.routing.NavigationRoute)返回指定的响应

  ```js
  workbox.routing.registerNavigationRoute('/single-page.app.html');
  ```

  默认情况下，该响应会包括所有的navigation请求，如果想限制它，可以通过设置`whitelist`和`blacklist`参数匹配路由

  ```js
  workbox.routing.registerNavigationRoute('/single-page-app.html', {
    whitelist: [
      new RegExp('/blog/')
    ],
    blacklist: [
      new RegExp('/blog/restricted/'),
    ]
  });
  ```

  需要注意：如果一个URL即在whitelist和blacklist，blacklist会覆盖whitelist

  **设置默认Handler**

  可以通过设置默认handler，即使不匹配路由也会被触发

  ```js
  workbox.routing.setDefaultHandler(({url, event, params}) => {
    ...
  });
  ```

  **设置异常捕获Handler**

  设置异常捕获Handler，当路由抛出异常，会触发

  ```js
  workbox.routing.setCatchHandler(({url, event, params}) => {
    ...
  });
  ```

  **定义非get请求的路由**

  ```js
  workbox.routing.registerRoute(
    matchCb,
    handlerCb,
    'POST'
  );
  workbox.routing.registerRoute(
    new RegExp('/api/.*\.json'),
    handlerCb,
    'POST'
  );
  ```

  **自定义workbox router**

  ```js
  const router = new DefaultRouter();
  self.addEventListener('fetch', (event) => {
    const responsePromise = router.handleRequest(event);
    if (responsePromise) {
      // Router found a route to handle the request
      event.respondWith(responsePromise);
    } else {
      // No route found to handle the request
    }
  });
  ```

  当用Router class，那也需要使用Route class或者继承classes来注册路由

  ```js
  const router = new DefaultRouter();
  router.registerRoute(new Route(matchCb, handlerCb));
  router.registerRoute(new RegExpRoute(new RegExp(...), handlerCb));
  router.registerRoute(new NavigationRoute(handlerCb));
  ```

- workbox.strategies

  `workbox-strategies`提供了最普遍的缓存策略

  - Stale-While-Revalidate（在等待时重新验证）

    ![stale-while-revalidate](http://reyshieh.com/assets/stale-while-revalidate.png)

    模式允许以尽可能快的速度响应请求，如果可用的话，可以使用缓存的响应，如果没有缓存，则返回到网络请求。然后使用网络请求来更新缓存

  - Cache-First

    ![cache-first](http://reyshieh.com/assets/cache-first.png)

  - Network First

    ![network-first](http://reyshieh.com/assets/network-first.png)

  - Network Only

    ![network-only](http://reyshieh.com/assets/network-only.png)

  - Cache Only

    ![cache-only](http://reyshieh.com/assets/cache-only.png)

  **配置策略**

  - 配置缓存名称

    ```js
    workbox.routing.registerRoute(
      new RegExp('/images/'),
      workbox.strategies.cacheFirst({
        cacheName: 'image-cache',
      })
    );
    ```

  - 配置缓存过期限制

  - 带有生命周期方法回调的plugins的数组

    - workbox.expiration.Plugin
    - workbox.cacheableResponse.Plugin
    - workbox.boradcastUpdate.Plugin
    - workbox.backgroundSync.Plugin

- workbox.expiration

  workbox提供了`workbox-cache-expiration` plugin，允许限制缓存入口的数量或者缓存能持续多长时间后移除入口

  - maxEntries

    需要主要，当缓存入口的数量超过限制，将会删除最老的入口

  - maxAgeSeconds

  ```js
  workbox.routing.registerRoute(
    /\/images\//,
    workbox.strategies.cacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    })
  );
  ```

- workbox.backgroundSync

  当向web服务器发送数据时，有时请求将失败。可能是因为用户失去了连接，也可能是因为服务器宕机;无论哪种情况，通常都希望稍后再尝试发送请求。

  [BackgroundSync API](https://wicg.github.io/BackgroundSync/spec/)是解决这个问题的一个方案。当service worker检测到网络请求失败，它可以注册以接收同步事件，当浏览器认为连接已经返回时，同步事件就会被发送。即使用户已经离开了应用程序，也可以传递同步事件，这使得它比重试失败请求的传统方法更有效。

  Workbox Background Sync被设计来更容易的使用BackgroundSync API和整合和别的workbox模块的配合。也实现了对不支持BackgroundSync的浏览器降级策略

  **基础使用**

  使用后台同步最简单的方法是使用plugin，当将来的同步事件触发时，插件会自动对失败的请求进行排队并重试。

  ```js
  const bgSyncPlugin = new workbox.backgroundSync.Plugin('myQueueName', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
  });
  
  workbox.routing.registerRoute(
    /\/api\/.*\/*.json/,
    workbox.strategies.networkOnly({
      plugins: [bgSyncPlugin]
    }),
    'POST'
  );
  ```

  **提升使用**

  Workbox Background Sync提供了Queue类，可以初始化和添加错误请求到队列中。失败请求会存储在[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)中并重新请求当浏览器认为连接恢复

  - 创建队列

    用队列名构造队列（必须和[origin](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#Definition_of_an_origin)不一致）

    ```js
    const queue = new workbox.backgroundSync.Queue('myQueueName');
    ```

  - 添加一个请求到队列

    当创建完Queue实例后，就可以添加失败请求到里面。添加失败请求通过唤起`.addRequest()`方法。例如，如下代码捕获任意失败请求并添加到队列中：

    ```js
    const queue = new workbox.backgroundSync.Queue('myQueueName');
    
    self.addEventListener('fetch', (event) => {
      // Clone the request to ensure it's save to read when
      // adding to the Queue.
      const promiseChain = fetch(event.request.clone())
      .catch((err) => {
          return queue.addRequest(event.request);
      });
    
      event.waitUntil(promiseChain);
    });
    ```

    一旦添加到队列，请求会自动重试直到service worker接收到`sync`事件(只有在浏览器认为连接已经恢复的请求下发生)。

    在不支持BackgroundSync API的浏览器中会在每次service worker被启动时重试队列。这要求页面控制service worker运行，因此不会非常有效。

  **测试Workbox Background Sync**

  测试BackgroundSync sync并不直观

  可以按照以下方式：

  - 加载页面，并注册service worker

  - 关闭电脑网络或者关掉web server(**不能用chrome devtools的offline**，因为只会影响页面请求，并不会阻止service worker请求)

  - 让网络请求插入到Workbox Background Sync 队列中

  - 打开网络或者service worker

  - 到chrome devtools>Application>service workers中主动调用sync 事件，输入workbox-background-sync:< 你的队列名 >，点击Sync按钮

    ![devtools-sync](http://reyshieh.com/assets/devtools-sync.png)

  - 到network请求中查看之前失败的请求，并且当重新请求成功，IndexDB数据将被清空

- workbox.googleAnalytics

  **使Workbox Google Analytics生效**

  调起`initialize()`方法

  ```
  workbox.googleAnalytics.initialize();
  ```

  以上是使用Google Analytics working offline的最简单方式，用该代码可以实现入队和重试失败Google Analytics请求。

  用以上方式，会有一个缺陷，无法区别该请求是否是首次尝试。意味着用户脱机的所有交互数据都会被接收。但是，无法知道在用户脱机时发生了哪些交互。

  可以通过设置一些参数来描述或注释这些从重新尝试请求中获得的数据

  - 通过设置`parameterOverrides`或`hitFilters`设置区分重试请求和非重试请求
    - parameterOverrides：为每个重试请求设置特定参数的相同值
    - hitFilter：在运行时计算特定参数的值或从另一个参数的值派生

- workbox.cacheableResponse

  `workbox-cacheable-responce`模块提供标准的方式，基于状态码、带有特定值的header出现或者两者结合，决定是否缓存该请求

  - 基于状态码缓存

    ```js
    workbox.routing.registerRoute(
      new RegExp('^https://third-party.example.com/images/'),
      workbox.strategies.cacheFirst({
        cacheName: 'image-cache',
        plugins: [
          new workbox.cacheableResponse.Plugin({
            statuses: [0, 200], // opaque responses 状态码为0
          })
        ]
      })
    );
    ```

    注：[Opaque responses](https://fetch.spec.whatwg.org/#concept-filtered-response-opaque)被定义在[Fetch API](https://fetch.spec.whatwg.org/)中，当CORS不启用时，对远程源发出的请求结果。对于不透明的响应，最直接的限制是不能从响应类的大多数属性(比如header)中获得有意义的信息，或者调用组成Body接口的各种方法(比如json()或text())。这符合不透明响应的黑箱性质。

  - 基于Headers缓存

    ```js
    workbox.routing.registerRoute(
      new RegExp('/path/to/api/'),
      workbox.strategies.staleWhileRevalidate({
        cacheName: 'api-cache',
        plugins: [
          new workbox.cacheableResponse.Plugin({
            headers: {
              'X-Is-Cacheable': 'true',
            },
          })
        ]
      })
    );
    ```

    以上例子表示当请求URLs包含`/path/to/api/`，且header中包括`X-Is-Cacheable`值为true，那么该响应就会被缓存。

    对于多个headers做标识，只要其中一个匹配即可。

  - 基于以上两种情况同时存在

    ```js
    workbox.routing.registerRoute(
      new RegExp('/path/to/api/'),
      workbox.strategies.staleWhileRevalidate({
        cacheName: 'api-cache',
        plugins: [
          new workbox.cacheableResponse.Plugin({
            statuses: [200, 404],
            headers: {
              'X-Is-Cacheable': 'true',
            },
          })
        ]
      })
    );
    
    ```

    如果用混合方式，必须两种情况都同时满足才能算匹配

  - 默认情况

    - `staleWhileRevalidate`和`networkFirst`：带有0或200状态码的响应被缓存
    - `cacheFirst`：只有200状态码会被缓存

    之所以两种策略存在不同，因为opaque响应式黑盒式。service worker不能知道这个响应是否是合法、是否是成功或者失败。

- workbox.broadcastUpdate

  `workbox-broadcast-cache-update`模式提供了一个标准的方式，通知桌面端，缓存响应更新了。最普遍被使用在`staleWhileRevalidate`策略。

  该模块利用 [Broadcast Channel API](https://developers.google.com/web/updates/2016/09/broadcastchannel) 通知更新。客户端监听更新，采取合适的行为，如自动展现一个消息让用户知道更新是合理的。

  - 如何确定是否要更新？

    缓存headers或有新的响应对象发生变化，表示更新

    默认下，`Content-Length`,`ETag`和`Last-Modified ` headers会被比较。

    workbox利用headers值代替逐字节比较会更有效，特别是潜在的大体积响应。

    > 注：因为workbox需要解析header值，因此opaque response不能使用该功能，不会触发更新消息

  - 使用Broadcast Cache更新

    该库更倾向于和`staleWhileRevalidate`策略一起使用，策略包括立即返回缓存的响应，但也提供异步更新缓存的机制。

    ```js
    workbox.routing.registerRoute(
      new RegExp('/api/'),
      workbox.strategies.staleWhileRevalidate({
        plugins: [
          new workbox.broadcastUpdate.Plugin('api-updates')
        ]
      })
    );
    ```

    通过以上配置，将会通过'api-updates'通道广播消息，但是你需要定制相关信息和app关联

    在app中，可以以下方式监听：

    ```js
    const updatesChannel = new BroadcastChannel('api-updates');
    updatesChannel.addEventListener('message', async (event) => {
      const {cacheName, updatedUrl} = event.data.payload;
    
      // Do something with cacheName and updatedUrl.
      // For example, get the cached content and update
      // the content on the page.
      const cache = await caches.open(cacheName);
      const updatedResponse = await cache.match(updatedUrl);
      const updatedText = await updatedResponse.text();
      ...
    });
    ```

    - 消息格式

      `event.data`会遵循以下格式

      ````js
      {
        type: 'CACHE_UPDATED',
        meta: 'workbox-broadcast-cache-update',
        // The two payload values vary depending on the actual update:
        payload: {
          cacheName: 'the-cache-name',
          updatedUrl: 'https://example.com/'
        }
      }
      ````

    - 定制headers作为检测，通过`headersToCheck`属性

      ```js
      workbox.routing.registerRoute(
        new RegExp('/api/'),
        workbox.strategies.staleWhileRevalidate({
          plugins: [
            new workbox.broadcastUpdate.Plugin(
              'api-updates',
              headersToCheck: ['X-My-Custom-Header']
            )
          ]
        })
      );
      ```

- workbox.rangeRequest

  发送请求时，range header可以设置告知服务器返回完整请求的一部分。对于像video文件很有用，用户可能会改变播放的位置

  在某些情况下，可能希望为缓存的文件提供服务，但是浏览器已经设置了一个range header。通常header会被忽略。该模块会查阅缓存响应并返回指定范围的数据

  - 基础用法

    通过添加plugin策略，检查范围请求

    ```js
    workbox.routing.registerRoute(
    	/.*.mp4/,
    	workbox.strategies.cacheFirst({
            plugins: [
                new workbox.rangeRequests.Plugin(),
            ],
    	});
    );
    ```

- workbox.streams

- workbox.navigationPreload

  "[Speed up Service Worker with Navigation Preloads](https://developers.google.com/web/updates/2017/02/navigation-preload)"介绍了navigation preload工作方式

  `workbox-navigation-preload`处理检查当前浏览器是否支持navigation preload，如果支持，将自动创建`activate`事件使用。

  Workbox会更新，以自动使用预加载响应。

  **已经通过预缓存HTML来处理导航的开发人不需要启用导航预加载！**该特征倾向于为没有预缓存HTML的开发人员减少导航延迟，但仍然想利用Workbox处理别的assets的缓存。

  例如，如果遵循应用程序Shell模式，并且已经设置了使用预缓存HTML的导航路由，那么启用导航预加载将是一种浪费。与预加载请求相关联的网络响应永远不会被使用，因为预缓存的HTML将被无条件地使用。

  - 基础使用

    ```js
    // Enable navigation preload
    workbox.navigationPreload.enable();
    
    // Swap in networkOnly, cacheFirst, or staleWhileRevalidate as needed.
    const strategy = workbox.strategies.networkFirst({
      cacheName: 'cached-navigations',
      plugins: [
        // Any plugins, like workbox.expiration, etc.
      ],
    });
    
    const navigationRoute = new workbox.routing.NavigationRoute(strategy, {
      // Optionally, provide a white/blacklist of RegExps to determine
      // which paths will match this route.
      // whitelist: [],
      // blacklist: [],
    });
    
    workbox.routing.registerRoute(navigationRoute);
    ```

  - 浏览器支持

    暂时只有Google浏览器支持navigation preload。

    `workbox.navigationPreload.enable()`会在运行时检查浏览器支持情况，可以不用担心调用`workbox.navigationPreload.enable()`会出问题。

## 经验之处，引自taobaofed

HTML，如果你想让页面离线可以访问，使用 NetworkFirst，如果不需要离线访问，使用 NetworkOnly，其他策略均不建议对 HTML 使用。

CSS 和 JS，情况比较复杂，因为一般站点的 CSS，JS 都在 CDN 上，SW 并没有办法判断从 CDN 上请求下来的资源是否正确（HTTP 200），如果缓存了失败的结果，问题就大了。这种我建议使用 Stale-While-Revalidate 策略，既保证了页面速度，即便失败，用户刷新一下就更新了。

如果你的 CSS，JS 与站点在同一个域下，并且文件名中带了 Hash 版本号，那可以直接使用 Cache First 策略。

图片建议使用 Cache First，并设置一定的失效时间，请求一次就不会再变动了。

上面这些只是普适性的策略，见仁见智。

还有，要牢记，对于不在同一域下的任何资源，绝对不能使用 Cache only 和 Cache first。