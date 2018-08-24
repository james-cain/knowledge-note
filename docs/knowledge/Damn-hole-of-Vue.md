# Vue

## NextTick

### 前提

在vue2.4之前都是使用microtasks，但由于microtasks的优先级过高，在某些情况下会出现比事件冒泡更快的情况，但如果都使用macrotasks又可能出现渲染的性能问题。所以在新版本中，会默认使用microtasks，但是在特殊情况下会用macrotasks，如v-on

实现macrotasks，**会先判断是否能使用setImmediate，不能的话降级为MessageChannel，以上都不行的话使用setTimeout**

```
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    macroTimerFunc = () => {
        setImmediate(flushCallbacks);
    }
} else if (typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) || MessageChannel.toString() === '[object MessageChannelConstructor]')) {
    const channel = new MessageChannel();
    const port = channel.port2;
    channel.port1.onmessage = flushCallbacks;
    macroTimerFunc = () => {
        port.postMessage(1);
    }
} else {
    macroTimerFunc = () => {
        setTimeout(flushCallbacks, 0);
    }
}
```

nextTick同时支持Promise的使用

```
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve
  // 将回调函数整合进一个数组中
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  // 判断是否可以使用 Promise 
  // 可以的话给 _resolve 赋值
  // 这样回调函数就能以 promise 的方式调用
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

