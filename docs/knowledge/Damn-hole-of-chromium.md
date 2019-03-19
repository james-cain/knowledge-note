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

生成可视化输出的DOM树中的每个节点都有一个对应的RenderObject。RenderObjects被存储在一个平行的树结构，称为Render树。RenderObject知道如何在显示面上绘制节点的内容。它通过向GraphicsContext发出必要的draw调用来实现这一点。**GraphicsContext负责将像素写入位图，最终显示在屏幕上**。**在Chrome中，GraphicsContext封装了我们的2D绘图库Skia。**

**传统上，大多数GraphicsContext调用都变成对SkCanvas或SkPlatformCanvas的调用，即立即绘制成软件位图**。但是**为了将绘画移出主线程，现在将这些命令记录到SkPicture中。SkPicture是一个可序列化的数据结构，它可以捕获并稍后重播命令，类似于显示列表。**

###### 从RenderObejcts到RenderLayers

每个RenderObject都直接或间接地通过一个祖先RenderObject与一个RenderLayer相关联。

共享相同坐标空间的RenderObjects(例如，受到相同CSS转换的影响)通常属于相同的RenderLayer。RenderLayers的存在使页面的元素以正确的顺序组合，以正确的方式显示重叠的内容、半透明的元素等。有许多条件将触发为特定RenderObejct创建新的RenderLayer，如RenderBoxModelObject::requiresLayer()中定义的那样，并覆盖一些派生类。以下的RenderObject，会创建RenderLayer:

- 它是页面的根对象
- 它具有显式的CSS位置属性(相对、绝对或转换)
- 它是透明的
- 是否有溢出、alpha掩码或反射
- 有一个CSS过滤器
- 对应于具有3D (WebGL)上下文或加速2D上下文的<canvas>元素
- 对应于一个<video>元素

RenderLayers也是一个树层次结构。根节点与页面的根元素对应的渲染层，每个节点的后代都是包含在父层中的可视层。每个RenderLayer的子层都保持为两个排序的列表，都是按升序排序的。

每个 RenderLayer 对象可以想象成图像中一个图层，各个图层叠加构成了一个图像。浏览器会遍历 **RenderLayer tree**，再遍历从属这个 RenderLayer 的 RenderObject，RenderObject 对象存储有绘制信息，并进行绘制。RenderLayer 和 RenderObject 共同决定了最终呈现的网页内容，**RenderLayer tree** 决定了网页的绘制的层次顺序，而从属于 RenderLayer 的 RenderObject 决定了该 RenderLayer 的内容。

###### Rendering(渲染方式)

浏览器在完成构建RenderLayer tree之后，会使用图形库将其构建的渲染模型绘制出来，分为两个阶段：

- 绘制：将从属每个 RenderLayer 图层上的 RenderObject 绘制在其 RenderLayer 上。即绘制（Paint）或者光栅化（Rasterization），将一些绘图指令转换成真正的像素颜色值。
- 合成(compositing)(**GPU**)：将各个 RenderLayer 图层合并成到一个位图(Bitmap)中。同时还可能包括位移（Translation），缩放（Scale），旋转（Rotation），Alpha 合成等操作。

###### 渲染方式

- **软件渲染方式**：使用 **CPU** 来绘制每个 RenderLayer 图层的内容(RenderObject)到一个位图，即一块 **CPU 使用的内存空间**。绘制每一层的时候都会使用该位图，区别在于绘制的位置可能不一样，绘制顺序按照从后到前。**因此软件渲染机制是没有合成阶段的**。
- 硬件加速渲染的合成化渲染方式：使用 GPU 来绘制所有合成层，并使用 GPU 硬件来加速合成。
- 软件绘图的合成化渲染方式： 某些合成层使用 CPU 来绘图，另外一些使用 GPU 来绘制。对于使用 CPU 来绘制的图层，该层的绘制结果会先保存在 CPU 内存中，之后会被传输到 GPU 内存中，然后再使用 GPU 来完成合成工作。

第二种和第三种渲染方式，都是使用了合成化渲染技术，合成工作也都是由 GPU 来做。对于常见的 2D 绘图操作，使用 GPU 来绘图不一定比使用 CPU 绘图在性能上有优势，例如绘制文字、点、线等。原因是 CPU 的使用缓冲机制有效减少了重复绘制的开销而且不需要考虑与 GPU 并行。另外，GPU 的内存资源相对 CPU 的内存资源来说比较紧张，而且网页的分层使得 GPU 的内存使用相对比较多。

###### 从RenderLayers到GraphicsLayers

软件渲染而言，到 **RenderLayer tree** 就结束了。但是，对于硬件渲染来说，在 **RenderLayer tree** 之后，浏览器渲染引擎为硬件渲染提供了更多的内部结构来支持这个机制。

**为了使用合成器，一些RenderLayers有它们自己的GraphicsLayer**(如果他是一个合成层(compositing layer))。

