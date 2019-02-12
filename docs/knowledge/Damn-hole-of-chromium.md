# Chromium

## 介绍

中文文档参考[chromium_doc_zh](https://ahangchen.gitbooks.io/chromium_doc_zh/content/zh/Start_Here_Background_Reading/Multi-process_Architecture.html)

官方文档参考[chromium_doc_en](https://www.chromium.org/developers/design-documents)

源码[source](https://chromium.googlesource.com/chromium/src)

镜像[github](https://github.com/chromium/chromium)

## 背景阅读

### 多进程架构

浏览器的每个标签都是一个独立的进程，这样设计的目的是为了保护整个应用程序免受渲染引擎中的bug和故障的伤害。并且会限制每个渲染引擎进程的相互访问，以及他们与系统其它部分的访问。某些程度上，这为web浏览提供了内存保护，为操作系统提供了访问控制。

浏览器进程/浏览器(Browser) - 运行UI和管理Tab/Plugin的主进程。

渲染进程/渲染器(Renderer) - 标签页相关的进程，**渲染器使用WebKit开源引擎[Blink](https://www.chromium.org/blink)来实现中断与html的布局**。

![chromium_arch](http://reyshieh.com/assets/chromium_arch.png)

每个渲染进程都有一个全局的RenderProcess对象，管理它与父浏览器进程之间的通信，维护全局的状态。浏览器为每个渲染进程维护一个对应的**RenderViewHost，用来管理浏览器状态，并与渲染器交流**。浏览器与渲染器使用Chromium's IPC system进行交流。

每个渲染器有一个以上的RenderView对象，由RenderProcess管理(与标签页的内容相关)。对应的RenderProcessHost维护与渲染进程中每个view相关的RenderViewHost。每个view被赋予一个view ID，以区分同一个渲染进程中的不同view。这些ID在每个渲染进程内是唯一的，但在浏览器中不是，所以区分一个view需要一个RenderProcessHost和一个view ID。

浏览器与包含内容的特定标签页之间的交流是通过RenderViewHost对象来完成的，他们知道如何通过RenderProcessHost向RenderProcess和RenderView发送消息。

在渲染进程中：

- RenderProcess与浏览器中对应的RenderProcessHost通信。每个渲染进程有唯一的一个RenderProcess对象。这就是所有浏览器-渲染器之间的交互发生的方式。
- RenderView对象与浏览器中对应的RenderViewHost和webKit嵌入层通信(通过RenderProcess)。**代表一个网页在标签页或一个弹出窗口的内容**。

在浏览器进程中：

- Browser对象代表顶级浏览器窗口。
- RenderProcessHost对象代表浏览器端与渲染器的IPC连接。在浏览器进程里，每个渲染进程有一个RenderProcessHost对象。
- RenderViewHost对象封装与远端浏览器的交流。
- RenderWidgetHost处理输入并在浏览器中为RenderWidget进行绘制。

通常情况下，每个新的window或标签页都是在一个新进程里打开的，浏览器会生成一个新的进程，然后指导它去创建一个RenderView。但有时，需要标签页或窗口间共享渲染进程。会有一些策略来把新的标签页分配给已有的进程(如果总的进程数太大的话，或者如果用户已经为这个域名打开一个进程)。

### Blink是如何工作

[How Blink works](https://docs.google.com/document/d/1aitSOucL0VHZa9Z2vbRJSyAIsAz24kX8LFByQ5xQnUg/edit)

### 如何展示网页

