# Electron

## 应用结构

Electron和浏览器的基本是一致的。分为主进程和渲染进程，在主进程中可以运行脚本创建web页面来展示用户界面。一个应用有且只有一个主进程。渲染进程用来展示每个web页面，运行在单独的安全沙盒环境中，和普通的浏览器区别在于，Electon的用户可以使用Nodejs api让页面和操作系统进行底层交互。

主进程使用`BrowserWindow`实例创建页面。每个`BrowserWindow`都在自己的渲染进程里运行页面。`BrowserWindow`实例销毁的同时，渲染进程也会终止。

主进程管理所有的web页面和对应的渲染进程。每个渲染进程是独立的，只关心它所运行的web页面。

**在页面中调用与 GUI 相关的原生 API 是不被允许的，因为在 web 页面里操作原生的 GUI 资源是非常危险的，而且容易造成资源泄露。** 如果你想在 web 页面里使用 GUI 操作，其对应的渲染进程必须与主进程进行通讯，请求主进程进行相关的 GUI 操作。

> 进程间通讯：主进程和渲染进程通信有多种实现方式，如可以使用ipcRenderer和ipcMain模块发送消息，使用remote模块进行RPC方式通信。[web页面间如何共享数据](https://electronjs.org/docs/faq#how-to-share-data-between-web-pages)