每个GraphicsLayer都有一个GraphicsContext，用于将相关的渲染层绘制到其中。在随后的合成过程中，合成程序最终负责将GraphicsContexts的位图输出组合到一个最终的屏幕图像中。

在当前的Blink实现中，以下的情况会使RenderLayer带有自己的合成层(compositing layer)：

- 图层带有3D或透视 tranform CSS属性
- 图层使用加速video解码的video元素
- 图层使用带有3D上下文或加速2D上下文的canvas元素
- 图层使用合成插件
- 图层使用css 动画进行不透明度，或者使用webkit动画 tranform
- 图层使用加速CSS过滤器

![GraphicsLayer-composition.png](http://reyshieh.com/assets/GraphicsLayer-composition.png)

不过并不是拥有独立缓存的 RenderLayer 越多越好，太多拥有独立缓存的 RenderLayer 会带来一些严重的副作用:

- 它大大增加了内存的开销，这点在移动设备上的影响更大，甚至导致浏览器在一些内存较少的移动设备上无法很好地支持图层合成加速；
- 它加大了合成的时间开销，导致合成性能的下降，而合成性能跟网页滚动/缩放操作的流畅度又息息相关，最终导致网页滚动/缩放的流畅度下降，让用户觉得操作不够流畅。

###### 从GraphicsLayers到WebLayers再到CC layers

###### 图层压缩

为了防止“层爆炸”，当许多元素位于具有直接合成原因的层的顶部时，Blink将多个渲染层重叠在一个直接合成原因的渲染层上，并将它们“挤压”到一个单独的后备存储中。这可以防止重叠引起的层爆炸。

###### 总结

- DOM树，基本的保留模型
- RenderObject树，与DOM树的可见节点有1: 1的映射RenderObjects知道如何绘制响应的DOM节点
- RenderLayer树，由RenderObject树上的renderObject组成。映射为多对一，因为每个renderObject要么与它的renderLayer关联，要么与它的第一个祖先的renderLayer关联
- GraphicsLayers树，映射GraphicsLayers一对多renderLayers

![the_compositing_forest.png](http://reyshieh.com/assets/the_compositing_forest.png)

##### 第二部分 合成器(compositor)

Chrome的合成器是管理GraphicsLayer树和协调帧生命周期的软件库

###### 介绍合成器

渲染分为两个阶段:首先是**绘制**，然后是**合成**。这允许合成器在每个合成层的基础上执行额外的工作。例如，在合成层的位图之前，合成器负责对每个合成层的位图应用必要的转换(由层的CSS转换属性指定)。此外，由于图层的绘制与合成是解耦的，因此禁用其中一个图层只会重新绘制该图层的内容并重新合成。

###### GPU到哪里？

那么GPU是如何发挥作用的呢?合成程序可以使用GPU来执行它的绘图步骤。这与旧的软件渲染模型有很大的不同，在旧的软件渲染模型中，渲染器进程(通过IPC和共享内存)将带有页面内容的位图传递给浏览器进程进行显示。

在硬件加速架构中，通过调用特定平台的3D api (Windows上的D3D;GL其他地方)。**渲染器的合成器本质上是使用GPU将页面的矩形区域(即所有的合成层(compositor layer)，根据层树的转换层次结构相对于视图的位置)绘制成一个位图**，这就是最终的页面图像。

###### GPU进程

受其沙箱的限制，Renderer进程(包含Blink和cc的实例)不能直接调用OS (GL / D3D)提供的3D api。因此，我们使用一个单独的进程来访问设备。我们称这个进程为GPU进程。**GPU进程是专门设计用来从渲染器沙箱或更严格的本地客户端“监狱”中访问系统的3D api**。它通过一个客户端-服务器模型工作如下:

- 客户机(在渲染程序中或在NaCl模块中运行的代码)不直接发出对系统api的调用，而是将它们序列化，并将它们放在驻留在它自己和服务器进程之间共享的内存中的环形缓冲区(ring buffer)(**命令缓冲区, command buffer**)中。

- 服务器(GPU进程运行在一个限制较少的沙箱中，允许访问平台的3D api)从共享内存中获取序列化命令，解析它们并执行适当的图形调用。

![the_gpu_process.png](http://reyshieh.com/assets/the_gpu_process.png)

- 命令缓冲区(The Command Buffer)

  GPU进程接受的命令与GL ES 2.0 API的模式非常接近(例如，有一个与glClear对应的命令，一个与glDrawArrays对应的命令，等等)。由于大多数GL调用没有返回值，客户机和服务器可以异步工作，这使得性能开销相当低。客户机和服务器之间的任何必要同步，例如客户机通知服务器有额外的工作要做，都是通过IPC机制处理的。

  从客户机的角度看，应用程序可以选择直接将命令写入命令缓冲区，或者通过我们提供的客户机端库使用GL ES 2.0 API，该库在幕后处理序列化。为了方便起见，合成程序和WebGL目前都使用GL ES客户端库。在服务器端，通过命令缓冲区接收的命令被转换为通过ANGLE调用桌面OpenGL或Direct3D。

- 资源共享&同步

  除了为命令缓冲区提供存储，Chrome还使用共享内存在客户机和服务器之间传递更大的资源，比如纹理的位图、顶点数组等。

  另一个结构称为邮箱(mailbox)，它提供了在命令缓冲区之间共享纹理并管理它们的生存期的方法。邮箱是一个简单的字符串标识符，它可以附加(使用)到任何命令缓冲区的本地纹理id，然后通过该纹理id别名访问。以这种方式附加的每个纹理id都持有底层真实纹理上的一个引用，一旦通过删除本地纹理id释放了所有引用，真实纹理也将被销毁。

  同步点(sync point)用于在希望通过邮箱共享纹理的命令缓冲区之间提供非阻塞同步。在命令缓冲区a上插入一个同步点，然后在命令缓冲区B上的同步点上“等待”，可以确保在B上插入的命令不会在a插入的命令同步点之前运行。

- 命令缓冲区多路复用

  目前Chrome为每个浏览器实例使用一个GPU进程，服务于所有渲染器进程和插件进程的请求。GPU进程可以在多个命令缓冲区之间进行多路复用，每个命令缓冲区都与自己的渲染上下文相关联。

  每个渲染器可以有多个GL源，例如WebGL Canvas元素可以直接创建GL命令流。直接在GPU上创建内容的层的合成是这样工作的:它们不是直接渲染回缓冲，而是渲染到一个纹理(使用帧缓冲对象)，当渲染GraphicsLayer时，合成上下文会捕获并使用这个纹理。需要注意的是，为了让合成程序的GL上下文能够访问屏幕外的GL上下文生成的纹理(即用于其他GraphicsLayers的FBOs的GL上下文)，GPU进程使用的所有GL上下文都被创建为共享资源。

  ![HandlingMultipleContexts.png](http://reyshieh.com/assets/HandlingMultipleContexts.png)

- 总结

  GPU进程架构提供几个好处包括：

  - 安全性:大部分渲染逻辑仍然在沙箱渲染器进程中，对平台3D api的访问仅限于GPU进程
  - 健壮性:GPU进程崩溃(例如，由于错误的驱动程序)不会导致浏览器宕机
  - 一致性:将OpenGL ES 2.0作为浏览器的呈现API进行标准化，无论使用什么平台，都允许在Chrome的所有OS端口上使用一个更容易维护的代码库
  - 并行性:渲染器可以快速向命令缓冲区发出命令，然后返回cpu密集型的渲染活动，让GPU进程来处理它们。我们可以很好地利用这两个进程在多核机器上，以及同时GPU和CPU多亏了这个管道

在解释完这些之后，我们可以回到解释GL命令和资源是如何由渲染程序的合成程序生成的

##### 第三部分 线程合成器(The Threaded Compositor)

合成程序是在GL ES 2.0客户端库之上实现的，该客户端库代理对GPU进程的图形调用。当一个页面通过合成程序渲染时，它的所有像素都通过GPU进程直接绘制到窗口的回缓冲(window's backbuffer)中(记住，drawing != painting)。

合成程序的体系结构随着时间的推移而发展:最初它位于渲染程序的主线程中，然后被移动到它自己的线程中(所谓的合成程序线程(compositor thread))，然后在绘制发生时承担额外的协调职责(所谓的隐含绘画(impl-side))。

从理论上讲，**线程合成器的基本任务是从主线程中获取足够的信息，以独立地生成帧**，以响应未来的用户输入，即使主线程很忙，不能请求额外的数据。**在实践中，这目前意味着它为视图当前位置周围区域内的层区域复制cc层树(cc layer tree)和SkPicture录制(SkPicture recordings)。**

###### 记录：从Blink角度绘图

感兴趣的区域是视图周围的区域，为其记录SkPictures。当DOM发生变化时，例如，由于某些元素的样式与以前的主线程框架不同，并且已经失效，**Blink将感兴趣区域中失效层的区域绘制到skpicture支持的GraphicsContext中**。这实际上并不生成新的像素，而是**生成这些新像素所需的Skia命令的显示列表**。这个显示列表稍后将用于根据合成器的判断生成新的像素。

![GraphicsContext_skpicture2.png](http://reyshieh.com/assets/GraphicsContext_skpicture.png)



###### 提交: 切换到合成线程

**线程合成程序的关键属性是对主线程状态副本的操作，因此它可以生成帧，而不需要向主线程请求任何东西**。因此，线程合成程序有两个方面:主线程方面和“impl”方面，后者是合成程序线程的一半。主线程有一个LayerTreeHost，它是层树的副本，而impl线程有一个LayerTreeHostImpl，它是层树的副本。自始至终都遵循类似的命名约定。

**从概念上讲，这两层树是完全独立的，并且可以使用compositor (impl)线程的副本来生成帧，而不需要与主线程进行任何交互**。这意味着主线程可能忙于运行JavaScript，而合成程序仍然可以在GPU上重新绘制之前提交的内容，而不会中断。

为了产生感兴趣的新帧，合成线程需要知道它应该如何修改它的状态(例如，更新层转换以响应滚动之类的事件)。因此，一些输入事件(如滚动)首先从浏览器进程转发到合成程序，然后从合成程序转发到渲染程序主线程。通过控制输入和输出，线程合成程序可以保证对用户输入的视觉响应。除了滚动之外，合成程序还可以执行任何其他页面更新，而不需要Blink来重新绘制任何内容。到目前为止，CSS动画和CSS过滤器是其他主要的合成驱动的页面更新。

这两层树由一系列称为commit的消息保持同步，这些消息由合成程序的调度程序(在cc/trees/thread_proxy.cc中)进行中介。提交将主线程的状态传输给合成线程(包括更新的层树、任何新的SkPicture录制，等等)，阻塞主线程，这样就可以进行同步。这是主线程参与特定帧生产的最后一步。

在它自己的线程中运行合成程序允许合成程序的层树副本更新层转换层次结构而不涉及主线程，但是主线程最终也需要例如滚动偏移量信息(例如JavaScript可以知道viewport滚动到哪里)。因此，提交还负责将任何复合线程层树更新应用于主线程的树和其他一些任务。

###### 树激活(Tree Activation)

当合成程序线程从主线程获得一个新的图层树时，它会检查这个新树，看看哪些区域是无效的，然后重新栅格化这些图层。在此期间，活动树仍然是合成线程之前使用的旧层树，而挂起树（pending tree）是新的层树，其内容正在进行栅格化。

为了保持显示内容的一致性，挂起树只在其可见的(即在viewport内)高分辨率内容完全栅格化时才会被激活。从当前活动树切换到现在准备就绪的挂起树称为激活。等待点阵内容就绪的净效果意味着用户通常至少可以看到一些内容，但是这些内容可能已经过时。如果没有可用的内容，Chrome会显示一个空白的或带有GL着色器的棋盘格模式。

需要注意的是，即使在活动树的点状区域也可以滚动过去，因为Chrome只记录感兴趣区域内图层区域的SkPictures。如果用户滚动到一个未记录的区域，合成程序将要求主线程记录并提交额外的内容，但是如果不能及时记录、提交和光栅化新内容以激活，则用户将滚动到一个棋盘区域。

为了减少棋盘格，Chrome还可以在高分辨率挂起树之前先快速栅格低分辨率的内容。如果挂起的树比当前屏幕上的树更好，那么只有低分辨率内容可用的挂起树将被激活(例如，传出的活动树对于当前的视图没有任何栅格化的内容)。tile管理器决定什么时候光栅化什么内容。

###### 瓦片(Tiling)

将页面上的每一层全部栅格化会浪费CPU时间(用于绘制操作)和内存(用于该层所需的任何软件位图的RAM);用于纹理存储的VRAM)。**合成程序不是对整个页面进行栅格化，而是将大多数web内容层分解为块，并在每个块的基础上对层进行栅格化。**

Web内容层tile的优先级是由许多因素决定的，包括tile与视图端口的接近程度以及它在屏幕上出现的估计时间。然后根据优先级将GPU内存分配给tile，然后从SkPicture录制中对tile进行光栅化，以优先级顺序填充可用内存预算。

###### 栅格化:从cc/Skia的角度绘画

**合成线程上的SkPicture记录可以通过两种方式之一在GPU上转换为位图:要么由Skia的软件光栅化器绘制成位图并上传到GPU作为纹理，要么由Skia的OpenGL后端(Ganesh)直接在GPU上绘制为纹理**。

对于Ganesh栅格化的层，SkPicture与Ganesh一起回放，生成的GL命令流通过命令缓冲区传递给GPU进程。当合成程序决定对任何块进行栅格化时，GL命令生成立即发生，并且块被捆绑在一起，以避免GPU上的块栅格化开销过大。

对于软件栅格化层，绘制目标是渲染器进程和GPU进程共享内存中的位图。位图通过上面描述的资源传输机制传递给GPU进程。因为软件栅格化非常昂贵，所以这种栅格化不会发生在合成线程本身(在那里它可以阻止为活动树绘制新的框架)，而是发生在合成栅格工作线程中。可以使用多个栅格工作线程加快软件栅格化;每个工作线程从优先级平铺队列的前端提取数据。完成的tiles被上传到GPU作为纹理。

位图的纹理上传是内存带宽受限平台上的一个重要瓶颈。这阻碍了软件光栅化层的性能，并继续阻碍硬件光栅化器(例如，对于图像数据或cpu渲染掩码)所需的位图的上传。Chrome过去有各种不同的纹理上传机制，但最成功的是一个异步上传器，它在GPU进程的工作线程中执行上传(或者在浏览器进程中执行附加线程，在Android的情况下)。这可以防止其他操作不得不阻塞可能很长的纹理上传。

**当使用GPU栅格化时，可以采用第三种方法来绘制内容:在绘制时直接将每一层的内容栅格化到backbuffer中，而不是在绘制之前将内容栅格化到纹理中。**这样做的好处是节省内存(没有中间纹理)和一些性能改进(在绘制时将纹理的副本保存到backbuffer)；但缺点是当纹理有效地缓存层内容时，性能会下降(因为现在需要在每一帧中重新绘制纹理)。

![compositing_with_the_gpu_process.png](http://reyshieh.com/assets/compositing_with_the_gpu_process.png)

###### Drawing on the GPU, Tiling, and Quads

一旦填充了所有的纹理，渲染页面的内容就只需要先深度遍历层结构，然后发出GL命令，将每个层的纹理绘制到帧缓冲区中。

在屏幕上绘制一个图层实际上就是绘制它的每一个tile。瓦片表示为四边形(quads)(简单的4-gons即矩形)绘制，填充给定层内容的子区域。合成程序生成四元组和一组渲染传递(渲染传递是包含四元组列表的简单数据结构)。用于绘图的实际GL命令是与四轴模型单独生成的。这是从quad实现中抽象出来的，因此可以为组合器编写非gl后端(惟一重要的非gl实现是软件组合器，后面将介绍)。绘制四轴渲染图或多或少相当于为每个渲染通道设置视图端口，然后设置转换并在渲染通道的四轴渲染列表中绘制每个四轴渲染图。

###### 不同比例的因素（Varied Scale Factors）

Impl-side painting的一个显著优点是，合成程序可以在任意比例因子下重放现有的skpicture。这在两个主要上下文中非常有用:缩放和在快速展示时产生低分辨率的贴片。

合成程序将拦截输入事件，用于缩放和缩放GPU上已经适当排列的块，但它也会在这一过程中以更合适的目标分辨率重新运行。每当新的tile准备好(点阵化和上传)时，就可以通过激活挂起的树来替换它们，从而提高缩放/缩放屏幕的分辨率(即使缩放还没有完成)。

当在软件中进行栅格化时，合成程序还会尝试快速生成低分辨率的贴图(通常来说，绘制这些贴图要简单得多)，如果高分辨率的贴图还没有准备好，就会在滚动时显示它们。这就是为什么有些页面在快速滚动时看起来很模糊——合成程序在屏幕上显示低分辨率的平铺块，而高分辨率的平铺块是栅格。

#### GPU架构路线图

最终目标架构包括：

- 在渲染器中强制合成模式(在所有页面上加速合成，[硬件加速概述文档](http://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome))
- 一个浏览器合成程序(通常是**Aura**，不过我们可能在Mac和Android WebView上做一些稍微不同的事情(下面称为“Purlieus”作为占位符)([Aura的设计文档](https://www.chromium.org/developers/design-documents/aura-desktop-window-manager))
- Ubercompositor([设计文档](https://docs.google.com/a/chromium.org/document/d/1ziMZtS5Hf8azogi2VjSE6XPaMwivZSyXAIIp0GgInNA/edit))
- 在浏览器和渲染器中进行线程合成([设计文档](http://dev.chromium.org/developers/design-documents/compositor-thread-architecture))
- 渲染器和浏览器中的隐含绘画([设计文档](http://www.chromium.org/developers/design-documents/impl-side-painting))
- BrowserInputController和我们的零输入延迟调度程序([设计文档](https://docs.google.com/document/d/1LUFA8MDpJcDHE0_L2EHvrcwqOMJhzl5dqb0AlBSqHOY/edit))
- 一个用于合成程序的软件后端，当我们没有一个可行的GPU时使用(黑名单或GPU进程反复崩溃)。这是我们打算无限期支持的惟一配置变量。(包含在[ubercomp设计文档中](https://docs.google.com/document/d/1ziMZtS5Hf8azogi2VjSE6XPaMwivZSyXAIIp0GgInNA/edit))
- 混合加速栅格化，在可能的情况下，使用GPU([设计文档](https://docs.google.com/document/d/1Vi1WNJmAneu1IrVygX7Zd1fV7S_2wzWuGTcgGmZVRyE/edit#heading=h.7g13ueq2lwwd))对层内容进行栅格化

#### Graphics和Skia

Chrome使用Skia对几乎所有的制图操作(graphics operations)，包括文本渲染(text rendering)。在大多数情况下，GDI仅用于原生主题渲染；新的应该使用Skia。

##### 为什么用Skia？

- GDI对于SVG、Canvas和我们考虑的一些复杂UI来说功能还不够全面。
- Skia是内部的，可以根据我们的需要进行修改。
- Skia已经有了一个高质量的Webkit/Canvas端口。
- GDI+不再由微软开发，在大多数操作上，至少在XP上，它比Skia慢。在Vista上，似乎至少有一些GDI+操作是硬件加速的，但是软件Skia通常足够快来满足我们的需求。
- GDI+文本渲染与GDI文本渲染有不可接受的不同，并且启动速度较慢。

#### GPU命令缓冲区

**GPU命令缓冲系统是Chrome与GPU或OpenGL ES(或通过角度模拟的OpenGL ES)对话的方式**。它被设计成具有一个API，该API模拟OpenGL ES 2.0 API，执行该API的限制，并处理驱动程序和平台中的不兼容性。

##### 目标

- 命令缓冲系统具有安全性。操作系统中的图形系统存在巨大的安全漏洞
- 跨系统兼容性
- 加速。**速度是选择命令缓冲区实现的原因。客户端可以非常快速地编写命令，而不需要与服务进行多少通信或根本不需要通信，并且只需偶尔告诉服务它已经编写了更多的命令**。例如，另一个实现可以为每个OpenGL ES 2.0函数使用单独的IPC，但这可能太慢了。命令缓冲区获得了另一个速度提升，因为它有效地并行化了对OS图形API的调用。像glUniform或glDrawArrays这样的调用可能是一个非常昂贵的调用，但是由于命令缓冲区的存在，客户机只需要向命令缓冲区写入几个字节就可以了。GPU进程在另一个进程上调用真正的OpenGL函数，有效地使程序多核

##### 实现

基本实现是一个“命令缓冲区”。客户机(渲染进程、pepper插件等)将命令写入一些共享内存。它通过IPC更新一个“put”指针，告诉GPU进程它在这个缓冲区中写入了。然后GPU进程或服务从该缓冲区读取命令。对于每个命令，它验证命令、参数，以及参数是否适合当前OS图形API的状态，然后才对OS进行实际调用。

#### GPU程序缓冲区

由于沙箱，每次加载一个页面时，我们都会翻译、编译和链接它的gpu着色器。虽然不是每个页面都定义着色器，但是合成器使用一些必须为每个选项卡重新编译的着色器。我们应该能够缓存以前链接的程序，并在再次请求时重用它们。

gpu程序缓冲区通过**内存**和**磁盘缓存**两种方式来加速进程。

##### 缓存类型

- 内存缓存

  由于未知的磁盘访问时间(以及所需的IPC调用)，二进制程序的所有缓存命中都来自内存缓存。基于磁盘的缓存加载将在启动时发生。

- 磁盘缓存

  磁盘缓存将扮演内存缓存的持久存储角色。它将具有与内存缓存相同的最大大小，并且所有缓存到内存缓存的程序也将被发送到磁盘缓存。

#### Blink/WebCore中的合成

##### 主要的合成任务

1. 确定如何将内容分组到备份存储中(如，合成层)
2. 绘制(**paint**)每个合成层的内容
3. 绘制(**draw**)合成层，以形成最终的图像

##### 堆叠上下文和绘画顺序

###### Flow, Positioning, and Z-index

- 正常flow：依据inline->block->float->别的格式布局
- 相对位置元素：作为正常流的一部分，相对于其预定位置定位
- 绝对位置元素：相对于包含块定位。不是正常流的一部分
- Fixed定位元素：相对于视口定位。不是正常流的一部分

#### 合成器线程架构

##### 目标

主渲染线程是HTML、CSS、JavaScript和几乎所有Web分平台上的东西运行的地方。它通常会停滞数十至数百毫秒。遗憾的是，不可能防止所有这些问题:样式重新计算、同步网络请求、绘制时间长、垃圾收集，所有这些都有依赖于内容的成本。

合成器线程架构允许我们快照页面的一个版本，并允许用户在快照上直接滚动和查看动画，显示页面正在平稳运行的假象。

##### 基本目标

合成程序被设计成两个部分:主线程的一半和“impl线程”的一半。

- 主线程的一半是典型的层树。层具有转换、大小和内容。层按需填充:层可能被损坏。合成程序决定何时运行层委托来告诉它进行绘制。
- 合成程序的隐含面(impl-side)对层树的用户隐藏。它是主线程树的一个几乎完全克隆——当我们在主线程上有一个层时，它在impl线程上也有一个对应的层。

主线程树是webkit想要绘制的模型。主线程将图层内容绘制成纹理。这些被传递给impl树。impl树实际上是画在屏幕上的。我们可以在任何时候绘制impl树，即使主线程被阻塞。

LayerChromium树的用户可以指定层是可滚动的。通过在将所有输入事件传递给主线程之前将它们路由到impl线程，我们可以滚动并重新绘制树，而不需要咨询主线程。这允许我们实现“平滑滚动”，即使主线程被阻塞。

LayerChromium树的用户可以向树中添加动画。我们可以在impl树上运行这些动画，从而允许无挂载动画。

#### 多线程的光栅化

我们当前的合成程序线程架构是围绕主webkit线程上的栅格化层的思想构建的，然后在合成程序线程上，根据不同的动画和滚动位置绘制我们所拥有的层的位。这允许我们上下移动页面，例如由于手指拖动，而不必阻塞webkit线程。当没有内容的tile被公开时，我们绘制一个棋盘格，并等待主线程对该tile进行栅格化。

我们希望能够在不需要新的提交的情况下填充棋盘格，因为这需要进入一个繁忙的webkit线程并拉入一个全新的树+损坏。我们还希望能够渲染多个分辨率和质量级别的tiles。这些技巧可以减少内存压力，避免棋盘格的中断。

#### 视频回放和合成器

Chromium合成程序支持视频回放，支持将工作转移到GPU，并在主线程被阻塞时显示视频帧。Chromium中有一些不同的媒体引擎实现，但它们与组合器的交互方式类似。

## 网络栈

网络堆栈是一个主要用于获取资源的单线程跨平台库。它的主要接口是URLRequest和URLRequestContext。**URLRequest，顾名思义，表示对URL的请求**。**URLRequestContext包含实现URL请求所需的所有关联上下文，如cookie、主机解析器、代理解析器、缓存等**。**许多URLRequest对象可能共享相同的URLRequestContext**。大多数net对象都不是线程安全的，尽管磁盘缓存可以使用专用线程，而且一些组件(主机解析、证书验证等)可以使用未连接的工作线程。由于它主要在单个网络线程上运行，所以不允许阻塞网络线程上的任何操作。因此，我们使用异步回调的非阻塞操作(通常是CompletionCallback)。网络堆栈代码还将大多数操作记录到NetLog中，这允许使用者将这些操作记录在内存中，并以用户友好的格式呈现，以便进行调试。

Chromium开发者写这个网络栈是为了：

- 允许对跨平台抽象进行编码
- 提供比高级系统网络库(如WinHTTP或WinINET)更大的控制能力
  - 避免系统库中可能存在的bug
  - 为性能优化提供更大的机会

#### 代码布局

- net/base - 抓取网络工具包，如主机解析，cookie，网络变化检测，SSL
- net/disk_cache -  [Web资源缓存](https://www.chromium.org/developers/design-documents/network-stack/disk-cache)

- net/ftp - [FTP](http://en.wikipedia.org/wiki/File_Transfer_Protocol) 实现。 编码主要基于旧的HTTP实现。
- net/http - [HTTP](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) 实现。
- net/ocsp - 在不使用系统库或系统不提供OCSP实现的情况下实现[OCSP](http://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol)。目前只包含一个基于NSS的实现。
- net/proxy_resolution - 代理 ([SOCKS](http://en.wikipedia.org/wiki/SOCKS) and HTTP)配置, 解决, 脚本获取, etc.
- net/quic - [QUIC](https://www.chromium.org/quic) 实现
- net/socket - [TCP](http://en.wikipedia.org/wiki/Transmission_Control_Protocol), "SSL sockets", 和 socket pools套接字跨平台实现 
- net/socket_stream - socket streams for WebSockets.
- net/spdy - HTTP2 (and its predecessor) [SPDY](https://www.chromium.org/spdy) 实现.
- net/url_request - `URLRequest`, `URLRequestContext`, and `URLRequestJob` implementations.
- net/websockets - [WebSockets](http://en.wikipedia.org/wiki/WebSockets) 实现.

#### 网络请求的剖析(主要关注HTTP)

![Chromium_HTTP_Network_Request_Diagram.svg](http://reyshieh.com/assets/Chromium_HTTP_Network_Request_Diagram.svg)

###### URLRequest

当启动URLRequest时，它要做的第一件事是决定创建什么类型的URLRequestJob。主要的作业类型是URLRequestHttpJob，用于实现http://请求。还有很多其他的作业，比如URLRequestFileJob (file://)、URLRequestFtpJob (ftp://)、URLRequestDataJob (data://)等等。网络堆栈将确定满足请求的适当作业，但是它为客户端提供了两种定制作业创建的方法:URLRequest::Interceptor和URLRequest::ProtocolFactory。除了URLRequest::Interceptor的接口更广泛之外，这些都是相当冗余的。随着作业的进展，它将通知URLRequest, URLRequest将根据需要通知URLRequest::Delegate。

###### URLRequestHttpJob

URLRequestHttpJob将首先标识为HTTP请求设置的cookie，这需要在请求上下文中查询CookieMonster。这可以是异步的，因为CookieMonster可能由sqlite数据库支持。这样做之后，它将请求上下文的HttpTransactionFactory创建一个HttpTransaction。通常，HttpCache将被指定为HttpTransactionFactory。HttpCache将创建一个HttpCache::Transaction来处理HTTP请求。HttpCache::Transaction将首先检查HttpCache(它检查磁盘缓存)，以查看缓存条目是否已经存在。如果是，则意味着响应已经缓存，或者这个缓存条目已经存在一个网络事务，因此只需从该条目中读取。如果缓存条目不存在，那么我们创建它并请求HttpCache的HttpNetworkLayer创建一个HttpNetworkTransaction来服务请求。HttpNetworkTransaction被赋予一个HttpNetworkSession，其中包含执行HTTP请求的上下文状态。其中一些状态来自URLRequestContext。

###### HttpNetworkTransaction

HttpNetworkTransaction询问HttpStreamFactory创建HttpStream。HttpStreamFactory返回HttpStreamRequest，该请求应该处理如何建立连接的所有逻辑，一旦建立了连接，就用一个HttpStream子类将其封装起来，该子类负责与网络直接通信。

目前，只有两个主要的HttpStream子类:HttpBasicStream和SpdyHttpStream，尽管我们计划为HTTP管道创建子类。HttpBasicStream承担直接读写套接字。SpdyHttpStream读写SpdyStream。网络事务将调用流的方法，在完成时，将调用回HttpCache::Transaction的回调，该回调将根据需要通知URLRequestHttpJob和URLRequest。对于HTTP路径，HTTP请求和响应的生成和解析将由HttpStreamParser处理。对于SPDY路径，请求和响应解析由SpdyStream和SpdySession处理。基于HTTP响应，HttpNetworkTransaction可能需要执行HTTP身份验证。这可能涉及重新启动网络事务。

###### HttpStreamFactory

HttpStreamFactory首先执行代理解析，以确定是否需要代理。端点被设置为URL主机或代理服务器。然后HttpStreamFactory检查SpdySessionPool，看看是否有此端点的可用SpdySession。如果没有，则stream factory从适当的池请求一个“套接字”(TCP/proxy/SSL/etc)。如果套接字是SSL套接字，则检查NPN是否表示协议(可能是SPDY)，如果是，则使用指定的协议。对于SPDY，我们将检查SpdySession是否已经存在并使用它，否则我们将从这个SSL套接字创建一个新的SpdySession，并从SpdySession创建一个SpdyStream，我们将SpdyHttpStream包装起来。对于HTTP，我们只需将套接字封装在HttpBasicStream中。

###### Proxy Resolution

HttpStreamFactory查询ProxyService来返回GURL的ProxyInfo。代理服务首先需要检查它是否具有最新的代理配置。如果没有，则使用ProxyConfigService查询系统的当前代理设置。如果代理设置设置为无代理或特定代理，则代理解析很简单(我们不返回代理或特定代理)。否则，我们需要运行一个PAC脚本来确定适当的代理(或缺少代理)。如果我们还没有PAC脚本，那么代理设置将指示我们应该使用WPAD自动检测，或者指定一个定制的PAC url，我们将使用ProxyScriptFetcher获取PAC脚本。一旦我们有了PAC脚本，我们将通过ProxyResolver执行它。注意，我们使用一个shim MultiThreadedProxyResolver对象将PAC脚本执行分派给线程，线程运行一个ProxyResolverV8实例。这是因为PAC脚本执行可能会阻塞主机解析。因此,为了防止一个停滞PAC脚本执行阻塞其他代理决议,我们允许同时执行多个PAC脚本。

###### Connection Management

HttpStreamRequest确定了适当的端点(URL端点或代理端点)之后，需要建立连接。它通过标识适当的“套接字”池并从中请求套接字来实现这一点。注意，这里的“套接字”基本上是指我们可以读写的东西，用来通过网络发送数据。SSL套接字构建在传输(TCP)套接字之上，并为用户加密/解密原始TCP数据。不同的套接字类型还处理不同的连接设置，比如HTTP/SOCKS代理、SSL握手等等。套接字池的设计是分层的，因此各种连接设置可以分层在其他套接字之上。HttpStream可以与实际的底层套接字类型无关，因为它只需要对套接字进行读写。套接字池执行各种功能——它们实现每个代理、每个主机和每个进程限制的连接。目前，这些设置为每个代理32个套接字，每个目标主机6个套接字，每个进程256个套接字(没有完全正确地实现，但已经足够好了)。套接字池还从执行中抽象套接字请求，从而为我们提供套接字的“后期绑定”。套接字请求可以通过新连接的套接字或空闲套接字(从以前的http事务重用)来实现。

###### Host Resolution

注意，传输套接字的连接设置不仅需要传输(TCP)握手，而且已经需要主机解析。HostResolverImpl使用getaddrinfo()执行主机解析，这是一个阻塞调用，因此解析器在未连接的工作线程上调用这些调用。通常，主机解析涉及DNS解析，但也可能涉及非DNS名称空间，如NetBIOS/WINS。HostResolverImpl还包含一个主机缓存，它可以缓存最多1000个主机名。

###### SSL/TLS

SSL套接字需要执行SSL连接设置和证书验证。目前，在所有平台上，我们都使用NSS的libssl来处理SSL连接逻辑。但是，我们使用特定于平台的api进行证书验证。我们还将使用证书验证缓存，这将把对同一证书的多个证书验证请求合并到一个证书验证作业中，并将结果缓存一段时间。

