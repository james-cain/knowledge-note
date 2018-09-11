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

