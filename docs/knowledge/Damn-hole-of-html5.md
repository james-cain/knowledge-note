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