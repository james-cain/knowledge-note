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









