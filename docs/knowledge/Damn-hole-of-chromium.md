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

### 进程模型

Web内容已经发展到包含大量在浏览器中运行的活动代码，这使得许多Web站点更像应用程序而不是文档。这种演变已经将浏览器的角色从简单的文档渲染器变成了操作系统。Chromium构建得像一个操作系统，以一种安全而健壮的方式运行这些应用程序，使用多个操作系统进程经Web站点隔离，并与浏览器本身隔离。这提高了健壮性，因为每个进程在自己的地址空间中运行，由操作系统调度，即使失败也是独立地。用户还可以在Chromium的任务管理器中查看每个进程的资源使用情况。

Web浏览器可以以多种方式划分为不同的OS进程，选择最佳的架构取决于许多因素，包括稳定性，资源使用情况和实际使用情况的观察结果。Chromium支持四种不同的进程模型来进行实验，默认模型最适合大多数用户。

#### 支持的模型

Chromium支持四种不同的模型，它们影响浏览器分配页面给渲染器进程。**默认情况下，Chromium为用户访问的每个Web站点实例使用单独的操作系统进程**。但是，用户可以在启动Chromium时指定命令行开关来选择其他体系结构：**每个Web站点的所有实例一个进程**、**每组选项卡一个进程**或者**所有都在一个单独的进程**。这些模型的不同之处在于，它们反映的内容的来源、选项卡之间的关系，还是两者皆有。

#### 单Web站点实例单进程

**默认情况下，Chromium为用户访问的每个站点实例创建一个渲染器进程。**这保证了不同站点的页面独立渲染，并且对同一站点的独立访问也是相互隔离的。因此，一个站点实例中的失败(如渲染器崩溃)或大量资源使用不会影响浏览器的其他部分。该模型基于内容的源和脚本会相互影响的选项卡之间的关系。因此，两个选项卡可能会显示相同进程中渲染的页面，而导航到给定选项卡中的跨站点页面可能会切换选项卡的渲染进程。

