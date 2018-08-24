# Browser

### 事件机制

#### 事件触发三阶段

- document往事件触发处传播，遇到注册的捕获事件会触发
- 传播到事件触发处时触发注册事件
- 从事件触发处往document传播，遇到注册的冒泡事件会触发

#### 注册事件

第三个参数可以是布尔值，也可以是对象。对于布尔值useCapture参数来说，该参数默认是false。

若为false，表示在**事件冒泡阶段**调用事件处理函数，如果参数为true，表示在**事件捕获阶段**调用

对于对象来说，可以是几个属性

- capture，布尔值，和useCapture一样
- once，布尔值
- passive，布尔值，表示永远不会调用preventDefault

只触发在目标上，可以使用stopPropagation来组织事件的传播。

### EventLoop

setTimeout延时为0，一样还是异步。原因是html5规定该函数的第二参数不得小于4毫秒，不足会自动增加。

不同的任务源会被分配到不同的Task队列中，任务源可以分为微任务(microTask)和宏任务(macroTask)。在ES6中，microTask称为jobs，macroTask称为task

```
console.log('script start');

setTimeout(function (){
    console.log('setTimeout');
}, 0);

new Promise((resolve) => {
    console.log('Promise');
    resolve();
}).then(function () {
    console.log('promise1');
}).then(function () {
    console.log('promise2');
});

console.log('script end');
// 执行顺序
// script start => Promise => promise1=> promise2 => script end => setTimeout
```

微任务包括process.nextTick，promise，Object.observe，MutationObserver

宏任务包括setTimeout，setInterval，setImmediate，script，I/O，UI rendering

**但是并不是微任务就快宏任务，**因为宏任务中包括了script，浏览器会先执行一个宏任务，接下来有一步代码，就会先执行微任务

正确的一次EventLoop顺序是

1. 执行同步代码，这属于宏任务
2. 执行栈为空，查询是否有微任务需要执行
3. 执行所有微任务
4. 必要的话渲染UI
5. 然后执行下一轮EventLoop，执行宏任务中的异步代码

