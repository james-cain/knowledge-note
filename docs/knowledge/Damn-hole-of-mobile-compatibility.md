# mobile 兼容性

## IOS转换时间问题

> ios年月日之间的连接符使用的是/，服务端如果返回的连接符为-时，在转换时间时，iOS是不认识的。
>
> 因此为了解决这个问题，需要在转换时间之前先替换时间格式
>
> 如下代码：

```js
export function getCompatibleDate(time) {
  // 将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
  return time.replace(/\-/g, '/');
}
```

转换完时间后，iOS就不会有问题