具体地说，我们将“站点”定义为注册域名(例如google.com或bbc.co.uk)加上模式(例如https://)。这类似于同源策略定义的源，但是它将子域(例如mail.google.com和docs.google.com)和端口(例如http://foo.com:8080)分组到同一个站点。这对于允许站点的不同子域或端口中的页面通过Javascript相互访问是必要的。

"站点实例"是来自同一站点的连接页面的集合。如果两个页面可以在脚本代码中获得对彼此的引用，则认为它们是连接的(如，如果一个页面使用JavaScript在新窗口中打开另一个页面)。

##### 优点

- 从不同的站点分离内容。这为Web内容提供了一种有意义的命运共享形式，其中页面与其他Web站点引起的故障隔离开来
- 隔离显示相同站点的独立选项卡。在不同的选项卡中独立访问相同的站点将创建不同的进程。这将阻止实例中的争用和失败影响到其他实例

##### 缺点

- 更多的内存开销。在大多数工作负载中，该模型将创建比下面描述的单站点单进程模型更多的渲染器进程。虽然这增加了稳定性和增加了并行性的可能，但也增加了内存开销
- 实现起来更复杂。与单选项卡到进程和单进程处理不同，此模型需要复杂的逻辑来支持选项卡在站点之间导航时交换进程，以及代理一些源之间的JavaScript操作，如postMessage

#### 单Web站点单进程

Chromium也支持隔离不同站点，但把所有相同站点的实例组合到相同的进程中的进程模式。使用这个模型，用户需要在启动Chromium时在终端指定`--process-per-site`开关。这创建更少的渲染进程，为了降低内存消耗而牺牲一些健壮性。该模型基于内容的源，而非标签之间的关系。

##### 优点

- 隔离不同站点的内容。正如单实例Web站点单进程模型，来自不同站点的页面将不会共享命运，即不同生死
- 更少的内存负载。这个模型会比单实例Web站点单进程和单选项卡单进程模型创建更少的并行进程。这可能有助于减少Chromium的内存占用

##### 缺点

- 可能导致更大的渲染进程。像google.com这样的站点承载着各种各样的应用程序，它们可能在浏览器里被同时打开，所有这些应用程序都将在相同的进程中渲染。因此，应用程序的资源争用和失败会影响到许多选项卡，使得浏览器看起来不能更好地响应。不幸的是，在不破坏向后兼容性的情况下，很难在比注册域名更细的粒度上识别站点边界
- 实现起来更复杂。和单Web站点实例单进程模型相似，这需要在导航中交换进程以及代理一些JavaScript操作的逻辑

#### 单选项卡单进程

单Web站点实例单进程和单Web站点单进程模型都需要在创建渲染进程时考虑站点内容的源。Chromium也提供了一个更简单的模型，**将每组脚本连接的选项卡提供一个渲染器进程**。这个模型可以使用`--process-per-tab`命令行开关来选中。

具体地说，我们将一组相互具有脚本连接的选项卡称为浏览实例，它也对应于HTML5规范中的"相关浏览上下文单元"。该集合由一个选项卡和使用JavaScript代码打开的任何其他选项卡组成。这些标签必须渲染在同一进程中，以允许标签之间执行JavaScript调用(多数通常发生在同源页面之间)。

##### 优点

- 容易理解。每个选项卡分配一个渲染进程，并不会随着时间的推移而改变

##### 缺点

- 导致页面间不希望的命运共享。如果用户将浏览实例中的选项卡导航到另一个web站点，则新页面将于浏览实例中的任何其他页面共享命运

⚠️在单选项卡单进程模型中，当需要安全性时，Chromium仍然强制在选项卡中进行进程交换。如，普通web页面不允许与特权页面(如设置和新选项卡页面)共享进程。因此，该模型在实践中并不比单Web站点实例单进程模型简单多少。

#### 单进程

最后，处于比较的目的，Chromium支持单进程模型，通过`--single-process`命令行开关打开。在这个模型中，浏览器和渲染引擎跑在同一个操作系统进程里。

单进程模型提供了一个衡量多进程架构带来的负荷的基线。这不是一个安全和健壮的架构，任何渲染器的崩溃都会整个浏览器进程挂掉。这只是设计用于测试和开发目的，并且可能包含其他架构中没有的bug。

#### ⚠️警告

以上列出的前两种模型，在现有的Chromium中存在一些还未实现的情况

- **大多数在选项卡中由渲染器发起的导航还不能导致进程交换**。如果用户点击一个链接，提交一个表单，或者被脚本重定向，如果导航是跨站点的，Chromium将不会尝试在选项卡中切换渲染器进程。Chromium只交换浏览器发器的跨站点导航的渲染器进程，例如，在位置栏中输入URL或打开一个书签。因此，来自不同站点的页面可能在相同的进程中渲染，甚至在单Web站点实例单进程和单Web站点单进程模型中也是如此。作为站点隔离项目的一部分，很可能在未来版本的Chromium中发生变化。

  但是，Web页面可以使用一种机制建议链接指向不相关的页面，并且可以在不同的进程中安全地渲染。如果一个链接具有`rel=noreferrer`或`target=_blank`属性，那么Chromium通常会在不同的进程中渲染它

- 子页面目前和它的父页面渲染在相同的进程中。尽管跨站点的子页面没有对它们的父页面的脚本访问，并且可以安全地在单独的进程中渲染，但Chromium还没有在它们自己的进程中渲染它们。与第一个警告相似，这意味着来自不同站点的页面可能在相同进程中渲染。这可能会在未来的版本中修改

- Chromium创建的渲染进程数目有上限。这避免浏览器占用用户电脑太多进程。这个限制和计算机的内存成比例，并且**最多可以有80个进程**。因为这样的限制，一个渲染器可能被分配给多个站点。这种重用现在是随机进行的，但在未来的版本中，Chromium会做一个启发式的策略，智能的把站点分配给渲染器进程

### 沙箱与插件

在每一个多进程架构中，Chromium的渲染器进程都是在一个**沙箱进程中执行**的，这个沙箱进程对用户计算机的访问是有限的。这些进程不能直接访问用户的文件系统、显示或大多数其他资源。相反，它们只能通过浏览器进程访问允许的资源，这可以对该访问施加安全策略。因此，Chromium的浏览器进程可以减轻被利用的渲染引擎所造成的损害。

浏览器插件，如Flash和Silverlight，也在它们自己的进程中执行，有些插件，如Flash，甚至运行在Chromium的沙箱中。在Chromium支持的每个多进程架构中，每种类型的活动插件都有一个进程实例。因此，所有Flash实例都在同一个进程中运行，而不管它们出现在哪个站点或选项卡中。

### Profile架构

2013年六月之后，该段需要更新。

Chromium有许多与Profile挂钩的特性，即一组关于当前用户和当前Chrome会话的数据，这些数据可以跨越多个浏览器窗口。

### 安全浏览

#### 浏览保护

启动安全浏览后，在允许的内容开始加载前，所有的URL都会被检查。URL通过两个列表进行检查：恶意软件和钓鱼网站。根据匹配到的列表，会在一个中转页面显示不同的警告信息。

检查安全浏览数据库是一个多步骤的过程。对URL进行散列(hash)，并对内存中的前缀列表进行同步检查。如果没有找到匹配，则立即认为URL是安全的。如果前缀匹配，则向安全浏览服务器发送异步请求，以获取与该前缀匹配的所有完整散列的列表。返回列表后，将与列表比较完整的散列，URL请求可以继续或取消。

##### 资源处理器

每当请求资源时，ResourceDispatcherHost将创建一个资源处理器的链。对于资源加载中的每个事件，每个处理器可以选择取消请求、延迟请求(在决定做什么之前执行一些异步工作)或继续(让链中的下一个程序有机会决定)。SafeBrowsingResourceHandler是在链的顶端创建的，因此它首先决定是否允许加载资源。如果禁用安全浏览，则SafeBrowsingResourceHandler不会添加到链中，因此不会发生与浏览相关的安全浏览操作。

##### 安全浏览中转页面

当资源被标记为不安全时，资源请求会被暂停，并展示一个中转页面(SafeBrowsingBlockingPage)。用户可以选择继续，这回唤醒资源请求，或者返回，返回将取消资源请求并返回之前的页面。

##### 威胁信息收集

如果中转页面是因为以下威胁列表攻击（包括恶意软件，钓鱼网站，UwS），标签页不处于匿名窗口职工，那么会有一个可选项，让你发送关于这个不安全资源的具体细节，以进行更进一步的分析。

当中转页面出现时，IPC被发送到渲染器进程以收集详细信息，从DOM收集细节。这些数据由一棵URL树组成，有各种frames，iframes，scripts和embeds。

如果用户勾选了忽视中转页面，将在浏览器端异步收集各种额外的详细信息。首先查询历史服务以获取所有url中涉及的重定向列表，然后查询缓存以获得针对这些url的每个请求的头，最后发送报告。

#### 下载保护

##### URL检查

下载检查的操作方式与浏览检查类似，但由于下载的性质不同，有一些更改。在接收到头文件之前，还不知道资源请求是下载，因此所有的下载都要经过浏览检查。出于同样的原因，我们不能像在浏览测试中那样检查重定向URL。相反，重定向链保存在URLRequest对象中，一旦开始下载检查，链中的所有url将同时检查。由于下载比页面加载对延迟的敏感性更低，我们还省去了内存中的数据库和对完整散列结果的缓存。最后，检查是与下载并行进行的，而不是在检查完成之前暂停下载请求，但是在检查完成之前，文件将被赋予一个临时名字。

如果下载被标记为恶意的，下载栏的项目会被替换为一个警告和一个保留或删除该文件的按钮。如果选择删除，下载会被取消，文件被删除。如果保留，文件会被保留并重命名为原来的名字。

##### 散列检查

在下载文件时，我们还计算文件数据的散列。文件下载完成后，将根据下载摘要列表检查此散列。目前，我们正在评估散列检查的有效性，因此不显示UI。

### 沙箱

安全是Chromium最重要的目标之一。安全的关键在于理解：我们只有充分理解系统在所有可能状态下的所有可能输入的组合的行为，才能真正确保系统的安全。**沙箱的目标是提供硬保证，不管输入是什么，最终代码都能或不能做什么。**

沙箱利用操作系统提供的安全性，**允许那些不能对计算机进行持久改变或访问机密信息的代码执行**。沙箱提供的框架和具体保证依赖于操作系统。

#### 沙箱Windows架构

Windows沙箱是一种仅用户模式可用的沙箱。没有特殊的内核模式驱动，用户不需要为了沙箱正确运行而成为管理员。

沙箱在流程级粒度上进行操作。任何需要沙箱的东西都需要独立的进程。**最小沙箱配置有两个进程：一个是称为代理(broker)的特权控制器，一个或多个称为目标(target)的沙箱进程。**沙箱作为静态库提供，必须链接到代理和目标可执行文件。

##### 代理(broker)进程

**在Chromium中，代理总是浏览器进程**。代理，广泛概念里，是一个权限控制器，沙箱进程(目标进程)活动的管理员。代理进程的责任是：

- 为每个目标进程指定策略
- 生成目标进程
- 托管沙箱策略引擎服务
- 托管沙箱拦截管理器
- 托管沙箱IPC服务(到目标进程)
- 代表目标进程执行策略允许的操作

代理应该总是比它生成的所有目标进程活得更久。沙箱IPC是一种低级机制(与Chromium的IPC不同)，用于透明地将某些windows API调用从目标(target)转发到代理(broker):这些**调用根据策略进行评估**。然后，代理执行策略允许的调用，并通过相同的IPC将结果返回给目标进程。**拦截管理器的工作**是修补应该通过IPC转发到代理的windows API调用，**通俗的说就是转发windows API到代理(broker)**。

##### 目标(target)进程

**在Chromium中，目标进程总是渲染器**，除非浏览器进程被指定了`--no-sandbox`命令行参数。目标进程承载所有将在沙箱中运行的代码，以及沙箱基础架构客户端：

1. 所有代码沙箱化

2. 沙箱IPC客户端

3. 沙箱策略引擎客户端

4. 沙箱拦截器

其中2-4是与沙箱代码连接的沙箱库的一部分。

**拦截器(也称为钩子)是通过沙箱IPC将Windows API调用转发到代理的方式**。由代理重新发出API调用并返回结果，或者干脆让调用失败。拦截器+IPC机制不提供安全性；当沙箱中的代码无法修改，应对沙箱限制，它可以提供兼容性。为了节省不必要的IPC，在调用IPC之前，还会在目标进程中对策略进行评估，尽管这不是一种安全保证，而仅仅是一种速度优化。

![broker-target-architecture.png](http://reyshieh.com/assets/broker-target-architecture.png)

#### 沙箱限制

在它的核心中，沙箱依赖于4个Windows机制的保护：

- 限定的令牌(token)
- Windows工作对象
- Windows桌面对象
- Windows Vista及以上：集成层

这些机制在保护操作系统、其配置和用户数据方面非常有效，前提是：

- 所有可保护的资源都具有比null安全描述符更好的安全描述符。换句话说，关键路径没有错误的安全性配置

- 计算机还没有被恶意软件破坏

- 第三方软件不会削弱系统的安全性

#### 沙箱可保护什么，不能保护什么？

沙箱限制了运行在沙箱中的代码的bug的危害。这些bug不能在用户的账号中安装持久性的恶意软件(写入文件系统被限制)。这些bug也不能读取或者从用户的设备中盗取任何文件。

(在Chromium中，渲染器进程时沙箱化的，它们处于保护中。Chromium插件没有运行在沙箱中，因为许多插件的设计基于一个假设：它们对本地系统有着完全的访问权限。另外，Chromium渲染器进程与系统相隔离，但还未与网络相隔离。所以基于域名的数据隔离还未提供)。

沙箱不能为系统组件(比如系统内核正在运行的组件)中的bug提供任何保护。

### 安全架构

大部分当前web浏览器使用一种将用户和网络结合成一个单一保护域的单片结构。在这样的浏览器中，攻击者可以利用任意代码执行漏洞，盗取敏感信息或者安装恶意软件。Chromium有着两个处于独立保护域 的模块：一个是浏览器内核，与操作系统交互，一个是渲染引擎，运行在只有限制权限的沙箱中。这种架构有助于减少高危攻击，而不牺牲与现有网站的兼容性。我们为浏览器漏洞定义了一个威胁模型，并评估了这种架构会如何减少过去的问题。

[Chromium浏览器安全架构](http://seclab.stanford.edu/websec/chromium/chromium-security-architecture.pdf)

### 线程

Chromium是多线程的。尽量的让UI能够快速响应，这意味着任何阻塞I/O或者其他昂贵的操作都不能阻塞UI线程。解决这个问题的做法是**在线程间传递消息作为通信的方式**。不鼓励使用功能锁和线程安全对象。相反的，对象只存在于单个线程中，通过消息的方式在线程之间传递消息，会在大多数跨进程请求间使用回调接口(由消息传递实现)。

#### 术语

- **线程不安全**（Thread-unsafe）：Chromium中的绝大多数类型在设计上都是线程不安全的。对这类类型/方法的访问必须同步，通常通过base::SequencedTaskRunner的访问进行排序(应该由SEQUENCE_CHECKER强制执行)或者通过低级同步处理(如锁，但更好的是序列)。
- **线程仿射**（Thread-affine）: 此类类型/方法需要始终从相同的物理线程(即从相同的base::SingleThreadTaskRunner)访问，并且应该使用THREAD_CHECKER来验证它们。除了使用第三方API或具有线程仿射的叶子依赖项之外:在Chromium中，几乎没有理由使用线程仿射类型。注意，base::SingleThreadTaskRunner是- base::SequencedTaskRunner，因此线程仿射是线程不安全的子集。线程仿射有时也被称为线程敌对（Thread-hostile）。
- **线程安全**（Thread-safe）：此类类型/方法可以被安全并行访问。
- **线程兼容**（Thread-compatible）: 此类类型提供了对const方法的安全并发访问，但需要对非const(或混合const/非const访问)进行同步。Chromium不暴露读写锁;因此，这种方法的唯一用例是对象(通常是全局对象)，它们以线程安全的方式初始化一次(在单线程启动阶段或通过线程安全的静态局部初始化范式(如base::NoDestructor)进行延迟)，并在不可变之后永久初始化。
- **不可变的**（Immutable）: 线程兼容类型的子集，在构造之后不能修改。
- **序列友好型**（Sequence-friendly）: 此类类型/方法是线程不安全类型，支持从base::SequencedTaskRunner调用。理想情况下，这是所有线程不安全类型的情况，但是遗留代码有时会进行过分热心的检查，在仅仅是线程不安全的场景中强制执行线程相关性。

#### 线程

每个Chrome进程都有：

- 一个主线程
  - 浏览器进程中：用于更新UI
  - 渲染进程中：运行大部分的Blink
- 一个IO线程
  - 浏览器进程中：处理IPC和网络请求
  - 渲染进程中：处理IPC
- 一些特殊目的的线程
  - file_thread: 一个用于文件操作的普通线程。当想要阻塞文件系统的操作(例如，为某种文件类型请求icon，或者向磁盘写下载文件)，分配给这个线程
  - db_thread: 用于数据库操作的线程。例如，cookie服务在这个线程上执行sqlite操作
- 通用线程池

大多数线程都有一个循环，从队列获取任务并运行它们(队列可以在多个线程之间共享)。

若干个组件有它们自己的线程：

- History：历史记录服务有它自己的线程。之后可能会和db_thread合并。需要保证按照正确的顺序发生。例如，cookie在历史记录前会先被加载，因为首次加载需要cookie，历史记录初始化需要很长时间，会阻塞cookie的加载
- Proxy services
- Automation proxy: 这个线程用于和驱动应用的UI测试程序通信

## UI Framework

### UI开发实践

#### 内容区域(在Tab中的UI)

在桌面平台中，这部分存在于内容区域的UI应该用**HTML技术**实现(在Android和iOS中，可以用web或native实现)。该HTML既可以是WebUI，也可以使与Chrome捆绑的普通HTML和JS。它应该在没有连接和低保真的情况下工作。

#### 非内容区域(弹出层或Chrome浏览器中的UI)

在非内容区域部分的UI应该用C++实现(windows/Linux/ChromeOS)。在Mac中用Cocoa实现。

#### 在任意页面上操作DOM

一些特性需要检查或修改当前选项卡的DOM，可以是任意站点。Blink的Web* c++ API意图简单和局限于指导在实际的情况下使用它。当Blink的c++ API不能实行时，使用隔离的脚本注入。注入的脚本应该尽可能精简，并且不应该包含任何处理其他浏览器的代码(例如闭包)。

由于脚本注入会带来运行时和内存成本，因此期望它是由具有工作预期的用户操作驱动的。一个很好的例子就是“翻译”。如果需要检查用户可能打开的每个页面，则不建议使用脚本注入。对于这种情况，请咨询chrome-eng-review@以获得适当的解决方案。例如，reader模式将触发逻辑从脚本注入转换为本机实现。

#### 原型化和探索解决方案空间

实验可以通过扩展来完成。非机密特性可以在Chrome Web Store上发布，并手动安装以进行早期测试。机密的扩展只能为受信任的测试人员启用，因此它们对公众是不可见的。扩展可以使用内容脚本进行脚本注入，也可以使用页面操作和浏览器操作在内容区域之外提供UI。扩展还可以使用NaCL，它可以完全访问Pepper API。

组件扩展(也就是自动安装到Chrome中的扩展)也是一个原型选项，但是应该只在常规扩展无法完成的需求时才使用。扩展应该只在显式的用户操作上执行，而不是在启动时执行。应该避免使用持久的背景页面。事件页面应该只用于不常见的项目，如推送消息、硬件事件、警报等，而不是常见的事件，如导航。如果您需要做一些施加恒定负载的事情，或者需要更新每个导航的状态，请咨询extensions团队;它们可能能够提供一个声明性API，以便在低影响的情况下完成这项工作。如果做不到这一点，如果您需要偏离这些指导方针，请咨询chrome-eng-review@。

### Views framework

Windows为构建用户界面提供了非常原始的工具。该系统提供了一些基本控件和本地窗口容器，但是构建自定义用户界面非常困难。由于我们希望对Chromium有不同的审美，我们不得不在Windows上构建一个框架来加速定制UI的开发。这个系统叫做**视图（views）**。

视图是一种渲染系统，与WebKit或Gecko中用于渲染web页面的系统类似。**用户界面由称为视图的组件树构成**。这些**视图负责渲染、布局和事件处理**。树中的每个视图表示UI的不同组件。类似的是HTML文档的层次结构。

视图层次结构的根是一个**部件(Widget)**，它是一个本机窗口。本机窗口接收来自窗口的消息，将其转换为视图层次结构可以理解的内容，然后将其传递给RootView。然后，RootView开始将事件传播到视图层次结构中。

**绘画(Painting)**和**布局(layout)**是用类似的方法完成的。视图树中的视图有它自己的边界(通常通过它包含的视图的布局方法赋予它边界)，因此当它被请求绘制时，它绘制到一个剪切其边界的画布中，渲染的原点被转换到视图的左上角。当**部件(widget)**接收到绘制消息时，整个视图树的渲染将被完成到一个单独的画布中，并由部件拥有。呈现本身是使用**Skia**和**GDI**调用的组合来完成的——GDI用于文本，Skia用于其他所有内容。

然而，Chromium的UI中的几个UI控件并不使用视图渲染。相反，它们是驻留在一种特殊视图中的本机窗口控件，这种视图知道如何显示和调整本机部件的大小。它们用于按钮、表、单选按钮、复选框、文本字段和其他此类控件。由于它们使用本机控件，这些视图也不是特别可移植，除非是在API中。

除了特定于平台的渲染代码、基于系统指标大小的代码等等，视图系统的其他部分并不是不可移植，因为大多数渲染都是使用跨平台的**Skia库**完成的。由于历史原因，视图的许多功能都采用Windows或ATL类型，但是我们后来用许多平台独立类型增强了ui/gfx/，最终我们可以用这些类型来替换它们。

### [Aura](https://www.chromium.org/developers/design-documents/aura)

### 本地控件

尽管视图为自定义布局、渲染和事件处理提供了便利，但在许多情况下，我们还是希望使用宿主操作系统(Windows)提供的控件。这是因为这些小部件已经具有许多理想的属性:反映最新和最好的主机操作系统的系统本机外观(例如，在Windows Vista上使用与Windows XP相同的Win32 API，本机按钮在高亮显示时接收辉光动画)、对可访问性的处理、焦点等。使用视图和Skia实现新控件是可能的，但是复制所有这些功能需要很长时间，而且我们还必须为每个新的操作系统版本更新它。因此，对于UI中不需要特别定制外观的部分，我们回到了原生控件。

#### 历史抽象

以前，原生控件(NativeControls)的使用如下：

![NativeControlHistoric2.png](http://reyshieh.com/assets/NativeControlHistoric2.png)

基类NativeControl是所有NativeControl(如按钮、复选框、树视图等)的根。这个视图子类是特定于windows的，它有一个子视图HWNDView。这个HWNDView承载一个HWND (NativeControlContainer)，它是实际的本地控件HWND的父控件。父节点负责接收从子节点HWND(例如WM_COMMAND, WM_NOTIFY等)发送的消息，并将这些消息转发回NativeControl。这种带有附加HWND的结构被认为是必要的，因为分类的Windows公共控件通过向父窗口发送消息向客户机应用程序发送消息通知。当Chrome有几种不同的ViewContainer/根小部件类型时，在NativeControl级别封装这种处理是有意义的。如今，只需要关心一种根HWND类型——WidgetWin，因此让它接收控制通知并将其转发回NativeControl比携带所有这些额外的HWND更有意义。

这种抽象的另一个问题是，Chrome有很多不同类型的按钮。因为NativeButton没有与其他按钮基类(BaseButton)共享基类，所以大多数API最终都略有不同。最好共享一个基类，然后在派生类中实现任何特定于本机按钮的方法。然而，由于这种结构，这是不可能的。

最后要注意的一点是:一些NativeControl子类(如复选框)是系统本机控件和视图组件的组合。要在复选框的文本标签后面获得适当的透明呈现，复选框有两个子视图——一个是仅呈现复选标记部分的本机windows控件的子视图，另一个是呈现文本的视图::label子视图。这种结构必须适应本设计的任何拟议修改。

#### 提议设计

![NativeControl.png](http://reyshieh.com/assets/NativeControl.png)

NativeButton是从按钮基类派生出来的类，就像其他按钮类一样(例如TextButton等)。它覆盖了需要与本机控件交互的各种方法，例如使按钮在对话框中显示为默认按钮等。有趣的是NativeButton本身就是跨平台代码。实现本机控件的特定于平台的详细信息封装在与平台无关的NativeControl接口后面，在本例中，该接口由一个新类NativeControlWin实现，它是HWNDView的子类，托管实际的Windows本机控件。我们通过在附加的HWND上存储一个指向NativeControlWin的指针来避免这里有一个额外的HWND，并且让WidgetWin中的消息处理程序尝试将消息直接转发给NativeControlWin，如果它找到这样的关联的话。NativeButton实现一个侦听器接口，该接口接收来自NativeControl实现的关于从操作系统接收的消息的高级通知。

由于NativeControl是接口而不是类，因此它必须为要作为NativeButton、复选框或其他视图的子视图提供GetView访问器。

通过这种方式，NativeButton可以与其他按钮类型共享基类。对于其他本机控件，也可以存在类似的关系，例如滚动条、树视图等。

### Chromium Graphics // Chrome GPU

#### 概述

##### 技术内容

开始于[GPU accelerated compositing in Chrome(Chrome的GPU加速合成)](https://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome)概述，包括了原始的非加速路径概述

查看功能开发的当前状态，可以看[GPU architecture roadmap](https://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome/gpu-architecture-roadmap)

##### 演示文稿

- List of [Googler-only presentation slides and videos](http://go/gpu-tech-talk-schedule)

- [Life of a Pixel](http://bit.ly/chromium-loap)
- [Surface Aggregation](https://docs.google.com/presentation/d/14FlKgkh0-4VvM5vLeCV8OTA7YoBasWlwKIJyNnUJltM) [[googler-only video](https://drive.google.com/file/d/0BwPS_JpKyELWTURjMS13dUJxR1k/view)]
- [History of the World of Chrome Graphics part 1](https://docs.google.com/presentation/d/1dCfAxJYIgYlnC49SH3hIeyQVIlkbPPb9QRsKfp-6P0g/edit) [[googler-only video](https://drive.google.com/file/d/0BwPS_JpKyELWUUhvUHctT1QzNDA/view)]
- [Blink Property Trees](https://docs.google.com/presentation/d/1ak7YVrJITGXxqQ7tyRbwOuXB1dsLJlfpgC4wP7lykeo) [[googler-only video](https://drive.google.com/file/d/0BwPS_JpKyELWUE1lRWxPXzQtdE0/view)]
- [Compositor Property Trees](https://docs.google.com/presentation/d/1V7gCqKR-edNdRDv0bDnJa_uEs6iARAU2h5WhgxHyejQ) [[googler-only video](https://drive.google.com/file/d/0BwPS_JpKyELWTTJ5aWNfenhPQ0k/view)]
- [The compositing stack after Surfaces/Display compositor](https://docs.google.com/presentation/d/1ou3qdnFhKdjR6gKZgDwx3YHDwVUF7y8eoqM3rhErMMQ/edit#slide=id.p)
- [Tile Management](https://docs.google.com/presentation/d/1gBYqSX92dMHa_UFek3F0D0g4-dt8xvRq0hIifC2IS7Y/edit#slide=id.p) [[googler-only video](https://drive.google.com/a/google.com/file/d/0B5eS4VhPbSBzUmZ2UVNZTm1wZmM/view?usp=sharing) and [notes](https://docs.google.com/document/d/16vWNxkI54E3swcq1IQvDR-LsPLXfhtlNh6Rbkbro2fI/edit#heading=h.57tap1txoipr)]
- [Impl-side painting](https://docs.google.com/a/chromium.org/presentation/d/1nPEC4YRz-V1m_TsGB0pK3mZMRMVvHD1JXsHGr8I3Hvc) [[googler-only video](http://go/implside-painting-talk-video)]
- [TaskGraphRunner and raster task scheduling](https://docs.google.com/presentation/d/1dsPwTzJKaLPfd1wMwRkXz--5PqCa43n5L2_EhJ-Qb-g/edit#slide=id.g4dfba32bf_097) [[googler-only video](https://drive.google.com/a/google.com/file/d/0BwPS_JpKyELWYXBVUDNfa2VLa3c/view) and [notes](https://docs.google.com/document/d/16vWNxkI54E3swcq1IQvDR-LsPLXfhtlNh6Rbkbro2fI/edit#heading=h.e1xk0xwayrkn)]
- [Checkerboards: Scheduling Compositor Input and Output](https://docs.google.com/presentation/u/2/d/1IaMfmCDspmpQwA1IGF6MP6XjuXwb2daxopAUwvgDOxM/edit#slide=id.p) [[googler-only video](https://drive.google.com/a/google.com/file/d/0BwPS_JpKyELWQzlIckRsTFRHRDg/view) and [notes](https://docs.google.com/document/d/16vWNxkI54E3swcq1IQvDR-LsPLXfhtlNh6Rbkbro2fI/edit#heading=h.wjy9kg2zq8rl)]
- [Compositor and Display Scheduling](https://docs.google.com/presentation/d/1FpTy5DpIGKt8r2t785y6yrHETkg8v7JfJ26zUxaNDUg/edit?usp=sharing) [[googler-only video](https://drive.google.com/a/google.com/file/d/0B_got0batQ0TUDJsUFRPeWVOcEk/view?usp=sharing) and [notes](https://docs.google.com/document/d/16vWNxkI54E3swcq1IQvDR-LsPLXfhtlNh6Rbkbro2fI/edit#heading=h.klitp6r86anv)]
- [Gpu Scheduler](https://docs.google.com/a/chromium.org/presentation/d/1QPUu0Nb2_nANLE8VApdMzzrifA6iG_BDG9Cd2L4BFV8/edit?usp=sharing) [[googler-only video](https://drive.google.com/a/google.com/file/d/0BwPS_JpKyELWb0k0NmNURU1uclk/view) and [notes](https://docs.google.com/document/d/16vWNxkI54E3swcq1IQvDR-LsPLXfhtlNh6Rbkbro2fI/edit#heading=h.lnpsv7tfpoew)]
- [Image Decoding](https://docs.google.com/document/d/13UsG1IVEIqRg5yaQ9ZmF7dXQprI6KCrSy82CK7Xwfkw/edit) [[googler-only video](https://drive.google.com/a/google.com/file/d/0BwPS_JpKyELWMEdQdlE2M29JUm8/view) and [slides](https://docs.google.com/presentation/d/1qLgH323yzj5yb9S7mJVmTxXtzsLyYjwgyeuJrgfLDgw/edit#slide=id.p)]
- [Native one-copy texture uploads for ChromeOS](https://01.org/blogs/2016/native-one-copy-texture-uploads-for-chrome-OS)
- [Tessellated GPU Path Rendering](https://docs.google.com/presentation/d/1tyroXtcGwOvU1LPFxVU-vtBiDkLTcxZ62v2S9wqZ77w/edit#slide=id.p)
- [Tessellating Edge-AA GPU Path Rendering](https://docs.google.com/presentation/d/1DpM5QS6kCkIqQN034Zz6oFm201Gd2wvq6Z30QfWNhcA/edit?usp=sharing)
- [WebGL 2.0 Updates](https://www.khronos.org/webgl/wiki/Presentations#September_2016_WebGL_Meetups) [[googler-only presentation](https://docs.google.com/a/google.com/presentation/d/1_V_vDLTTpx7XX7_P2J-Nehy-adhdRJItiN-4Pm9QGHQ/edit?usp=sharing)]
- [Background on color spaces](https://docs.google.com/presentation/d/1c4zjeWDEpHG36gCPZmXjCH7Rlp5_N9p1qyHRIe0AALY/edit?usp=sharing) [[googler-only video](https://drive.google.com/file/d/0B6kh5pYRi1dKWGMtaFU2MkZIVjQ/view?usp=sharing)]
- [Global Memory Coordination](https://docs.google.com/presentation/d/1H2TN3DMRBlOWrpMqqkWlYeKuc7ecGH4-3tr4zqH5LdQ/edit?usp=sharing)
- [The RenderSurfaceLayerList data structure](https://docs.google.com/a/chromium.org/presentation/d/11f3A8cdfSSKmYazetxy9ochHuHqsmSEk3RW3DTYBDIc)
- [OOP-D: Out-of-Process Display Compositor Talk](https://docs.google.com/presentation/d/1PfaIDZ5oJTEuAEJR8aj-B9QC-r1Pht_jQXwjifM1jQI/edit?usp=sharing)
- [OOP-D: Out-of-Process Display Compositor Design Doc](https://docs.google.com/document/d/1tFdX9StXn9do31hddfLuZd0KJ_dBFgtYmxgvGKxd0rY/edit?usp=sharing)

##### 主要设计文档

- [Graphics and Skia](https://www.chromium.org/developers/design-documents/graphics-and-skia)
- [Aura](https://www.chromium.org/developers/design-documents/aura-desktop-window-manager)
- [Threaded compositing](http://dev.chromium.org/developers/design-documents/compositor-thread-architecture)
- [Impl-side painting](http://www.chromium.org/developers/design-documents/impl-side-painting)
- [Zero-input latency scheduler](https://docs.google.com/a/chromium.org/document/d/1LUFA8MDpJcDHE0_L2EHvrcwqOMJhzl5dqb0AlBSqHOY/edit)
- [GPU Accelerated Rasterization](https://docs.google.com/a/chromium.org/document/d/1Vi1WNJmAneu1IrVygX7Zd1fV7S_2wzWuGTcgGmZVRyE/edit#heading=h.7g13ueq2lwwd)
- [Property trees](https://docs.google.com/document/d/1VWjdq8hCJlNbak5ZyAsnLh-0--Hl_wht0xyuagODl8A/edit#heading=h.tf9gh6ldf3qj)
- Motivation for property trees: [Compositing Corner Cases](https://docs.google.com/document/d/1hajeBrjGuVG8EtDwyiQnV36oP_1mC8DO8N_7e61MiiE/edit#)
- [Unified BeginFrame scheduling](https://docs.google.com/document/d/13xtO-_NSSnNZRRS1Xq3xGNKZawKc8HQxOid5boBUyX8/edit#)

##### 更多设计文档

- [Video playback and the compositor](https://www.chromium.org/developers/design-documents/video-playback-and-compositor)

- [RenderText and Chrome UI text drawing](https://www.chromium.org/developers/design-documents/rendertext)

- [GPU Command Buffer](https://www.chromium.org/developers/design-documents/gpu-command-buffer)

- [GPU Program Caching](https://docs.google.com/a/chromium.org/document/d/1Vceem-nF4TCICoeGSh7OMXxfGuJEJYblGXRgN9V9hcE/edit)

- [Surfaces](https://www.chromium.org/developers/design-documents/chromium-graphics/surfaces) (New delegated rendering)

- [Ubercompositor](https://docs.google.com/a/chromium.org/document/d/1ziMZtS5Hf8azogi2VjSE6XPaMwivZSyXAIIp0GgInNA/edit) (Old delegated rendering)

- [16 bpp texture support](https://docs.google.com/a/chromium.org/document/d/1TebAdNKbTUIe3-46RaEggT2dwGIdphOjyjm5AIGdhNw/edit)

- [Image Filters](https://www.chromium.org/developers/design-documents/image-filters)

- [Synchronous compositing for Android WebView](https://docs.google.com/a/chromium.org/document/d/1jw9Xyuovw32NR73u6uQEVk7-fxNtpS7QWAoDMJhF5W8/edit)

- [Partial Texture Updates](https://docs.google.com/a/chromium.org/document/d/1yvSVVgJ8bFyWjXGHpb8wDNtGdx8W5co7W0gbzjdFRj0)

- [ANGLE WebGL 2 Planning](https://docs.google.com/document/d/1MkJxb1bB9_WNeCViVZ4bf4opCH_NhqFn049xGq6lf4Q/edit?usp=sharing)

- [Asynchronous GPU Rasterization](https://docs.google.com/a/chromium.org/document/d/1MAUJrOGMuD56hV4JhKp5bTgDv3d9rXRbAftviF8ZmWE/edit?usp=sharing) (Client side of GPU scheduling)

- [Color correct rendering support](https://docs.google.com/document/d/1BMyXXTmiAragmt5ukVBIIOLDthd7JcJBgGMt-PwuTHY/edit#)

- [PictureImageLayer and Directly Composited Images](https://docs.google.com/document/d/1sMGAkWhhZT8AfXCAfv4RjT1QxQnkpYKNFW6VXHB7kKk/edit#)

- [Discardable GPU Memory](https://docs.google.com/document/d/1LoNv02sntMa7PPK-TZTuMgc3UuWFqKpOdEqtFvcm_QE/edit?usp=sharing)

- [GL Command Buffer Extensions](https://chromium.googlesource.com/chromium/src/gpu/+/master/GLES2/extensions/CHROMIUM)

- - [Mailbox Extension](https://chromium.googlesource.com/chromium/src/gpu/+/master/GLES2/extensions/CHROMIUM/CHROMIUM_texture_mailbox.txt)

- [cc::Surfaces for Videos](https://docs.google.com/document/d/1tIWUfys0fH2L7h1uH8r53uIrjQg1Ee15ttTMlE0X2Ow/edit#)

- [Command Buffer Multi Flush](https://docs.google.com/document/d/1mvX3VGIrlWtIP8ZBJdzPp9Nf-7TfnrN-cyPy6angVU4/edit)

- [Lightweight GPU Sync Points (SyncTokens)](https://docs.google.com/document/d/1XwBYFuTcINI84ShNvqifkPREs3sw5NdaKzKqDDxyeHk/edit)

- [Gpu Service Scheduler](https://docs.google.com/document/d/1AdgzXmJuTNM2g4dWfHwhlFhs5KVe733_6aRXqIhX43w/edit#heading=h.o5mpe5uzxfv0)

- [Expected Power Savings from Partial Tree Updates](https://drive.google.com/file/d/1KyGuiUm5jm50zsAKmaxAHcFclfbOhHVd/view)

##### 其他一些有趣的链接

- [How to get Ganesh / GPU Rasterization](https://www.chromium.org/developers/design-documents/chromium-graphics/how-to-get-gpu-rasterization)

- [Rendering Architecture Diagrams](https://www.chromium.org/developers/design-documents/rendering-architecture-diagrams)

- Blink:

- - [Presentation about Blink / Compositor interaction](https://docs.google.com/a/chromium.org/presentation/d/1dDE5u76ZBIKmsqkWi2apx3BqV8HOcNf4xxBdyNywZR8/edit#slide=id.p)
  - [Blink phases of rendering](https://docs.google.com/a/chromium.org/document/d/1jxbw-g65ox8BVtPUZajcTvzqNcm5fFnxdi4wbKq-QlY/edit#heading=h.rxj0p5cgef9y)
  - [How repaint works](https://docs.google.com/a/chromium.org/document/d/1jxbw-g65ox8BVtPUZajcTvzqNcm5fFnxdi4wbKq-QlY/edit#heading=h.rxj0p5cgef9y)

- [Presentation on ANGLE architecture and plans](https://docs.google.com/presentation/d/1CucIsdGVDmdTWRUbg68IxLE5jXwCb2y1E9YVhQo0thg/pub?start=false&loop=false)

- [Debugging Chromium with NVIDIA's Nsight](https://www.chromium.org/developers/design-documents/chromium-graphics/debugging-with-nsight)

- [Chromium WebView graphics slides](https://docs.google.com/a/chromium.org/presentation/d/1pYAGn2AYJ7neFDlDZ9DmLHpwMIskzMUXjFXYR7yfUko/edit)

- [GPU Triage Guide](https://docs.google.com/document/d/1Sr1rUl2a5_RBCkLtxfx4qE-xUIJfYraISdSz_I6Ft38/edit#heading=h.vo10gbuchnj4)

#### Chrome的GPU加速合成

##### 为什么用硬件合成？

传统来说，web浏览器完全依赖于CPU渲染web页面内容。即使是最小的设备，功能强大的gpu也是不可或缺的一部分，人们的注意力被转移到寻找一种方式，能更有效地利用这种底层硬件来取得更好的展示和节省电。使用GPU合成web页面的内容产生了显著的提速。

硬件合成的好处有三个:

- 在绘图和涉及大量像素的合成操作中，GPU上的页面层合成可以比CPU(在速度和功耗方面)获得更高的效率。硬件是专门为这些类型的工作负载设计的。

- 对于GPU上已经存在的内容(如加速视频、Canvas2D或WebGL)，不需要昂贵的回读。

- CPU和GPU之间的并行性，可以同时运行，创建一个高效的图形流水线。

##### 第一部分 Blink渲染基础

为了理解GPU加速在Chrome中的工作原理，首先理解Blink渲染页面的基本构造块是很重要的。

###### 节点和DOM树(Nodes and the DOM tree)

在Blink中，web页面的内容被当做节点对象树(称为DOM树)存储。页面中的每个HTML元素以及元素之间的文本是以节点的形式关联的。DOM树的顶级节点总是Document节点。

###### 从节点到RenderObjects(From Nodes to RenderObjects)

生成可视化输出的DOM树中的每个节点都有一个对应的RenderObject。RenderObjects被存储在一个平行的树结构，称为Render树。RenderObject知道如何在显示面上绘制节点的内容。它通过向GraphicsContext发出必要的draw调用来实现这一点。GraphicsContext负责将像素写入位图，最终显示在屏幕上。在Chrome中，GraphicsContext封装了我们的2D绘图库Skia。

传统上，大多数GraphicsContext调用都变成对SkCanvas或SkPlatformCanvas的调用，即立即绘制成软件位图。但是为了将绘画移出主线程，现在将这些命令记录到SkPicture中。SkPicture是一个可序列化的数据结构，它可以捕获并稍后重播命令，类似于显示列表。

###### 从RenderObejcts到RenderLayers

每个RenderObject都直接或间接地通过一个祖先RenderObject与一个RenderLayer相关联。

共享相同坐标空间的RenderObjects(例如，受到相同CSS转换的影响)通常属于相同的RenderLayer。渲染层的存在使页面的元素以正确的顺序组合，以正确的方式显示重叠的内容、半透明的元素等。有许多条件将触发为特定RenderObejct创建新的RenderLayer，如RenderBoxModelObject::requiresLayer()中定义的那样，并覆盖一些派生类。RenderObject的常见情况，保证创建RenderLayer:

- 它是页面的根对象
- 它具有显式的CSS位置属性(相对、绝对或转换)
- 它是透明的
- 是否有溢出、alpha掩码或反射
- 有一个CSS过滤器
- 对应于具有3D (WebGL)上下文或加速2D上下文的<canvas>元素
- 对应于一个<video>元素

