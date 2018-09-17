# google devtools

## Pause Your Code With BreakPoints

### XHR/Fetch breakpoints

操作步骤：Sources -> XHR Breakpoints -> Add breakpoint -> 输入需要断点的请求URL字符串(string) -> confirm

之后凡是有string的URL都会被断点

###Event listener breakpoints

可以选择明确的事件例如click，或者事件的分类，如所有的鼠标事件

操作步骤：sources -> Event Listener Breakpoints -> 勾选需要中断的分类，或扩展分类勾选指定的事件。

### Exception breakpoints

中断 能捕获或者未捕获的异常的代码段

操作步骤：sources -> Pause on exceptions -> Pause On Caught Exceptions

###Function breakpoints

代码中断点调试方式-`debug(functionName)`，也可以直接在devtools中在所在行断点

需要注意，目标函数所在的作用域

```
(function () {
    function hey() {
        console.log('hey');
    }
    function yo() {
        console.log('yo');
    }
    debug(yo); // 可以运行
    yo();
})();
debug(hey); // 不可运行
```

## Map Preprocessed Code to Source Code

(将预处理代码映射到源代码)

使用Source Maps 将缩减的代码映射到源代码。

Source Maps默认处于启用状态（Chrome 39开始）

## Debug Javascript

在代码中植入console.log()的方式是**错误**的。应该用devtools的debugging工具。

## Create，save，and run Snippets

操作步骤：Sources -> Snippets -> add

追加js代码段，devtools会将代码段保存在文件中。当需要执行时，右击Snippets名 -> run。就可以随时执行需要的代码。

### 创建代码段

要创建代码段，Sources > Snippets > 点击右键 > New

### 运行代码段

可以在控制台中评估部分代码段，选中需要评估的部分，右键点击选择Evaluate in Console，就会执行部分代码段

## 分析运行时性能

### 使用RAIL模型评估性能

**RAIL**是一种以用户为中心的性能模型。每个网络应用均具有与生命周期有关的四个不同方面，且这些方面以不同的方式影响着性能：

- Response
- Animation
- Idle
- Load

性能评估标准

- 以用户为中心：最终目标不是让网站在任何特定设备上都能运行很快，而是使用户满意
- 立即响应用户：在100毫秒以内确认用户输入
- 设置动画或滚动时，在10毫秒以内生成帧
- 最大程度增加主线程的空闲时间
- 持续吸引用户，在1000毫秒以内呈现交互内容

关键RAIL指标汇总

可以使用 Chrome Devtools Timeline工具记录用户操作

| RAIL步骤 | 关键指标                                     | 用户操作                                                     |
| -------- | -------------------------------------------- | ------------------------------------------------------------ |
| 响应     | 输入延迟时间（从点按到绘制）小于100毫秒      | 用户点按按钮（例如打开导航）                                 |
| 动画     | 每个帧的工作（从JS到绘制）完成时间小于16毫秒 | 用户滚动页面，拖动手指（例如，打开菜单）或看到动画。拖动时，应用的响应与手指位置有关（例如，拉动刷新、滑动轮播）。此指标仅适用于拖动的持续阶段，不使用于开始阶段 |
| 空闲     | 主线程JS工作分成不大于50毫秒的块             | 用户没有与页面交互，但主线程应足够用于处理下一个用户输入     |
| 加载     | 页面可以在1000毫秒内就绪                     | 用户加载页面并看到关键路径内容                               |

接下来介绍Performance Panel的使用

https://googlechrome.github.io/devtools-samples/jank/  用无痕模式打开此链接，打开控制台

### 分析结果

#### Analyse frames per second(FPS)

测量动画的性能的主要依据是frames per second(FPS)。只有当动画运行在60FPS情况下用户才会觉得正常。

