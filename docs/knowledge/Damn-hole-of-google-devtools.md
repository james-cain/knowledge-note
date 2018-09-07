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

