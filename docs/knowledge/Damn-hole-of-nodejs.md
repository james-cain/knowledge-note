# nodejs

## 架构

分为**三层**：

- 应用app

- V8及node内置架构 - V8是node运行的环境，node虚拟机

  - 核心模块(javascript实现) 实现Node standard Library
  - c++绑定 Node Bindings(Socket, http, file system, etc.)
  - libuv(Thread Pool[Async I/O], Event Loop) + V8

  ![node-architecture.png](http://reyshieh.com/assets/node-architecture.png)

  基于Chrome V8引擎构建，由事件循环(Event Loop)分发I/O任务，最终工作线程(Work Thread)将任务丢到线程池(Thread Pool)里去执行，而事件循环只要等待执行结果就可以。

- 操作系统

**核心模块**：Events、Stream、File System、Net、HTTP和全局对象

## Node全局对象