1. 观察FPS柱状图。可以看出，每帧会显示为一段柱状，且每帧耗时越长，高度越低。

   ![fps1](http://reyshieh.com/assets/fps1.jpg)

2. 观察CPU图。其中CPU图的颜色和Summary中的颜色是一致的，当CPU饼图已经被除了白色填充蛮时，代表CPU已经达到了最大值。长时间达到最大值，会导致CPU只能做更少的工作。

   ![fps2](http://reyshieh.com/assets/fps2.jpg)

3. 将鼠标移到FPS、CPU或者NET图上时，会显示在这一时刻网页的屏幕快照。可以从左到右移动鼠标来重新播放记录。这种方式有利于人工分析动画的进程。

4. 在**Frames**中，移动鼠标到绿色区域中。devTools会展示出每帧的FPS，每一帧可能都小于规定的60FPS（即16ms）。

   ![fps2](http://reyshieh.com/assets/fps3.jpg)

   当然，在这个例子中，这个网页很明显在执行上是不好的。但是在实际上，也并没有那么明显，因此使用工具做测量带来了很大的便利。

5. **Open the FPS meter**，当运行网页时，该工具为FPS提供了实时评估。

   1). 打开命令行菜单 Command+Shift+P(mac)和Control+Shift+P(Windows, Linux)

   2). 输入**Rendering**，选择**Show Rendering**

   3). 在**Rendering tab**中，勾选**FPS Meter**，会在视口右上角出现一个实时分析图

   ![fps4](http://reyshieh.com/assets/fps4.jpg)

6. 关注Summary tab

   - 网页花了大部分的时间在渲染上。因为性能是减少工作的艺术，所以目标是减少花在渲染工作上的时间

   - 详述Main。Main展现的是主线程的所有活动的火焰图。x轴代表随着时间变化的记录，每一个条形图代表一个事件，长度代表耗时时长。y轴代表回调栈。上面的事件会调起下面的事件。

     ![fps5](http://reyshieh.com/assets/fps5.jpg)

   - 需要注意如果在Animation Frame Fired 事件的右上角有一个红色三角，代表该事件发生了错误警告

7. Network视图

   ![network](http://reyshieh.com/assets/network.jpg)

   Requests遵循以下颜色分类:

   - HTML: 蓝色，请求左上角如果有一个深蓝的正方形，代表是高优先级的请求，天蓝色的正方形，代表低优先的请求
   - CSS: 紫色
   - JS: 黄色
   - Images: 绿色

   一条请求由三部分组成：左边一条线，中间一根条形(包括深色部分和浅色部分)，右边一条线

   左边线表示请求发送前的所有事情

   中间浅色部分表示请求发送+等待(TTFB)

   中间深色部分表示内容下载

   右边线表示等待主线程经过时间，但是不在Timing tab中

   ![network2](http://reyshieh.com/assets/network2.jpg)

   ![network3](http://reyshieh.com/assets/network3.jpg)

### 分析运行时性能小结

- 不要编写会强制浏览器重新计算布局的Javascript。将读取和写入功能分开，并首先执行读取

  Javascript计算，特别是**会触发大量视觉变化的计算会降低应用性能**。不要让时机不当或长时间运行的Javascript影响用户交互

- 不要让CSS过于复杂。减少使用CSS并保持CSS选择器简洁

  [缩小样式计算的范围并降低其复杂性](https://developers.google.com/web/fundamentals/performance/rendering/reduce-the-scope-and-complexity-of-style-calculations)

  在进行Timeline记录时，检查大型**Recalculate Style**事件的记录（以紫色显示）。点击Recalculate Style事件可以在Details窗格中查看更多相关信息。**如果样式更改需要较长时间**，对性能的影响会非常大。**如果样式计算会影响大量元素**，也需要改进。

  ![fps6](http://reyshieh.com/assets/fps6.jpg)

  降低Recalculate Style事件的影响，可以执行以下操作：

  - 使用[CSS触发器](https://csstriggers.com/)了解哪些CSS属性会触发布局、绘制与合成。这些属性对渲染性能的影响最大
  - 转换使用影响较小的属性。[坚持仅合成器属性和管理层计数](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count)

- 尽可能地避免布局。选择根本不会触发布局的CSS

  - [避免布局抖动](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing)
  - [诊断强制同步布局](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/forced-synchronous-layouts)

  布局抖动是指反复出现强制同步布局情况。会在Javascript从DOM反复地写入和读取时出现，将会强制浏览器反复重新计算布局。

- 绘制比任何其他渲染活动花费的时间都要多

  绘制是填充像素的过程，经常是渲染流程中开销最大的部分。坚持使用合成器属性并避免一起绘制，会极大的改进性能。

## 分析网络性能

打开分析网页https://googlechrome.github.io/devtools-samples/network/gs/v1.html

优化点：

- 移动脚本到body元素的后面，标记async阻止同步加载

- 将logo改成svg减小体积

优化后网页https://googlechrome.github.io/devtools-samples/network/gs/v2.html

### Queued or stalled requests

#### 导致原因可能包括

太多的请求放在单个域名中。在HTTP1.0/1.1连接中，chrome浏览器允许每个域名下的TCP链接并行最大下载数为6个

#### 解决方式

- 在HTTP1.0/HTTP1.1，实现域名分片
- 在HTTP2.0，不要使用域名分片
- 移除或者defer不必要的请求，让必要的请求更快下载

### Slow Time To First Byte(TTFB)

一个请求要花很长的时间等待接受从服务器发送出来的第一个字节。

在waterfall中用绿色bar表示等待请求的时间长度

#### 导致原因可能包括

- 在客户端和服务器之间的链接很慢
- 服务器响应速度慢。可以通过在服务器本地请求，以确定是连接慢还是服务器本身慢。如果本地服务器还是得到slow TTFB，说明是服务慢。

#### 解决方式

- 如果是连接慢，可以将内容放在CDN或者改变主机服务商
- 如果是服务慢，应当优化数据查询，实现数据缓存，或者修改服务配置

### Slow content download

在waterfall中用蓝色bar表示下载时长

#### 导致原因可能包括

- 在客户端和服务器之间的链接很慢
- 有大量的内容要下载

#### 解决方式

- 可以将内容放在CDN或者改变主机服务商
- 优化请求使发送的字节数减小

### Network Panel

#### Filter requests

![network-filter](http://reyshieh.com/assets/network-filter.jpg)

可以通过以空格分格每个属性，同时使用多个属性。例如：mime-type: image/gif larger-than: 1K。多个属性还可以用AND操作符，OR操作符还不支持。

支持的属性包括以下几类：

- domain 只展示来自特殊域名的资源。可以利用通配符(*)来包括多个域名。
- has-response-header 展示包括特殊HTTP响应头的资源
- is 用is: running查询WebSocket资源
- larger-than 展示资源大小大于指定体积的资源
- method 展示指定HTTP method type的资源
- mime-type 展示特殊MIME type的资源
- mixed-content 展示所有mixed content资源(mixed-content: all) 或(mixed-content:displayed)
- scheme 展示http资源(scheme: http)或https资源(scheme: https)
- set-cookie-domain 展示有匹配特殊值的Domain属性`Set-cookie`头部的资源
- set-cookie-name 展示有匹配特殊性的name属性`Set-cookie`头部的资源
- set-cookie-value 展示有匹配特殊性的value属性`Set-cookie`头部的资源
- status-code 展示匹配了指定HTTP status code的资源

#### view initiators and dependencies

可以通过点击`Shift`，将鼠标移至request上。devtools 发起资源为绿色，依赖资源为红色

![network-hover-1](http://reyshieh.com/assets/network-hover-1.jpg)

![network-hover-2](http://reyshieh.com/assets/network-hover-2.jpg)

## 分析内存问题

影响页面性能的内存问题，包括**内存泄漏、内存膨胀和频繁的垃圾回收**

Chrome工具：

- 用任务管理器了解页面当前正在使用的内存使用
- 使用Timeline记录可视化一段时间内的内存使用
- 使用堆快照确定已分离的DOM数的内存泄漏(内存泄漏的常见原因)
- 使用分配时间线记录了解新内存在JS堆中的分配时间

用户可通过以下方式察觉内存问题：

- 页面的性能随着时间的延长越来越差。这可能是**内存泄漏**的原因。内存泄漏是指页面中的错误导致页面随着时间的延长使用的内存越来越多。当程序持续无法释放其使用的临时内存时就会发生
- 页面的性能一直很糟糕。这可能是**内存膨胀**的原因。内存膨胀是指页面为达到最佳速度而使用的内存比本应使用功能的内存多。内存膨胀不存在硬性数字，不同设备和浏览器具有不同的能力。在高端智能手机上流畅运行的相同页面在低端智能手机上则可能崩溃
- 页面出现延迟或者经常暂停。这可能是**频繁垃圾回收**的原因。垃圾回收是指浏览器收回内存。浏览器决定何时进行垃圾回收。回收期间，所有脚本执行都将暂停。所以，如果浏览器经常进行垃圾回收，脚本执行就会被频繁暂停

### 内存分析常用术语

#### 对象大小

将内存视为具有原语类型（如数字和字符串）和对象（关联数组）的图表。可以将内存表示为一个由多个互连的点组成的图表。

![memory101-1](http://reyshieh.com/assets/memory101-1.jpg)

对象可以通过以下两种方式占用内存：

- 直接通过对象自身占用
- 通过保持对其他对象的引用隐式占用，这种方式可以**阻止这些对象被垃圾回收器（GC）自动处置**

当使用Devtools中的堆分析仪（在Memory面板下）时，有两项是：**直接占用内存**（Shallow Size）和**占用总内存**（Retained Size）

![profile2](http://reyshieh.com/assets/profile2.jpg)

##### 浅层大小（Shallow Size，直接占用内存，**不包括引用的对象占用的内存**）

对象自身占用内存的大小

通常，只有**数组和字符串**会有明显的浅层大小。不过，**字符串和外部数组的主存储一般位于渲染器内存中，仅将一个小包装器对象置于Javascript堆上**

**渲染器内存是渲染检查页面的进程的内存总和：原生内存+页面的JS堆内存+页面启动的所有专用工作线程的JS堆内存。**尽管如此，即使一个小对象也可能通过阻止其他对象被自动垃圾回收进程处理的方式间接地占用大量内存

##### 保留大小（Retained Size，占用总内存，**包括引用的对象所占用的内存**）

一个对象一旦删除后，它引用的依赖对象就不能被GC根引用，它们所占用的内存就会被释放，一个对象占用总内存包括这些依赖对象所占用的内存

将对象本身连同其无法从**GC根**到达的相关对象一起删除后释放的内存大小

**GC根**由句柄（handles，控制器）组成，这些句柄（控制器）（不论是局部还是全局）是在建立由build-in函数（native code）到V8外部的Javascript对象的引用时创建。所有此类句柄（控制器）都可以在**GC roots（GC根）>Handle scope（句柄作用域）**和**GC根>Global scope（全局句柄）**下的堆快照内找到。

存在很多内部的GC根，从应用角度来看，存在以下种类的根：

- Window全局对象(位于每个iframe中)。堆快照中有一个distance(距离)字段，表示从window对象到达对应对象的最短保留路径长度
- 文档DOM树，由可以通过遍历文档到达的所有原生DOM节点组成。并不是所有的节点都有JS包装器（引用），不过，如果有包装器（引用）的节点在document存在的情况下都会被保留
- 有很多对象可能是在调试代码时或者Devtools console中创建出来的

注意：在创建堆快照时，不要在console中执行代码，也不要启用调试断点

内存图从根开始，根可以是浏览器的`window`对象或`Node.js`模块的`Global`对象。这些对象如何被内存回收不受用户的控制

![memory101-2](http://reyshieh.com/assets/memory101-2.jpg)

任何无法从根到达的对象都会被GC回收（不会被GC根遍历到的对象都将被内存回收）

> 浅层大小和保留大小列均以字节为单位表示数据

#### 对象保留树（对象的占用总内存树）

堆是一个由互连的对象组成的网络。在数字领域，这些结构被称为图或内存图。图表由通过边缘（edges）连接的节点（Nodes）组成，两者都是给定标签

- 节点（Nodes）（或对象）使用构造函数（用于构建节点）的名称进行标记
- 边缘使用属性的名称进行标记

![profile3](http://reyshieh.com/assets/profile3.jpg)

截图快照中，能看到距离（distance）字段：是指对象到GC根的距离。如果用一个类型的所有对象的距离都一样，而有一小部分的距离比较大，那么可能存在问题，需要检查。

#### 支配对象（Dominators）

支配对象就想一个树结构，因为每个对象都有一个支配者。一个对象的支配者可能不会直接引用它支配的对象；也就是说，支配对象树结构不是图中的生成树

下图中，节点#3是节点#10的支配者，但#7也在每个从GC到#10的路径中出现。如果B对象在每个从根节点到A对象的路径中都出现，那么B对象就是A对象的支配对象

![dominator](http://reyshieh.com/assets/dominator.jpg)

#### V8详细信息

Javascript对象表示

存在三种原语类型：

- 数字（如3.14159...）
- 布尔值（true或false）
- 字符串

**它们无法引用其他值，并且始终是叶或终止节点**

数字可以存储为：

- 中间31位整型值（称为小整型（SMI））
- 堆对象，作为堆数字引用。堆数字用于存储不适合SMI格式的值，如双精度数（doubles），或者在需要将值“包装”起来时使用

字符串可以存储为：

- VM堆中
- 渲染器内存中（外部）。将创建一个包装器对象（引用）并用于访问外部存储空间

新创建的Javascript对象会被在Javascript堆（或VM堆）分配内存。这些对象由V8垃圾回收器管理，只要还有一个强引用就在内存中保留

**原生对象（本地对象）**是Javascript堆之外的任何对象。与堆对象相反，**原生对象在生命周期内不由V8垃圾回收器管理，并且只能使用其Javascript包装器对象从Javascript访问**

**Cons字符串（连接字符串）**是一种由存储并联接的成对字符串组成的对象，是串联的结果。Cons字符串内容仅根据需要进行联接。如：如果连接a和b，得到字符串（a,b）这用来表示连接的结果。如果之后要再把这个结果与d连接，就得到了另一个连接字符串((a, b), d)

**数组（Array）**是数字类型键的对象。像字典这种有键-值对的对象就是用数组实现的

典型的Javascript对象可以是两个数组类型之一，用于存储：

- 命名属性
- 数字元素

如果只有少量的睡醒，他们会被直接存储在Javscript对象本身中

**映射（Map）** 用于说明对象类型和它的结构的对象

#### 对象组

每个原生对象（本地对象）都由一组之间相互关联的对象组成。比如一个DOM子树，每个节点都能访问到它的父元素，下一个子元素和下一个兄弟元素，构成了一个关联图。原生对象不会在Javascript堆中表示，这正是它们的大小为什么为零的原因

每个包装器对象都会保持对相应原生对象的引用，用来传递对这些本地对象的操作。这样本地对象也有到包装对象的引用。GC可以释放包装器对象不再被引用的对象组。但是，忘记释放单个包装器将保持整个组和关联的包装器。

### 用任务管理器了解页面当前正在使用的内存使用

![memory](http://reyshieh.com/assets/memory.jpg)

- 内存占用列 表示原生内存。DOM节点存储在原生内存中。如果此值正在增大，则说明正在创建DOM节点
- Javascript使用的内存列 表示JS堆。此列包含两个值。括号中的数字表示实时数字，实时数字表示页面上的可到达对象正在使用的内存量。如果此数字在增大，要么是正在创建新对象，要么是现有对象正在增长

### 使用Timeline记录可视化一段时间内的内存使用

在Performance panel中，勾上Memory，即可看到内存使用情况

![memory2](http://reyshieh.com/assets/memory2.jpg)

要显示内存记录，可以使用下面的代码

```
var x = [];

function grow() {
  for (var i = 0; i < 10000; i++) {
    document.body.appendChild(document.createElement('div'));
  }
  x.push(new Array(1000000).join('x'));
}

document.getElementById('grow').addEventListener('click', grow);

```

每次按代码中引用的按钮时，将向文档正文附加1万个`div`节点，并将一个由100万个`x`字符组成的字符串推送到`x`数组中。运行此代码会生成一个类似于以下Timeline记录：

![memory3](http://reyshieh.com/assets/memory3.jpg)

Overview窗格中的HEAP图表(NET下方)表示JS堆。Overview窗格下方是计数器窗格。内存使用按JS堆、文档、DOM节点、侦听器和GPU内存细分。

节点计数以离散步长方式增大。 假定节点计数的每次增大都是对 `grow()` 的一次调用。 JS 堆图表（蓝色图表）的显示并不直接。为了符合最佳做法，第一次下降实际上是一次强制垃圾回收（通过按 **Collect garbage** 按钮实现）。随着记录的进行，会看到 JS 堆大小高低交错变化。每次点击按钮，JavaScript 代码都会创建 DOM 节点，在创建由 100 万个字符组成的字符串期间，代码会完成大量工作。这里的关键是，JS 堆在结束时会比开始时大（这里“开始”是指强制垃圾回收后的时间点）。**在实际使用过程中，如果看到这种 JS 堆大小或节点大小不断增大的模式，则可能存在内存泄漏。**

### 使用堆快照确定已分离的DOM数的内存泄漏

只有页面的DOM树或Javascript代码不再引用DOM节点时，DOM节点才会被作为垃圾进行回收。如果某个节点已从DOM树移除，但某些Javascript仍然引用它，称节点为“已分离”。**已分离的DOM节点时内存泄漏的常见原因**。

已分离DOM节点的示例

```
var detachedNodes;

function create() {
  var ul = document.createElement('ul');
  for (var i = 0; i < 10; i++) {
    var li = document.createElement('li');
    ul.appendChild(li);
  }
  detachedTree = ul;
}

document.getElementById('create').addEventListener('click', create);
```

点击代码中引用的按钮将创建一个包含10个li子级的ul节点。这些节点由代码引用，但不存在与DOM树中，因此已分离。

**堆快照是确定已分离节点的一种方式**。堆快照可以显示拍摄快照时内存在页面的JS对象和DOM节点间的分配

要创建快照，打开devtools转到Memory面板，选择Heap Snapshot单选按钮，然后按Take Snapshot按钮

完成后，从左侧面板（名称为HEAP SNAPSHOTS）中选择该快照

在Class filter文本框中键入`Detached`，搜索已分离的DOM树

![profile](http://reyshieh.com/assets/profile.jpg)

#### 切换快照视图

![profile4](http://reyshieh.com/assets/profile4.jpg)

默认以下有三个视图：

- Summary(概要) - 通过构造函数名分类显示对象
- Containment(控制) - 可用来探测堆内容
- Statistics

##### Summary view(概要视图)

默认是以概要视图显示，显示了对象总数

标题行中显示：

- Constructor(构造函数)表示所有通过该构造函数生成的对象
- Distance 显示的是对象到达GC根的最短距离
- Objects Count 显示对象的实例数
- Shallow size 显示由对应构造函数生成的对象的直接占用内存（浅层大小）总数
- Retained size 显示对应对象所占用的最大内存

黄色背景的对象被Javascript引用

红色背景的对象由黄色背景色引用被分离的节点

##### Containment view(控制视图)

控制视图可以称作对应用对象结构的“鸟瞰视图(bird's eyes view)”。它能让你查看function内部，跟Javascript对象一样的观察VM内部对象

该视图提供了几个进入点：

- DOMWindow对象-这些对象是Javascript代码的“全局”对象
- GC根-VM的垃圾回收器真正的GC根
- Native对象-浏览器对象对“推入”Javascript虚拟机中来进行自动操作，如：DOM节点，CSS规则

关于闭包的建议

- 给函数命名在快照中的闭包函数间做出区分会非常有帮助

  ```
  // 不建议
  function createLargeClosure() {
    var largeStr = new Array(1000000).join('x');
   
    var lC = function() { // this is NOT a named function
      return largeStr;
    };
   
    return lC;
  }
  // 建议
  function createLargeClosure() {
    var largeStr = new Array(1000000).join('x');
   
    var lC = function lC() { // this IS a named function
      return largeStr;
    };
   
    return lC;
  }
  ```

### 发现频繁的垃圾回收

可以使用Chrome任务管理器或者Timeline内存记录发现频繁的垃圾回收。

在任务管理器中，Memory或Javascript Memory值频繁上升和下降表示存在频繁的垃圾回收。

在Timeline记录中，JS堆或节点计数图表频繁上升和下降指示存在频繁的垃圾回收。

## Set up a Workspace

在通常情况下，在Sources中编辑文件后，重新刷新页面所有的改变都会丢失。devtools的Workspaces可以保存所有的改变到文件系统中。

例子 https://glitch.com/edit/#!/smooth-bow?path=index.html:1:0

打开该链接，在Advanced Options > Download Project中下载工程

解压源码，移动解压的app到桌面

![workspace](http://reyshieh.com/assets/workspace.jpg)

点击show展示运行网站

点击Sources > Filesystem > Add Folder To Workspace > 选择 ~/Desktop/app

点击允许给Devtools读写完整路径。在Filesystem tab中，index.html,script.js,和styles.css有绿色的店。这些点以为着Devtools 为网络资源和文件资源建立了mapping

![workspace2](http://reyshieh.com/assets/workspace2.jpg)

### Save a CSS change to disk

打开~/Desktop/app/styles.css。改变颜色为绿色。

![workspace3](http://reyshieh.com/assets/workspace3.jpg)

![workspace4](http://reyshieh.com/assets/workspace4.jpg)

h1的样式显示路径为styles.css: 1意味着本地的style.css改变会使网页h1也发生变化

### Save an HTML change to disk

但是用同样的方式改变html元素，打开~/Desktop/app/index.html，这些改变将不会发生变化。原因：

- 元素面板上的节点树代表页面的DOM
- 展示页面，浏览器从网络中抓取到HTML，转换HTML为DOM节点树
- 如果页面中有Javascript，Javascript可能添加，删除或者改变Dom节点。CSS一样可以改变DOM
- 浏览器最终使用DOM确定它应该向浏览器用户显示什么内容
- 因此，网页的最终状态可能和抓取下来的HTML是不同的
- 这使得DevTools很难解决在元素面板中所做的更改应该保存在何处，因为DOM受HTML、JavaScript和CSS的影响。

简而言之，DOM tree !== HTML

如果还是要从Sources面板中改变HTML，可以

- 点击Sources tab > Page
- 代替要改变的元素
- 点击保存
- 重新加载网页，改变的元素将展示出来
- 打开~/Desktop/app/index.html。改变的元素也保存

### Save a Javascript change to disk

- 打开 Elements tab 
- 用Command Menu > 输入QS。展示Quick Source
- 通过Quick Source添加代码到script.js中
- 点击保存，重新加载页面，网页将发生变化

## 调试Progressive Web App

使用Application面板检查、修改和调试网络应用清单、服务工作线程和服务工作线程缓存

- 使用Manifest窗格检查网络应用清单
- 使用Service Worker窗格执行与服务工作线程相关的全部任务，例如注销或更新服务、模拟推送事件、切换为离线状态，或者停止服务工作线程
- 从Cache Storage窗格查看服务工作线程缓存
- 从Clear Storage窗格中点击一次按钮，注销服务工作线程并清除所有存储于缓存

### 网络应用清单

用户能够将应用添加到移动设备的主屏幕上，需要一个网络应用清单。清单定义应用在主屏幕上的外观、从主屏幕启动时将用户定向到何处、以及应用在启动时的外观

- [通过网络应用清单改进用户体验](https://developers.google.com/web/fundamentals/web-app-manifest)
- [使用应用安装横幅](https://developers.google.com/web/fundamentals/app-install-banners)

设置好清单后，可以使用Application面板的Manifest窗格对其进行检查

- 要查看清单来源，点击App Manifest标签下方的链接
- 按Add to homescreen按钮模拟Add to Homescreen事件
- Identity和Presentation部分以一种对用户更加友好的方式显示清单来源中的字段
- Icons部分显示了已指定的每个图标

### 服务工作线程

浏览器独立于网页在后台运行的脚本。这些脚本可以访问不需要网页或用户交互的功能，例如推送通知、后台同步和离线体验。

- [服务工作线程简介](https://developers.google.com/web/fundamentals/primers/service-worker)

- [推送通知：及时、相关且精确](https://developers.google.com/web/fundamentals/push-notifications)

窗格中的操作按钮

- Offline复选框 切换至离线模式。等同于Network窗格中的离线模式
- Update on reload 复选框 可以强制服务工作线程在每次页面加载时更新
- Bypass for network 复选框 可以绕过服务工作线程并强制浏览器转至网络寻找请求的资源
- Update 按钮 对指定的服务工作线程执行一次性更新
- Push 按钮 在没有负载的情况下模拟推送通知
- Sync 按钮 模拟后台同步事件
- Unregister 按钮 注销指定的服务工作线程

### 服务工作线程缓存

Cache Storage窗格提供一个已使用（服务工作线程）Cache API花奴才能的只读资源列表

### 清除存储

只需点击一次按钮即可注销服务工作线程并清除所有缓存与存储

## 检查和管理存储、数据库与缓存、检查和删除Cookie

- 查看和修改本地存储与会话存储
- 检查和修改IndexdDB数据库
- 对Web SQL数据库执行语句
- 查看应用缓存和服务工作线程缓存
- 点击一次按钮即可清清除所有存储、数据库、缓存和服务工作线程
- 查看与Cookie有关的详细信息，例如名称、值、网域和大小，等等
- 删除单个Cookie，选定网域的Cookie或所有网域的全部Cookie

## 常见快捷键

### 访问Devtools

| 访问DevTools                      | 在Windows上       | 在Mac上   |
| --------------------------------- | ----------------- | --------- |
| 打开Developer Tools               | F12、Ctrl+Shift+I | Cmd+Opt+I |
| 打开/切换检查元素模式和浏览器窗口 | Ctrl+Shift+C      | Cmd+Opt+C |
| 打开Developer Tools并聚焦到控制台 | Ctrl+Shift+J      | Cmd+Opt+J |
| 检查检查器（取消停靠第一个后按）  | Ctrl+Shift+I      | Cmd+Opt+I |

## lighthouse--Audits

https://developers.google.com/web/tools/chrome-devtools/speed/get-started 介绍了如何运用performance、Audits分析网站的耗时和如何提升性能，非常有用

- Audits 从Performance、PWA、Accessibility、Best Practices、SEO五个维度分析性能
- Coverage 用来分析在初始加载时每个脚本执行的覆盖度，可以分析出哪些脚本能用async或defer方式加载
- Request Blocking 用来阻塞用户自己指定目录下的脚本，若还能正常运行，说明这些脚本压根没有在初始加载中执行
- Performance 可以通过User Timing API分析出哪些方法是耗时的方法，做出性能上的优化；Bottom Up 中显示了选中的方法以下的时间占比，更好的看执行时间

https://developers.google.com/web/tools/chrome-devtools/accessibility/reference accessibility指标介绍

## Console

### 写入控制台

`console.log()`方法可以向控制台进行任何基本记录。此方法采用一个或多个表达式作为参数，并将其当前值写入控制台，从而将多个参数级联到一个由空格分割的行中

`console.debug()`与`console.log()`作用相同

`console.info()`与`console.log()`也很相像，只是在输出旁边显示一个图标（带白色"i"的蓝色圆圈）

### 清空控制台

`console.clear()`

### 输出Javascript形式表示的指定对象

`console.dir(object)` 如果正在记录的对象是HTML对象，将输出其以DOM形式表示的属性

```
console.dir(document.body);// 等价 console.log('%O', document.body);
```

### 组织控制台输出

`console.group()`，可以使用组命令输出组织到一起。采用一个字符串参数设置组名称。在Javascript中调用此命令后，控制台会将所有后续输出都组织在一起。

结束分组，用命令`console.groupEnd()`

```
// 示例
var user = "jsmith", authenticated = false;
console.group("Authentication phase");
console.log("Authenticating user '%s'", user);
// authentication code here...
if (!authenticated) {
    console.log("User '%s' not authenticated.", user)
}
console.groupEnd();
```

#### 嵌套组

日志组可以彼此嵌套。

```
// 示例
var user = "jsmith", authenticated = true, authorized = true;
// Top-level group
console.group("Authenticating user '%s'", user);
if (authenticated) {
    console.log("User '%s' was authenticated", user);
    // Start nested group
    console.group("Authorizing user '%s'", user);
    if (authorized) {
        console.log("User '%s' was authorized.", user);
    }
    // End nested group
    console.groupEnd();
}
// End top-level group
console.groupEnd();
console.log("A group-less log trace.");
```

#### 自动折叠组

大量使用组时，为了即使查看所有信息是非常有用的。可以通过调用`console.groupCollapsed()`自动折叠

```
// 示例
console.groupCollapsed("Authenticating user '%s'", user);
if (authenticated) {
    ...
}
console.groupEnd();
```

### 错误和警告

`console.error()`

`console.warn()`

### 断言

`console.assert()`可以仅在其第一个参数为false时有条件地显示错误字符串（其第二个参数）

```
// 示例，在不满足第一个条件时，才会打印日志
console.assert(list.childNodes.length < 500, "Node count is > 500");
```

### 字符串替代和格式设置

方法的第一个参数中可能会包含一个或多个格式说明符。格式说明符由一个%符号与后面紧跟的一个字母组成，字母指示应用到值的格式。字符串后的参数会按顺序应用到占位符中。

格式说明符列表：

| 说明符   | 输出                                                         |
| -------- | ------------------------------------------------------------ |
| %s       | 将值格式化为字符串                                           |
| %i或者%d | 将值格式化为整形                                             |
| %f       | 将值格式化为浮点值                                           |
| %o       | 将值格式化为可扩展DOM元素。如同在Elements面板中显示的一样    |
| %O       | 将值格式化为可扩展Javascript对象,也可使用console.dir达到同样效果 |
| %c       | 将CSS样式规则应用到显示中，作为第二个参数                    |

对%c的示例

```
console.log("%cThis will be formatted with large, blue text", "color: blue; font-size: x-large");
```

### 记录对象数组

可以用`console.table()`命令将数组显示为表格形式

```
// 示例
console.table([{a:1, b:2, c:3}, {a:"foo", b:false, c:undefined}]);
console.table([[1,2,3], [2,3,4]]);
```

#### 记录特定的属性

可以在table()的第二个参数记录更多高级对象。查看希望显示的属性字符串的数组

```
// 示例
function Person(firstName, lastName, age) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.age = age;
}

var family = {};
family.mother = new Person("Susan", "Doyle", 32);
family.father = new Person("John", "Doyle", 33);
family.daughter = new Person("Lily", "Doyle", 5);
family.son = new Person("Mike", "Doyle", 8);

console.table(family, ["firstName", "lastName", "age"]);
```

### 测量执行时间

`console.time()`和`console.timeEnd()`跟踪代码执行点之间经过的时间

```
// 示例
console.time("Array initialize");
var array= new Array(1000000);
for (var i = array.length - 1; i >= 0; i--) {
    array[i] = new Object();
};
console.timeEnd("Array initialize");
```

`console.timeStamp()` 在录制会话期间向**Timeline**添加一个事件

```
// 示例
console.timeStamp('check out this custom timestamp thanks to console.timeStamp()!');
```

###对执行进行计数

`console.count()`对相同字符串传递到函数的次数进行计数。当完全相同的语句被提供给同一行上的count()时，此数字将增大。

```
// 示例
function login(user) {
    console.count("Login called for user " + user);
}

users = [ // by last name since we have too many Pauls.
    'Irish',
    'Bakaus',
    'Kinlan'
];

users.forEach(function(element, index, array) {
    login(element);
});

login(users[0]);
```

### 启动带有可选标签的Javascript CPU配置文件

`console.profile()` 每一个配置文件都会添加到**Profiles**面板中

`console.profileEnd()`用来完成配置文件，停止当前的Javascript CPU分析会话，并将报告输出到**Profiles**面板中

### 堆栈追踪

`console.trace()` 从调用此方法的位置输出一个堆叠追踪

```
function add(num) {
    if (num > 0) {
        console.trace('recursion is fun:', num);
        return num + add(num - 1);
    } else {
        return 0;
    }
}
```

### 使用window.onerror处理运行时异常

可以使用`window.onerror`处理程序函数，每当Javascript代码执行中发生错误时都会调用此函数。当Javascript异常每次在窗口上下文中引发并且未被try/catch块捕捉时，调用此函数时还会调用异常的消息、引发异常的文件的网址、该文件中的行号，三者根据次顺序作为三个参数传递

例如，使用Ajax post调用设置一个错误处理程序，用于收集未捕捉异常的相关信息并将其报告回服务器。这样就可以记录用户浏览器中发生的所有错误并获得相关通知。

```
window.onerror = function(message, url, line) {
    console.log("window.onerror was invoked with message = " + message + ", url = " + url + ", line = " + line);
}
```

