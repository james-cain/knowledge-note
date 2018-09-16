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



## Set up a Workspace

在通常情况下，在Sources中编辑文件后，重新刷新页面所有的改变都会丢失。devtools的Workspaces可以保存所有的改变到文件系统中。

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

