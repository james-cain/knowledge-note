(window.webpackJsonp=window.webpackJsonp||[]).push([[24],{171:function(v,_,t){"use strict";t.r(_);var a=t(0),r=Object(a.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var v=this,_=v.$createElement,t=v._self._c||_;return t("div",{staticClass:"content"},[t("h1",{attrs:{id:"网络"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#网络","aria-hidden":"true"}},[v._v("#")]),v._v(" 网络")]),v._v(" "),t("h2",{attrs:{id:"osi七层协议"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#osi七层协议","aria-hidden":"true"}},[v._v("#")]),v._v(" OSI七层协议")]),v._v(" "),t("p",[v._v("应用层、表示层、会话层、传输层、网络层、数据链路层、物理层")]),v._v(" "),t("h2",{attrs:{id:"tcp-ip四层体系"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#tcp-ip四层体系","aria-hidden":"true"}},[v._v("#")]),v._v(" TCP/IP四层体系")]),v._v(" "),t("p",[v._v("应用层（各种应用层协议，如TELNET、FTP、SMTP）、传输层（TCP、UDP）、网际层（IP）、网络接口层")]),v._v(" "),t("h2",{attrs:{id:"五层协议体系"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#五层协议体系","aria-hidden":"true"}},[v._v("#")]),v._v(" 五层协议体系")]),v._v(" "),t("p",[v._v("应用层、传输层、网络层、数据链层、物理层")]),v._v(" "),t("h2",{attrs:{id:"udp"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#udp","aria-hidden":"true"}},[v._v("#")]),v._v(" UDP")]),v._v(" "),t("p",[t("strong",[v._v("面向报文")])]),v._v(" "),t("p",[v._v("UDP是一个面向报文的协议。即只是报文的搬运工，不会对报文进行任何拆分和拼接操作")]),v._v(" "),t("ul",[t("li",[v._v("在发送端，应用层将数据传递给传输层的 UDP 协议，UDP 只会给数据增加一个 UDP 头标识下是 UDP 协议，然后就传递给网络层了")]),v._v(" "),t("li",[v._v("在接收端，网络层将数据传递给传输层，UDP 只去除 IP 报文头就传递给应用层，不会任何拼接操作")])]),v._v(" "),t("p",[t("strong",[v._v("不可靠性")])]),v._v(" "),t("ol",[t("li",[v._v("无连接的，通信是不需要建立和断开连接")]),v._v(" "),t("li",[v._v("不可靠的，协议收到什么数据就传递什么数据，不关系对方是否能收到")]),v._v(" "),t("li",[v._v("没有拥塞控制，一直会以恒定的速度发送数据。弊端在网络条件不好的情况下会导致丢包，好处对实时性要求高的场景（比如电话会议）使用更好")])]),v._v(" "),t("p",[t("strong",[v._v("高效")])]),v._v(" "),t("p",[t("img",{attrs:{src:"http://reyshieh.com/assets/UDP.png",alt:"UDP"}})]),v._v(" "),t("p",[v._v("UDP没有TCP复杂，不需要保证数据不丢失且有序到达。所以"),t("strong",[v._v("UDP的头部")]),v._v("开销小，"),t("strong",[v._v("只有八个字节")]),v._v("，在传输数据报文时是高效的")]),v._v(" "),t("p",[v._v("头部包含以下几个数据")]),v._v(" "),t("ul",[t("li",[v._v("两个十六位的端口号，分别为源端口Source port（可选字段）和目标端口Destination port")]),v._v(" "),t("li",[v._v("整个数据报文的长度Length")]),v._v(" "),t("li",[v._v("整个数据报文的检验和（IPV4可选字段），该字段用于发现头部信息和数据中的数据")])]),v._v(" "),t("p",[v._v("传输方式")]),v._v(" "),t("p",[v._v("支持一对一，一对多，多对多，多对一，即支持单播，多播，广播的功能")]),v._v(" "),t("h3",{attrs:{id:"理解udp的无服务"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#理解udp的无服务","aria-hidden":"true"}},[v._v("#")]),v._v(" 理解UDP的无服务")]),v._v(" "),t("ul",[t("li",[v._v("不保证消息交付 -- 不确认，不重传，无超时")]),v._v(" "),t("li",[v._v("不保证交付顺序 -- 不设置包序号，不重排，不会发生队首阻塞")]),v._v(" "),t("li",[v._v("不跟踪连接状态 -- 不必建立连接或重启状态机")]),v._v(" "),t("li",[v._v("不需要拥塞控制 -- 不内置客户端或网络反馈机制")])]),v._v(" "),t("p",[v._v("TCP是一个面向字节流的协议，能够以多个分组形式发送应用程序消息，且对分组中的消息范围没有任何明确限制。因此，连接的两端存在一个连接状态，每个分组都有序号，丢失还要重发，并且要按顺序交付。")]),v._v(" "),t("p",[v._v("UDP数据报有明确的限制：数据报必须封装在IP分组中，应用程序必须读取完整的消息。数据报不能分片。")]),v._v(" "),t("h2",{attrs:{id:"tcp"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#tcp","aria-hidden":"true"}},[v._v("#")]),v._v(" TCP")]),v._v(" "),t("p",[t("img",{attrs:{src:"http://reyshieh.com/assets/TCP.png",alt:"TCP"}})]),v._v(" "),t("ul",[t("li",[t("p",[t("strong",[v._v("20字节")])])]),v._v(" "),t("li",[t("p",[v._v("Sequence number，保证TCP传输的报文都是有序的，对端可以通过序号顺序的拼接报文")])]),v._v(" "),t("li",[t("p",[v._v("Acknowledgement Number，表示数据接收端期望接收的下一个字节的编号是多少，同事表示上一个序号的数据已经收到")])]),v._v(" "),t("li",[t("p",[v._v("标识符")]),v._v(" "),t("p",[v._v("URG=1：表示本数据报的数据部分包含紧急信息，是一个高优先级报文，此时紧急指针有效。紧急数据一定位于当前数据包数据部分的最前面，紧急指针标明了紧急数据的尾部")]),v._v(" "),t("p",[v._v("ACK=1：表示确认号字段有效。TCP规定在连接建立后传送的所有报文段都必须把ACK置为1")]),v._v(" "),t("p",[v._v("PSH=1：表示接收端应该立刻将数据push给应用层，而不是等缓冲区满了再提交")]),v._v(" "),t("p",[v._v("RST=1：表示当前TCP连接出现严重问题，可能需要重新建立TCP连接，也可以用于拒绝非法的报文段和拒绝连接请求")]),v._v(" "),t("p",[v._v("SYN=1：SYN=1，ACK=0时，表示报文段是一个连接请求报文；SYN=1，ACK=1，表示报文段是一个同意建立连接的应答报文")]),v._v(" "),t("p",[v._v("FIN=1：表示报文段是一个释放连接的请求报文")])])]),v._v(" "),t("h3",{attrs:{id:"状态机"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#状态机","aria-hidden":"true"}},[v._v("#")]),v._v(" 状态机")]),v._v(" "),t("p",[v._v("HTTP是无连接，所以下层的TCP也是无连接的，只是两端共同维护状态")]),v._v(" "),t("h4",{attrs:{id:"建立连接三次握手"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#建立连接三次握手","aria-hidden":"true"}},[v._v("#")]),v._v(" 建立连接三次握手")]),v._v(" "),t("p",[t("img",{attrs:{src:"http://reyshieh.com/assets/3timeshandshake.png",alt:"三次握手"}})]),v._v(" "),t("p",[v._v("主动发起端称为客户端，被动连接端称为服务端。不管是客户端还是服务端，TCP连接建立后都能发送和接受数据，所以TCP是一个"),t("strong",[v._v("全双工")]),v._v("的协议")]),v._v(" "),t("p",[t("strong",[v._v("起初")])]),v._v(" "),t("p",[v._v("两端都是CLOSED状态，通信开始前，都会创建TCB。服务端创建完TCB后便进入到LISTEN状态，等待客户端发送数据")]),v._v(" "),t("p",[t("strong",[v._v("第一次握手")])]),v._v(" "),t("p",[v._v("客户端向服务端发送连接请求报文段。报文段中包含自身的数据通讯初始序号。请求发送后，客户端进入SYN-SENT状态")]),v._v(" "),t("p",[t("strong",[v._v("第二次握手")])]),v._v(" "),t("p",[v._v("服务端收到连接请求报文段后，同意连接就会发送一个应答，应答包含自身的数据通讯初始序号，发送完进入SYN-RECEIVE状态")]),v._v(" "),t("p",[t("strong",[v._v("第三次握手")])]),v._v(" "),t("p",[v._v("当客户端收到连接同意的应答后，向服务端发送一个确认报文。客户端发完便进入ESTABLISHED状态，服务端收到也进入ESTABLISHED状态，连接建立成功")]),v._v(" "),t("p",[t("strong",[v._v("第三次握手可以包含数据，通过TCP快速打开（TFO）技术，客户端和服务端存储相同cookie，下次握手时发出cookie达到减少RTT的目的")])]),v._v(" "),t("h4",{attrs:{id:"断开连接四次握手"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#断开连接四次握手","aria-hidden":"true"}},[v._v("#")]),v._v(" 断开连接四次握手")]),v._v(" "),t("p",[t("img",{attrs:{src:"http://reyshieh.com/assets/4timeshandshake.png",alt:"四次握手"}})]),v._v(" "),t("p",[v._v("在断开连接时两端都需要发送FIN和ACK")]),v._v(" "),t("p",[t("strong",[v._v("第一次握手")])]),v._v(" "),t("p",[v._v("客户端任务数据发送完成，需要向服务端发送连接释放请求")]),v._v(" "),t("p",[t("strong",[v._v("第二次握手")])]),v._v(" "),t("p",[v._v("服务端收到连接释放请求后，会告诉应用层要释放TCP链接。然后会发送ACK，并进入CLOSE_WAIT状态，表示客户端到服务端的链接已经释放，不接受客户端的数据了。")]),v._v(" "),t("p",[t("strong",[v._v("第三次握手")])]),v._v(" "),t("p",[v._v("服务端此时还没有发完的数据会继续发送，完毕后会向客户端发送连接释放请求，服务端便进入LAST_ACK状态")]),v._v(" "),t("p",[t("strong",[v._v("第四次握手")])]),v._v(" "),t("p",[v._v("客户端收到释放请求后，向服务端发送确认应答，此时客户端进入TIME_WAIT状态。该状态会持续2MSL(最大段生存期，指报文段在网络中生存的时间，超时会被抛弃)时间，若该时间段内没有服务端的重发请求，就进入CLOSE状态。当服务端收到确认应答后，也进入CLOSE状态")]),v._v(" "),t("h4",{attrs:{id:"arq协议"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#arq协议","aria-hidden":"true"}},[v._v("#")]),v._v(" ARQ协议")]),v._v(" "),t("p",[v._v("超时重传机制。通过确认和超时机制保证数据的正确送达，ARQ协议包含停止等待ARQ和连续ARQ")]),v._v(" "),t("h5",{attrs:{id:"停止等待arq"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#停止等待arq","aria-hidden":"true"}},[v._v("#")]),v._v(" 停止等待ARQ")]),v._v(" "),t("p",[v._v("这个协议的缺点是传输效率低，在良好的网络环境下每次发送报文都得等待对端的ACK")]),v._v(" "),t("h5",{attrs:{id:"连续arq"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#连续arq","aria-hidden":"true"}},[v._v("#")]),v._v(" 连续ARQ")]),v._v(" "),t("p",[v._v("发送端拥有一个"),t("strong",[v._v("发送窗口")]),v._v("，在没有收到应答的情况下持续发送窗口内的数据，相比停止等待ARQ协议来说减少了等待时间，提高效率")]),v._v(" "),t("p",[v._v("连续ARQ中，接收端会持续不断收到报文。通过"),t("strong",[v._v("累计确认")]),v._v("，可以在收到多个报文以后统一回复一个应答报文。报文中的ACK可以用来告诉发送端这个序号之前的数据已经全部接受到了，下次请发送这个序号+1的数据")]),v._v(" "),t("p",[v._v("累计确认会存在问题。在连续接收报文时，可能会遇到收到序号5，未接受到序号6，然而序号7以后的报文已经接收。遇到这种情况，ACK会回复6，导致7重复发送，这种情况可以通过"),t("strong",[v._v("Sack")]),v._v("来解决。")]),v._v(" "),t("h5",{attrs:{id:"滑动窗口（流量控制）"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#滑动窗口（流量控制）","aria-hidden":"true"}},[v._v("#")]),v._v(" 滑动窗口（流量控制）")]),v._v(" "),t("p",[v._v("两端都维护窗口：发送端窗口和接收端窗口("),t("strong",[v._v("rwnd")]),v._v(")")]),v._v(" "),t("p",[v._v("发送端窗口是由接收端窗口剩余大小决定的。接收方会把当前接收窗口的剩余大小写入应答报文，发送端收到应答后根据该值和网络拥塞情况设置发送窗口的大小，所以发送窗口的大小是不断变化的")]),v._v(" "),t("p",[t("img",{attrs:{src:"http://reyshieh.com/assets/sliderwindow1.png",alt:"滑动窗口1"}})]),v._v(" "),t("p",[v._v("当发送端接收到应答报文后，会将窗口进行滑动")]),v._v(" "),t("p",[t("img",{attrs:{src:"http://reyshieh.com/assets/sliderwindow2.png",alt:"滑动窗口2"}})]),v._v(" "),t("p",[t("strong",[v._v("滑动窗口实现了流量控制")]),v._v("。接收方通过报文告知发送方还可以发送多少数据，从而保证接收方能够来得及接收数据")]),v._v(" "),t("p",[t("strong",[v._v("zero窗口")])]),v._v(" "),t("p",[v._v("在发送报文的过程中，可能会遇到对端出现零窗口的情况。发送端会停止发送数据，并启动persistent timer。该定时器会定时发送请求给对端，让对端告知窗口大小。在重试次数超过一定次数后，可能会中断TCP连接")]),v._v(" "),t("h5",{attrs:{id:"拥塞处理"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#拥塞处理","aria-hidden":"true"}},[v._v("#")]),v._v(" 拥塞处理")]),v._v(" "),t("p",[v._v("拥塞处理作用于网络，防止过多的数据拥塞网络，避免出现网络负载过大的情况")]),v._v(" "),t("p",[v._v("拥塞处理包括了四个算法：慢开始、拥塞避免、快速重传、快速恢复")]),v._v(" "),t("ul",[t("li",[t("p",[v._v("慢开始(拥塞控制)")]),v._v(" "),t("p",[v._v("在传输开始时将发送窗口慢慢指数级扩大，避免一开始就传输大量数据导致网络拥塞")]),v._v(" "),t("p",[v._v("具体步骤：")]),v._v(" "),t("ol",[t("li",[v._v("连接初试设置拥塞窗口("),t("strong",[v._v("cwnd")]),v._v(")为1MSS（一个分段的最大数据量）"),t("strong",[v._v("1MSS=1460KB")])]),v._v(" "),t("li",[v._v("每过一个RTT就将窗口大小乘2")]),v._v(" "),t("li",[v._v("指数级增长到阈值后，启动拥塞避免算法")])]),v._v(" "),t("p",[v._v("优劣势："),t("strong",[v._v("对于大型流式下载服务，慢启动的影响不大；然后对于很多HTTP连接，如只是一些短暂、突发的连接，常常会出现还没有到最大窗口请求就被终止。因此，实际在整个web传输过程中，经常会受到服务器与客户端之间往返时间的限制，而这些限制是因慢启动限制了可用的吞吐量引起的，对于小文件传输是很不利的")]),v._v("。")])]),v._v(" "),t("li",[t("p",[v._v("拥塞避免")]),v._v(" "),t("p",[v._v("每过一个RTT窗口大小只加一，这样避免指数级增长导致网络拥塞，慢慢将大小调整到最佳值")]),v._v(" "),t("p",[v._v("在传输过程中可能定时器超时的情况，这时TCP会认为网络拥塞了，会马上进行以下：")]),v._v(" "),t("ol",[t("li",[v._v("将阈值设为当前拥塞窗口的一半")]),v._v(" "),t("li",[v._v("将拥塞窗口设为1MSS")]),v._v(" "),t("li",[v._v("启动拥塞避免算法")])])]),v._v(" "),t("li",[t("p",[v._v("快速重传")]),v._v(" "),t("p",[v._v("一般和快恢复一起出现。一旦接收端收到的报文出现失序情况，接收端只会回复最后一个顺序正确的报文序号（没有Sack的情况下）。如果收到三个重复的ACK，无需等待定时器超时再重发而是启动快速重传。具体算法包括两种：")]),v._v(" "),t("ol",[t("li",[t("p",[v._v("TCP Taho")]),v._v(" "),t("p",[v._v("将阈值设为当前拥塞窗口的一半")]),v._v(" "),t("p",[v._v("将拥塞窗口设为1MSS")]),v._v(" "),t("p",[v._v("重新开始满开始算法")])]),v._v(" "),t("li",[t("p",[v._v("TCP Reno")]),v._v(" "),t("p",[v._v("拥塞窗口减半")]),v._v(" "),t("p",[v._v("将阈值设为当前拥塞窗口")]),v._v(" "),t("p",[v._v("进入快恢复阶段（重发对端需要的包，一旦受到一个新的ACK答复就退出该阶段）")]),v._v(" "),t("p",[v._v("使用拥塞避免算法")])]),v._v(" "),t("li",[t("p",[v._v("TCP New Reno")]),v._v(" "),t("p",[v._v("TCP发送方先记下三个重复ACK的分段的最大序号")]),v._v(" "),t("p",[v._v("假如有一个分段数据是1~10序号的报文，其中丢失了序号为3和7的报文，那么该分段的最大序号就是10.发送端只会收到ACK序号为3的应答。这时候重发序号为3的报文，接收方顺利接受并会发送ACK序号为7的应答。接收方顺利接收并会发送ACK序号为11的应答，这时发送端认为这个分段接收端已经顺利接收，接下来退出快恢复阶段。")])])])])]),v._v(" "),t("h3",{attrs:{id:"带宽延迟积"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#带宽延迟积","aria-hidden":"true"}},[v._v("#")]),v._v(" 带宽延迟积")]),v._v(" "),t("p",[v._v("TCP的拥塞控制和预防机制对性能有一个重要的影响：发送端和接收端理想的窗口大小，一定会因为往返时间及目标传输速率而变化")]),v._v(" "),t("p",[v._v("发送端和接收端之间在途未确认的最大数据量，取决于拥塞窗口(swnd)和接受窗口(rwnd)的最小值。")]),v._v(" "),t("p",[t("strong",[v._v("因此只有传输不中断，才能保证最大吞吐量。")])]),v._v(" "),t("p",[v._v("e.g.")]),v._v(" "),t("p",[v._v("假设cwnd和rwnd的最小值是16KB，往返时间为100ms，那么")]),v._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[v._v("16KB = (16 * 1024 * 8) = 131072 bit\n131072 bit / 0.1s = 1310720 bit/s\n1310720 bit/s = 1310720 / 1000000 = 1.31 Mbit/s\n")])])]),t("p",[v._v("经过计算，TCP连接的数据传输数率将会限制在1.31Mbit/s，因此，想提高吞吐量，要么增大最小窗口值，要么减少往返时间")]),v._v(" "),t("h3",{attrs:{id:"队首阻塞"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#队首阻塞","aria-hidden":"true"}},[v._v("#")]),v._v(" 队首阻塞")]),v._v(" "),t("p",[v._v("TCP在不可靠的信道上实现了可靠的网络传输。")]),v._v(" "),t("ul",[t("li",[v._v("分组错误检测与纠正")]),v._v(" "),t("li",[v._v("按序交付")]),v._v(" "),t("li",[v._v("丢包重发")]),v._v(" "),t("li",[v._v("保证网络最高效率的流量控制、拥塞控制和预防机制")])]),v._v(" "),t("p",[v._v("按序交付和可靠交付，导致了额外的延迟，对性能造成负面影响。这些机制都发生在TCP层，应用程序对此毫无感知，只能在通过套接字读数据时感觉到延迟交付。称为"),t("strong",[v._v("TCP的队首(HOL, Head of Line)阻塞")])]),v._v(" "),t("p",[v._v("队首阻塞造成的延迟可以让应用程序不用关心分组重排和重组，让代码保持整洁。但整洁带来的代价就是分组到达时间会存在无法预知的延迟变化。这个时间通常被称为"),t("strong",[v._v("抖动")]),v._v("，也是影响程序性能的一个主要因素")]),v._v(" "),t("h3",{attrs:{id:"针对tcp可以做的一些性能优化"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#针对tcp可以做的一些性能优化","aria-hidden":"true"}},[v._v("#")]),v._v(" 针对TCP可以做的一些性能优化")]),v._v(" "),t("ul",[t("li",[v._v("增大TCP的初始拥塞窗口 -- 加大初始拥塞窗口可以让TCP在第一次往返就传输较多数据，随后的速度提升速度也很明显")]),v._v(" "),t("li",[v._v("慢启动重启 -- 在连接空闲时禁用慢启动可以改善瞬时发送数据的长TCP连接的性能")]),v._v(" "),t("li",[v._v("窗口缩放 -- 增大最大接收窗口大小，让高延迟的连接达到更好吞吐量")]),v._v(" "),t("li",[v._v("TCP快速打开 — 允许在第一个SYN分组中发送应用程序数据")]),v._v(" "),t("li",[v._v("消除不必要的数据传输可以提高很大的性能，如减少下载不必要的资源，或者通过压缩算法把要发送的比特数降到最低")]),v._v(" "),t("li",[v._v("减少网络往返的延迟 — 通过在不同的地区部署服务器(比如，使用CDN)，把数据放到接近客户端的地方")]),v._v(" "),t("li",[v._v("尽可能重用已经建立的TCP连接，把慢启动和其他拥塞控制机制的影响降到最低")])]),v._v(" "),t("h3",{attrs:{id:"post和get区别"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#post和get区别","aria-hidden":"true"}},[v._v("#")]),v._v(" Post和Get区别")]),v._v(" "),t("ul",[t("li",[v._v("Get请求能缓存，Post不能")]),v._v(" "),t("li",[v._v("Post相对Get安全一点，因为Get请求都包含在URL里，且会被浏览器保存历史记录，Post不会，但是抓包还是一样")]),v._v(" "),t("li",[v._v("Post可以通过request body来传输比Get更多的数据")]),v._v(" "),t("li",[v._v("URL有长度限制，会影响Get请求，但是这个长度限制是浏览器规定的，不是RFC规定的")]),v._v(" "),t("li",[v._v("Post支持更多的编码类型且不对数据类型限制")])]),v._v(" "),t("h2",{attrs:{id:"tls（传输层安全）"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#tls（传输层安全）","aria-hidden":"true"}},[v._v("#")]),v._v(" TLS（传输层安全）")]),v._v(" "),t("blockquote",[t("p",[v._v("SSL(Secure Sockets Layer,安全套接字层)协议通过加密来保护客户个人资料，通过认证和完整性检查来确保交易安全，SSL协议在直接位于TCP上一层的应用层被实现")]),v._v(" "),t("p",[v._v("SSL不会影响上层协议(如HTTP、电子邮件、即时通讯)，但能够保证上层协议的网络通信安全")])]),v._v(" "),t("p",[v._v("SSL在后来被改名为TLS。但不等同，实际上TLS1.0是SSL3.0的升级版")]),v._v(" "),t("h3",{attrs:{id:"tls握手"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#tls握手","aria-hidden":"true"}},[v._v("#")]),v._v(" TLS握手")]),v._v(" "),t("p",[v._v("客户端和服务器通过TLS交换数据之前，要协商建立加密信道。协商内容包括TLS版本、加密套件，必要时还会验证证书")]),v._v(" "),t("p",[v._v("每一个TLS连接在TCP握手基础上"),t("strong",[v._v("最多需要两次")]),v._v("额外的往返。TLS提供了恢复功能，可以在多个连接间共享协商后的安全秘钥，这样可以加两次往返缩小为一次。")]),v._v(" "),t("p",[v._v("TLS的会话恢复有两种方式：会话标识符(会话缓存)和会话记录单(无状态恢复)")]),v._v(" "),t("ul",[t("li",[t("p",[v._v("会话标识符(Session Identifier)")]),v._v(" "),t("p",[v._v('在内部，服务器会为每个客户端保存一个会话ID和协商后的会话参数。客户端也可以保存会话ID信息，并将ID包含在后续会话的"ClientHello"消息中。假如客户端和服务器都可以在自己的缓存中找到共享的会话ID参数，那么就可以进行简短握手，即一次往返。')]),v._v(" "),t("p",[v._v("但会带来问题，因为服务器要为每个客户都创建和维护一段会话缓存，对于每天都有几万甚至几百万独立连接的服务器，要占用很大的内存，因此需要一套会话ID缓存和清除策略应对。")])]),v._v(" "),t("li",[t("p",[v._v("会话记录单(Session Ticket)")]),v._v(" "),t("p",[v._v('客户端先表明自己支持会话记录单，服务器可以在完整TLS握手的最后一次交换中添加一条"新会话记录单"(New Session Ticket)记录，包含只有服务器知道的安全秘钥吉阿米果的所有会话数据。客户端将这个记录单保存下来，在后续会话的ClientHello消息中，将其包含在Session Ticket扩展中。所有会话数据只保存在客户端，由于数据被加密过，且秘钥只有服务器知道，因此仍然是安全的。')]),v._v(" "),t("p",[v._v("会话记录单消除了服务器端的缓存负担，通过客户端在于服务器新连接时提供会话记录单简化了部署。")])])]),v._v(" "),t("h3",{attrs:{id:"信任链"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#信任链","aria-hidden":"true"}},[v._v("#")]),v._v(" 信任链")]),v._v(" "),t("p",[v._v("身份验证是建立每个TLS连接必不可少的部分")]),v._v(" "),t("p",[v._v("可以用张三和李四表述两者之间的验证过程：")]),v._v(" "),t("ul",[t("li",[v._v("张三和李四分别生成自己的公钥和私钥")]),v._v(" "),t("li",[v._v("张三和李四分别隐藏自己的私钥")]),v._v(" "),t("li",[v._v("张三向李四公开自己的公钥，李四向张三公开自己的公钥")]),v._v(" "),t("li",[v._v("张三向李四发送 一条新消息，并用自己的私钥签名")]),v._v(" "),t("li",[v._v("李四使用张三的公钥验证收到的消息签名")])]),v._v(" "),t("p",[v._v("但信任才是交流的关键。只有张三和李四相互信任，保证不被别人冒名顶替，才能有接下来的信任交换")]),v._v(" "),t("p",[t("strong",[v._v("当使用浏览器时，我们应用信任谁")]),v._v("？")]),v._v(" "),t("ul",[t("li",[v._v("手工指定证书")]),v._v(" "),t("li",[v._v("证书颁发机构 — CA是被证书接受者(拥有者)和依赖证书的一方共同信任的第三方")]),v._v(" "),t("li",[v._v("浏览器和操作系统 — 每个操作系统和大多数浏览器都会内置一个知名证书颁发机构的名单")])]),v._v(" "),t("p",[v._v("现实中最常见的方案是使用第二种，浏览器指定可信任的证书颁发机构(根CA)，然后验证他们签署的每个站点的责任就转移到他们头上，他们会审计和验证这些站点的证书没有被滥用或冒充")]),v._v(" "),t("h3",{attrs:{id:"证书撤销"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#证书撤销","aria-hidden":"true"}},[v._v("#")]),v._v(" 证书撤销")]),v._v(" "),t("p",[v._v("证书颁发者出于某些原因，如证书的私钥不再安全、证书颁发机构本身被冒名顶替，或者其他各种正常的原因，像以旧换新或所属关系更替等，需要撤销或作废证书。证书本身会包含如何检测其是否过期的指令。")]),v._v(" "),t("ul",[t("li",[v._v("证书撤销名单(CRL, Certificate Revocation List)，每个证书颁发机构维护并定期发布已撤销证书的序列号名单。任何想验证证书的人都可以下载撤销名单，检查相应证书是否榜上有名。如果有，说明证书已经被撤销CRL文件本身是可以定期发布、每次更新时发布，或通过HTTP或其他文件传输协议来提供访问，通常允许被缓存一定时间，但会存在一些问题\n"),t("ul",[t("li",[v._v("CRL名单会随着证书的增多而变长，每个客户端都必须取得包含所有序列号的完整名单")]),v._v(" "),t("li",[v._v("没有办法立即更新刚刚被撤销的证书序列号，比如客户端先缓存了CRL，之后证书被撤销，要等到缓存过期之后，该证书才能视为无效")])])]),v._v(" "),t("li",[v._v("在线证书状态协议(OCSP, Online Certificate Status Protocol)，提供了一种实时检查证书状态的机制。OCSP占用带宽更少，支持实时验证。但同样会带来问题\n"),t("ul",[t("li",[v._v("证书颁发机构必须处理实时更新")]),v._v(" "),t("li",[v._v("证书颁发机构必须确保随时可以访问")]),v._v(" "),t("li",[v._v("客户端在进一步协商之前阻塞OCSP请求")]),v._v(" "),t("li",[v._v("OCSP请求可能会泄漏客户端的隐私")])])])]),v._v(" "),t("h3",{attrs:{id:"tsl记录大小"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#tsl记录大小","aria-hidden":"true"}},[v._v("#")]),v._v(" TSL记录大小")]),v._v(" "),t("p",[v._v("TLS的应用数据都会根据记录协议传输。每条记录的上限为16KB，视选择的加密方式不同，每条记录还可能额外带有20到40字节的首部、MAC及可选的填充信息。MTU通常为1500字节，因此分组占比最小的情况下只相当于帧大小的6%")]),v._v(" "),t("p",[v._v("记录越小，分帧浪费越大。但是也不是记录增大到上限(60KB)也不一定好。因为TLS层必须等到所有TCP分组都到达之后才能解密数据。只要有TCP分组因拥塞控制而丢失、失序或被节流，那就必须将相应TLS记录的分段缓存起来，从而导致额外的延迟。实践中，这种延迟会造成浏览器性能显著下降，因为浏览器倾向于逐字节地读取数据")]),v._v(" "),t("p",[v._v("值得推荐的方式：每个TCP分组恰好封装一个TLS记录，而TLS记录大小恰好占满TCP分配的"),t("strong",[v._v("MSS(Maximum Segment Size, 最大段大小)")]),v._v("。也就是不要让TLS记录分成多个TCP分组，另一方面又要尽量在一条记录中多发送数据，以下数据可以做最优参考：")]),v._v(" "),t("ul",[t("li",[v._v("IPv4需要20字节，IPv6需要40字节")]),v._v(" "),t("li",[v._v("TCP帧需要20字节")]),v._v(" "),t("li",[v._v("TCP选项需要40字节(时间戳，SACK等)")])]),v._v(" "),t("p",[v._v("常见MTU为1500字节，TLS记录大小在IPv4下是1420字节，在IPv6下是1400字节。为确保兼容，建议使用IPv6下的大小：1400字节。")]),v._v(" "),t("h3",{attrs:{id:"tls压缩"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#tls压缩","aria-hidden":"true"}},[v._v("#")]),v._v(" TLS压缩")]),v._v(" "),t("p",[v._v("TLS内置了压缩功能，支持对记录协议传输的数据进行无损压缩。但在实践中，往往"),t("strong",[v._v("需要禁用服务器上的TLS压缩功能")])]),v._v(" "),t("ul",[t("li",[v._v("会受到安全攻击，攻击者利用TLS压缩恢复加密认证cookie，实施会话劫持")]),v._v(" "),t("li",[v._v("传输级的TLS压缩不关心内容，可能会再次压缩已经压缩过的数据(图像，视频等)")])]),v._v(" "),t("p",[v._v("双重压缩会浪费服务器和客户端的CPU时间，而且暴露的安全漏洞也很严重，因此需要禁用TLS压缩")]),v._v(" "),t("h3",{attrs:{id:"证书链的长度"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#证书链的长度","aria-hidden":"true"}},[v._v("#")]),v._v(" 证书链的长度")]),v._v(" "),t("p",[v._v("验证信任链需要浏览器遍历链条中的每个节点，从站点证书开始递归验证父证书，直至信任的根证书")]),v._v(" "),t("p",[v._v("优化首要工作就是检查服务器在握手时没有忘记包含所有中间证书")]),v._v(" "),t("p",[v._v('其次，要确保证书链的长度最小。理想情况下，发送的证书链应该只包含两个证书：站点证书和中间证书颁发机构的证书。第三个证书直接是根证书颁发机构的证书，已经包含在浏览器内置的信任名单中，不用发送。这样做的好处是，一般证书发送是在"慢启动"算法初始阶段，如果超过了TCP的初始拥塞窗口，那么就需要多握手一次往返，导致服务器需要停下来等待客户端的ACK消息，浪费了等待时间')]),v._v(" "),t("p",[v._v("而且，一般在证书链中不需要包含根证书颁发机构的证书，没有必要。因为浏览器的信任名单中没有该根证书，那就说明不被信任，即便发送了也无济于事")]),v._v(" "),t("p",[v._v("理想的证书链应该在"),t("strong",[v._v("2KB或3KB")]),v._v("左右，同事还能给浏览器提供所有必要的信息避免不必要的往返或者对证书本身额外的请求")]),v._v(" "),t("h3",{attrs:{id:"ocsp封套-ocsp-stapling"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#ocsp封套-ocsp-stapling","aria-hidden":"true"}},[v._v("#")]),v._v(" OCSP封套(OCSP stapling)")]),v._v(" "),t("p",[v._v("服务器可以在证书链中包含(封套)证书颁发机构的OCSP响应，让浏览器跳过在线查询。把查询OCSP操作转移到服务器可以让服务器缓存签名的OCSP响应，从而节省很多客户端的请求")]),v._v(" "),t("p",[v._v("要启用OCSP封套，需要服务器支持。目前nginx、apache和IIS等服务器都可以通过配置支持OCSP封套")]),v._v(" "),t("h3",{attrs:{id:"http严格传输安全-hsts-strict-transport-security"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#http严格传输安全-hsts-strict-transport-security","aria-hidden":"true"}},[v._v("#")]),v._v(" HTTP严格传输安全(HSTS, Strict Transport Security)")]),v._v(" "),t("p",[v._v("一种安全策略机制。能让服务器通过简单的HTTP首部(如"),t("code",[v._v("Strict-Transport-Security: max-age=31536000")]),v._v(")对适用的浏览器声明访问规则。使用该策略后，会让代理使用以下规则：")]),v._v(" "),t("ul",[t("li",[v._v("所有对原始服务器的请求都通过HTTPS发送")]),v._v(" "),t("li",[v._v("所有不安全的链接和客户端请求在发送之前都应该在客户端自动转换为HTTPS")]),v._v(" "),t("li",[v._v("证书如果有错误，显示错误消息，用户不能回避警告")]),v._v(" "),t("li",[v._v("max-age以秒为单位制定HSTS规则集的生存时间")])]),v._v(" "),t("p",[v._v("从性能角度来说，HSTS通过把责任转移到客户端，让客户端自动把所有链接重写为HTTPS，消除了HTTP到HTTPS的重定向损失")]),v._v(" "),t("h2",{attrs:{id:"无线网路"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#无线网路","aria-hidden":"true"}},[v._v("#")]),v._v(" 无线网路")]),v._v(" "),t("h3",{attrs:{id:"最大信道容量-最大信息速率"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#最大信道容量-最大信息速率","aria-hidden":"true"}},[v._v("#")]),v._v(" 最大信道容量(最大信息速率)")]),v._v(" "),t("p",[v._v("香农定理")]),v._v(" "),t("blockquote",[t("p",[t("strong",[v._v("C=BW*log₂（1+S/N) （bit/s)")])])]),v._v(" "),t("ul",[t("li",[v._v("C信道容量，单位是bit/s")]),v._v(" "),t("li",[v._v("BW是可用宽带，单位是Hz")]),v._v(" "),t("li",[v._v("S是信号，N是噪声，单位是W")])]),v._v(" "),t("p",[v._v("可以看出，数据传输速度最直接相关的就是接收端与发送端之间的可用带宽和信号强度")]),v._v(" "),t("p",[v._v("###影响信道容量因素")]),v._v(" "),t("ol",[t("li",[t("p",[t("strong",[v._v("信道的总体比特率与分配的带宽呈正比")]),v._v("。换句话说，在其他条件等同的情况下，频率范围加倍、传输速度加倍")]),v._v(" "),t("p",[v._v("不同频率范围的性能也是不一样的。")]),v._v(" "),t("ul",[t("li",[v._v("低频信号传输距离远、覆盖范围广，但要求天线更大，而且竞争激烈")]),v._v(" "),t("li",[v._v("高频信号能传输更多数据，但传输距离不远，因此覆盖范围小，需要较多的基础设施加入")])])]),v._v(" "),t("li",[t("p",[v._v("信号强度也叫信噪比(SRN, Signal Noise Ratio)，信噪比衡量的是与其信号强度与背景噪声及干扰之间的比值。"),t("strong",[v._v("背景噪声越大，携带信息的信号就必须越强")])])]),v._v(" "),t("li",[t("p",[v._v("用于编码信号的算法，也对无线性能有显著影响。调制指的就是数模转换过程，不同调制算法的转换效率是不一样的。不同的字母数字组合与符号率决定了信道的最终吞吐量")])])]),v._v(" "),t("h2",{attrs:{id:"wi-fi"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#wi-fi","aria-hidden":"true"}},[v._v("#")]),v._v(" Wi-Fi")])])}],!1,null,null,null);r.options.__file="Damn-hole-of-network.md";_.default=r.exports}}]);