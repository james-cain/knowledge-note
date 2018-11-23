# WebAPI

## IndexedDB

1. [`IDBFactory`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBFactory) 提供了对数据库的访问。这是由全局对象 `indexedDB` 实现的接口，因而也是该 API 的入口

   ```js
   // 打开数据库连接,该方法返回IDBOpenRequest对象
   // version 代表打开的数据库的版本，默认为1
   indexDB.open(name[, version])
   // 删除数据库，若删除成功，返回的result将设置为undefined
   indexDB.deleteDatabase(name)
   indexDB.deleteDatabase(name, options)// 实验阶段
   // 比较作为键的两个值，以确定作为indexedDB操作(如存储和迭代)的相等和顺序性
   // -1 first<second
   // 0 first==second
   // 1 first>second
   // 如
   // var a = 1;
   // var b = 2;
   // var result = window.indexedDB.cmp(a, b);
   indexDB.cmp(first, second)
   
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
   IDBObjectStore.get(key) // 返回IDBRequest对象，根据key查询object store
   IDBObjectStore.getKey(key) // 返回IDBRequest对象
   IDBObjectStore.getAll([query, count]) // 返回IDBRequest对象
   IDBObjectStore.getAllKeys([query, count]) // 返回IDBRequest对象
   IDBObjectStore.index(name)
   IDBObjectStore.openCursor([query, direction]) // 返回IDBRequest对象，在单独线程中，返回一个新的IDBCursorWithValue对象
   // direction为IDBCursorDirection对象，合法值包括next、nextunique、prev、prevunique，默认next
   IDBObjectStore.openKeyCursor([query, direction]) // 返回IDBRequest对象，在单独线程中，返回一个新的IDBCursor对象
   IDBObjectStore.put(item[, key])
   ```

6. [`IDBIndex`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBIndex) 提供了到索引元数据的访问。

7. [`IDBCursor`](https://developer.mozilla.org/en-US/docs/IndexedDB/IDBCursor) 遍历对象存储空间和索引。

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


