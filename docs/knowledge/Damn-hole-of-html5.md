# html5

## web通信

web通信，实际有两个略不同的系统，**跨文档通信(cross-document messaging)**和**通道通信(channel messaging)**。

无论是跨文档通信（cross-document messaging）、通道通信（channel messaging）、服务器发送事件（server-sent events）或是网络套接字（web sockets）都要执行**message事件**

## Message事件

包含5个只读属性

| 属性名      | 含义                                         |
| ----------- | -------------------------------------------- |
| data        | 包含任意字符串数据，由原始脚本发送           |
| origin      | 一个字符串，包含原始文档的方案、域名以及端口 |
| lastEventId | 一个字符串，包含了当前的消息事件的唯一标识符 |
| source      | 原始文件的窗口的引用                         |
| ports       | 一个数组，包含任何MessagePort对象发送消息    |

在跨文档通信和通道通信中，lastEventId的值一般为空字符串；lastEventId应用在服务器端发送事件上。

发送消息中如果没有ports，则ports属性值就是个长度为0的数组

MessageEvent继承DOM事件接口，且属性共享。然而，**通信事件并没有冒泡，不能取消，也没有默认行为**

## 跨文档通信

IE8+浏览器支持

发送核心JS代码：

```js
window.parent.frames[1].postMessage(message, '*')
```

postMessage方法支持两个参数

| 参数         | 含义           |
| ------------ | -------------- |
| message      | 发送的数据     |
| targetOrigin | 发送数据的来源 |

postMessage中的message参数不仅仅可以是字符串，结构对象、数据对象（如：File和ArrayBuffer）或是数组

但**IE8/IE9/FireFox3.6只支持字符串数据**

