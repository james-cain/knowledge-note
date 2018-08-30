# 性能优化

##网站及性能优化点

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

