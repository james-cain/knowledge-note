# 性能优化

##网站及性能优化点

- google devtools https://developers.google.com/web/tools/chrome-devtools/
- navigation timing performance resource 一个页面的渲染完成耗时
- http2.0
- 1000000长列表性能，用户无感知渲染
- http://taobaofed.org/blog/2016/04/25/performance-composite/
- [pwa](https://developers.google.com/web/tools/workbox/guides/using-plugins)
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

## 网络加载类

### 首屏数据请求提前，避免Javascript文件加载后才请求数据

为了进一步提升页面加载速度，可以考虑将页面的数据请求尽可能提前，避免在JavaScript加载完成后才去请求数据。通常数据请求是页面内容渲染中关键路径最长的部分，而且不能并行，所以如果能将数据请求提前，可以极大程度上缩短页面内容的渲染完成时间。

### 懒执行，首屏加载和按需加载，非首屏内容滚屏加载，保证首屏内容最小化

将某些逻辑延迟到使用时再计算。该技术可以用于首屏优化，懒执行需要唤醒，一般可以通过定时器或者事件的调用来唤醒

推荐移动端页面首屏数据展示延时不能超过3秒。推荐首屏所有资源大小不应超过1014kb，即大约不超过1MB

### 模块化资源并行下载

在移动端资源加载中，尽量保证JS资源并行加载，主要指的是模块化js资源异步加载

### inline首屏必备的css和js

避免页面HTML载入完成到页面内容展示这段过程中页面出现空白

```
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <title>样例</title>

    <meta name="viewport" content="width=device-width,minimum-scale=1.0, maximum-scale=1.0,user-scalable=no">

    <style>

    /* 必备的首屏CSS */

    html, body{

        margin: 0;

        padding: 0;

        background-color: #ccc;

    }

    </style>

</head>

<body>

</body>
```

### meta dns prefetch设置DNS预解析

让浏览器提前解析获取静态资源的主机IP，避免等到请求时才发起DNS解析请求。通常移动端HTML采用如下方式

```
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//cdn.domain.com">
```

### 资源预加载

预加载，是声明式的fetch，强制浏览器请求资源，并且不会阻塞onload事件

对于移动端首屏加载后，提前加载可能会被使用的资源，保证用户需要浏览时已经加载完成

```
<link rel="preload" href="https://example.com">
```

预加载在一定程度上降低首屏的加载时间，但兼容性不好

### 预渲染

预渲染，可以通过预渲染将下载的文件先放在后台渲染

```
<link rel="prerender" href="https://example.com">
```

### 合理利用MTU策略

通常情况下，TCP网络传输的最大传输单元（Maximum Transmission Unit,MTU）为1500B，即网络一个RTT（Round-Trip Time，网络请求往返时间）时间内可以传输的数据量最大为1500字节。因此，在前后端分离的开发模式中，尽量保证页面的HTML内容在1KB以内，这样整个HTML的内容请求就可以在一个RTT时间内请求完成，最大限度地提高HTML载入速度。

## 缓存类

### 强缓存和协商缓存

强缓存（Expires、Cache-Control）和协商缓存（Last-Modified、If-Modified-Since和Etag、If-None-Match）

在一些特殊的地方可能需要选择特殊的缓存策略

- 对于不需要缓存的资源，可以使用Cache-Control: no-store，表示资源不需要缓存
- 对于频繁变动的资源，可以使用Cache-Control: no-cache并配合Etag使用，表示资源已被缓存，但是每次都会发送请求询问资源是否更新
- 对于代码文件来说，通常使用Cache-Control:  max-age=31536000并配合策略缓存使用，然后对文件进行指纹处理，一旦文件名变动就会立刻下载新的文件

### 合理利用浏览器缓存

在移动端还可以使用localStorage等来保存AJAX返回的数据，或者使用localStorage保存CSS或JavaScript静态资源内容，实现移动端的离线应用，尽可能减少网络请求，保证静态资源内容的快速加载。

### 静态资源离线方案

对于移动端或Hybrid应用，可以设置离线文件或离线包机制让静态资源请求从本地读取，加快资源载入速度，并实现离线更新。

### 尝试使用AMP HTML

AMP HTML可以作为优化前端页面性能的一个解决方案，使用AMP Component中的元素来代替原始的页面元素进行直接渲染。

```
<!-- 不推荐 -->

<video width="400" height="300" src="http://www.domain.com/videos/myvideo.mp4" poster="path/poster.jpg">

    <div fallback>

        <p>Your browser doesn’t support HTML5 video</p>

    </div>

    <source type="video/mp4" src="foo.mp4">

    <source type="video/webm" src="foo.webm">

</video>





<!-- 推荐 -->

<amp-video width="400" height="300" src="http://www.domain.com/videos/myvideo.mp4" poster= "path/poster.jpg">

    <div fallback>

        <p>Your browser doesn’t support HTML5 video</p>

    </div>

    <source type="video/mp4" src="foo.mp4">

    <source type="video/webm" src="foo.webm">

</amp-video>
```

## 图片类

### 图片压缩处理

### 使用较小的图片，合理使用base64内嵌图片

在页面使用的背景图片不多且较小的情况下，可以将图片转化成base64编码嵌入到HTML页面或CSS文件中，这样可以减少页面的HTTP请求数。需要注意的是，要保证图片较小，一般图片大小超过2KB就不推荐使用base64嵌入显示

### 使用更高压缩比格式的图片，如webp

### 图片懒加载

将不关键的资源延后加载。原理是只加载自定义区域（通常是可视区域，也可以是即将进入可视区域）内需要加载的东西。懒加载不仅可以用于图片，也可以使用在别的资源上，比如进入可视区域才开始播放视频等等。

```
<img data-src="//cdn.domain.com/path/photo.jpg" alt="懒加载图片">
```

### 使用Media Query或srcset根据不同屏幕加载不同大小的图片

针对不同的移动端屏幕尺寸和分辨率，输出不同大小的图片或背景图能保证在用户体验不降低的前提下节省网络流量，加快部分机型的图片加载速度

### 使用iconfont代替图片图标

### 定义图片大小限制

加载的单张图片一般不建议超过30KB，避免大图片加载时间长而阻塞页面其他资源的下载，推荐在10KB以内。

## 脚本类

### 尽量使用id选择器

选择页面DOM元素时尽量使用id选择器，因为id选择器速度最快。

### 合理缓存DOM对象

对于需要重复使用的DOM对象，要优先设置缓存变量，避免每次使用时都要从整个DOM树中重新查找。

### 页面元素尽量使用事件代理，避免直接事件绑定

使用事件代理可以避免对每个元素都进行绑定，并且可以避免出现内存泄露及需要动态添加元素的事件绑定问题，所以尽量不要直接使用事件绑定。

```
// 不推荐
$('.btn').on('click', function(e){
    console.log(this);
});
// 推荐
$('body').on('click', '.btn', function(e){
    console.log(this);
});
```

### 使用touchstart代替click

由于移动端屏幕的设计，touchstart事件和click事件触发时间之间存在300毫秒的延时，所以在页面中没有实现touchmove滚动处理的情况下，可以使用touchstart事件来代替元素的click事件，加快页面点击的响应速度，提高用户体验。但同时我们也要注意页面重叠元素touch动作的点击穿透问题。

### 避免touchmove、scroll连续事件处理

需要对touchmove、scroll这类可能连续触发回调的事件设置事件节流，例如设置每隔16ms（60帧的帧间隔为16.7ms，因此可以合理地设置为16ms）才进行一次事件处理，避免频繁的事件调用导致移动端页面卡顿。

```
// 推荐
$('.scroller').on('touchmove', '.btn', function(e){
    let self = this;
    setTimeout(function(){
        console.log(self);
    }, 16);
});
```

### 避免使用eval、with，使用join代理连接符+，推荐使用ECMAscript 6的字符串模板

### 尽量使用ECMAScript 6+的特性来编程

### 防抖(debounce)

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

### 节流(throttle)

方法一：使用时间戳，当触发事件的时候，取出当前的时间戳，然后减去之前的时间戳（最一开始值设为0），如果大于设置的时间周期，就执行函数，然后更新时间戳为当前的时间戳，如果小于，就不执行

```
function throttle(func, wait) {
    var context, args;
    var previous = 0;

    return function() {
        var now = +new Date();
        context = this;
        args = arguments;
        if (now - previous > wait) {
            func.apply(context, args);
            previous = now;
        }
    }
}
```

方法二：使用定时器，当触发事件的时候，设置一个定时器，再触发事件的时候，如果定时器存在，就不执行，直到定时器执行，然后执行函数，清空定时器，设置下个定时器

```
function throttle(func, wait) {
    var timeout;
    var previous = 0;

    return function() {
        context = this;
        args = arguments;
        if (!timeout) {
            timeout = setTimeout(function(){
                timeout = null;
                func.apply(context, args)
            }, wait)
        }

    }
}
```

方法三：结合以上两者的优势，做到鼠标移入立刻执行，停止触发的时候还能再执行一次。

```
function throttle(func, wait) {
    var timeout, context, args, result;
    var previous = 0;

    var later = function() {
        previous = +new Date();
        timeout = null;
        func.apply(context, args)
    };

    var throttled = function() {
        var now = +new Date();
        //下次触发 func 剩余的时间
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
         // 如果没有剩余的时间了或者你改了系统时间
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        } else if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
    };
    return throttled;
}
```

## 渲染类

### 使用viewport固定屏幕渲染，可以加速页面渲染内容

一般认为，在移动端设置Viewport可以加速页面的渲染，同时可以避免缩放导致页面重排重绘。在移动端固定Viewport设置的方法如下。

```
<!-- 设置viewport不缩放 -->

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 避免各种形式重排重绘

页面的重排重绘很耗性能，所以一定要尽可能减少页面的重排重绘，例如页面图片大小变化、元素位置变化等这些情况都会导致重排重绘。

### 使用CSS3动画，开启GPU加速

使用CSS3动画时可以设置transform: translateZ(0)来开启移动设备浏览器的GPU图形处理加速，让动画过程更加流畅。

```
-webkit-transform: translateZ(0);
-ms-transform: translateZ(0);
-o-transform: translateZ(0);
transform: translateZ(0);
```

### 合理使用Canvas和requestAnimationFrame

### SVG代替图片

部分情况下可以考虑使用SVG代替图片实现动画，因为使用SVG格式内容更小，而且SVG DOM结构方便调整。

### 不滥用float

在DOM渲染树生成后的布局渲染阶段，使用float的元素布局计算比较耗性能，所以尽量减少float的使用，推荐使用固定布局或flex-box弹性布局的方式来实现页面元素布局。

### 不滥用web字体或过多font-size声明

过多的font-size声明会增加字体的大小计算，而且也没有必要的。

### 渲染几万条数据不卡住页面

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

## 架构协议类

### 尝试使用SPDY和HTTP2

在条件允许的情况下可以考虑使用SPDY协议来进行文件资源传输，利用连接复用加快传输过程，缩短资源加载时间。HTTP 2在未来也是可以考虑尝试的。

HTTP/1.1每个请求都会建立和断开，消耗好几个RTT时间，并且由于TCP慢启动，加载体积大的文件需要更多的时间。

HTTP2.0引入了多路复用，能让多个请求使用同一个TCP链接，加快了网页的加载速度。并且还支持Header压缩，进一步减少请求的数据大小

### 使用后端数据渲染

使用后端数据渲染的方式可以加快页面内容的渲染展示，避免空白页面的出现，同时可以解决移动端页面SEO的问题。如果条件允许，后端数据渲染是一个很不错的实践思路。

## 高性能网站建设指南

### 规则1-减少HTTP请求

通过一些技术，包括**图片地图、CSS spirites、内联图片和脚本、样式表的合并**等。在实际页面上估计响应时间可以**减少到50%**左右

#### 图片地图(Image Map)

使用图片地图，既能减少HTTP请求，又不需改变页面外观感受。允许你在一个图片上关联多个URL。目标URL取决于用户点击了图片的哪个位置

例子

[无图片地图](http://stevesouders.com/hpws/imagemap-no.php)

[有图片地图](http://stevesouders.com/hpws/imagemap.php)

图片地图有两种类型：

- 服务器端图片地图(Server-side image maps)-将所有点击提交到同一个目标URL，向其传递用户点击的x、y坐标。服务器daunt将该x、y坐标映射为适当的操作
- 客户端图片地图(Client-side image maps)-将用户的点击映射到一个操作，而无需向后端应用程序发送请求。映射通过HTML的**MAP标签**实现

图片地图缺点：

- 在定义图片地图上的区域坐标时，如果采取手工的方式很难完成且容易出错
- 除了矩形之外几乎无法定义其他形状。

一般使用场景：

导航栏或者其他超链接中使用多个图片，将它们转换为地图是加速页面的最简单方式

#### CSS Sprites

"显灵板"(Ouija Board)是任何支持背景图片的HTML元素，如SPAN或DIV。使用CSS的background-position属性，可以将HTML元素放置到背景图片中期望的位置上。

```
<div style="background-image: url('a_lot_of_sprites.gif);
			background-posiiton: -260px -90px;
			width: 26px;
			height: 24px;">
</div>
```

例子

[Sprites](http://stevesouders.com/examples/sprites.php?)

优点：

- 通过合并图片减少HTTP请求，并且比图片地图更灵活
- 降低了下载量。合并后的图片会比分离的图片的总和要小，这是因为它降低了图片自身的开销（颜色表、格式信息，等）

一般使用场景：

在页面中为背景、按钮、导航栏、链接等提供大量图片时很适合

#### 内联图片(Inline Images)

```
data:[<mediatype>][;base64],<data>
```

Base64编码会增加图片的大小，因此整体下载量会增加。

例子

[Inline-images](http://stevesouders.com/examples/inline-images.php?)

**由于data:URL是内联在页面中的，在跨域不同页面时不会被缓存。**可以将CSS规则放在外部样式表中，这意味着数据可以**缓存在样式表内部**

例子

[Inline-css-images](http://stevesouders.com/examples/inline-css-images.php)

缺点：

- 将内联图片放置在外部样式表中增加了一个额外的HTTP请求，但被缓存后可以得到额外的收获

#### 合并脚本和样式表(Combined Scripts and Stylesheets)

在理想情况下，一个页面应该使用不多于一个的脚本和样式表

例子

[分离脚本示例](http://stevesouders.com/examples/combo-none.php)

[合并脚本示例](http://stevesouders.com/examples/combo.php)

### 规则2-使用内容发布网络(Content Delivery Network,CDN)

内容发布网络（CDN）是一组分布在多个不同地理位置的Web服务器，用于更加有效地向用户发布内容。

CDN用于发布静态内容，如图片、脚本、样式表和Flash。提供动态HTML页面会引入特殊的存储需求-数据库连接、状态管理、验证、硬件和OS优化等

例子

[CDN](http://stevesouders.com/hpws/ex-cdn.php?)

[no-CDN](http://stevesouders.com/hpws/ex-nocdn.php)

优点：

- 缩短响应时间
- 备份、扩展存储能力和进行缓存
- 有助于缓和Web流量峰值压力，如在获取天气或股市新闻、浏览流行的体育或娱乐事件时

缺点：

- 响应时间可能会受到其他网站-甚至很可能是竞争对手流量的影响
- 无法直接控制组件服务器所带来的特殊麻烦。例如，修改HTTP响应头必须通过服务提供商来完成，而不是有工作团队完成
- 如果CDN服务的性能下降了，工作质量也随之下降

### 规则3-添加Expires头

通过使用一个长久的Expires头，可以使这些组件被缓存。长久的Expires头最常用于**图片**，但应该将其用在所有组件上，包括**脚本、样式表和Flash**。

#### Max-Age和mod_expires

Cache-Control使用max-age指令指定组件被缓存多久。以秒为单位一个更新窗。

一个长久的max-age头可以将刷新窗设置为未来10年。Cache-Control: max-age=315360000

对于Expires和Cache-Control max-age，如果两者同时出现，HTTP规范规定max-age指令将重写Expires头。

#### 修改文件名

当出现了Expires头时，直到过期日期为止一直会使用缓存的版本。浏览器不会检查任何更新，直到过了过期日期。这也是为什么使用Expires头能够显著地减少响应时间-浏览器直接从硬盘上读取组件而无需生成任何HTTP流量。

最有效的解决方案是修改所有链接，全新的请求将从原始服务器下载最新的内容。

例子

[无Expires](http://stevesouders.com/hpws/expiresoff.php)

[长久的 Expires](http://stevesouders.com/hpws/expireson.php)

优点：

- 具有长久Expires头的组件将会被缓存，在后续请求时浏览器直接从硬盘上读取它，避免了一个HTTP请求

若不加Expires头，**仍然会存储在浏览器的缓存中**。为了提高效率，浏览器会向原始服务器发送一个条件GET请求。如果组件没有改变，原始服务器可以免于发送整个组件，而是**发送一个很小的头**，告诉浏览器可以使用其缓存的组件。

### 规则4-压缩组件

通过Accept-Encoding: gzip, deflate头，支持对文件的压缩。

如果Web服务器看到请求中有这个头，就会使用客户端列出的方法中的一种来压缩响应。Web服务器通过响应中的Content-Encoding头来通知Web客户端。Content-Encoding: gzip

其中gzip是最理想的压缩方法

值得压缩的内容：XML、JSON在内的任何文本响应，脚本和样式表

不值得压缩：图片和PDF，因为它们已经被压缩

**压缩的成本**：服务端会花费额外的CPU周期来完成压缩，客户端要对压缩文件进行解压缩。

通常对大于1KB或者2KB的文件进行压缩。mod_gzip_minimum_file_size指令控制希望压缩的文件的最小值，默认是500B。

#### 节省

压缩通常能将相应的数据量减少接近70%。

#### 配置

- Apache 1.3的gzip压缩由mod_gzip模块提供。最常用的指令

mod_gzip_on

	启用mod_gzip

mod_gzip_item_include

mod_gzip_item_exclude

	基于文件类型、MIME类型、用户代理等定义哪些需要压缩、哪些不需要

很多Web主机服务都**默认为text/html**打开了mod_gzip。最重要的配置修改就是需要明确压缩脚本和样式表。

```
mod_gzip_item_include	file	\.js$
mod_gzip_item_include	mime	^application/x-javascript$
mod_gzip_item_include	file	\.css$
mod_gzip_item_include	mime	^text/css$
```

**gzip命令行工具提供了一个选项，用于控制压缩的程度，可以在CPU使用量和数据大小的变化之间进行取舍**，但mod_gzip中没有配置指令能够控制压缩级别。

- Apache 2.x的gzip压缩由mod_deflate模块提供。

上例中的配置可以在2.x中如下配置：

```
AddOutputFilterByType DEFLATE text/html text/css application/x-javascript
```

mod_gzip包含了一个用于控制压缩机别的指令-Deflate CompressionoLevel

#### 代理缓存

由于浏览器响应头中带有Expires和Cache-Control，用来缓存响应。当浏览器通过代理来发送请求时，就会带来问题。假设URL发送到代理的第一个请求来自一个不支持gzip的浏览器，此时浏览器缓存了未压缩的内容。现在，假设到达代理的第二个请求访问的是同一个URL，来自一个支持gzip的浏览器，但是此时代理只会把缓存中没有压缩的内容进行响应，就失去了进行压缩的机会。若顺序反了--第一个请求来自一个支持gzip的浏览器，而第二个请求来自于一个不支持gzip的浏览器—情况就更糟糕。

要解决这个问题，可以通过在Web服务器的响应中添加**Vary**头。Web服务器可以告诉代理根据一个或多个请求头来改变缓存的响应。由于压缩的决定时基于Accept-Encoding请求头的，因此需要在服务器的Vary响应头中包含Accept-Encoding

```
Vary: Accept-Encoding
```

因此，代理需要缓存响应的多个版本，为Accept-Encoding请求头的每个值缓存一份。通过Vary头，可以选择需要读取的是缓存还是不缓存的内容。

例子

[无压缩](http://stevesouders.com/hpws/nogzip.php)

[压缩HTML](http://stevesouders.com/hpws/gzip-html.php)

[压缩所有组件](http://stevesouders.com/hpws/gzip-all.php)

### 规则5-将样式表放在顶部

将样式表放在文档底部会导致在浏览器中阻止内容逐步呈现。为避免当样式变化时重绘页面中的元素，浏览器会阻塞内容逐步呈现。

#### 白屏

#####将CSS放在底部

导致白屏问题的情形有以下几种：

- 在新窗口中打开时
- 重新加载时
- 作为主页

例子

[将css放在底部](http://stevesouders.com/hpws/css-bottom.php)

##### 将CSS放在顶部

为了避免白屏，将样式表放在文档顶部的HEAD中。

[将CSS放在顶部](http://stevesouders.com/hpws/css-top.php)

引入样式表有两种方式：

- 使用LINK标签

  ```
  <link rel="stylesheet" href="style.css">
  ```

- 使用@import规则

  ```
  <style>
  	@import url("style.css");
  </style>
  ```

LINK标签会比@import带来性能上的收益。@import规则有可能会导致白屏现象，即便把@import规则放在文档的HEAD标签中也是如此。

#### 无样式内容的闪烁

所谓无样式内容闪烁(Flash of Unstyled Content，Fouc)，就在在页面逐步加载时，文字首先显示，然后是图片。最后样式表正确地下载并解析之后，已经呈现的文字和图片要用新的样式重绘。

例子

[无样式内容的CSS闪烁](http://stevesouders.com/hpws/css-fouc.php)

白屏是对FOUC问题的弥补。

### 规则6-将脚本放在底部

#### 并行下载

使用**两个主机名**比使用1、4或10个主机名能带来更好的性能。

#### 脚本阻塞下载

在下载脚本时并行下载实际上是被**禁用**的-即使使用了不同的主机名，浏览器也不会启动其他的下载。

原因：

- 脚本可能使用document.write来修改页面内容，因此浏览器会等待，以确保页面能够恰当地布局
- 为了保证脚本能够按照正确的顺序执行。

例子

[顶部脚本VS底部脚本](http://stevesouders.com/hpws/move-scripts.php)

### 规则7-避免CSS表达式

CSS表达式是动态设置CSS属性的一种强大(并且危险)的方式。

在很多动态页面，可以使用CSS表达式将背景色设置为每小时变化一次。

```
background-color: expression((new Date()).getHours()%2 ? '#b8d4ff' : '#f08100');
```

expression方法接受一个Javascript表达式。

####一次性表达式

如果CSS表达式必须被求值一次，那么可以在这一次执行中重写自身。

```
<style>
P {
    background-color: expression(altBgcolor(this));
}
</style>
<script type="text/javascript">
function altBgcolor(elem) {
    elem.style.backgroundColor = (new Date()).getHours() % 2 ? '#b8d4ff' : '#f08100';
}
</script>
```

### 规则8-使用外部Javascript和CSS

就纯粹而言，内联快一些。

外部文件所带来的收益-Javascript和CSS文件有机会被浏览器缓存起来。

如何衡量内联和外部引用：

- 页面浏览量

  每个用户产生的页面浏览量越少，内联Javascript和CSS的越好

- 组件重用

  页面如果使用了相同的Javascript和CSS，使用外部文件可以提高这些组件的重用率

#### 加载后下载

对于作为多次页面浏览量中的第一次的主页，为主页内联Javascript和CSS，又能为所有后续页面浏览量提供外部文件。可以通过在主页加载完成后动态下载外部组件来实现（通过onload事件）。这能够将外部文件放到浏览器的缓存中以便用户接下来访问其他页面。

例子

[加载后下载](http://stevesouders.com/hpws/post-onload.php)

### 规则9-减少DNS查找

通常浏览器查找一个给定主机名的IP地址要花费20-120毫秒。在DNS查找完成之前，浏览器不能从主机名那里下载到任何东西。

响应时间以来于DNS解析器（通常由ISP提供）、所承担的请求压力、与它之间的距离和带宽速度。

#### DNS缓存和TTL

DNS可以被缓存起来提高性能。

缓存方式有多种：

- ISP（Internet Service Provider，网络服务提供者）或者局域网中一台特殊的缓存服务器
- 用户计算机**浏览器**缓存
- 用户计算机**操作系统**缓存

缓存读取顺序：浏览器缓存->操作系统缓存->ISP。

服务器可以表明记录可以被缓存多久，即查找返回的DNS记录包含了一个**存活时间**(TTL, Time-to-live)值。该值告诉客户端可以对该记录缓存多久。

**操作系统会考虑**TTL值，而浏览器通常会忽略，并设置自己的时间限制。并且HTTP协议的keep-alive会**覆盖TTL和浏览器的时间限制**，即只要浏览器和Web服务器保持连接打开的状态，就不需要进行DNS查找。

浏览器对缓存的DNS记录的数量是有限制的，并且不会考虑缓存记录的时间，即只要超过了限制，就会删除较早的DNS记录，之后访问就要重新查找。不过，即使浏览器丢弃了DNS记录，操作系统只要保留该记录，就不会到ISP中查找，也不会明显延迟。

TTL值建议设置为1天，但是一些拥有巨大数量用户的顶级网站会将时间设置的很小，甚至有的设置为1分钟，主要是因为这些网站能够做到当服务器、虚拟IP地址（VIP）或联合定位掉线时能快速提供故障转移。

如何在并行下载和减少DNS查找做权衡？

建议**将组件分别放到至少2个、但不要超过4个主机名下**。

### 规则10-精简Javascript

#### 混淆

混淆会带来几个问题

- 缺陷
- 维护
- 调试

#### 内联脚本

#### 精简CSS

精简CSS能够带来的节省通常要小于精简Javascript，最大的潜在节省来自于优化CSS-合并相同的类、移除不使用的类等。

最佳解决方案是移除注释和空白，并进行 一些直观的优化，如使用缩写（用"#606"代替"#660066"）和移除不必要的字符串（用"0"代替"0px"）

### 规则11-避免重定向

重定向（Redirect）用于将用户从一个URL重新路由到另一个URL。常见的是301和302。重定向会使页面变慢。

常见的3xx状态码：

- 300 Multiple Choices（基于Content-type）
- 301 Moved Permancently
- 302 Moved Temporarily（亦称Found）
- 303 See Other
- 304 Not Modified（并不是真正的重定向，用来响应GET请求，避免下载已经存在于浏览器中的数据）
- 305 Use Proxy
- 307 Temporary Redirect

301和302响应体通常是空的。并且在实际中都不会被缓存，除非有附加的头-如Expires和Cache-Control等。

除了以上重定向，还有别的方式可以实现重定向：

- 在HTML文档的头中包含meta refresh标签，在content属性指定的秒数后重定向

  ```
  <meta http-equiv="refresh" content="0; url=http://stevesouders.com/newuri">
  ```

- Javascript中，将document.location设置为期望的URL即可。

如果必须进行重定向，最好使用标准的3XXHTTP状态码，主要是为了确保后退按钮能够正常工作。

重定向是解决很多问题的简单方式，但最好使用其他不会减慢网页加载速度的解决方案：

- 缺少结尾的斜线

  当存在URL的结尾必须出现斜线(/)而没有出现时，这是最为浪费、发生得也很频繁的一种重定向。

### 规则12-删除重复脚本

重复脚本损伤性能的方式有两种-不必要的HTTP请求和执行Javascript所浪费的时间。

### 规则13-配置ETag

实体标签(Entity Tag，ETag)是Web服务器和浏览器用于确认缓存组件有效性的一种机制。

Last-Modified和ETag都是用于检测浏览器缓存中的组件与原始服务器上的组件是否匹配。ETag是唯一标识了一个组件的一个特定版本的字符串。唯一的格式约束是该字符串必须用引号引起来。

ETag会使用If-None-Match头将ETag传回原始服务器。如果ETag是匹配的，就会返回304状态码，使响应减少字节数。

### 规则14-使Ajax可缓存

在请求中可以增加Expires头，响应将被缓存并从磁盘上进行读取，从而得到更快的用户体验。

## 高性能网站建设进阶指南

### 创建快速响应的Web应用

####Web Workers and Gears

Javascript并不支持多线程，所以无法使用Javascript代码创建一个后台线程来执行开销很大的代码。介于这个原因，需要一种像多线程那样能多任务并发执行却没有线程之间相互侵入危险的方法。因此有了Web Workers

创建并启动worker

```
// 创建并开始执行worker
var worker = new Worker("js/decrypt.js");

// 注册事件处理程序，当worker给主线程发送信息时执行
worker.onmessage = function (e) {
    alert("The decrypted value is " + e.data);
}

// 发送信息给worker，这里是指待解密的值
worker.postMessage(getValueToDecrypt());

/**
* js/decrypt.js的伪代码
*/
// 注册用来接收来自主线程信息的处理程序
onmessage = function(e) {
    // 获取传过来的数据
    var valueToDecrypt = e.data;
    
    // TODO: 实现解密功能
    
    // 把值返回给主线程
    postMessage(decryptedValue);
}
```

如果发现使用的浏览器不支持Web Worker API，可以用**Google的Gears插件**，利用它在IE、Firefox和safari的早期版本上实现一些像Web Worker一样的功能。

Gears Worker API与Web Worker API相似但并不完全一致。如下代码就是使用Gears的API来重写

```
// 创建Worker Pool，它会产生Worker
var workerPool = google.gears.factory.create('beta.workerpool');

// 注册事件处理程序，接收来自Worker的信息
workerPool.onmessage = function (ignore1, ignore2, e) {
    alert("The decrypted value is " + e.body);
}

// 创建Worker
var workerId = workerPool.createWorkerFromUrl("js/decrypt.js");
 
// 发送信息到这个worker
workerPool.sendMessage(getValueToDecrypt(), workerId);

/**
* js/decrypt.js的Gears伪代码
*/
var workerPool = google.gears.workerPool;
workerPool.onmessage = function(ignore1, ignore2, e) {
    // 获得传递过来的数据
    var valueToDecrypt = e.body;
    
    // TODO: 实现解封装功能
    
    // 把值返回给主线程
    workerPool.sendMessage(decryptedValue, e.sender);
}
```

####内存使用对响应时间的影响

创建快速响应网页的另一个关键方面是：内存管理。

当执行回收时，在GC实现中最复杂的几乎是“stop the world”，它们会冻结整个运行环境(包括正在掉员工的主浏览器Javascript线程)，直到遍历完整个创建对象的“堆”。在这个过程中，它们查找那些不再使用或能够回收未用内存的对象。

对于大部分应用程序而言，GC是完全透明的，因为冻结运行环境的时间短到可以完全避开用户注意。但是随着应用程序内存占用的增加，最终还是会引起用户的察觉。

当这种情况发生时，应用程序开始定期地出现间歇式迟钝；问题变得更糟糕时，整个浏览器可能出现定期的冻结。就会有糟糕的用户体验。

更糟糕的是，Javascript没有工具能够通知开发者何时进行垃圾回收或者完成工作消耗了多少时间；导致开发者需靠猜测来判断GC是否为形成UI延迟的原因。

较好的解决内存问题的方式：

- 使用delete关键字从内存中移除不再需要的Javascript对象
- 从网页的DOM树上移除不再是必须的节点

```
var page = { address: "http://some/url" };

page.contents = getContents(page.address);
...
delete page.contents;

...
var nodeToDelete = document.getElementById("redundant");
// 从DOM中移除节点(它仅能通过从父节点调用removeChild()来完成)
// 并同时从内存中删除这个节点
delete nodeToDelete.parent.removeChild(nodeToDelete);
```

### 拆分初始化负载

对于大多数Web应用程序来说，最好把在onload事件之前执行的Javascript代码拆分成一个单独的文件，下载完成之后剩下的Javascript采用**无阻塞下载技术**立即下载。

### 无阻塞加载脚本

通常，大多数浏览器是并行下载组件的，但对于外部脚本并非如此。**当浏览器开始下载外部脚本时，在脚本下载、解析并执行完毕之前，不会开始下载任何其他内容。**

**当脚本下载和执行时，浏览器阻塞了所有其他下载。只有当脚本执行完成之后，图片、样式表和iframe才开始并行下载。**

浏览器在下载和执行脚本时出现阻塞的原因：脚本可能会改变页面或Javascript的名字空间，他们会对后续内容造成影响。**脚本必须按顺序执行，但没有必要按顺序下载。**Internet Explorer 8是第一个支持脚本并行下载的浏览器。IE 8并行下载脚本的能力让页面加载更快，但并没有完全解决问题。虽然它实现了并行下载js脚本，但**仍在脚本下载并执行完毕之前阻塞图片和iframe的下载**。

让脚本运行的更好有以下几种方式：

- XHR Eval

  通过XMLHttpRequest(XHR)从服务端获取脚本。当响应完成时通过eval命令执行内容。

  该方法的缺陷是通过XMLHttpRequest获取的脚本必须部署在和主页面相同的域中。

  ```
  var xhrObj = getXHRObject();
  xhrObj.onreadystatechange = function() {
      if (xhrObj.readyState == 4 && xhrObj.status == 200) {
          eval(xhrObj.responseText); // 该方式的核心部分
      }
  }
  xhrObj.open('GET', 'A.js', true);
  xhrObj.send('');
  ```

- XHR 注入

  该方式也是通过XMLHttpRequest来获取Javascript的。但与eval不同的是，该机制是通过创建一个script的DOM元素，然后把XMLHttpRequest的响应注入script中来执行Javascript的。

  ```
  var xhrObj = getXHRObject();
  xhrObj.onreadystatechange = function() {
      if (xhrObj.readyState == 4 && xhrObj.status == 200) {
          var scriptElem = document.createElement('script');
          document.getElementByTagName('head')[0].appendChild(scriptElem);
          scriptElem.text = xhrObj.responseText;
      }
  }
  xhrObj.open('GET', 'A.js', true);
  xhrObj.send('');
  ```

- Script DOM Element

  该技术使用Javascript动态地创建script DOM元素并设置其src属性

  ```
  var scriptElem = document.createElement('script');
  scriptElem.src = 'http://anydomain.com/A.js';
  document.getElementsByTagName('head')[0].appendChild(scriptElem);
  ```

  下载过程中用这种方式创建脚本不会阻塞其他组件，并且**允许跨域获取脚本**。

- Script Defer

  IE支持script的defer属性，可以让浏览器不必立即加载脚本。当**IE**下载设置defer属性的脚本时，**允许其他资源并行下载。**

  只在部分浏览器中实现了并行下载。

  ```
  <script defer src="A.js"></script>
  ```

  兼容性，IE 10+，chrome等主流浏览器都兼容

- document.write Script Tag

  使用document.write把HTML标签script写入页面中

  同样和Script Defer一样，只在IE中是并行加载脚本的

  不推荐使用该技术，因为它只在部分浏览器中实现并行下载，而且还阻塞脚本之外所有其他资源的下载。

  ```
  document.write("<script type='text/javascript' src='A.js'></script>");
  ```

以上这些高级的下载技术不能确保脚本按照在页面中排列的顺序下载和执行。因为脚本是并行下载的，所以他们会按照到达的顺序执行-最先到达的最先执行-而不是按照他们排列的顺序。但在IE浏览器中，script defer 和document.write Script Tag保证了脚本按照顺序执行而不管哪个先下载完成。

#### 浏览器忙指示器

浏览器提供忙指示器，让用户感知到页面还在加载。常用的浏览器忙指示器：状态栏、进度条、标签页面和光标。

理解每种技术如何对浏览器忙指示器产生影响相当重要。在某些情况下为了得到更好的用户体验，需要忙指示器，让用户知道页面正在运行。

### 整合异步脚本

根据无阻塞页面脚本中理解异步加载脚本原理，脚本如果按常规方式加载（<script src="url"></script>），不仅会阻塞页面中其他内容的下载，还会阻塞脚本后面所有元素的渲染。异步加载脚本可以避免这种阻塞现象，从而提高页面加载速度。

在IE8、safari 4和chrome 2实现了当采用常规script标签方式时并行下载，同时保持执行顺序。

#### 异步加载脚本时保持执行顺序

- 硬编码回调（Hardcoded Callback）

  让外部脚本调用行内代码里的函数。如，将原本在行内脚本中执行的调用函数移到外部脚本中执行。但这种方法是不灵活-改变回调接口时需要调整外部脚本。

- Window Onload

  通过监听window的onload事件来触发行内代码的执行。只要确保外部脚本在window.onload之前下载执行就能保持执行顺序。

- 定时器

  使用轮询方法来保证在行内代码执行之前所依赖的外部脚本机已经加载。可以使用setTimeout方法。

- Script Onload

  整合异步加载外部脚本和行内脚本的首选。

  ```
  <script type="text/javascript">
  var aExamples = [['couple-normal.php','Normal Script Src'],..];
  
  function init() {
  	..初始加载方法
  }
  
  var domscript = document.createElement('script');
  domscript.src = "menu.js";
  domscript.onloadDone = false;
  domscript.onload = function () {
      domscript.onloadDone = true;
      init();
  }
  domscript.onreadystatechange = function () {
  	if (("loaded" === domscript.readyState || "complete" === domscript.readyState) && !domscript.onloadDone) {
          domscript.onloadDone = true;
          init();
  	}
  }
  document.getElementsByTagName('head')[0].appendChild(domscript);
  </script>
  ```

- 降级使用script标签

### 布置行内脚本

行内脚本虽然不会产生额外的HTTP请求，但**会阻塞页面上资源的并行下载，还会阻塞逐步渲染**。

若站点中使用了行内脚本，尽可能地避免这种行为非常重要，提供了几个有效的解决方案:

- 把行内脚本移至底部

  把行内脚本移至页面上所有资源的后面来实现并行下载和逐步渲染。**该技术避免了阻塞下载，但它依旧阻塞渲染**。如果行内脚本执行时间不是很长(少于300毫秒)，那么这种技术可以作为一个页面提速的简单方法。

- 异步启动执行脚本

  **可以让浏览器异步执行行内脚本**，使其有可能实现并行下载和逐步渲染。简单的异步调用就是**使用setTimeout**，例子：

  ```
  function longCode() {
      var tStart = Number(new Date());
      while((tStart + 5000) > Number(new Date())) {};
  }
  setTimeout(longCode, 0);
  ```

  例子的结果类似于把行内脚本移至底部，图片并行下载，页面花了5秒加载完成。但不同在于，使用setTimeout好处，那就是**在IE中实现了逐步渲染**。在行内脚本开始执行之前，IE有足够的时间渲染页面顶部的文本。但在**Firefox**中的渲染仍然是被阻塞的，需要增加到**250毫秒**来实现Firefox中的逐步渲染。

  使用onload事件可以让文本和图片在一旦可用时立即被渲染，并在不阻塞下载和渲染前提下尽可能早地执行行内脚本。

- 使用script的defer属性

  只有在IE和Firefox 3.1+支持。通常把它用于下载外部脚本，其实defer属性也适用于行内脚本，它允许浏览器在继续解析和渲染页面的同时延迟执行行内脚本。

#### 保持CSS和Javascript的执行顺序

对CSS来说，**不管HTTP响应和接受的顺序如何，它们都是按照指定顺序应用的**。CSS的应用规则同时适用于样式表和行内样式，**浏览器会等待下载时间长的样式表下载完成以保证CSS是按照页面指定的顺序应用的**。

#### 大部分下载都不阻塞行内脚本

#### JS会阻塞后续DOM解析以及其它资源(如CSS、js或图片资源)的加载

JS运行在浏览器中，是单线程的，且JS可能会修改DOM结构，给DOM添加样式等等，所以意味着在当前的JS加载执行完成前，后续资源的加载可能都是没有意义的。所以会影响他们的加载。

其实，这里是**没有考虑prefetch、defer、async的情况的**。

- 没有prefetch、defer、async，浏览器会立即加载并执行指定的脚本，“立即”指的是在渲染该script标签之下的文档元素之前，也就是不等待后续载入的文档元素，但是还是得等待前面的CSS文件渲染完

- `<script async src="script.js"></script>`

  有async，加载和渲染后续文档的过程将和script.js的加载与执行并行进行(下载异步，执行同步)。也就是当js加载完成后，会中断文档的解析，先执行脚本，脚本执行完后，再继续解析。

- `<script defer src="script.js"></script>`

  有defer，加载后续文档元素的过程将和script.js的加载并行进行（异步），但是script.js的执行要在所有元素解析完成之后，DOMContentLoaded事件触发之前完成。也就是当脚本下载完后，先解析DOM，解析完后再执行js

![defer_async](http://coracain.top/assets/defer_async.jpg)

但其实在现代浏览器中，用的最多的还是prefetch；defer和async都是异步加载脚本文件；慎用async，因为只要下载完成后就加载，不考虑页面样式先后的加载顺序，不过它对于那些可以不依赖任何脚本或不被任何脚本依赖的脚本来说是非常合适的，典型例子：Google Analytics；耗时较长的脚本代码可以使用defer来推迟执行。

#### 样式表阻塞后面的行内脚本执行和DOMContentLoaded事件触发

| 渲染引擎                        | 样式表之前的脚本 | 样式表之后的外部脚本 | 样式表之后的行内脚本 |
| ------------------------------- | ---------------- | -------------------- | -------------------- |
| Presto(Opera，已经退出历史舞台) | 否               | 否                   | 否                   |
| Webkit(Safari, Chrome)          | 否               | 是                   | 是                   |
| Gecko(Firefox)                  | 否               | 是                   | 是                   |
| Trident(MSIE)                   |                  | 是                   | 是                   |

很好理解，在JS代码执行前，浏览器必须保证在JS之前的所有CSS样式都解析完成，否则前面的CSS样式可能会覆盖JS文件中定义的元素样式，这是CSS阻塞后续JS执行的根本原因。

样式表和行内脚本之间的相互影响明显不同于其他资源，这是由于浏览器需保持CSS和Javascript的解析顺序所致。

解决样式表阻塞行内脚本的问题，方案是调整行内脚本的位置，使其不出现在样式表和任何其他资源之间。**行内脚本应该放在样式表之前或者其他资源之后，如果其他资源是脚本，行内脚本和外部脚本之间可能会有代码依赖**。出于这个原因，通常建议把行内脚本放在样式表之前，即可避免所有的代码依赖问题。

#### CSS加载会阻塞DOM树的渲染，不会阻塞DOM树的解析，不会阻塞其他资源（如图片）的加载

当CSS还没加载出来的时候，页面显示的是白屏，直到CSS加载完成之后，才会显示出来。这是浏览器的一种优化机制。在加载CSS的时候，可能会修改下面DOM节点的样式，如果CSS加载不阻塞DOM树渲染的话，那么当CSS加载完之后，DOM树可能又得重新重绘或回流，造成不必要的损耗。

#### 为了避免让用户看到长时间的白屏，应该提高CSS加载速度，可以注意如下方法：

- 使用CDN(CDN会根据网络状况，挑选最近的一个具有缓存内容的节点提供资源，因此可以减少加载时间)
- 对CSS进行压缩
- 合理的使用缓存
- 减少http请求数，将多个CSS文件合并，或者直接写成内联样式（内联样式不能缓存）

其实，用原理来解析会更容易理解，上图

![webkit渲染过程](http://coracain.top/assets/webkit-render.jpg)

![webkit渲染过程](http://coracain.top/assets/gecko-render.jpg)

可以看出：

- DOM解析和CSS解析是两个并行的进程，所以CSS加载不会阻塞DOM的解析
- 由于Render Tree是依赖于DOM Tree和CSSOM Tree的，所以必须等待到CSSOM Tree构建完成，也就是CSS资源加载完成(或者CSS资源加载失败)后，才能开始渲染。因此，CSS加载是会阻塞DOM的渲染的
- 由于js可能会操作之前的DOM节点和CSS样式，因此浏览器会维持html中css和js的顺序。因此，样式表会在后面的js执行前先加载执行完毕。所以CSS会阻塞后面js的执行。

### 编写高效的Javascript

#### 管理作用域

当执行Javascript代码时，Javascript引擎会创建一个执行上下文(Execution Context)。

Javascript引擎会在页面加载后创建一个全局的执行上下文，然后每执行一个函数时都会创建一个对应的执行上下文，最终创建一个执行上下文的堆栈，当前起作用的执行上下文在堆栈的最顶部。

每个执行上下文都有一个与之关联的作用域链，用于解析标识符。全局执行上下文的作用域链中只有一个变量对象，它定义了Javascript中所有可用的全局变量和函数。当函数被创建(不是执行)时，Javscript引擎会把创建时执行上下文的作用域赋给函数的内部属性[[Scope]] （内部属性不能通过Javascript来存取，所以无法直接访问此属性）。然后，当函数被执行时，Javascript引擎会创建一个活动对象(Activation Object)，并在初始化时给this、arguments、命名参数和该函数的所有局部变量赋值。活动对象会出现在执行上下文作用域链的顶端，紧接其后的是函数[[Scope]]属性中的对象。

在执行代码时，Javascript引擎通过搜索执行上下文的作用域链来解析诸如变量和函数名这样的标识符。解析标识符的过程从作用域的顶部开始，按照自上而下的顺序进行。

例子：

```
function add(num1, num2) {
    return num1 + num2;
}
var result = add(5, 10);
```

当执行add函数时，Javascript引擎需要解析函数里的num1和num2标识符，解析的过程是检查作用域链中的每个对象，直到找到指定的标识符。查找从作用域链中的第一个对象开始，这个对象就是包含该函数局部变量的活动对象。如果在该对象中没有找到标识符，就会继续在作用域中的下一个对象里查找标识符。一旦找到标识符、查找就结束。

理解Javascript中如何管理作用域和作用域链很重要，在作用域链中要查找的对象个数直接影响标识符解析的性能。

#### 使用局部变量

局部变量是Javascript中读写最快的标识符。因为它们存在于执行函数的活动对象中，解析标识符只需查找作用域链中的单个对象。

**一个好的经验是任何非局部变量在函数中的使用超过一次时，都应该将其存储为局部变量。**

全局变量对象始终是作用域链中的最后一个对象，所以对全局标识符的解析总是最耗时的。

#### 增长作用域链

在代码执行过程中，执行上下文对应的作用域链通常保持不变。然而有两个语句会临时增长执行上下文的作用域链。**第一个是with语句**，用于将对象属性作为局部变量来显示，使其便于访问。例如：

```
var person = {
    name: 'Nicholas',
    age: 30
}
function displayInfo (){
    var count = 5;
    with (person) {
        alert(name + "is" + age);
        alert("Count is " + count);
    }
}
displayInfo();
```

实际上，with语句块是将一个新的变量对象添加到执行上下文作用域链的顶部。这个变量对象包含了指定对象的所有属性，所以这些属性可以不使用点符号访问。

**尽管with语句在反复使用同一个对象属性时看起来很方便，但在作用域链中增加的额外对象影响了对局部标识符的解析。当执行with语句中的代码时，函数中的局部变量将从作用域链的第一个对象变为第二个对象，自然而然会减慢标识符的存取。一旦with语句执行结束，作用域链将恢复到原来的状态。由于with语句存在这个主要的缺陷，建议避免使用。**

第二个增长作用域链的是**try-catch语句块中的catch从句**。执行catch从句类似于with语句，在作用域链的顶部增加了一个对象。**该对象包含了由catch指定命名的异常对象**。然而，由于catch从句仅在执行try从句发生错误时才执行，所以它比with语句的影响要小，但应该注意不要在catch从句中执行过多的代码，将性能影响减小到最低。

#### 高效的数据存取

数据在脚本中存储的位置直接影响脚本执行的总耗时。脚本中有4种地方可以存取数据：

- 字面量值
- 变量
- 数组元素
- 对象属性

在大多数浏览器中，从字面量中读取值和从局部变量中读取值的开销差异很小，但从数组或对象中读取数据差异大，存取这些数据结构中某个值，需要通过索引（数组）或属性值（对象）来查询数据存储的位置。

**始终将那些需要频繁存取的值存储到局部变量中**

#### 快速条件判断

- if语句

  提高if条件的整体性能。

  方法一将条件按频率降序排列。由于最快的运算在第一个条件语句后就退出，所以要确保这种情况尽可能多地出现。

  方法二是将条件拆分成几个分支，二分查找算法可以逐步找出有效的条件。

- switch语句

  简化了多重条件判断的结构，并提升了性能。

  在Javascript中，当仅判断一两个条件时，if语句通常比switch语句更快。当有两个以上条件且条件比较简单时，switch语句往往更快。

- 数组查询

  把已知的数字映射到指定的结果上，正是数组查询的工作方式。把所有的结果都存储在数组中，并用数组的索引映射value变量。

  使用数组查询的理想情况是有大量的条件存在，并且这些条件能用数字或字符串（对于字符串，可以使用对象而非数组来存储）这样的离散值来表示

综上，可以罗列出优化条件判断的场景

- 使用if语句的情况：
  - 两个之内的离散值需要判断
  - 大量的值能容易地分到不同的区间范围中
- 使用switch语句的情况:
  - 超过两个而少于10个离散值需要判断
  - 条件值是非线性的，无法分离出区间范围
- 使用数组查询的情况
  - 超过10个值需要判断
  - 条件对应的结果是单一值，而不是一系列操作

#### 快速循环

- 循环性能的简单提升

  for循环，do-while循环、while循环和for-in循环

  优化循环 优化点一使用局部变量来代替属性查找能加快循环的执行效率；优化点二**将循环变量递减到0，而不是递增到总长度**。根据每个循环的复杂性不同，这个简单的改变可以比原来节约**多达50%**的执行时间。

  **数组原生的indexOf方法，遍历数组成员的耗时可能会比使用普通的循环还长。**

- 避免for-in循环

  for-in循环通常比其他循环蛮，因为它需要从一个特定的对象中解析每个可枚举的属性。这意味着它为了提取这些属性需要检查对象的原型和整个原型链。

  如果明确知道要操作的所有属性名，用标准循环（for、do-while或while）对属性名进行遍历要快得多

  当然，在处理诸如JSON对象这样的为止属性集时，依然必须使用for-in循环

#### 字符串优化

- 字符串连接

  传统上，字符串连接一直Javascript中性能最低的操作之一。通常情况下，字符串连接是通过使用加法运算符(+)来完成的。**频繁地在后台创建和销毁字符串会导致字符串连接的性能异常低下**。

  可以利用Javascript的Array对象的join方法，连接数组中所有的元素并且在元素之间插入指定的字符串。

- 裁剪字符串

  Javascript中没有用于移除字符串头尾空白的原生修剪方法。自行封装trim函数实现

  ```
  function trim(text) {
      return text.replace(/^\s+|\s+$/g, "");
  }
  ```

  但是以上方法中存在性能问题-正则表达式。一方面是指名有两个匹配模式的管道运算符，另一方面是指名全局应用该模式的g标记。可以将正则表达式一分为二并去掉g标记来重写函数，以此来提高速度：

  ```
  function trim(text) {
      return text.replace(/^\s+/, "").replace(/\s+$/, "");
  }
  ```

  但最快的裁剪字符串方式，如下

  ```
  function trim(text) {
      text = text.replace(/^\s+/, "");
      for (var i = text.length - 1; i >= 0; i--) {
          if (/\S/.test(text.charAt(i))) {
              text = text.substring(0, i + 1);
              break;
          }
      }
      return text;
  }
  ```

#### 避免运行时间长的脚本

Javascript是单线程语言，所以在一个时间段中，每个窗口或标签页只能执行一个脚本。这意味着在Javascript代码执行时，所有用户的交互必然被中断。如果Javascript代码未经过细心的设计，有可能长时间地冻结页面，并最终导致浏览器停止响应。大多数浏览器会检测到长时间运行的脚本，并弹出中止脚本运行对话框询问用户是否允许脚本继续执行下去。

如果你看到中止脚本运行的对话框，这就表示Javascript代码需要进行重构。一般而言，脚本执行时间不应该超过100毫秒；任何超过这个时间的网页几乎肯定会让用户感觉运行速度过慢。

最常见的脚本执行时间过长的原因包括:

- 过多的DOM交互

  DOM操作比其他任何Javascript操作的开销都高。尽可能地减少DOM交互可显著减少Javascript的运行时间。**大多浏览器只会等待整个脚本执行完成后才更新DOM**，这样会让用户感觉页面响应缓慢。

- 过多的循环

  执行次数太多或每一次迭代中执行运算过多的循环都可能会导致脚本运行时间过长。

- 过多的递归

#### 使用定时器挂起

Javascript的单线程本质特性意味着任何时间段内只能执行一个脚本。因为在此期间不能处理用户的交互行为，所以有必要在长时间执行的Javascript代码中加入**中断**。最简单的方法是**使用定时器**。

创建定时器就是向setTimeout函数传递需要执行的函数及延迟执行该函数的时间（以毫秒为单位）。传入延迟时间后，执行代码被放置到一个**队列**中。当一个脚本执行完成时，Javascript引擎挂起以便浏览器执行其他任务。一旦页面更新完按成，Javascript引擎就检查队列中轮到哪个脚本去运行。如果有脚本正在等待，则执行它然后重复这个过程；如果没有脚本执行，Javascript引擎将保持空闲直到另有脚本进入队列中。

**当创建一个定时器时，实际上是把某些代码排到Javascript引擎队列中稍后执行。**在调用setTimeout时，插入的代码会在等待指定的时间后执行。从本质上讲，定时器是把代码执行的时间推迟到将来，那时终止脚本运行的限制已经被重置了。

因此，每当脚本需要花太长时间来完成执行的时候，就让部分延迟执行。

**注意过小的延迟也会引起浏览器不响应。不建议使用0毫秒的延迟，因为所有的浏览器都无法在这么短的时间里正确地更新页面显示。一般而言，延迟50-100毫秒是合适的，这足够让浏览器有时间执行必要的页面更新。**

#### 用于挂起的定时器模式

处理数组是因为脚本长时间运行的常见原因之一。

用定时器拆分处理数组的函数：

```
// 函数接受三个参数：
// 第一个是需要处理的数组，第二个是用来处理每个数组元素的函数，最后一个是可选的用来设置处理函数执行时的上下文
// 处理元素用到了定时器，所以在每个元素处理后代码会被挂起
// 处理的下个元素始终在数组的顶部，并且在处理前移出数组。接着检查是否还有元素要处理。
// chunk函数把传入的数组作为“将要处理”的元素项列表，执行过程中数组将被改变。
function chunk (array, process, context) {
    setTimeout(function () {
       	var item = array.shift();
       	process.call(context, item);
       	
       	if (array.length > 0) {
			setTimeout(arguments.callee, 100);
		}
    }, 100);
}

// 通过以下函数调用
var names = ['xl', 'cora', 'james', 'cain'], todo = names.concat();
chunk(todo, function(item) {
    console.log(item);
});
```

用定时器执行较大型运算中小而有序的部分。

如何通过一个有效的算法（冒泡排序）来对大型数据集进行排序，避免脚本长时间运行的问题

```
// 函数拆分了array排序时的每次遍历，让浏览器在对数组处理的过程中还能做些其他事情。
function sort(array, onComplete) {
    var pos = 0;
    (function () {
		var j, value;
		for (j = value.length; j > pos; j--) {
            if (array[j] < array[j - 1]) {
                value = data[j];
                data[j] = data[j - 1];
                data[j - 1] = value;
            }
		}
		pos++;
		if (pos < array.length) {
            setTimeout(arguments.callee, 10);
		} else {
            onComplete();
		}
	})();
}
```

### 可伸缩的Comet

Comet是通用术语，描述技术、协议和为浏览器提供可行且可扩展的低延迟数据传输实现的集合。

Comet的目标包括随时从服务端向客户端推送数据、提升传统Ajax的速度和可扩展性，以及开发事件驱动的Web应用。

#### Comet工作原理

通过更智能的**长连接管理**和**减少每个连接占用的服务端资源**，Comet比传统Web服务更易于**提供更多的同步连接**，客户端与服务端之间的数据传输更快。

每个连接使用一个线程是有问题的，所以大部分Comet服务器或明显减少每个线程的资源开销，或者使用微线程或进程。

在客户端，常用的技术包括轮询、长轮询、永久帧(forever frame/iframe)、XHR流和WebSocket。

#### 传输技术

- 轮询

  由于每台服务器允许的最大并发连接数有限制，所以在很多浏览器中连接很容易发生阻塞或死锁。最简单的方式是简单轮询，即网站或应用每x毫秒发出一个请求来检查是否有更新需要呈现到用户界面上。

  ```
  setTimeout(function() {xhrRequest({"foo": "bar"})}, 2000);
  
  function xhrRequest(data) {
      var xhr = new XMLHttpRequest();
      // 在发送请求的时候，处理的数据通过参数进行传递
      xhr.open("get", "http://localhost/foo.php", true);
      xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
              // 处理服务器返回的更新
          }
      };
      xhr.send(null);
  }
  ```

  简单轮询是效率最低但最简单的Comet技术

- 长轮询

  该方法中浏览器发送一个请求到服务端，而服务端只在有可用的新数据时才响应。要支持长轮询，服务端要完全保持一个所有未响应请求和它们对应连接的大集合。服务端通过返回Transfer-Encoding: chunked或Connection: close响应来保持这些请求连接。当某个客户端或某组客户端的数据准备好时，服务端确认那些连接并给浏览器返回一个包含有效负载的响应。浏览器立即返回一个请求给服务器。如果连接断开，客户端将尝试重建和服务端之间的连接。

  例子

  ```
  function longPoll(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
              // 发送另一个请求，重新连接服务端
              callback(xhr.responseText);
              xhr.open('GET', url, true);
              xhr.send(null);
          }
      }
      // 连接到服务端以打开一个请求
      xhr.open('POST', url, true);
      xhr.send(null);
  }
  ```

- 永久帧

  该方法打开一个隐藏的iframe，请求一个基于HTTP1.1块编码的文档。块编码是为增量读取超大型文档而设计的，所以可以把它看做一个不断增加内容的文档。

  例子

  ```
  function foreverFrame(url, callback) {
      var iframe = body.appendChild(document.createElement("iframe"));
      iframe.style.display = "none";
      iframe.src = url + "?callback=parent.foreverFrame.callback";
      this.callback = callback;
  }
  
  // 服务端会发送一系列信息到iframe中
  <script>
  	parent.foreverFrame.callback("the first message");
  </script>
  <script>
  	parent.foreverFrame.callback("the second message");
  </script>
  ```

客户端Comet的性能优化目的是：

- 减少数据传输的延迟
- HTTP连接的保存和管理
- 远程消息和处理跨域问题

服务器端的性能优化目的是：

- 保存和共享HTTP的连接数
- 尽量减少每个连接所消耗的内存、CPU、I/O和带宽

### 超越Gzip压缩

Gzip虽然压缩代码加快了网络传输，但是并不能保证所有用户都能支持Gzip。最关键的还是要发送更小的响应，使页面加载速度更快。

介绍几种通用的技术减小页面未经压缩的大小，同时不会增加压缩后的大小。

- 使用事件委托

- 使用相对URL
- 移除空白
- 移除属性的引号
- 避免行内样式
- 为Javascript变量设置别名

### 图像优化

图像格式：JPEG（Joint Photographic Experts Group，图像专家小组）、PNG和GIF（Graphics Interchange Format，图形交换格式）

GIF通常用于显示图形（网站的Logo、草图、图表、大部分动画和图标），JPEG更适合显示照片，PNG两者都适合。

GIF：透明、动画、无损、逐行扫描、隔行扫描

JPEG：有损、不支持透明和动画、隔行扫描

PNG：透明、无损、逐行扫描、隔行扫描

### 划分主域

由于长连接的原因，HTTP/1.1建议每个服务端提供少量的连接数，默认情况下，HTTP/1.0在每次响应后会关闭TCP连接，为每次请求建立一个新的TCP链接会消耗时间。为了降低这种开销，HTTP/1.1使用了长连接，并且使用单个连接来完成多个请求和响应。长连接通常保持长时间打开着，从而导致拥有一定数量可用连接的服务端负载提高，因此，HTTP/1.1中建议每个服务端的连接数减少到2个。

HTTP/1.0的Keep-Alive和HTTP/1.1的长连接的差异比较：

- 长连接在HTTP/1.1中是默认的。一旦HTTP版本指定为“HTTP/1.1”，就无需额外的头信息来声明支持长连接。但Keep-Alive在HTTP/1.0中不是默认的，客户端和服务端必须同时发送Connection: Keep-Alive头信息
- 在通过代理使用HTTP/1.0的Keep-Alive时，连接存在一些风险。代理不能理解Connection: Keep-Alive头信息，会不加区分地把它转向服务端。这可能导致代理创建一个挂起的连接并等待原始服务器来关闭。而原始服务器不会关闭连接，因为它创建的是一个Keep-Alive连接。因此，客户端必须确保在与代理会话时不发送Connection: Keep-Alive，实际上所有主流浏览器都是这样做的
- HTTP/1.0 Keep-Alive响应必须使用Content-Length头信息来标识单个连接中不同响应之间的结束分界点。
- HTTP/1.1中引入了块传输编码。但在HTTP/1.0中不能使用。块编码支持服务端成块回传数据

服务端连接数

| 浏览器       | HTTP/1.1 | HTTP/1.0 |
| ------------ | -------- | -------- |
| IE6/7        | 2        | 4        |
| IE8          | 6        | 6        |
| IE9          | 10       | 10       |
| IE10         | 6        | 6        |
| IE11         | 6        | 6        |
| Firefox 2    | 2        | 8        |
| Firefox 3+   | 6        | 6        |
| Chrome 1,2   | 6        | 6        |
| chrome 4+    | 6        | 6        |
| Safari 3,4   | 4        | 4        |
| Opera 9,10   | 4        | 4        |
| Opera 10.51+ | 8        | ？       |

域划分会有几个典型的操作问题

- IP地址和主机名

  **浏览器执行“每个服务端最大连接数”的限制是根据URL上的主机名，而不是解析出来的IP地址**

  浏览器把每个主机名看做一个单独的服务端，因此为每个主机名打开最大连接数，即使这两个主机名解析出来为相同的IP地址。如：stevesouders.com和www.stevesouders.com。虽然IP相同，但是会并行下载。

  因此，对于想把内容分配到多个域，不必额外部署服务器，而是为新域建立一条CNAME记录。CNAME仅仅是域名的一个别名。即使域名都指向同一个服务器，浏览器依旧会为每个主机名开放最大连接数。

- 多少个域

  最终数量取决于资源的大小和数量，但划分为两个域是很好的经验

- 如何划分资源

  有两种划分方式：1是使用哈希函数把资源的文件名转换为一个整数，根据这个整数来选择域。2是按照资源的类型来选择域，如**将样式表和脚本划分在域一，将图片划分在域二**

### 尽早刷新文档的输出

HTML文档的生成过程：当服务端解析页面的时候，所有的输出都被写入STDOUT。每次写入一个字符、一个单词或一行文字，服务器不会立即将它们输出，而是把所有输出内容排到一个队列中，然后再以较大的数据块发送到浏览器。这样做更加有效，因为它会使从服务器发送到浏览器的数据包数量更少。**由于发送数据包会引起网络延迟，所以通常发送少量大数据包的效果要比发送大量小数据包好。**

#### 块编码

HTTP/1.0的响应式作为一整块数据返回的，大小是由Content-Length头来发送的。浏览器需要知道数据大小，这样才能确定响应的结束时间。**因为HTML文档是作为一个整块发送的，所以浏览器在响应结束之前，不会开始渲染页面和下载资源。**

HTTP/1.1引入了**Transfer-Encoding: chunked**响应头。通过块编码，HTML文档可以被分成多个数据块返回，每个响应的数据块都以标识其大小的指示符为开头。这就**允许浏览器在下载数据包后马上进行解析**，使得页面的加载速度更快。

如果不使用块编码，响应必须包含一个Content-Length的头信息。**这就意味着服务器在将整个响应组合在一起，并计算出大小之前，不会开始发送响应信息**。通过块编码，服务器可以尽早发送响应，因为它只需要知道每个发送块的大小即可。

通常情况下，响应头必须在响应的最开始发送，这就意味着服务器在这些耗费时间的数据库查询或Web服务调用结束之前，是无法开始发送响应的。然而，当使用块编码后这些头就可以被延后发送。最开始的块会被立刻发送，在这个块中通过Trailer头来列举出那些将会延迟发送的头：

```
Trailer: Cookie
Trailer: Etag
```

通过这种方式，Cookie和Etag头可以被包含在HTML响应的尾部发送过来。

#### 刷新输出和Gzip压缩

当Apache启用了压缩功能时，它的缓冲输出（flush）机制将会阻止刷新。Apache 2.x使用mod_deflate来进行压缩。这个模块的缓冲默认设置为8096字节，使用DeflateBufferSize指令来减小这个缓冲的大小。还可以通过向HTML文档填充超过8K的内容（在压缩以后）来实现刷新输出。

例子：

[Flush no Gzip Padding](http://stevesouders.com/efws/flush-gzip-no-padding.php)

[Flush Gzip Padding](http://stevesouders.com/efws/flush-gzip-padding.php)

### 少用iframe

使用iframe的好处是他们的文档完全独立于其父文档。iframe中的相对URL是相对于其基准URI，而非其父文档的URI。iframe中包含的Javascript访问其父文档是受限的。如来自不同域的iframe不能访问其父文档的Cookie。但是iframe性能较低。

- 创建iframe的开销比创建其他类型的DOM元素要高1-2个数量级。

- 在典型方式下使用iframe时，会阻塞父窗口的onload事件。

  这个阻塞行为有一个简单的解决方案。但**仅在Safari和Chrome中有**效。使用Javascript动态地设置iframe的URL而不是使用HTML的src属性。

  ```
  <iframe id=iframe1 src=""></iframe>
  <script type="text/javascript">
  	document.getElementById('iframe1').src = "url";
  </script>
  ```

- **通常情况下，iframe和主页面中的资源是并行下载的，但是在某些情况下，主页面会阻塞iframe中资源的下载。**

  - 脚本位于iframe之前

    主页面的外部脚本采用典型方式（<script src="url"></script>）加载会阻塞后面的所有资源。因此，如果iframe及其资源之前有外部的脚本，他们的下载会被阻塞。

  - 样式表位于iframe之前

    样式表不阻塞其他资源。除了IE和Firefox中，样式表阻塞了和iframe相关的请求。IE中，iframe请求是被阻塞的。在Firefox中，样式表和iframe是并发加载的，但样式表阻塞了iframe中的资源。

  - 样式表位于iframe之后

    把样式表移动到iframe之后或许能避免阻塞行为。但是在Firefox中不会。

- 使用iframe不会增加指定主机名的并行下载数量，所有主流浏览器都是这样的情况。

- 跨标签页和窗口的连接共享中，如果把多个属性部署在单个域名的主机上时，用户同时打开多个Web应用，将在性能上带来负面影响。连接资源会发生抢夺。

### 简化CSS选择符

CSS选择符对性能的影响源于浏览器匹配选择符合文档元素时所消耗的时间。

CSS选择符是从右到左进行匹配的。

```
#toc A { color: #666; }
```

对于以上的例子，实际上浏览器检查了整个文档中的每个链接。它和子选择符相比，如下

```
#toc>A { color: #666; }
```

不仅检查每个链接的父元素，还要遍历文档树去查找id为toc的祖先元素。如果被评估的链接不是toc的后代，那么浏览器就要向上一级遍历直到文档的根节点。

#### 编写高效的CSS选择符

- 避免使用通配规则

  除了传统意义上的通配选择符之外，相邻兄弟选择符、子选择符、后代选择符合属性选择符都归纳于“通配规则”下，只推荐使用ID、类和标签选择符

- 不要限定ID选择符

  在页面中一个指定的ID只能对应一个元素，没有必要添加额外的限定符。如DIV#toc没有必要，直接简化为#toc

- 不要限定类选择符

  不要用具体的标签限定类选择符，而是对类名进行扩展。如LI.chapter改成.li-chapter更好些

- 让规则越具体越好

  不要试图编写像OL LI A这样的长选择符，最好是创建一个像.list-anchor一样的类

- 避免使用后代选择符

  通常处理后代选择符的开销是最高的

- 避免使用标签-子选择符

- 质疑子选择符的所有用途

  尽量有具体的类取代子选择符

- 依靠继承

  了解哪些属性可以通过继承得到，避免对这些属性重复指定规则

## Web性能权威指南

