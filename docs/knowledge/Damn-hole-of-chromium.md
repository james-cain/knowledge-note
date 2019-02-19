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

![Chromium_application_layers.png](http://reyshieh.com/assets/Chromium_application_layers.png)

- WebKit：Safari、Chromium和其他所有基于WebKit的浏览器共享的渲染引擎。WebKit Port是WebKit的一个部分，用来集成平台独立的系统服务，比如资源加载与图像。
- WebKit glue：将WebKit的类型转为Chromium的类型。也就是**WebKit嵌入层**。这里有两个browser: Chromium和test_shell(允许测试WebKit)
- Renderer/Render host：**多进程嵌入层**。它代理通知，并跨过进程边界执行指令。
- WebContents：一个可重用的组件，是内容模块的主类。易于嵌入，允许多进程将HTML绘制成View。
- Browser：代表浏览器窗口，包含多个WebContents。
- Tab Helpers：可以被绑定到WebContents的独立对象。浏览器将它们的分类附加到所持有的WebContents上(如图标，信息栏等)

#### WebKit

WebKit用于布局web页面，主要从Apple中pull过来。WebKit主要由"WebCore"组成，代表了核心的布局功能，还有"JavaScriptCore"，用来运行JavaScript。但目前已被V8 JavaScript引擎代替了。

##### WebKit port

WebKit port是我们所需的特定于平台的功能的实现，这些功能与独立于平台的WebCore代码交互。

#### WebKit glue

Chromium应用工程使用不同的类型，编码风格，以及代码布局和第三方的WebKit代码，glue使Google编码与类型为WebKit提供了更加方便的嵌入式API。glue对象通常与WebKit对象命名相似，但在开头会加上Web前缀。如WebCore::Frame变成了WebFrame。

test_shell应用程序是用来测试WebKit port和glue的web浏览器。

#### 渲染器进程

![Renderingintherenderer.png](http://reyshieh.com/assets/Renderingintherenderer.png)

Chromium的渲染器进程使用glue接口嵌入在WebKit port上。它不包含太多的代码：它的主要工作是作为渲染器端到浏览器的IPC通道。

渲染器最重要的类为RenderView，代表一个网页。它处理与浏览器之间所有导航相关的命令。它驱动RenderWidget提供绘图和输入事件处理。RenderView与浏览器进程的通信通过全局的RenderProcess对象。

##### 渲染器中的线程

每个渲染器有两个线程。渲染器线程是主要对象(如RenderView和所有WebKit代码)运行的地方。当和浏览器通信时，消息首先被发送到主线程，然后主线程将消息分派给浏览器进程。除此之外，允许我们将消息从渲染器同步发送到浏览器，这只会发生在一小部分操作中，在这操作中，需要继续执行来自浏览器的结果。一个例子是在JavaScript请求时获取页面的cookie。渲染器线程将阻塞，主线程将对接收到的所有消息排队，直到找到正确的响应。在此期间接收到的任何消息随后都将发布到渲染器线程以进行正常处理。

#### 浏览器进程

![renderingbrowser.png ](http://reyshieh.com/assets/renderingbrowser.png)

##### 底层浏览器进程对象

所有与渲染器进程通信的IPC都是在浏览器的I/O线程中完成的。线程也处理所有的网络通信，以防止它干扰用户界面。

当RenderProcessHost在主线程中被初始化，它将创建新的渲染器进程和一个ChannelProxy IPC对象，其中包含一个指向渲染器的命名管道。该对象运行在浏览器的I/O线程中，监听到渲染器的命名管道，并自动将所有消息转发回UI线程（主线程）上的RenderProcessHost。在这个管道中安装一个ResourceMessageFilter，它将过滤掉某些可以直接在I/O线程中处理的消息，如网络请求。

UI线程（主线程）上的RenderProcessHost负责将所有特定于视图的消息发送到适当的RenderViewHost(它本身处理有限数量的非特定于视图的消息)。

##### 上层浏览器进程对象

特定于视图的消息来源于RenderViewHost，大部分的消息都在这被处理，剩下的会被转发到RenderWidgetHost基类。这两个对象与渲染器中的RenderView和RenderWidget一一映射。

在RenderView/Widget上面的是WebContents对象，大部分的消息事实上都是作为对象的函数调用而结束。一个WebContents代表网页的内容。它是内容模块的顶级对象，负责在视图中显示web页面。

WebContents对象包含在TabContentsWrapper中。负责标签页。

## 整体架构

### 硬件视频加速

加速API的主要使用者是：< video >管道(在web上展示媒体信息)，WebRTC(使得web上脱离插件的实时视频聊天变得可能)，Pepper API(为pepper插件比如Adobe Flash提供硬件加速)

实现硬件加速API与操作系统相关，有时候也与硬件平台相关，因为操作系统和驱动/硬件表示层提供了不同的各种选项

![hwvideo.png](http://reyshieh.com/assets/hwvideo.png)

设备的层出不穷，这个列表可能已经过时

### 跨进程通信(IPC)

Chromium是一个多进程的架构，进程之间的通信原语是命名管道。每个渲染器进程可以分配到一个命名管道来跟浏览器进程通信。管道在异步模式使用，以确保任何一端都不会阻塞等待另一端。

#### 浏览器中的IPC

在浏览器中，和渲染器的通信是通过I/O线程完成的。来自views(renderView)的消息必须使用ChannelProxy代理到主线程。该方案的优点是，资源请求（用于web页面等）是最常见和性能关键消息，可以完全在I/O线程上处理，而不会阻塞用户界面，这是通过RenderProcessHost插入管道的ChannelProxy::MessageFilter实现的。**该过滤器运行在I/O线程，拦截资源请求信息，将它们直接转发到资源分发主机。**

#### 渲染器中的IPC

每个渲染器也有一个线程管理通信（即主线程，主渲染器线程），渲染和大多数处理都发生在另一个线程上。大多数消息通过主渲染器线程从浏览器发送到WebKit线程，反之亦然。这个额外的线程支持同步渲染器到浏览器的消息。

#### 消息

##### 消息的类型

基本的消息类型分为两种：**路由(routed)**和**控件(control)**。控件消息由创建管道的类处理。有时，该类将允许其他人通过MessageRouter对象接收消息，其他侦听器可以注册该对象，并接收使用其唯一(每个管道)id发送的"路由"信息。

例如，在渲染时，控件消息不是特定于给定视图的，将由RenderProcess(渲染器)或RenderProcessHost(浏览器)处理。对资源或修改剪贴板的请求不是特定于视图的，控件消息也是。路由消息的例子是请求视图绘制区域的消息。

路由消息曾经被用于从指定的RenderViewHost中获取消息。然而，从技术上说，任何类可以通过使用RenderProcessHost::GetNextRoutingID接收路由消息，用RenderProcessHost::AddRoute注册本身。现在，RenderFrameHost和RenderViewHost实例都有它们自己的路由ID。

**从浏览器到渲染器的消息被称为View消息；从渲染器到浏览器的消息被称为ViewHost消息**。插件的线程命名也是如此。分别为PluginProcess消息和PluginProcessHost消息。

##### 声明消息

特殊宏用于声明消息。若要声明**从渲染器到浏览器**的路由消息(例如特定于frame的FrameHost消息)，其中包含一个URL和一个整数作为参数，这样写：

```
IPC_MESSAGE_ROUTE2(FrameHostMsg_MyMessage, GURL, int)
```

声明一个**从浏览器到渲染器**的控件消息(例如不特定于frame的Frame消息)，其中不包含参数，这样写：

```
IPC_MESSAGE_CONTROL0(FrameMsg_MyMessage)
```

##### 包装数据

参数通过ParamTraits模板序列化或反序列化到消息体中。模板具体化在ipc_message_utils.h中提供给大多数常见的类型。

#### 发送消息

可以通过管道来发送消息。在浏览器中，RenderProcessHost包含用于从浏览器的UI线程向渲染器发送消息的管道。为了方便，RenderWidgetHost(RenderViewHost的基类)提供了一个Send函数。

消息由指针发送，并在发送后由IPC层删除。因此，一旦找到合适的Send函数，只需携带一个新的消息调用它：

```
Send(new ViewMsg_StopFinding(routing_id_));
```

注意，必须按照顺序指定路由ID，让消息能够路由到接收端正确的View/ViewHost。RenderWidgetHost(RenderViewHost的基类)和RenderWidget(RenderView的基类)都有可以使用的GetRoutingId()成员。

#### 处理消息

### 管道(Channels)

IPC::Channel()定义了通过管道通信的方法。IPC::SyncChannel为同步等待某些消息的响应提供了额外的功能。渲染器进程提供了同步的特性，但浏览器进程没有提供。

管道不是线程安全的，通常希望用管道在另一个线程里发送消息。例如，当UI线程希望发送消息时，它必须通过I/O线程。为此，使用IPC::ChannelProxy。它有着与正常管道对象类似的API，但它把消息代理到另一个线程去发送，而在收到这些消息时，把消息代理回原来的线程。在代理消息时，也可以通过RenderMessageFilter对象过滤掉一些消息，使用这个特性去做资源请求以及其它可以直接在I/O线程处理的请求。

### 同步消息

从渲染器的角度来看，有些消息应该是同步的。这通常发生在WebKit调用我们时，它应该返回一些东西，但我们必须在浏览器中执行。这些消息的示例包括拼写检查和获取JavaScript的cookie。不允许同步浏览器到渲染器的IPC，以防止阻塞可能不稳定的渲染器上的用户界面。

⚠️不要在UI线程处理同步消息，必须在I/O线程中处理他们。否则，应用程序可能因为插件等待UI线程的同步绘制而陷入死锁，而渲染器等待浏览器同步消息时也会有阻塞。

#### 声明同步消息

同步消息用IPC_SYNC_MESSAGE_*这样的宏来声明。这些宏有输入，也有返回值（非同步消息没有返回参数的概念）：

```c
IPC_SYNC_MESSAGE_CONTROL2_1(SomeMessage, // Message name
							GURL, // input_param1
							int,	// input_param2
							std::string); // result
```

类似的，也可以让消息路由到view，需要把"CONTROL"换成"ROUTED"，得到IPC_SYNC_MESSAGE_*。

#### 分发同步消息

当WebKit线程分发出一个同步IPC请求时，请求对象(继承自IPC::SyncMessage)会在渲染器中通过IPC::SyncChannel对象分发给主线程。所有同步的消息也是通过它发送的。同步管道在接收到同步消息时，会阻塞调用线程，只有当收到回复时，才会解除阻塞。

在WebKit线程等待同步请求时，主线程仍然会从浏览器进程接收消息。这些消息会添加到WebKit线程里，等到WebKit线程被唤醒时处理它们。当同步消息回复被接收时，这个线程会解除阻塞。

### 多进程资源加载(该部分官网说明需要更新)

所有的网络通信都是在主浏览器进程中处理的。这么做不仅让浏览器进程可以控制每个渲染器对网络的访问，还可以跨cookie和缓存数据等进程维护一致的会话状态。另一个重要的原因，作为一个HTTP/1.1的用户代理，浏览器整体上在每个host上不能打开太多连接。

多进程应用程序可以从三个层面来看。

- 最底层是WebKit库，用来渲染页面
- 在它上面是渲染器进程(每个标签页对应一个进程)，每个进程包含一个WebKit实例
- 管理所有渲染器的是浏览器进程，控制所有的网络访问

![Resource-loading.png](http://reyshieh.com/assets/Resource-loading.png)

#### Blink

Blink有一个ResourceLoader对象，该对象负责获取数据。每个loader都有一个WebURLLoader来执行实际的请求。这个接口的头文件在Blink repo中。

ResourceLoader实现了WebURLLoaderClient接口。这是渲染器使用的回调接口，用于分发数据和其他事件到Blink。

#### Renderer

渲染器对WebURLLoader的实现，称为WebURLLoaderImpl，位于content/child/。它使用全局ResourceDispatcher单例对象(对每个渲染器进程)来创建独立的请求ID，通过IPC转发request给浏览器。来自浏览器的响应将引用此请求ID，然后资源分发器将ID转换回RequestPeer对象。

#### Browser

浏览器中的RenderProcessHost对象从每个渲染器接收IPC请求。使用指向渲染进程host的指针(尤其是ResourceDispatcherHost::Receiver)，转发请求给全局的ResourceDispatchHost，并且用渲染器生成的request ID唯一标识这些请求。

然后，每个请求会被转换成一个URLRequest对象，反过来将其转发给它内部的URLRequestJob。当URLRequest生成通知时，它的ResourceDispatcherHost::Receiver和request ID会被用于将通知发送给正确的RenderProcessHost，以将其发回给渲染器。由于渲染器生成的ID是保留的，所以它能够将所有响应与Blink首先生成的特定请求关联起来。

#### Cookies

所有的cookies由CookieMonster对象处理，位于/net/base中。我们不与其他浏览器的网络栈(如WinNET或Necko)共享cookies。cookie monster存在于处理所有网络请求的浏览器进程中，因为cookie需要在所有选项卡上都是相同的。

页面可以通过document.cookie为一个document请求cookie。这种情况下，我们从渲染器向浏览器发送一个同步消息来请求cookie。当浏览器在处理cookie时，WebKit的工作线程会挂起。当渲染器的I/O线程接收到浏览器的响应时，会解除这个线程挂起，然后把结果传回给JavaScript引擎。

### 插件架构

插件是浏览器不稳定的主要来源。插件也会在渲染器没有实际运行时，让进程沙箱化。因为插件是由第三方编写的，我们无法控制它们对操作系统的访问。解决方案是在插件各自独立的进程中运行插件。

#### 进程内插件

Chromium有着在进程内运行插件的能力，也可以在进程外运行插件。两者都是从我们的非多进程感知的WebKit嵌入层开始的，该层期望嵌入器实现Webkit::WebPlugin接口。这实际由WebPluginImpl实现。WebPluginImpl在图中的虚线以上，与WebPluginDelegate接口交流，对进程内插件而言，这个接口由WebPluginDelegateImpl实现，它会接着与我们的NPAPI包装层通信。

![in_process_plugins.png](http://reyshieh.com/assets/in_process_plugins.png)

#### 进程外插件

Chromium通过切换上面的图中虚线以上几层的实现来支持跨进程插件。这只是在WebPluginImpl和WebPluginDelegateImpl层之间插入一个IPC层，并让我们在每个模式之间共享所有的NPAPI代码。所有旧的WebPluginDelegateImpl代码，以及它涉及的所有NPAPI层，现在都在独立的插件进程中执行。

渲染器/插件通信通道的两边由PluginChannel和PluginChannelHost表示。我们有许多渲染器进程，每个插件有一个插件进程。这意味着对于它使用的每个插件类型(例如Adobe Flash和Windows Media Player)，渲染器中都有一个PluginChannelHost。在每个插件进程中，对于每个具有该类型插件实例的渲染器进程，会有一个PluginChannel。

通道的每一端依次映射到插件的许多不同实例。例如，如果web页面中嵌入了两个Adobe Flash影片，那么在渲染器端就会有两个WebPluginDelegateProxy，以及在插件端会有两个WebPluginDelegateStub。通道负责在IPC连接上复用这些对象之间的通信。

图中灰色部分为上面的进程内图表的类，中间彩色的为新的进程外代码层。

![out_of_process_plugins.png](http://reyshieh.com/assets/out_of_process_plugins.png)

#### 无窗口插件

无窗口插件设计用于在渲染器管道内直接运行。当WebKit想要在屏幕上绘制一个区域时，调用插件代码，将会作为一个绘制上下文处理。无窗口插件通常用于希望插件在页面上是透明的情况下—由插件绘图代码决定如何导航给定的页面。

要使无窗口插件退出进程，仍然需要将它们的渲染合并到WebKit完成的(同步)渲染传递中。一个非常缓慢的选择是剪切插件将要绘制的区域，然后同步地将其传到插件进程并让它绘制。然后可以使用一些共享内存来加速。

然而，渲染速度取决于插件进程(想象一个页面有30个透明的插件--我们需要30次到插件进程的往返)。因此，我们使用无窗口插件异步绘制，就像我们现有的页面渲染相对于屏幕是异步的一样。渲染器有效地存储了插件的渲染区域的样子，并在绘制时使用该图像，插件可以自由地异步发送表示对渲染区域的更改的新更新。

所有这些都因为"透明"插件而变得有点复杂。插件进程需要知道它想绘制什么像素。它还保存了渲染器上次发送给它的内容的缓存，作为插件背后的页面背景，然后让插件重复绘制。

所以，总的来说，下面是一个无窗口插件绘制的区域所涉及的缓冲区：

- 渲染器进程
  - 回退存储插件最后绘制的东西
  - 插件的共享内存，以接收更新
  - 复制插件背后的页面背景
- 插件进程
  - 复制插件背后的页面背景，作为绘制时的源材料使用
  - 渲染器共享内存以发送更新

#### 全貌

图中展示整个系统，有浏览器和两个渲染进程，并与一个共享的进程外Flash进程通信。总共有三个插件实例。

![pluginsoutofprocess.png](http://reyshieh.com/assets/pluginsoutofprocess.png)

