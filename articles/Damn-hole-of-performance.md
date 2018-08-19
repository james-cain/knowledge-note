## Damn hole of performance

- google devtools https://developers.google.com/web/tools/chrome-devtools/
- navigation timing performance resource 一个页面的渲染完成耗时
- http2.0
- 1000000长列表性能，用户无感知渲染
- http://taobaofed.org/blog/2016/04/25/performance-composite/
- pwa
- https://github.com/barretlee/performance-column/issues
- https://github.com/fouber/blog/issues/3
- https://developer.yahoo.com/performance/rules.html?guccounter=1
- http://velocity.oreilly.com.cn/2010/ppts/VelocityChina2010Dec7StaticResource.pdf
- http://velocity.oreilly.com.cn/2011/ppts/MobilePerformanceVelocity2011_DavidWei.pdf
- https://developers.google.com/speed/docs/insights/rules?csw=1
- https://developers.google.com/speed/docs/insights/mobile
- https://developers.google.com/web/fundamentals/performance/rendering/?hl=zh-cn
- https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/?hl=zh-cn
- https://developers.google.com/web/fundamentals/performance/critical-rendering-path/
- 《[高性能网站建设指南](http://book.douban.com/subject/3132277/)》《[高性能网站建设进阶指南](http://book.douban.com/subject/4719162/)》《[Web性能权威指南](http://book.douban.com/subject/25856314/)》
- https://www.cnblogs.com/CraryPrimitiveMan/p/3795086.html
- https://www.cnblogs.com/-simon/p/5883336.html
- https://www.cnblogs.com/callmeguxi/p/6846447.html



1. DNS预解析,可以通过预解析的方式来预先获得域名所对应的IP

   ```
   <link rel="dns-prefetch" href="//xxx.com">
   ```

2. 缓存：强缓存（Expires、Cache-Control）和协商缓存（Last-Modified、If-Modified-Since和Etag、If-None-Match）

   在一些特殊的地方可能需要选择特殊的缓存策略

   - 对于不需要缓存的资源，可以使用Cache-Control: no-store，表示资源不需要缓存
   - 对于频繁变动的资源，可以使用Cache-Control: no-cache并配合Etag使用，表示资源已被缓存，但是每次都会发送请求询问资源是否更新
   - 对于代码文件来说，通常使用Cache-Control:  max-age=31536000并配合策略缓存使用，然后对文件进行指纹处理，一旦文件名变动就会立刻下载新的文件

3. HTTP2.0

   HTTP/1.1每个请求都会建立和断开，消耗好几个RTT时间，并且由于TCP慢启动，加载体积大的文件需要更多的时间。

   HTTP2.0引入了多路复用，能让多个请求使用同一个TCP链接，加快了网页的加载速度。并且还支持Header压缩，进一步减少请求的数据大小

4. 预加载，是声明式的fetch，强制浏览器请求资源，并且不会阻塞onload事件

   ```
   <link rel="preload" href="https://example.com">
   ```

   预加载在一定程度上降低首屏的加载时间，但兼容性不好

5. 预渲染，可以通过预渲染将下载的文件先放在后台渲染

   ```
   <link rel="prerender" href="https://example.com">
   ```

6. 懒执行，将某些逻辑延迟到使用时再计算。该技术可以用于首屏优化，懒执行需要唤醒，一般可以通过定时器或者事件的调用来唤醒

7. 懒加载，将不关键的资源延后加载。原理是只加载自定义区域（通常是可视区域，也可以是即将进入可视区域）内需要加载的东西。懒加载不仅可以用于图片，也可以使用在别的资源上，比如进入可视区域才开始播放视频等等。

8. 如何渲染几万条数据并不卡住界面

   ```
   可以通过requestAnimationFrame来每16ms刷新一次
   
   setTimeout(() => {
       // 插入10万条数据
       const total = 100000;
       // 一次插入20条，如果觉得性能不好就减少
       const once = 20;
       // 渲染数据总共需要几次
       const loopCount = total / once;
       let countOfRender = 0;
       let ul = document.querySelector("ul");
       function add() {
           //优化性能，插入不会造成回流
           const fragment = document.createDocumentFragment();
           for(let i = 0; i < once; i++) {
               const li = document.createElement("li");
               li.innerText = Math.floor(Math.random() * total);
               fragment.appendChild(li);
           }
           ul.appendChild(fragment);
           countOfRender += 1;
           loop();
       }
       function loop() {
           if (countOfRender < loopCount) {
               window.requestAnimationFrame(add);
           }
       }
       loop();
   }, 0);
   ```

9. 防抖（debounce）

   原理：尽管触发事件，但是一定在事件触发n秒后才执行，如果在事件触发的n秒内又触发了这个事件，就以新的事件的时间为准，n秒后才执行，总之，就是要等触发完事件n秒内不再触发事件，才执行。

   例子

   ```
   <!DOCTYPE html>
   <html lang="zh-cmn-Hans">
   
   <head>
       <meta charset="utf-8">
       <meta http-equiv="x-ua-compatible" content="IE=edge, chrome=1">
       <title>debounce</title>
       <style>
           #container{
               width: 100%; height: 200px; line-height: 200px; text-align: center; color: #fff; background-color: #444; font-size: 30px;
           }
       </style>
   </head>
   
   <body>
       <div id="container"></div>
       <script src="debounce.js"></script>
   </body>
   	<script>
   		var count = 1;
           var container = document.getElementById('container');
   
           function getUserAction(e) {
               container.innerHTML = count++;
           };
   
           var setUseAction = debounce(getUserAction, 10000, true);
   
           container.onmousemove = setUseAction;
   
           document.getElementById("button").addEventListener('click', function(){
               setUseAction.cancel();
           })
   	</script>
   </html>
   ```

   Debounce.js

   ```
   function debounce(func, wait, immediate) {
   
       var timeout, result;
   
       var debounced = function () {
           var context = this;
           var args = arguments;
   
           if (timeout) clearTimeout(timeout);
           if (immediate) {
               // 如果已经执行过，不再执行
               var callNow = !timeout;
               timeout = setTimeout(function(){
                   timeout = null;
               }, wait)
               if (callNow) result = func.apply(context, args)
           }
           else {
               timeout = setTimeout(function(){
                   func.apply(context, args)
               }, wait);
           }
           return result;
       };
   
       debounced.cancel = function() {
           clearTimeout(timeout);
           timeout = null;
       };
   
       return debounced;
   }
   ```

   注意：当涉及函数有返回值时，debounce中同样要返回函数的执行结果，但是当immediate为false的时候，因为使用功能了setTimeout，将func.apply(context, args)的返回值赋给变量，最后再return的时候，值将会一直是undefined，所以只在immediate为true的时候返回函数的执行结果

