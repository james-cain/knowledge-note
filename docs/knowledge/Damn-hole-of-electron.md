# Electron

> 以下内容来源于[Electron官方文档](https://electronjs.org/docs)，本人摘录了部分使用过的API和部分概念，以及会对开发中做出对应总结，详细文档请查看官网

## 应用结构

Electron和浏览器的基本是一致的。分为主进程和渲染进程，在主进程中可以运行脚本创建web页面来展示用户界面。一个应用有且只有一个主进程。渲染进程用来展示每个web页面，运行在单独的安全沙盒环境中，和普通的浏览器区别在于，Electon的用户可以使用Nodejs api让页面和操作系统进行底层交互。

主进程使用`BrowserWindow`实例创建页面。每个`BrowserWindow`都在自己的渲染进程里运行页面。`BrowserWindow`实例销毁的同时，渲染进程也会终止。

主进程管理所有的web页面和对应的渲染进程。每个渲染进程是独立的，只关心它所运行的web页面。

**在页面中调用与 GUI 相关的原生 API 是不被允许的，因为在 web 页面里操作原生的 GUI 资源是非常危险的，而且容易造成资源泄露。** 如果你想在 web 页面里使用 GUI 操作，其对应的渲染进程必须与主进程进行通讯，请求主进程进行相关的 GUI 操作。

> 进程间通讯：主进程和渲染进程通信有多种实现方式，如可以使用ipcRenderer和ipcMain模块发送消息，使用remote模块进行RPC方式通信。[web页面间如何共享数据](https://electronjs.org/docs/faq#how-to-share-data-between-web-pages)

## 多线程

通过[web-workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)，可以实现用操作系统级别的线程来跑JavaScript

可以在Electron的Web Workers里使用Node.js的特性。**所有的Electron内置模块不可以用在多线程环境中**

## API

### app

> 控制应用程序的事件生命周期

`app对象`会发出的事件：

- will-finish-launching - 当应用程序完成基础的启动的时候被触发。Windows和Linux中，与`ready`事件相同；在macOS中，相当于`NSApplication`中的`applicationWillFinishLaunching`提示。

  通常会在这里为`open-file`和`open-url`设置监听器，并启动崩溃报告和自动更新。

  绝大部分，必须在`ready`事件句柄中处理所有事务。

- ready - 当Electron完成初始化时被触发。

- window-all-closed - 当所有的窗口都被关闭时触发。

- before-quit - 在应用程序开始关闭窗口之前触发。调用evet.preventDefault()会组织默认行为(终结应用程序)。

- will-quit - 当所有窗口都已关闭并且应用程序将退出时发出。

- quit - 在应用程序退出时发出。

- open-file - 当用户想要在应用中打开一个文件时发出。

- open-url - 当用户想要在应用中打开一个URL时发出。

- activate - 当应用被激活时发出。各种操作都可以触发此事件, 例如首次启动应用程序、尝试在应用程序已运行时或单击应用程序的坞站或任务栏图标时重新激活它。

方法：

- app.quit() - 尝试关闭所有窗口

- app.exit() - 立即退出程序并返回exitCode

- app.relaunch() - 从当前实例退出，重启应用

  请注意, 此方法在执行时不会退出当前的应用程序, 你需要在调用 `app.relaunch` 方法后再执行 `app. quit` 或者 `app.exit` 来让应用重启

- 