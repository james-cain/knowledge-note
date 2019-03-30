# WebAPI

## IndexedDB

### 存储加密

可以使用web的[WebCrypto](http://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

### 存储上限值

| 浏览器  | 限制         |
| ------- | ------------ |
| Chrome  | 可用空间<6%  |
| Firefox | 可用空间<10% |
| Safari  | <50MB        |
| IE10    | <250MB       |

### 逐出策略

| 浏览器  | 逐出策略                      |
| ------- | ----------------------------- |
| Chrome  | 在Chrome耗尽空间后采用LRU策略 |
| Firefox | 在整个磁盘已装满时采用LRU策略 |
| Safari  | 无逐出                        |
| Edge    | 无逐出                        |

### 检查是否支持indexedDB

```js
if (!('indexedDB' in window)) {
    console.log('This browser doesnt support IndexedDB');
}
```

### 游标索引

游标可以用来遍历两个类型的数据，一个是IDBObjectStore，一个是IDBIndex

- IDBObjectStore：如果在该对象上使用游标，会根据primaryKey遍历整个数据，这里不会存在重复的情况，因为primaryKey是唯一的
- IDBIndex：在index上使用游标，会以当前的index来进行遍历，其中可能会存在重复的现象

在IDBObjectStore对象上有两种方法来打开游标：

- openCursor：遍历的对象是具体的数据值
- openKeyCursor：遍历的对象是数据key值

```js
// 示例，用index打开游标
index.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
        customers.push(cursor.value);
        cursor.continue();
    } else {
        alert('Got all customers:' + customers);
    }
};
```

### 数据库版本更新问题

> 同一个数据库可以同时在多个客户端（页面、工作线程）中被利用，事务确保当在读写时不会冲突。如果其中一个新的客户端期望更新数据库，除非其他客户端都关闭当前版本的数据库连接，否则是不允许的。
>
> 为了防止新的客户端中断更新，客户端可以通过 [监听版本事件](https://www.w3.org/TR/IndexedDB/#connection-version-change-event)做到。该事件会在别的客户端期望更新数据库时触发。
>
> 可以做如下操作:

方式一：

```js
db.onversionchange = function() {
	// 保存所有数据
    saveUnsave().then(function() {
        // 如果document不在激活态，可以直接reload页面而不需要用户交互
        if (!document.hasFocus()) {
            location.reload();
        }
        // 如果document正在focus，重新刷新页面太粗暴了，可以通过向用户弹出询问的方式会合理些
        else {
            displayMessage('Please reload this page for the latest version.');
        }
    })
}
function saveUnsavedData() {}
function displayMessage() {}
```

方式二：调用connection的close()方法。但是，这样要确保应用对这件事知情，否则接下来的操作都会是失败的

```js
db.onversionchange = function() {
    saveUnsavedData().then(function() {
        db.close();
        stopUsingTheDatabase();
    });
};

function stopUsingTheDatabase() {}
```

>  如果别的客户端在versionchange事件触发后仍持有数据库的连接，blocked事件就会触发

```js
var request = indexedDB.open('library', 4);
var blockedTimeout;

request.onblocked = function() {
    // 给别的客户端时间异步保存数据
    blockedTimeout = setTimeout(function() {
        displayMessage('Upgrade blocked - Please close other tabs displaying this site.');
    }, 1000);
}

request.onupgradeneeded = function(event) {
    clearTimeout(blockedTimeout);
    hideMessage();
    // ...
}

function hideMessage() {}
```

> 对于已经断开了数据库连接的客户端，不会看到对应message

### Object Store

> object store是对数据库的数据的主要存储机制。每个数据库都有一系列的object stores。`object stores都可以被修改，但是只能使用upgrade transaction，例如，通过upgradeneeded事件响应`。当一个新的数据库被创建时，是不包括任何object stores的
>
> object  store的每个数据都有一个key和value。list根据对key升序排序。相同的key不会用重复的记录
>
> object store都有一个key path。如果object store有一个key path，那么会使用**in-line keys**，否则使用**out-of-line keys**
>
> object store有一个key generator
>
> object store可以从记录中通过以下三种途径获取key：
>
> 1. **key generator**
> 2. **key path**
> 3. **可以明确的指名key值**，当值被存储到object store中时。

### Values

> 每个记录都关联一个value。用户代理必须支持任何序列化独享。包括简单类型，如String、Date对象；和Object、Array实例，File对象、Blob对象、ImageData对象等。

### Keys

> 为了高效检索记录，每个记录时根据它的key来组织
>
> key的类型包括：number，date，string，binary，array；其中binary是新提出的草案，支持的浏览器包括Chrome 58，Firefox 51和Safari 10.1

### 示例

```js
var request = indexedDB.open("library");
request.onupgradeneeded = function () {
	var db = request.result;
	var store = db.createObjectStore("books", { keyPath: 'isbn.id'});
	store.put({title: "Quarry Memories", author: "Fred", isbn: { id: 123456, name: 'test' }});
}
request.onsuccess = function () {
	var db = request.result;
	var tx = db.transaction("books", "readonly");
	var store = tx.objectStore("books");
	var request2 = store.get(123456)
	request2.onsuccess = function () {
		console.log(request2.result);
	}
}

// 新增一个name object store
var request = indexedDB.open("library", 2);
request.onupgradeneeded = function () {
	console.log('upgrading');
	var db = request.result;
	var store = db.createObjectStore("name");
	store.put('james', 'reyshieh');
}
request.onsuccess = function () {
	console.log('success');
	var db = request.result;
	var tx = db.transaction("name", "readonly");
	var store = tx.objectStore("name");
	var request2 = store.get('reyshieh')
	request2.onsuccess = function () {
		console.log(request2.result);
	}
}
```

### API

1. [`IDBFactory`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBFactory) 提供了对数据库的访问。这是由全局对象 `indexedDB` 实现的接口，因而也是该 API 的入口

   ```js
   // 打开数据库连接,该方法返回IDBOpenRequest对象
   // version 代表打开的数据库的版本，默认为1
   indexedDB.open(name[, version])
   // 删除数据库，若删除成功，返回的result将设置为undefined
   indexedDB.deleteDatabase(name)
   indexedDB.deleteDatabase(name, options)// 实验阶段
   // 比较作为键的两个值，以确定作为indexedDB操作(如存储和迭代)的相等和顺序性
   // -1 first<second
   // 0 first==second
   // 1 first>second
   // 如
   // var a = 1;
   // var b = 2;
   // var result = window.indexedDB.cmp(a, b);
   indexedDB.cmp(first, second)
   
   // 示例
   var note = document.querySelector('ul');
   window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || windwo.msIndexedDB;
   // 不要使用var indexedDB = ...方式，除非在function中
   // 以下两个对象不需要使用windwo.mozIDB*前缀
   window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
   window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
   var DBOpenRequest = window.indexedDB.open('toDoList', 4);
   DBOpenRequest.onerror = function (event) {
       note.innerHTML += '<li>Error loading database.</li>';
   }
   DBOpenRequest.onsuccess = function (event) {
       note.innerHTML += '<li>Database initialised.</li>';
       // 将打开的结果存储在变量中，接下来要使用，返回的result是一个用来连接的IDBDatabase对象
       db = DBOpenRequest.result;
   }
   ```

2. [`IDBOpenDBRequest`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBOpenDBRequest) 表示一个打开数据库的请求。

3. [`IDBRequest`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBRequest) 提供了到数据库异步请求结果和数据库的访问。这也是在调用一个异步方法时所得到的。

   ```js
   // window.indexedDB.open()调用后会返回该对象，用来作为打开数据库的请求
   // IDBOpenDBRequest实际继承于IDBRequest和EventTarget
   // IDBRequest将带有一个被设置为pending的readyState，当请求完成或失败，将改变为done。请求成功，返回结果将通过IDBRequest.onsuccess方法回调；如果失败，将通过IDBRequest.onerror的方法回调
   // IDBRequest的属性包括：
   IDBRequest.error // 返回DOMException
   IDBRequest.result // 返回结果，实际是IDBDatabase对象
   IDBRequest.source // 返回资源为对象，如IDBIndex、IDBObjectStore或IDBCursor，如果是在indexedDB.open中回调，返回null
   IDBRequest.readyState // pending or done
   IDBRequest.transaction // 返回IDBTransaction对象，在没有事务的情况下会为null。如indexedDB.open，将不会有事务返回；版本更新时，在upgradeneeded事件中，transaction属性将返回一个带有等于“versionchange”模式的IDBTransaction，可以在事件中做更新以及别的操作，更新完成后，transaction属性又恢复为null
   
   // IDBRequest的事件包括：
   IDBRequest.onerror
   IDBRequest.onsuccess
   
   // IDBOpenRequest的事件包括：
   IDBOpenRequest.onblocked
   IDBOpenRequest.onupgradeneeded
   
   // 示例
   var openRequest = indexedDB.open('db', 2);
   console.log(openRequest.transaction); // 返回null
   
   openRequest.onupgradeneeded = function (event) {
       console.log(openRequest.transaction.mode); // 返回versionchange
       var db = openRequest.result;
       if (event.oldVersion < 1) {
           // 创建新的数据库
           db.createObjectStore('books');
       }
       if (event.oldVersion < 2) {
           var bookStore = openRequest.transaction.objectStore('books');
           bookStore.createIndex('by_title', 'title');
       }
   };
   
   openRequest.onsuccess = function() {
       console.log(openRequest.transaction); // 返回null
   }
   ```

4. [`IDBDatabase`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBDatabase) 表示数据库的连接。只能通过这个连接来拿到一个数据库事务。

   ```js
   // 属性
   IDBDatabase.name // 返回连接数据库的名称，即open(name)中的name
   IDBDatabase.version // 返回链接数据库的版本，初次创建时，属性值为空字符串
   IDBDatabase.objectStoreNames // 包含的所有object store的名称list
   
   // 事件
   IDBDatabase.onabort // 数据库使用终止时回调
   IDBDatabase.onclose // 数据库close，如会话关闭
   IDBDatabase.onerror // 数据库使用失败
   IDBDatabase.onversionchange // 数据库结构发生变化(IDBOpenDBRequest.onupgradeneeded事件或IDBFactory.deleteDatabase())，不同于IDBVersionChangeEvent，但是相关联的
   
   // 方法
   IDBDatabase.close()
   IDBDatabase.createObjectStore(name[, options]) // 创建或返回一个新的object store或index，即IDBObjectStore对象
   // options 包括keyPath、autoIncrement(true时，用key生成器自增，默认为false)
   IDBDatabase.deleteObjectStore(name) // 通过给定名字销毁object store
   IDBDatabase.transaction(storeNames[, mode]) // 返回事务对象(IDBTransaction)包含IDBTransaction.objectStore方法 storeNames可以是字符串数组，如果只有一个，可以直接用字符串名称
   // 获取所有数据库可以使用db.objectStoreNames
   // var transaction = db.transaction(db.objectStoreNames);
   // mode有三个模式：readonly,readwrite,readwriteflush，默认为readonly，尽可能不要使用readwrite，除非必须写数据库
   ```

5. [`IDBObjectStore`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBObjectStore) 表示一个对象存储空间。

   ```js
   // 属性
   IDBObjectStore.indexNames // 返回indexes名称list
   IDBObjectStore.keyPath
   IDBObjectStore.name // 获取store名称
   IDBObjectStore.transaction // 获取属于哪个IDBTransaction对象
   IDBObjectStore.autoIncrement // 自动增长计步，返回true/false
   
   // 方法
   IDBObjectStore.add(value, key) // 返回IDBRequest对象，该方法只做插入，如果只更新已经存在的记录，要使用IDBObjectStore.put方法
   IDBObjectStore.clear() // 返回IDBRequest对象，清除所有的数据，如果只想删除部分数据，要用IDBObjectStore.delete方法
   IDBObjectStore.count([query]) // 返回IDBRequest对象，返回所有记录的数量或所有匹配key、IDBKeyRange的记录数量
   IDBObjectStore.createIndex(indexName, keyPath[, objectParameters]) // 返回IDBIndex对象，创建一个新的字段/列，定义一个新的数据点
   // objectParameters为IDBIndexParameters对象，可以包括属性：unique、multiEntry、locale
   // objectStore.createIndex('hours', 'hours', { unique: true });
   IDBObjectStore.delete(key or KeyRange) // 返回IDBRequest对象
   IDBObjectStore.deleteIndex(indexName) // 删除index
   IDBObjectStore.get(key) // 返回IDBRequest对象，根据key查询object store，该方法不管是否是unique，都会返回第一个与键相关联的记录
   IDBObjectStore.getKey(key) // 返回IDBRequest对象，返回主键的值
   IDBObjectStore.getAll([query, count]) // 返回IDBRequest对象，该方法返回所有值
   IDBObjectStore.getAllKeys([query, count]) // 返回IDBRequest对象
   IDBObjectStore.index(name)
   IDBObjectStore.openCursor([query, direction]) // 返回IDBRequest对象，在单独线程中，返回一个新的IDBCursorWithValue对象
   // direction为IDBCursorDirection对象，合法值包括next、nextunique、prev、prevunique，默认next
   IDBObjectStore.openKeyCursor([query, direction]) // 返回IDBRequest对象，在单独线程中，返回一个新的IDBCursor对象
   IDBObjectStore.put(item[, key])
   // put可以指定key来影响key generator，当且仅当key是数值且高于最后生成key
   // 示例
   store = db.createObjectStore('store', { autoIncrement: true });
   store.put('a'); // will get key 1
   store.put('b', 3); // will get key 3
   store.put('c'); // will get key 4
   store.put('d', -10); // will get key -10
   store.put('e'); // will get key 5
   store.put('f', 6.00001); // will get 6.00001
   store.put('g'); // will get key 7
   store.put('f', 8.9999); // will get 8.9999
   store.put('g'); // will get key 9
   store.put('h', 'foo'); // will get key 'foo'
   store.put('i'); // will get key 10
   store.put('j', [1000]); // will use key [1000]
   store.put('k'); // will get key 11
   ```

6. [`IDBIndex`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBIndex) 提供了到索引元数据的访问。

   ```js
   // 索引是一种对象存储，用来在另一个对象存储中查找记录
   // 可以通过主键或者索引搜索记录
   // 索引中的每个记录只能指向其引用的对象存储中的一条记录，但是多个索引可以引用相同的对象存储
   
   // 属性
   IDBIndex.isAutoLocale // 返回判断索引是否有locale值的Boolean值
   IDBIndex.locale // 返回locale值(如en-US)
   IDBIndex.name // 索引的名称
   IDBIndex.objectStore // 索引关联的对象存储名
   IDBIndex.keyPath // 索引的键
   IDBIndex.multiEntry // 返回boolean值，当计算索引的keyPath的结果生成数组时，影响索引的行为
   // true: 对于键数组中的每个项，索引中都有一条记录
   // false: 对于数组中的每个键，都有一个记录
   IDBIndex.unique // 如果true，索引不允许键值重复
   
   // 方法
   IDBIndex.count() // 返回IDBRequest对象，返回记录数
   IDBIndex.get(key) // 返回IDBRequest对象，返回与值匹配的值
   IDBIndex.getKey() // 该方法不管是否是unique，都会返回第一个与键相关联的记录
   IDBIndex.getAll([query, count])
   IDBIndex.getAllKeys([query, count])
   IDBIndex.openCursor()
   IDBIndex.openKeyCursor()
   ```

7. [`IDBCursor`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBCursor) 遍历对象存储空间和索引。

   ```js
   // 属性
   IDBCursor.source
   IDBCursor.direction // 遍历方向，next、nextUnique、prev、prevUnique
   IDBCursor.key
   IDBCursor.value
   IDBCursor.primaryKey
   
   // 方法
   IDBCursor.advance(count) // 在游标方向往前走的步数
   IDBCursor.continue(key) // 将当前游标位置移动到指定key的位置，如果没有提供key则代表移动到下一位置
   IDBCursor.continuePrimaryKey() 
   IDBCursor.delete()
   IDBCursor.update()
   
   // 示例
   objectStore.openCursor().onsuccess = function(event) {
       var cursor = event.target.result;
       if (cursor) {
           // cursor.key
           // cursor.value
           cursor.continue();
       } else {
           console.log('Entries all displayed.');
       }
   }
   ```

8. [`IDBTransaction`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBTransaction) 表示一个事务。在数据库上创建一个事务，指定它的范围（例如希望访问哪一个对象存储空间），并确定希望的访问类型（只读或写入）。

   ```js
   // 属性
   IDBTransaction.db // 返回数据库连接
   IDBTransaction.error 
   IDBTransaction.mode // readonly、readwrite、versionchange，默认值为readonly
   IDBTransaction.objectStoreNames // 返回IDBObjectStore对象的名称list
   
   // 事件
   IDBTransaction.onabort
   IDBTransaction.oncomplete
   IDBTransaction.onerror
   
   // 方法
   IDBTransaction.abort() // 事务发生异常时，回滚所有对象变化
   IDBTransaction.objectStore(name) // 返回IDBObjectStore实例
   ```

9. [`IDBKeyRange`](https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange) 定义键的范围。

   > 通过该属性，可以限制range使用大写、小写绑定。如，遍历所有键值，其中值的范围在A-Z。
   >
   > 可以使用以下代码结构，检索所有键在一个确认的范围：

   All keys <= x: IDBKeyRange.upperBound(x)

   All keys < x: IDBKeyRange.upperBound(x, true)

   All keys >= y: IDBKeyRange.lowerBound(y)

   All keys > y: IDBKeyRange.lowerBound(y, true)

   All keys >= x && <= y: IDBKeyRange.bound(x, y)

   All keys > x && < y: IDBKeyRange.bound(x, y, true, true)

   All keys > x && <=y: IDBKeyRange.bound(x, y, true, false)

   All keys >= x && < y: IDBKeyRange.upperBound(x, y, false, true)

   All keys = z: IDBKeyRange.only(z)

10. [`IDBCursorWithValue`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBCursorWithValue) 遍历对象存储空间和索引并返回游标的当前值。

11. [`IDBEnvironment`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBEnvironment) 提供了到客户端数据库的访问。它由 [window](https://developer.mozilla.org/en-US/docs/DOM/window) 对象实现。

    IDBEnvironment.indexedDB // 工厂函数，包含IDBFactory对象

12. [`IDBVersionChangeEvent`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBVersionChangeEvent) 表明数据库的版本号已经改变。

    ```js
    IDBVersionChangeEvent.oldVersion // 返回旧版本数据库的版本号
    IDBVersionChangeEvent.newVersion // 返回新版本数据库的版本号
    ```

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

## MessageChannel和MessagePort对象

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
            // 如果用户同意，就可以向他们发送通知
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

### 第一步，订阅消息的具体实现步骤如下：

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

### 第二步，使用web-push发送消息

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

## WebWorker

> 独立于任何UI脚本在后台运行脚本的API
>
> 解决长时间运行的脚本问题，不会因影响用户点击或其他交互而中断
>
> 解决耗时任务问题，不会为了保持页面可响应而立即返回
>
> 通常workers应该有较长的生命期，较高的启动性能消耗，且每个实例都会产生较高的内存消耗

e.g.

1. 数字密集型计算的后台worker

```html
<!DOCTYPE HTML>
<html>
 <head>
  <meta charset="utf-8">
  <title>Worker example: One-core computation</title>
 </head>
 <body>
  <p>The highest prime number discovered so far is: <output id="result"></output></p>
  <script>
   var worker = new Worker('worker.js');
   worker.onmessage = function (event) {
     document.getElementById('result').textContent = event.data;
   };
  </script>
 </body>
</html>
```

对应的worker.js

```js
var n = 1;
search: while (true) {
    n += 1;
    for(var i = 2; i <= Math.sqrt(n); i += 1) {
        if (n % i == 0) {
            continue search;
        }
    }
    postMessage(n);
}
```

2. Javascript模块化worker

使用Javascript import声明来引入其他模块的能力；默认严格模式；顶层声明不会污染worker的全局作用域

模块workers可以使用跨域脚本实例化，只要使用CORS协议把该脚本暴露出来

模块worker中importScripts()方法将自动失效，Javascript import声明是更好的选择

```html
<script type="module">
  const worker = new Worker("worker.js", { type: "module" });
  worker.onmessage = receiveFromWorker;
</script>
```

3. 共享worker

```html
<script>
	var worker = new SharedWorker("test.js");
	var log = document.getElementById("log");
	worker.port.onmessage = function(e) {
        log.textContent += '\n' + e.data;
	}
</script>
```

```js
// test.js
onconnect = function(e) {
    var port = e.ports[0];
    port.postMessage("Hello World!");
}
```

也可以使用addEventListener()接收事件

e.g.

```html
<script>
	// 该例子向worker发送一个事件使得worker以另一个事件回复
	var worker = new SharedWorker("test.js");
	var log = document.getElementById("log");
	worker.port.addEventListener("message", function(e) {
        log.textContent += "\n" + e.data;
	}, false);
	worker.port.start(); // 使用addEventLitener事件方式必须用该方法
	worker.port.postMessage('ping');
</script>
```

```js
// test.js
onconnect = function(e) {
    var port = e.ports[0];
    port.postMessage("Hello World!");
    port.onmessage = function(e) {
    	// 不是e.ports[0].postMessage
        port.postMessage("pong"); 
        // 或者可以使用
        // e.target.postMessage("pong");
    }
}
```

两个页面连接到同一个worker，第二个页面在第一个页面中的iframe

e.g.

```html
<!DOCTYPE HTML>
<meta charset="utf-8">
<title>Shared workers: demo 3</title>
<pre id="log">Log:</pre>
<script>
  var worker = new SharedWorker('test.js');
  var log = document.getElementById('log');
  worker.port.addEventListener('message', function(e) {
    log.textContent += '\n' + e.data;
  }, false);
  worker.port.start();
  worker.port.postMessage('ping');
</script>
<iframe src="inner.html"></iframe>

<!-- inner.html -->
<!DOCTYPE HTML>
<meta charset="utf-8">
<title>Shared workers: demo 3 inner frame</title>
<pre id=log>Inner log:</pre>
<script>
  var worker = new SharedWorker('test.js');
  var log = document.getElementById('log');
  worker.port.onmessage = function(e) {
   log.textContent += '\n' + e.data;
  }
</script>
```

```js
// test.js
var count = 0;
onconnect = function(e) {
  count += 1;
  var port = e.ports[0];
  port.postMessage('Hello World! You are connection #' + count);
  port.onmessage = function(e) {
    port.postMessage('pong');
  }
}
```

4. 通过共享worker共享状态

同时打开多个窗口浏览同一个地图。在一个worker的协调下，所有窗口共享同样的地图信息。每个窗口都可以独立地随意移动，一旦在地图上设置了任何数据，其他窗口也都会更新

5. 委托

可以将计算密集型任何分割到多个worker中来得到更好的性能

e.g. 将1到10000000的所有数字进行操作的计算密集型的任务移交给10个子worker

```html
<script>
	var worker = new Worker('worker.js');
	worker.onmessage = function(e) {
        document.getElementById('result').textContent = e.data;
	}
</script>
```

```js
// worker.js
var num_workers = 10;
var items_per_worker = 1000000;
var result = 0;
var pending_workers = num_workers;
for (var i = 0; i < num_workers; i += 1) {
    var worker = new Worker('core.js');
    worker.postMessage(i * items_per_worker);
    worker.postMessage((i + 1) * items_per_worker);
    worker.onmessage = storeResult;
}
function storeResult(event) {
    result += 1 * event.data;
    pending_workers -= 1;
    if (pending_workers <= 0) postMessage(result);
}
```

```js
// core.js
var start;
onmessage = getStart;
function getStart(event) {
    start = 1 * event.data;
    onmessage = getEnd;
}
var end;
function getEnd(event) {
    end = 1 * event.data;
    onmessage = null;
    work();
}
function work() {
    var result = 0;
    for (var i = start; i < end; i += 1) {
        result += 1;
    }
    postMessage(result);
    close();
}
```

### API

```js
var worker = new Worker('helper.js');
// 加入type: module代表模块脚本
var worker = new Worker('helper.js', { type: 'module' });

// 使用postMessage()方法来向Worker发送数据。该通信通道可以发送结构化数据，如果要发送ArrayBuffer对象(通过直接传输它们而不是克隆后发送)，在第二个参数上提供它们的列表
worker.postMessage({
    operation: 'find-edges',
    input: buffer,// ArrayBuffer对象
    threshold: 0.6,
}, [buffer]);

// 共享worker
// 使用SharedWorker()构造函数来创建共享worker。该构造函数使用脚本URL作为第一个参数，worker名(如果有的话)作为第二个参数
var worker = new SharedWorker('service.js');
worker.port.onmessage = function(event) { ... };
worker.port.postMessage({'some message'});

// 在共享worker内，新的client会使用connect事件来声明，新的client的port由事件对象的source属性给出
onconnect = function (event) {
  var newPort = event.source;
  // set up a listener
  newPort.onmessage = function (event) { ... };
  // send a message back to the port
  newPort.postMessage('ready!'); // can also send structured data, of course
};
```

### WorkerGlobalScope

```typescript
interface WorkerGlobalScope : EventTarget {
  readonly attribute WorkerGlobalScope self;
  readonly attribute WorkerLocation location; // WorkerLocation对象
  readonly attribute WorkerNavigator navigator; // WorkerNavigator对象
  void importScripts(USVString... urls); // 获取urls中的每一个URL，按照传入的顺序一个接一个地执行它们并返回

  attribute OnErrorEventHandler onerror;
  attribute EventHandler onlanguagechange;
  attribute EventHandler onoffline;
  attribute EventHandler ononline;
  attribute EventHandler onrejectionhandled;
  attribute EventHandler onunhandledrejection;
};
```

WorkerGlobalScope对象有：

- 一个与之关联的type（"classic"或"module"）
- 一个与之关联的HTTPS状态，初始值为"none"
- 一个与之关联的referrer策略，初始值为空字符串
- 一个与之关联的CSP列表，初始值为空列表
- 一个与之关联的模块银蛇，初始为空的模块映射

### DedicatedWorkerGlobalScope

```typescript
[Global=(Worker,DedicatedWorker),Exposed=DedicatedWorker]
interface DedicatedWorkerGlobalScope : WorkerGlobalScope {
  void postMessage(any message, optional sequence<object> transfer = []);

  void close();

  attribute EventHandler onmessage;
};
```

### SharedWorkerGlobalScope

```typescript
[Global=(Worker,SharedWorker),Exposed=SharedWorker]
interface SharedWorkerGlobalScope : WorkerGlobalScope {
  readonly attribute DOMString name; // 必须返回SharedWorkerGlobalScope对象的name，使用SharedWorker构造器，可以通过name的值获取该worker的引用

  void close();

  attribute EventHandler onconnect;
};
```

## Mutation Observer

Mutation Observer API用来监视DOM变动，如节点的增减、属性变动、文本内容的变动。

DOM发生变动就会触发Mutation Observer事件。但是，与事件本质不同：

- 事件是同步触发，DOM的变化立即会触发相应的事件
- Mutation Observer是异步触发，DOM的变化会等到当前所有DOM操作都结束了才会触发

解决了DOM变动频繁的问题。如在文档中连续插入1000个<p>元素，用Mutation Observer只在1000个元素插入后才触发，且只触发一次

### 使用

#### 构造函数

```js
var observer = new MutationObserver(callback);
```

回调函数接受两个参数，第一个变动数组，第二个观察器实例

```js
var observer = new MutationObserver(function (mutations, observer) {
    mutations.forEach(function (mutation) {
        console.log(mutation);
    });
});
```

#### 实例方法

##### observe()

> 第一个参数：所要观察的DOM节点
>
> 第二个参数：一个配置对象，指定所要观察的特定变动

```js
var article = document.querySelector('article');
var options = {
    childList: true,
    attributes: true
};
observer.observe(article, options);
```

options有以下几种

- childList: 子节点的变动（指新增，删除或更改）
- attribute: 属性的变动
- characterData: 节点内容或节点文本的变动

##### disconnect()

用来停止观察。调用方法后，DOM发生变动不会触发观察器

```js
observer.disconnect();
```

##### takeRecords()

用来清除变动记录。即不在处理未处理的变动。返回变动记录的数组

```js
observer.takeRecords();
```

## MutationRecord

Mutation Observer回调函数返回实例的数组，包括以下DOM相关信息

```js
type: 观察的变动类型(attribute、characterData或childList)
target：发生变动的DOM节点
addedNodes：新增的DOM节点
removedNodes：删除的DOM节点
previousSibling：前一个同级节点，如果没有返回null
nextSibling：下一个同级节点，如果没有则返回null
attributeName：发生变动的属性
oldValue：变动前的值。只对attribute和characterData变动有效，如果发生childList变动，则返回null
```

e.g.

```js
var callback = function(records) {
    records.map(function(record) {
        console.log('Mutation type: ' + record.type);
        console.log('Mutation target: ' + record.target);
    });
};
var p = new MutationObserver(callback);
var option = {
    childList: true,
    subtree: true
};
p.observe(document.body, option);
```

使用Mutation Observer API时，网页加载DOM节点的生成会产生变动记录，只要观察DOM的变动，就能在第一个时间触发相关事件，因此也就没有必要使用`DOMContentLoaded`事件

