# nodejs

## 架构

分为**三层**：

- 应用app
- V8及node内置架构 - V8是node运行的环境，node虚拟机
  - 核心模块(javascript实现) 实现Node standard Library
  - c++绑定 Node Bindings(Socket, http, file system, etc.)
  - libuv(Async I/O, Event Loop) + http
- 操作系统

**核心模块**：Events、Stream、File System、Net、HTTP和全局对象

## Node全局对象