targetOrigin *****->接收任何目标来源 **/** -> 限制信息只能同源发送。注意在指定来源的时候，后面**不要带斜杆**

```js
window.postMessage('发送消息', 'http://example.com');
// 而不是
window.postMessage('发送消息', 'http://example.com/');
```

## 通道通信

消息通道提供了一个直接，双向浏览上下文之间的通信手段。管道每端为端口，数据从一个端口发送，另一个变成输入

##MessageChannel和MessagePort对象

创建一个MessageChannel对象，实际上创造了两个相互关联的端口。一个端口保持开放，为发送端。另外一个被转发到其他浏览上下文

MessagePort，包含三个可用方法

| 方法名        | 含义                       |
| ------------- | -------------------------- |
| postMessage() | 通过通道发送消息           |
| start()       | 开始在端口上分派接受的信息 |
| close()       | 关闭端口                   |

MessagePort对象还有onmessage事件属性，可被用来定义事件句柄而不是事件监听

### 实例

```js
// 本例组成由 主页面+内部嵌套两个iframe页面(iframe1和iframe2)
// 首先是第一个iframe页面(称为iframe1)，主要完成任务为实现表单提交，通知另外一个iframe页(称为iframe2)，在iframe2中展现。在做表单提交前，需要先通知主页面已经加载好；并且接受来自主页面的传递进来的端口信息
var eleForm = document.querySelector("form"), port;
eleForm.onsubmit = function() {
    var message = documenet.querySelector("input[type='test']").value;
    if (port === undefined) {
        alert('信息发送失败，目前没有可用的端口");
    } else {
        port.postMessage(message);
    }
    return false;
}
window.addEventListener('DOMContentLoaded', function (e) {
	// postMessage为主页面中发送
    window.addEventListener('message', function (evt) {
        if (evt.origin === 'https://coracain.com') {
            port = evt.ports[0];
        } else {
            alert(evt.origin + '来源不认识');
        }
    }, false);
    window.parent.postMessage('iframe1页加载完毕', 'https://coracain.com');
}, false);

// 右边iframe2页主要接收来自iframe1发送的信息，并展示。
// 主要完成任务，一是创建MessageChannel通道对象，二是告诉主页面，加载完了，并把端口传过去，三是显示发送过来的信息
var eleBox = document.querySelector('#message');
var messageHandler = function (e) {
    eleBox.innerHTML = '接收到的信息是' + e.data;
}
window.addEventListener('DOMContentLoaded', function () {
	if (window.MessageChannel) {
        // 创建一个新的MessageChannel对象
        var mc = new MessageChannel();
        
        // 给父级发送一个端口
        window.parent.postMessage('iframe2页加载完毕', 'https://coracain.com', [mc.port1]);
        
        // 显示发送的信息
        mc.port2.addEventListener('message', messageHandler, false);
        mc.port2.start();
	} else {
        eleBox.innerHTML = '浏览器不支持通道通信';
	}
}, false);

// 主页面主要是做将iframe2中的通道端口传递到iframe1，让两个iframe打通
window.addEventListener('message', function (evt) {
    if (evt.origin === 'https://coracain.com') {
        if (evt.ports.length > 0) {
            // 将端口转移到iframe1文档
            window.frames[0].postMessage('端口打开', 'https://coracain.com', evt.ports);
        }
    }
}, false);
```

## Input重复上传同一文件问题

input[type=file]使用的是onchange，onchange监听的为input的value值，只有在内容发生改变的时候去触发，而value在上传文件的时候保存的是文件的内容，只需要在上传成功的回调里面，将当前input的value值置空即可。

```
event.target.value= '';
```

## Img srcset/sizes

## execCommand

```js
// 探测浏览器是否支持copy命令
export function available() {
  return !!document.queryCommandSupported && document.queryCommandSupported('copy');
}

// 复制指定文本信息
export function copy(text) {
  const fakeElem = document.body.appendChild(document.createElement('textarea'));
  fakeElem.style.position = 'absolute';
  fakeElem.style.left = '-9999px';
  fakeElem.setAttribute('readonly', '');
  fakeElem.value = text;
  fakeElem.select();
  try {
    return document.execCommand('copy');
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    fakeElem.parentNode.removeChild(fakeElem);
  }
}
```

## notification

```html
<button onclick="notifyMe()">Notify me!</button>
```

```js
function notifyMe() {
    // 先检查浏览器是否支持
    if (!("Notification" in window)) {
		alert("This browser does not support desktop notification");
	}
	// 检查用户是否同意接受通知
	else if (Notification.permission === "granted") {
        var notification = new Notification("Hi there!");
	}
	// 否则需要向用户获取权限
	else if (Notification.permission === "denied") {
        Notification.requestPermission(function (permission) {
            // 如果用户统一，就可以向他们发送通知
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });
	}
}
```

## pushManager

浏览器实现消息推送，和native app一样，依赖于推送服务。是服务器、浏览器和推送服务三者之间进行的。首先要使用Notification.requestPermission 让用户授权，只有允许后，才会向浏览器推送服务。

订阅服务过程，服务端需要一个唯一标识的身份区分不同的浏览器。由服务器端使用web-push生成**applicationServerKey**，这个key存在公钥和私钥，都需要转换成`UInt8Array`格式，公钥用于浏览器向推送服务发送请求，获取对应的PushSubscription(推送订阅对象)，再将该对象发送给服务器存储。完整的推送订阅对象结构如下：

```js
{
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
        "p256dh" : "BNcRd...",
        "auth"   : "tBHI..."
    }
}
```

其中`endpoint`就是推送服务返回的唯一标识用户设备的地址，而`keys`是浏览器预先生成的，包含了用于安全验证信息

###第一步，订阅消息的具体实现步骤如下：

1. 注册 Service Worker
2. 使用 pushManager 添加订阅，浏览器向推送服务发送请求，其中传递参数对象包含两个属性：
   - `userVisibleOnly`，不允许静默的推送，所有推送都对用户可见，所以值为`true`
   - `applicationServerKey`，服务器生成的公钥
3. 得到推送服务成功响应后，浏览器将推送服务返回的 endpoint 加入推送订阅对象，向服务器发送这个对象供其存储

具体代码实现：

```js
// 将base64的applicationServerKey转换成UInt8Array
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0, max = rawData.length; i < max; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function subscribe(serviceWorkerReg) {
    serviceWorkerReg.pushManager.subscribe({ // 2.订阅
    	userVisibleOnly: true,
    	appliactionServerKey: urlBase64ToUint8Array('<applicationServerKey>')
    }).then(function(subscription) {
        // 3.发送推送订阅对象到服务器，具体实现中发送请求到后端api
        sendEndPointInSubscription(subscription);
    }).catch(function () {
        if (Notifacation.permission === 'denied') {
            // 用户拒绝了订阅请求
        }
    });
}
if ('serviceWorker' in navigator && 'PushManager' in window) {
	// 1.注册service worker
    navigator.serviceWorker.register('./service-worker.js').then(function(reg) {});
    navigator.serviceWorker.ready.then(function(reg) {subscribe(reg)});
}
```

取消订阅：

```js
navigator.serviceWorker.ready.then(function (reg) {
    reg.pushManager.getSubscription().then(function(subscription) {
        subscription.unsubscribe().then(function(successful) {
            //
        }).catch(function(e) {
            //
        });
    });
});
```

推送服务的响应

接下来，服务端可以向endpoint发送包含以上请求头的请求了，推送服务响应`201`标识接受调用。其余响应状态码如下：

- 429 Too many requests
- 400 Invalid request
- 404 Not Found 订阅过期，需要在服务端删除保存的推送订阅对象
- 410 Gone 订阅失效，需要在服务端删除保存的推送订阅对象，并调用推送订阅对象的`unsubscribe()`方法
- 413 Payload size too large

###第二步，使用web-push发送消息

[web-push](https://github.com/web-push-libs/web-push)可以帮助生成公私钥，用`setVapidDetail`设置公私钥，并且调用`sendNotification`可以向推送服务发起调用请求，根据返回状态码做响应操作

具体实现可以如下：

```js
var webpush = require('web-push');
var vapidKeys = webpush.generateVAPIDKeys();// 1. 生成公私钥
webpush.setVapidDetails( // 2.设置公私钥
	'mailto:sender@example.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);
// 3.从数据库中拿出之前保存的pushSubscription
// 4.向推送服务发起调用请求
webpush.sendNotification(pushSubscription, '推送消息内容').catch(function(err) {
    if (err.statusCode === 410) {
        // 从数据库中删除推送订阅对象
    }
});
```

### 第三步，显示通知

```js
self.addEventListener('push', function (event) {
	if (event.data) {
        var promiseChain = Promise.resolve(event.data.json()).then(data => self.registration.showNotification(data.title, {}));
        event.waitUntil(promiseChain);
	}
});
```

## ServiceWorker

service worker属于 [web worker](https://html.spec.whatwg.org/multipage/workers.html#workers)一类。service worker会在注册service worker client的源上执行。

service worker包括一些state，如parsed、installing、installed、activating、activated和redundant。初始化于parsed

service worker关联包含自己的注册表（[service worker registration](https://w3c.github.io/ServiceWorker/#dfn-service-worker-registration)）

Service worker带有一个全局对象（[ServiceWorkerGlobalScope](https://w3c.github.io/ServiceWorker/#serviceworkerglobalscope)）

### Service Worker Registration

包括scope url和一组service workers:installing worker（状态为installing 或null）、waiting worker（状态为installed或null）、active worker（状态为activating、activated或null）

包括最新更新检测时间(last update check time)，默认为null

通过cache mode来更新，包括imports、all或none，默认为imports

包括uninstalling flag，默认不设置

包括[NavigationPerloadManager](https://w3c.github.io/ServiceWorker/#navigationpreloadmanager)对象

包括navigation preload enabled标记，默认不设置

包括navigation preload header值，默认为true

### Service Worker Client

Service worker client是一个环境。service worker client有一个相关联的废弃标志，默认不设置。

如果sevice worker client是环境设置对象，那么它有一个定义返回service worker client源的算法；否则将返回service worker client创建URL源的地址

window client：全局对象是Window对象的service worker client

dedicated worker client：全局对象是[DedicatedWorkerGlobalScope](https://html.spec.whatwg.org/multipage/workers.html#dedicatedworkerglobalscope)对象的service worker client

shared worker client：全局对象是[SharedWorkerGlobalScope](https://html.spec.whatwg.org/multipage/workers.html#sharedworkerglobalscope)对象的service worker client

worker client：dedicated worker client和shared worker client

service worker client选择并使用service worker registration来进行对自己和子资源的加载。依靠对非子资源请求来对service worker registration选择，是匹配service worker registration从scope改变成注册映射的过程。

当请求的url不是本地时，service worker client从scope到注册映射匹配service worker registration。也就是说，service worker client视图尝试咨询service worker registration--将scope url和创建URL相匹配。

如果匹配成功，被选择的service worker registration的激活worker将开始控制service worker client。否则，将返回到默认行为的位置。

### Client Context

#### ServiceWorker

```c#
[SecureContext, Exposed=(Window,Worker)]
interface ServiceWorker : EventTarget {
  readonly attribute USVString scriptURL;
  readonly attribute ServiceWorkerState state;
  void postMessage(any message, optional sequence<object> transfer = []);

  // event
  attribute EventHandler onstatechange;
};
ServiceWorker includes AbstractWorker;

enum ServiceWorkerState {
  "installing",
  "installed",
  "activating",
  "activated",
  "redundant"
};
```

该对象会在`ServiceWorkerRegistration.active`属性和`ServiceWorkerContainer.controller`属性中可用，它是一个激活并在控制页面的serviceWorker

包括scriptURL和state两个只读属性。scriptURL必须和注册该ServiceWorker的文档处在同一域，state值可以为installing、installed、activating、activated或redundant

- scriptURL

  ```
  // script放在https://example.com/app.html下
  navigator.serviceWorker.register('/service_worker.js');
  // 注册完成后,通过navigator.serviceWorker.controller.scriptURL返回的值为"https://example.com/service_worker.js"
  ```

- state

  返回的值为ServiceWorkerState(installing,installed,activating,activated,redundant)之一

- postMessage(message, transfer)

#### ServiceWorkerRegistration

```c#
[SecureContext, Exposed=(Window,Worker)]
interface ServiceWorkerRegistration : EventTarget {
  readonly attribute ServiceWorker? installing;
  readonly attribute ServiceWorker? waiting;
  readonly attribute ServiceWorker? active;
  [SameObject] readonly attribute NavigationPreloadManager navigationPreload;

  readonly attribute USVString scope;
  readonly attribute ServiceWorkerUpdateViaCache updateViaCache;

  [NewObject] Promise<void> update();
  [NewObject] Promise<boolean> unregister();

  // event
  attribute EventHandler onupdatefound;
};

enum ServiceWorkerUpdateViaCache {
  "imports",
  "all",
  "none"
};
```

- scope

  ```js
  // 以上面scriptURL为例
  navigator.serviceWorker.ready.then(registration => console.log(registration.scope));
  // https://exmaple.com/
  ```

#### navigator.serviceWorker

```c#
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute ServiceWorkerContainer serviceWorker;
};

partial interface WorkerNavigator {
  [SecureContext, SameObject] readonly attribute ServiceWorkerContainer serviceWorker;
};
```

返回ServiceWorkerContainer对象

#### ServiceWorkerContainer

```c#
[SecureContext, Exposed=(Window,Worker)]
interface ServiceWorkerContainer : EventTarget {
  readonly attribute ServiceWorker? controller;
  readonly attribute Promise<ServiceWorkerRegistration> ready;

  [NewObject] Promise<ServiceWorkerRegistration> register(USVString scriptURL, optional RegistrationOptions options);

  [NewObject] Promise<any> getRegistration(optional USVString clientURL = "");
  [NewObject] Promise<FrozenArray<ServiceWorkerRegistration>> getRegistrations();

  void startMessages();


  // events
  attribute EventHandler oncontrollerchange;
  attribute EventHandler onmessage; // event.source of message events is ServiceWorker object
  attribute EventHandler onmessageerror;
};
```

- ServiceWorkerContainer.controller

  当ServiceWorker的state是active时，返回一个ServiceWorker对象（和ServiceWorkerRegisteration.active）返回的对象相同。如果当前的state不是active或强制刷新浏览器则返回null

- ServiceWorkerContainer.ready

  定义serviceWorker是否准备好为一个页面服务，返回一个Promise对象。当ServiceWorkerRegistration获取到一个active的ServiceWorker时被解决

- register(scriptURL, options)

- onmessage

#### NavigationPreloadManager

```c#
[SecureContext, Exposed=(Window,Worker)]
interface NavigationPreloadManager {
  Promise<void> enable();
  Promise<void> disable();
  Promise<void> setHeaderValue(ByteString value);
  Promise<NavigationPreloadState> getState();
};

dictionary NavigationPreloadState {
  boolean enabled = false;
  ByteString headerValue;
};
```

- enable()

  触发时，返回promise对象并且对注册表添加navigation preload enabled标签

- diable()

  触发时，返回promise对象并且取消navigation preload enabled标签

- setHeaderValue(value)

  设置Service-Worker-Navigation-Preload头并返回一个空Promise

- getState()

例子

```js
addEventListener('activate', event => {
    event.waitUntil(async function () {
        if (self.registration.navigationPreload) {
            await self.registration.navigationPreload.enable();
        }
    }());
});
```

Preloaded Response

```js
addEventListener('fetch', event => {
    event.respondWith(async function () {
        // 从缓存中读响应
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        // else 使用preloaded响应
        const response = await event.preloadedResponse;
        if (response) return response;
        // else 网络请求
        return fetch(event.request);
    }());
});
```

#### ServiceWorkerGlobalScope

ServiceWorker的全局执行上下文

```c#
[Global=(Worker,ServiceWorker), Exposed=ServiceWorker]
interface ServiceWorkerGlobalScope : WorkerGlobalScope {
  [SameObject] readonly attribute Clients clients;
  [SameObject] readonly attribute ServiceWorkerRegistration registration;

  [NewObject] Promise<void> skipWaiting();

  attribute EventHandler oninstall;
  attribute EventHandler onactivate;
  attribute EventHandler onfetch;

  // event
  attribute EventHandler onmessage; // event.source of the message events is Client object
  attribute EventHandler onmessageerror;
};
```

- [Clients](https://developer.mozilla.org/en-US/docs/Web/API/Clients)

- skipWaiting()

  允许service worker直接从registration的waiting阶段跳到active阶段

#### Client

```c#
[Exposed=ServiceWorker]
interface Client {
  readonly attribute USVString url;
  readonly attribute FrameType frameType;
  readonly attribute DOMString id;
  readonly attribute ClientType type;
  void postMessage(any message, optional sequence<object> transfer = []);
};

[Exposed=ServiceWorker]
interface WindowClient : Client {
  readonly attribute VisibilityState visibilityState;
  readonly attribute boolean focused;
  [SameObject] readonly attribute FrozenArray<USVString> ancestorOrigins;
  [NewObject] Promise<WindowClient> focus();
  [NewObject] Promise<WindowClient?> navigate(USVString url);
};

enum FrameType {
  "auxiliary",
  "top-level",
  "nested",
  "none"
};
```

Client对象即service worker client。带有一个frame type，包括auxiliary、top-level、nested和none

- postMessage(message, transfer)

#### Clients

```c#
[Exposed=ServiceWorker]
interface Clients {
  // The objects returned will be new instances every time
  [NewObject] Promise<any> get(DOMString id);
  [NewObject] Promise<FrozenArray<Client>> matchAll(optional ClientQueryOptions options);
  [NewObject] Promise<WindowClient?> openWindow(USVString url);
  [NewObject] Promise<void> claim();
};
```

当用户代理创建了ServiceWorkerGlobalScope对象时，必须创建一个Clients对象

- claim()

  允许激活的service worker设置自己

#### Event

##### ExtendableEvent

```c#
[Constructor(DOMString type, optional ExtendableEventInit eventInitDict), Exposed=ServiceWorker]
interface ExtendableEvent : Event {
  void waitUntil(Promise<any> f);
};
```

event.waitUntil(f)

##### FetchEvent

```c#
[Constructor(DOMString type, FetchEventInit eventInitDict), Exposed=ServiceWorker]
interface FetchEvent : ExtendableEvent {
  [SameObject] readonly attribute Request request;
  readonly attribute Promise<any> preloadResponse;
  readonly attribute DOMString clientId;
  readonly attribute DOMString resultingClientId;
  readonly attribute DOMString replacesClientId;

  void respondWith(Promise<Response> r);
};
```

##### Events

**install**: Service Worker安装成功后被触发的事件，在事件处理函数中可以添加需要缓存的文件

**activate**: 当Service Worker安装完成后并进入激活状态，会触发activate事件。通过监听activate事件可以做一些预处理，如对旧版本的更新、对无用缓存的清理等

**message**: Service Worker运行于独立context中，无法直接访问当前页面主线程的DOM等信息，但是通过postMessage API，可以实现消息的传递，这样主线程就可以接受Service Worker的指令操作DOM

**fetch**(请求): 当浏览器在当前指定的scope下发起请求时，会触发fetch事件，并得到传有response参数的回调函数，回调中就可以做各种代理缓存的事情

**push**(推送): push事件是为推送准备的。依赖于Notification API和PUSH API。通过PUSH API，当订阅了推送服务后，可以使用推送方式唤醒Service Worker以响应来自系统消息传递服务的消息，即使**用户已经关闭了页面**

**sync**(后台同步): sync事件由background sync（后台）同步发出。background sync配合Service Worker推出的API，用于为Service Worker提供一个可以实现注册和监听同步处理的方法。但**还不在W3C Web API标准中**

**notificationclick**

**notificationclose**

**canmakepayment**

**paymentrequest**

**messageerror**

### Caches

```c#
[SecureContext, Exposed=(Window,Worker)]
interface Cache {
  [NewObject] Promise<any> match(RequestInfo request, optional CacheQueryOptions options);
  [NewObject] Promise<FrozenArray<Response>> matchAll(optional RequestInfo request, optional CacheQueryOptions options);
  [NewObject] Promise<void> add(RequestInfo request);
  [NewObject] Promise<void> addAll(sequence<RequestInfo> requests);
  [NewObject] Promise<void> put(RequestInfo request, Response response);
  [NewObject] Promise<boolean> delete(RequestInfo request, optional CacheQueryOptions options);
  [NewObject] Promise<FrozenArray<Request>> keys(optional RequestInfo request, optional CacheQueryOptions options);
};
```

### Security Considerations

#### Secure Context

Service workers必须执行在secure contexts中。因此service workers和他的service worker clients需要在HTTPS域中。同样也允许在localhost，127.0.0.0/8，::1/128供开发使用。

#### importScripts(urls)

当被ServiceWorkerGlobalScope对象调用执行该方法时，必将import 脚本到worker global scope中，给到ServiceWorkerGlobalScope对象和urls，并对每个请求执行fetch操作

### Service Worker与页面通信

Service Worker没有直接操作页面DOM的权限，但是可以通过postMessage方法和Web页面进行通信，让页面操作DOM

1. **Client**:postMessage(message, transfer)

   在`sw.js`中向页面发信息，可以采用client.postMessage()方法

   ```js
   self.clients.matchAll().then(function(clients) {
   	if (clients && clients.length) {
           clients.forEach(function (client) {
               // 发送字符串'sw.update'
               client.postMessage('sw.update');
           });
   	}
   });
   ```

2. **ServiceWorkerContainer**: onmessage()

   在页面中接收`sw.js`发来的信息，通过event.data来读取数据

   ```js
   navigator.serviceWorker.addEventListener('message', function (event) {
       if (e.data === 'sw.update') {
           // 此处可以操作页面的DOM元素
       }
   });
   ```

3. **ServiceWorker**:postMessage(message, transfer)

   在主页面给ServiceWorker发消息，可以采用navigation.serviceWorker.controller.postMessage()方法

   ```js
   // 点击指定DOM时给Service Worker发送消息
   document.getElementById('app-refresh').addEventListener('click', function() {
       navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage('sw.updatedone');
   });
   ```

4. **ServiceWorkerGlobalScope**: onmessage()

   在`sw.js`中接收主页面发来的信息，通过event.data来读取数据

   ```js
   self.addEventListener('message', function (event) {
       console.log(event.data); // 输出：'sw.updatedone'
   });
   ```

同样可以使用MessageChannel创建一个信道，并在这个信道的两个MessagePort属性来传递数据。

以https://googlechrome.github.io/samples/service-worker/post-message/为例

截取service-worker.js 通讯相关部分：

```js
// This is a somewhat contrived example of using client.postMessage() to originate a message from
// the service worker to each client (i.e. controlled page).
// Here, we send a message when the service worker starts up, prior to when it's ready to start
// handling events.
self.clients.matchAll().then(function(clients) {
  clients.forEach(function(client) {
    console.log(client);
    client.postMessage('The service worker just started up.');
  });
});

self.addEventListener('message', function(event) {
  console.log('Handling message event:', event);
	...
      // This command adds a new request/response pair to the cache.
      case 'add':
        // If event.data.url isn't a valid URL, new Request() will throw a TypeError which will be handled
        // by the outer .catch().
        // Hardcode {mode: 'no-cors} since the default for new Requests constructed from strings is to require
        // CORS, and we don't have any way of knowing whether an arbitrary URL that a user entered supports CORS.
        var request = new Request(event.data.url, {mode: 'no-cors'});
        return fetch(request).then(function(response) {
          return cache.put(event.data.url, response);
        }).then(function() {
          event.ports[0].postMessage({
            error: null
          });
        });
...
    }
  }).catch(function(error) {
    // If the promise rejects, handle it by returning a standardized error message to the controlled page.
    console.error('Message handling failed:', error);

    event.ports[0].postMessage({
      error: error.toString()
    });
  });

  // Beginning in Chrome 51, event is an ExtendableMessageEvent, which supports
  // the waitUntil() method for extending the lifetime of the event handler
  // until the promise is resolved.
  if ('waitUntil' in event) {
    event.waitUntil(p);
  }

  // Without support for waitUntil(), there's a chance that if the promise chain
  // takes "too long" to execute, the service worker might be automatically
  // stopped before it's complete.
});
```

```js
function showCommands() {
  document.querySelector('#add').addEventListener('click', function() {
    sendMessage({
      command: 'add',
      url: document.querySelector('#url').value
    }).then(function() {
      // If the promise resolves, just display a success message.
      ChromeSamples.setStatus('Added to cache.');
    }).catch(ChromeSamples.setStatus); // If the promise rejects, show the error.
  });
}

function sendMessage(message) {
  // This wraps the message posting/response in a promise, which will resolve if the response doesn't
  // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
  // a convenient wrapper.
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    navigator.serviceWorker.controller.postMessage(message,
      [messageChannel.port2]);
  });
}

if ('serviceWorker' in navigator) {
  // Set up a listener for messages posted from the service worker.
  // The service worker is set to post a message to all its clients once it's run its activation
  // handler and taken control of the page, so you should see this message event fire once.
  // You can force it to fire again by visiting this page in an Incognito window.
  navigator.serviceWorker.addEventListener('message', function(event) {
    ChromeSamples.setStatus(event.data);
  });

  navigator.serviceWorker.register('service-worker.js')
    // Wait until the service worker is active.
    .then(function() {
      return navigator.serviceWorker.ready;
    })
    // ...and then show the interface for the commands once it's ready.
    .then(showCommands)
    .catch(function(error) {
      // Something went wrong during registration. The service-worker.js file
      // might be unavailable or contain a syntax error.
      ChromeSamples.setStatus(error);
    });
} else {
  ChromeSamples.setStatus('This browser does not support service workers.');
}
```





