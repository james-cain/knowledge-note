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
