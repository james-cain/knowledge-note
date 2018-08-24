# 网络

## OSI七层协议

应用层、表示层、会话层、传输层、网络层、数据链路层、物理层

## TCP/IP四层体系

应用层（各种应用层协议，如TELNET、FTP、SMTP）、传输层（TCP、UDP）、网际层（IP）、网络接口层

## 五层协议体系

应用层、传输层、网络层、数据链层、物理层

## UDP

**面向报文**

UDP是一个面向报文的协议。即只是报文的搬运工，不会对报文进行任何拆分和拼接操作

- 在发送端，应用层将数据传递给传输层的 UDP 协议，UDP 只会给数据增加一个 UDP 头标识下是 UDP 协议，然后就传递给网络层了
- 在接收端，网络层将数据传递给传输层，UDP 只去除 IP 报文头就传递给应用层，不会任何拼接操作

**不可靠性**

1. 无连接的，通信是不需要建立和断开连接
2. 不可靠的，协议收到什么数据就传递什么数据，不关系对方是否能收到
3. 没有拥塞控制，一直会以恒定的速度发送数据。弊端在网络条件不好的情况下会导致丢包，好处对实时性要求高的场景（比如电话会议）使用更好

**高效**

![UDP](https://coracain.top/assets/UDP.png)

UDP没有TCP复杂，不需要保证数据不丢失且有序到达。所以UDP的头部开销小，只有八个字节，在传输数据报文时是高效的

头部包含以下几个数据

- 两个十六位的端口号，分别为源端口Source port（可选字段）和目标端口Destination port
- 整个数据报文的长度Length
- 整个数据报文的检验和（IPV4可选字段），该字段用于发现头部信息和数据中的数据

传输方式

支持一对一，一对多，多对多，多对一，即支持单播，多播，广播的功能

## TCP

![TCP](https://coracain.top/assets/TCP.png)

- Sequence number，保证TCP传输的报文都是有序的，对端可以通过序号顺序的拼接报文

- Acknowledgement Number，表示数据接收端期望接收的下一个字节的编号是多少，同事表示上一个序号的数据已经收到

- 标识符

  URG=1：表示本数据报的数据部分包含紧急信息，是一个高优先级报文，此时紧急指针有效。紧急数据一定位于当前数据包数据部分的最前面，紧急指针标明了紧急数据的尾部

  ACK=1：表示确认号字段有效。TCP规定在连接建立后传送的所有报文段都必须把ACK置为1

  PSH=1：表示接收端应该立刻将数据push给应用层，而不是等缓冲区满了再提交

  RST=1：表示当前TCP连接出现严重问题，可能需要重新建立TCP连接，也可以用于拒绝非法的报文段和拒绝连接请求

  SYN=1：SYN=1，ACK=0时，表示报文段是一个连接请求报文；SYN=1，ACK=1，表示报文段是一个同意建立连接的应答报文

  FIN=1：表示报文段是一个释放连接的请求报文

### 状态机

HTTP是无连接，所以下层的TCP也是无连接的，只是两端共同维护状态

#### 建立连接三次握手

![三次握手](https://coracain.top/assets/3timeshandshake.png)

主动发起端称为客户端，被动连接端称为服务端。不管是客户端还是服务端，TCP连接建立后都能发送和接受数据，所以TCP是一个**全双工**的协议

**起初**

两端都是CLOSED状态，通信开始前，都会创建TCB。服务端创建完TCB后便进入到LISTEN状态，等待客户端发送数据

**第一次握手**

客户端向服务端发送连接请求报文段。报文段中包含自身的数据通讯初始序号。请求发送后，客户端进入SYN-SENT状态

**第二次握手**

服务端收到连接请求报文段后，同意连接就会发送一个应答，应答包含自身的数据通讯初始序号，发送完进入SYN-RECEIVE状态

**第三次握手**

当客户端收到连接同意的应答后，向服务端发送一个确认报文。客户端发完便进入ESTABLISHED状态，服务端收到也进入ESTABLISHED状态，连接建立成功

**第三次握手可以包含数据，通过TCP快速打开（TFO）技术，客户端和服务端存储相同cookie，下次握手时发出cookie达到减少RTT的目的**

#### 断开连接四次握手

![四次握手](https://coracain.top/assets/4timeshandshake.png)

在断开连接时两端都需要发送FIN和ACK

**第一次握手**

客户端任务数据发送完成，需要向服务端发送连接释放请求

**第二次握手**

服务端收到连接释放请求后，会告诉应用层要释放TCP链接。然后会发送ACK，并进入CLOSE_WAIT状态，表示客户端到服务端的链接已经释放，不接受客户端的数据了。

**第三次握手**

服务端此时还没有发完的数据会继续发送，完毕后会向客户端发送连接释放请求，服务端便进入LAST_ACK状态

**第四次握手**

客户端收到释放请求后，向服务端发送确认应答，此时客户端进入TIME_WAIT状态。该状态会持续2MSL(最大段生存期，指报文段在网络中生存的时间，超时会被抛弃)时间，若该时间段内没有服务端的重发请求，就进入CLOSE状态。当服务端收到确认应答后，也进入CLOSE状态

#### ARQ协议

超时重传机制。通过确认和超时机制保证数据的正确送达，ARQ协议包含停止等待ARQ和连续ARQ

##### 停止等待ARQ

这个协议的缺点是传输效率低，在良好的网络环境下每次发送报文都得等待对端的ACK

##### 连续ARQ

发送端拥有一个**发送窗口**，在没有收到应答的情况下持续发送窗口内的数据，相比停止等待ARQ协议来说减少了等待时间，提高效率

连续ARQ中，接收端会持续不断收到报文。通过**累计确认**，可以在收到多个报文以后统一回复一个应答报文。报文中的ACK可以用来告诉发送端这个序号之前的数据已经全部接受到了，下次请发送这个序号+1的数据

累计确认会存在问题。在连续接收报文时，可能会遇到收到序号5，未接受到序号6，然而序号7以后的报文已经接收。遇到这种情况，ACK会回复6，导致7重复发送，这种情况可以通过**Sack**来解决。

##### 滑动窗口（流量控制）

两端都维护窗口：发送端窗口和接收端窗口

发送端窗口是由接收端窗口剩余大小决定的。接收方会把当前接收窗口的剩余大小写入应答报文，发送端收到应答后根据该值和网络拥塞情况设置发送窗口的大小，所以发送窗口的大小是不断变化的

![滑动窗口1](https://coracain.top/assets/sliderwindow1.png)

当发送端接收到应答报文后，会将窗口进行滑动

![滑动窗口2](https://coracain.top/assets/sliderwindow2.png)

**滑动窗口实现了流量控制**。接收方通过报文告知发送方还可以发送多少数据，从而保证接收方能够来得及接收数据

**zero窗口**

在发送报文的过程中，可能会遇到对端出现零窗口的情况。发送端会停止发送数据，并启动persistent timer。该定时器会定时发送请求给对端，让对端告知窗口大小。在重试次数超过一定次数后，可能会中断TCP连接

##### 拥塞处理

拥塞处理作用于网络，防止过多的数据拥塞网络，避免出现网络负载过大的情况

拥塞处理包括了四个算法：慢开始、拥塞避免、快速重传、快速恢复

- 慢开始

  在传输开始时将发送窗口慢慢指数级扩大，避免一开始就传输大量数据导致网络拥塞

  具体步骤：

  1. 连接初试设置拥塞窗口为1MSS（一个分段的最大数据量）
  2. 每过一个RTT就将窗口大小乘2
  3. 指数级增长到阈值后，启动拥塞避免算法

- 拥塞避免

  每过一个RTT窗口大小只加一，这样避免指数级增长导致网络拥塞，慢慢将大小调整到最佳值

  在传输过程中可能定时器超时的情况，这时TCP会认为网络拥塞了，会马上进行以下：

  1. 将阈值设为当前拥塞窗口的一半
  2. 将拥塞窗口设为1MSS
  3. 启动拥塞避免算法

- 快速重传

  一般和快恢复一起出现。一旦接收端收到的报文出现失序情况，接收端只会回复最后一个顺序正确的报文序号（没有Sack的情况下）。如果收到三个重复的ACK，无需等待定时器超时再重发而是启动快速重传。具体算法包括两种：

  1. TCP Taho

     将阈值设为当前拥塞窗口的一半

     将拥塞窗口设为1MSS

     重新开始满开始算法

  2. TCP Reno

     拥塞窗口减半

     将阈值设为当前拥塞窗口

     进入快恢复阶段（重发对端需要的包，一旦受到一个新的ACK答复就退出该阶段）

     使用拥塞避免算法

  3. TCP New Reno

     TCP发送方先记下三个重复ACK的分段的最大序号

     假如有一个分段数据是1~10序号的报文，其中丢失了序号为3和7的报文，那么该分段的最大序号就是10.发送端只会收到ACK序号为3的应答。这时候重发序号为3的报文，接收方顺利接受并会发送ACK序号为7的应答。接收方顺利接收并会发送ACK序号为11的应答，这时发送端认为这个分段接收端已经顺利接收，接下来退出快恢复阶段。

## HTTP

### headers

####请求头

1. <u>Accept</u>：用来告知客户端可以处理的内容类型，这种内容类型用MIME类型来表示。借助内容协商机制，服务器可以从诸多备选项中选择一项进行应用，并使用**Content-Type**应答头通知客户端它的选择。

< MIME_type >/< MIME_subtype >

< MIME_type >/*

*/ * 任意类型的MIME类型

;q=(q因子权重)

如： text/html,application/xhtml+xml,application/xml;q=0.9, * /*;q=0.8

2. <u>Accept-Charset</u>：请求头用来告知（服务器）客户端可以处理的字符集类型。借助内容协商机制，服务器可以从诸多备选项中选择一项进行应用，并使用**Content-Type**应答头通知客户端它的选择。通常不会设置此项。

<**charset**> utf-8或iso-8895-1字符集

*** 通配符**

;q=

3. <u>Accept-Encoding</u>：将客户端能够理解的内容编码方式进行通知。使用并在相应报文首部**Content-Encoding**中通知客户端选择

压缩方式包括gzip（Lempel-Ziv coding压缩算法（LZ77）+32位CRC校验的编码方式）、compress（Lempel-Ziv-Welch（LZW））、deflate（zlib结构+deflate压缩算法）、br（Brotli算法）、identity（保持自身）、*（匹配其他任意未在首部字段中列出的编码方式）

identity不压缩存在两种情形：a.要发送的数据已经经过压缩，再次进行压缩不会导致被传输的数据量更小，如图像格式 b.服务器超载，无法承受压缩需求导致的计算开销，通常，如果服务器使用超过80%的计算能力，不建议压缩

4. Accept-Language：允许客户端声明它可以理解的自然语言，以及优先选择的区域方言，并使用**Content-Language**应答头通知客户端它的选择。
5. Accept-Ranges：标识自身支持范围请求（partial requests）。当浏览器发现Accept-Range头时，可以尝试继续中断了的下载，而不是重新开始

none：在一些浏览器，如IE9，会依据该头部去禁用或者移除下载管理器的暂停按钮

bytes

6. Access-Control-Allow-Credentials：表示是否可以将对请求的响应暴露给页面。Credentials可以是<u>cookies，authorization headers 或TLS client certificates</u>

当作为对预检请求的响应的一部分时，这能表示是否真正的请求可以使用credentials。注意GET请求**没有预检**，所以若对资源的请求带有了credentials，响应会被浏览器忽视

Access-Control-Allow-Credentials头需与XMLHttpRequest.withCredentials或Fetch api中的Request()构造器中的credentials选项结合使用

Access-Control-Allow-Credentials: true

使用带credentials的XHR：

```
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://example.com/', true);
xhr.withCredentials = true;
xhr.send(null);
```

使用带credentials的Fetch：

```
fetch(url, {
    credentials: 'include'
})
```

7. Access-Control-Allow-Headers：用于**预检请求**中，列出将会在正式请求的**Access-Control-Expose-Headers**字段中出现的首部信息

简单首部，如 [simple headers](https://developer.mozilla.org/en-US/docs/Glossary/simple_header)、[`Accept`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept)、[`Accept-Language`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept-Language)、[`Content-Language`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Language)、[`Content-Type`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Type) （只限于解析后的值为 `application/x-www-form-urlencoded、``multipart/form-data `或 `text/plain 三种MIME类型（不包括参数）），它们始终是被支持的，不需要在这个首部特意列出。`

如果请求中含有 [`Access-Control-Request-Headers`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Access-Control-Request-Headers) 字段，那么这个首部是必要的。

8. Access-Control-Allow-Methods：对**预检请求**的应答明确了客户端所要访问的资源允许使用的方法或方法列表

Access-Control-Allow-Methods: POST,GET,OPTIONS

9. Access-Control-Allow-Origin：指定了该响应的资源是否允许与给定的origin共享

***** 允许所有域都具有访问资源的权限

<**origin**> 指定一个可以访问资源的URI

10. Access-Control-Expose-Headers：列出哪些首部可以作为响应的一部分暴露给外部

默认情况下，Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma简单响应首部是可以暴露给外部的，其他的首部需要在里面列出来

11. Access-Control-Max-Age：表示**预检请求**的返回结果（即Access-Control-Allow-Methods和Access-Control-Allow-Headers提供的信息）可以被缓存多久

在Firefox中，上限是24小时（即87400秒），在Chromium中则是10分钟（即600秒）还规定了默认值是5秒

若值为-1，表示禁用缓存。每一次请求都需要提供预检请求，即用OPTIONS请求进行预检

12. Access-Control-Request-Headers：出现在**预检请求**中，用于通知服务器在真正的请求中会采用哪些请求首部
13. Access-Control-Request-Method：出现在**预检请求**中，用于通知服务器在真正的请求中会采用哪种HTTP方法。因为预检请求所使用的方法总是OPTIONS，与实际请求所使用的方法不一样，**所以这个首部是必要的**
14. Age：消息头里包含消息对象在缓存代理中存储的时长，以秒为单位

Age消息头的值通常接近于0.表示此消息对象刚刚从原始服务器获取不久；其他的值表示代理服务器当前的系统时间与此应答消息中的通用**消息头Date**的值之差

15. Allow：用于枚举资源所支持的HTTP方法的集合

若服务器返回状态码 [`405`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/405) `Method Not Allowed，则该首部字段亦需要同时返回给客户端。如果` `Allow`  首部字段的值为空，说明资源不接受使用任何 HTTP 方法的请求。这是可能的，比如服务器需要临时禁止对资源的任何访问。

16. Authorization：请求消息头含有服务器用于验证用户代理身份的凭证，通常会在服务器返回[`401`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/401) `Unauthorized` 状态码以及[`WWW-Authenticate`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/WWW-Authenticate) 消息头之后在后续请求中发送此消息头。
17. Cache-Control：用于http请求和响应中通过指定指令来实现缓存机制。缓存指令是单向的，意味着在请求设置的指令，在响应中不一定包含相同的指令。

- 缓存请求指令

  ```
  Cache-Control: max-age=<seconds>(最大存储周期，相对于请求的时间)
  Cache-Control: max-stale[=<seconds>](表明客户端愿意接收一个已经过期的资源。 可选的设置一个时间(单位秒)，表示响应不能超过的过时时间)
  Cache-Control: min-fresh=<seconds>(表示客户端希望在指定的时间内获取最新的响应)
  Cache-control: no-cache 
  Cache-control: no-store
  Cache-control: no-transform
  Cache-control: only-if-cached(表明客户端只接受已缓存的响应，并且不要向原始服务器检查是否有更新的拷贝)
  ```

- 缓存响应指令

  ```
  Cache-control: must-revalidate(缓存必须在使用之前验证旧资源的状态，并且不可使用过期资源)
  Cache-control: no-cache(在释放缓存副本之前，强制告诉缓存将请求提交给原始服务器进行验证)
  Cache-control: no-store(缓存不应存储有关客户端请求或服务器响应的任何内容)
  Cache-control: no-transform(不得对资源进行转换或转变)
  Cache-control: public(可缓存，表明响应可以被任何对象缓存)
  Cache-control: private(可缓存，表明响应只能被单个用户缓存，不能作为共享缓存，即代理服务器不能缓存)
  Cache-control: proxy-revalidate(与must-revalidate作用相同，但它仅适用于共享缓存（例如代理），并被私有缓存忽略)
  Cache-Control: max-age=<seconds>
  Cache-control: s-maxage=<seconds>(覆盖max-age 或者 Expires 头，但是仅适用于共享缓存(比如各个代理)，并且私有缓存中它被忽略。)
  ```

- 拓展Cache-Control指令

  ```
  Cache-control: immutable (表示响应正文不会随时间而改变)
  Cache-control: stale-while-revalidate=<seconds>(表明客户端愿意接受陈旧的响应，同时在后台异步检查新的响应。秒值指示客户愿意接受陈旧响应的时间长度)
  Cache-control: stale-if-error=<seconds>(表示如果新的检查失败，则客户愿意接受陈旧的响应。秒数值表示客户在初始到期后愿意接受陈旧响应的时间)
  ```

禁止缓存

```
Cache-Control: no-cache, no-store, must-revalidate
```

缓存静态资源

```
Cache-Control: public, max-age=31536000
```

18. Clear-Site-Data：表示清除当前请求网站有关的浏览器数据（cookie，存储，缓存）。若想清楚所有类型的数据，可以使用通配符（*）

    ```
    // 单个参数
    Clear-Site-Data: "cache"
    // 多个参数(用逗号分隔)
    Clear-Site-Data: "cache", "cookies"
    ```

    参数：

    - "cache" 服务端希望删除本URL原始响应的本地缓存数据。根据浏览器不同，可能还会清除预渲染页面，脚本缓存，WebGL着色器缓存或者地址栏建议等内容
    - "cookies"服务端希望删除URL响应的所有cookie。HTTP身份验证凭据也会被清除
    - "storage"服务端希望删除URL原响应的所有DOM存储，包括存储机制，如localStorage、sessionStorage、IndexedDB、服务注册线程、AppCache、WebSQL数据库、FileSystem API data、Plugin data
    - "executionContexts" 服务端希望浏览器重新加载本请求（location.reload）
    - "*" 服务端希望清除原请求响应的所有类型的数据

    **登出**，如果用户退出网站或服务，希望删除本地存储的数据。可以在https://example.com/logout的**响应头**增加Clear-Site-Data

    ```
    Clear-Site-Data: "cache", "cookies", "storage", "executionContexts"
    ```

    清除cookies，如果在https://example.com/clear-cookies的响应头中出现，则同一域和所有子域（如https://stage.example.com等）的所有Cookie，都会被清除

    ```
    Clear-Site-Data: "cookies"
    ```

19. Connection：决定当前的事务完成后，是否会关闭网络连接。如果该值是“keep-alive”，网络连接就是持久不会关闭的。keep-alive不是必须填的

20. Content-Disposition：指示回复的内容该以何种形式展示，以内联（**inline**）即网页或者页面的一部分，还是附件（attachment）的形式下载并保存到本地，大多数浏览器会呈现一个“保存为”的对话框，将filename的值预填为下载后的文件名

    Content-Disposition: inline

    Content-Disposition: attachment

    Content-Disposition: attachment; filename="filename.jpg"

21. Content-Encoding：实体消息首部，用于对特定媒体类型的数据进行压缩。对于特定类型的文件，比如jpeg图片文件，已经进行压缩过的，就不需要继续压缩

22. Content-Language：用来说明访问者希望采用的语言或语言组合，这样的话用户就可以根据自己偏好的语言来定制不同的内容

23. Content-Length：用来指名发送给接收方的消息主体的大小，用十进制数字表示

24. Content-Location：首部指定的是要返回的数据的地址选项。最主要的用途是用来指定要访问的资源经过内容协商后的结果的URL

    **Location**-指定的是一个重定向请求的目的地址（或者新创建的文件的URL）-对应的是响应

    Content-Location-指向的是可供访问的资源的直接地址，不需要进行进一步的内容协商-对应的是要返回的实体

25. Content-Range：显示的是一个数据片段在整个文件中的位置

    Content-Range: <**unit**>  <**range-start**>-<**range-end**>/<**size**>

    Content-Range: <**unit**>  <**range-start**>-<**range-end**>/*

    Content-Range: <**unit**>  */<**size**>

    unit-数据区间所采用的单位。通常是字节（byte）

    range-start-区间起始值

    range-end-区间的结束值

    size-整个文件的大小

26. Content-Security-Policy：允许站点管理者在指定的页面控制用户代理的资源。主要以白名单的形式配置可信任的内容来源，在网页中，能够使用白名单中的内容正常执行（包含JS、CSS、Image等），而非白名单的内容无法正常执行，这条策略将极大的指定服务源以及脚本端点。减少**跨站点脚本攻击（XSS）**，也能减少**运营商劫持的内容注入攻击**

    Head中添加Meta标签示例

    ```
    <meta http-equiv="Content-Security-Policy" content="script-src 'self'">
    ```

    不支持CSP的浏览器将会自动忽略CSP的信息，不会有什么影响

    当定义多个策略的时候，浏览器会优先采用最先定义的。

    | 指令            | 取值示例                  | 说明                                                         |
    | --------------- | ------------------------- | ------------------------------------------------------------ |
    | default-src     | 'self' cdn.example.com    | 定义针对所有类型（js/image/css/web font/ajax/iframe/多媒体等）资源的默认加载策略，某类型资源如果没有单独定义策略，就使用默认。 |
    | script-src      | 'self' js.example.com     | 定义针对JavaScript的加载策略                                 |
    | object-src      | 'self'                    | 针对,, 等标签的加载策略                                      |
    | style-src       | 'self' css.example.com    | 定义针对样式的加载策略                                       |
    | img-src         | 'self' image.example.com  | 定义针对图片的加载策略                                       |
    | media-src       | 'media.example.com'       | 针对或者引入的html多媒体等标签的加载策略                     |
    | frame-src       | 'self'                    | 针对iframe的加载策略                                         |
    | connect-src     | 'self'                    | 针对Ajax、WebSocket等请求的加载策略。不允许的情况下，浏览器会模拟一个状态为400的响应 |
    | font-src        | font.qq.com               | 针对Web Font的加载策略                                       |
    | sandbox         | allow-forms allow-scripts | 对请求的资源启用sandbox                                      |
    | report-uri      | /some-report-uri          | 告诉浏览器如果请求的资源不被策略允许时，往哪个地址提交日志信息。不阻止任何内容，可以改用Content-Security-Policy-Report-Only头 |
    | base-uri        | 'self'                    | 限制当前页面的url（CSP2）                                    |
    | child-src       | 'self'                    | 限制子窗口的源(iframe、弹窗等),取代frame-src（CSP2）         |
    | form-action     | 'self'                    | 限制表单能够提交到的源（CSP2）                               |
    | frame-ancestors | 'none'                    | 限制了当前页面可以被哪些页面以iframe,frame,object等方式加载（CSP2） |
    | plugin-types    | application/pdf           | 限制插件的类型（CSP2）                                       |
    | manitest-src    |                           | 限制application manifest文件源                               |
    | worker-src      |                           | 限制Worker，SharedWorker或者ServiceWorker脚本源              |
    | disown-opener   |                           | 确保资源在操作的时候能够脱离父页面                           |
    | navigation-to   |                           | 限制文档可以通过以下任何方式访问URL（a，form，window.location，window.open，etc） |
    | report-to       |                           | Fires a `SecurityPolicyViolationEvent`                       |

    指令值示例及说明

    | 指令值                              | 示例                                        | 说明                                                         |
    | ----------------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
    | *                                   | img-src *                                   | 允许任何内容                                                 |
    | none'                               | img-src 'none'                              | 不允许任何内容                                               |
    | 'self'                              | img-src 'self'                              | 允许同源内容                                                 |
    | data:                               | img-src data:                               | 允许data:协议（如base64编码的图片）                          |
    | [www.a.com](http://www.a.com/)      | img-src [www.a.com](http://www.a.com/)      | 允许加载指定域名的资源                                       |
    | *.a.com                             | img-src *.a.com                             | 允许加载a.com任何子域的资源                                  |
    | [https://img.com](https://img.com/) | img-src [https://img.com](https://img.com/) | 允许加载img.com的https资源                                   |
    | https:                              | img-src https:                              | 允许加载https资源                                            |
    | 'unsafe-inline'                     | script-src 'unsafe-inline'                  | 允许加载inline资源（style属性，onclick，inline js和inline css等等） |
    | 'unsafe-eval'                       | script-src 'unsafe-eval'                    | 允许加载动态js代码，例如eval()                               |

    CSP使用方式

    HTML Meta标签

    Meta标签主要含有两部分的key-value：

    - http-equiv
    - content

    ```
    <meta http-equiv="Content-Security-Policy" content="script-src 'self'">
    ```

    HTTP Header

    通过HTTP header带上CSP的指令，可以支持所有请求

    ```
    Content-Security-Policy: script-src 'self' *.qq.com *.url.cn
    ```

27. Content-Security-Policy-Report-Only：响应头允许通过监测策略，生成JSON文档，通过POST请求发送到指定的URI，该策略只会返回报告，不会阻止运行，这是和Content-Security-Policy的却别

28. Content-Type：用于指示资源的MIME类型media type。在响应中，Content-Type标头告诉客户端实际返回的内容的内容类型。浏览器会在某些情况下进行MIME查找，并不一定遵循此标题的值；为了防止这种行为，可以将标题**X-Content-Type-Options**设置为**nosniff**

29. Cookie：存放由服务端通过Set-Cookie设置的HTTP cookies

30. DNT（Do Not Track）：表明用户对于网站追踪的偏好。DNT: 0/1

    0-表示用户愿意目标站点追踪用户个人信息

    1-表示用户不愿意目标站点追踪用户个人信息

31. Date：包含了消息生成的日期和时间

32. Etag：资源的特定版本的标识符。让缓存更高效，并节省带宽，如果内容没有改变，Web服务器不需要发送完整的响应。Etag可以防止资源的同时更新相互覆盖（“空中碰撞”）

    如果给定URL中的资源更改，则一定要生成新的Etag值。比较etags能快速确定此资源是否变化，但也可能被跟踪服务器永久存留。

    指令

    - 'W/'表示使用弱验证器。弱验证器很容易生成，但不利于比较
    - "<**etag-value**>"实体标签唯一表示所请求的资源。没有明确的算法实现，通常可以使用内容的散列，最后修改时间戳的哈希值，或简单的使用版本号方式

    **避免“空中碰撞”**- 使用Etag和If-Match头部实现

    **缓存未更改的资源**-通过Etag和If-None-Match比较实现。1.用户再次访问给定的URL（设有ETag字段），显示资源过期了且不可用，客户端就发送值为ETag的IF-None-Match header字段 2.服务端将客户端的ETag与其当前版本的资源的ETag进行比较，如果两个值匹配，服务器将返回不带任何内容的304未修改状态，告诉客户端缓存版本可用

33. Expect：是一个请求消息头，包含一个期望条件，表示服务器只有在满足此期望条件的情况下才能妥善处理请求。

34. Expires：响应头包含日期/时间，即在此时候之后，响应过期（http1.1）

    如果在Cache-Control响应头中设置了"max-age"或者"s-max-age"指令，那么Expires头会被忽略

35. Forwarded：包含了代理服务器的客户端的信息，即由于代理服务在请求路径中的接入而被修改或丢失的信息。可以用X-Forwarded-For、X-Forwarded-Host、X-Forwarded-Proto替换。会暴露一定的隐私和敏感信息，比如客户端的IP地址。

    ```
    Forwarded: by=<identifier>; for=<identifier>; host=<host>; proto=<http|https>
    ```

    Identifier - 显示在使用代理的过程中被修改或者丢失的信息。

    - 一个IP地址（V4或V6，ipv6地址需要包含在方括号里面，同时用括号括起来）
    - 语意不明的标识符（比如“_ hidden”或“_ secret”）
    - "unknown"，当前信息实体不可知

    by - 请求进入到代理服务器的接口

    for - 发起请求的客户端以及代理链中的一系列的代理服务器

    host - 代理接收到的Host首部的信息

    proto - 发起请求时采用的何种协议，通常是"http"或者"https"

    ```
    # 大小写不敏感
    Forwarded: For="[2001:db8:cafe::17]:4711"
    
    # for proto by 之间可用分号分隔
    Forwarded: for=192.0.2.60; proto=http; by=203.0.113.43
    
    # 多值可用逗号分隔
    Forwarded: for=192.0.2.43, for=198.51.100.17
    ```

36. Host：指名了服务器的域名，以及（可选的）服务器监听的TCP端口号。如果没有给定端口号，会自动使用被请求服务的默认端口（一般为80）HTTP1.1的所有请求报文中**必须包含**一个Host头字段。如果一个HTTP1.1请求缺少Host头字段或者设置了超过一个的Host头字段，会返回400状态码

37. If-Match：表示是一个条件请求。在请求方法为GET和HEAD的情况下，服务器仅在请求的资源满足此首部列出的ETag之一时才会返回资源。而对于PUT或其他非安全方法来说，只有在满足条件的情况下才可以将资源上传

38. If-Modified-Since：条件式请求首部，服务器只在所请求的资源在给定的日期时间之后对内容进行过修改的情况下才会将资源返回，状态码为200。如果请求的资源从那时未修改，那么返回一个不带有消息主体的304响应，而在**Last-Modified**首部中会带有上次修改时间。该**请求参数只会在GET或者HEAD请求中使用**

    当与If-None-Match一同出现时，会被忽略掉，除非服务器不支持If-None-Match

39. If-None-Match：表示是一个条件请求。对于GET和HEAD请求方法，当且仅当服务器上没有任何资源的ETag属性值与这个首部中列出的相匹配的时候，服务器端才会返回请求的资源，响应码200。对于其他方法来说，当且仅当最终确认没有已存在的资源的  [`ETag`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/ETag) 属性值与这个首部中所列出的相匹配的时候，才会对请求进行相应的处理。

40. If-Range：HTTP请求头字段用来使得Range头字段在一定条件下起作用：当字段值中的条件得到满足时，Range头字段才会起作用，同时服务器回复**206**部分内容状态码，以及Range头字段请求的响应部分；如果字段值中的条件没有得到满足，服务器将会返回200状态码，将返回完整的请求资源

    If-Range头字段通常用于断点续传的下载过程中，用来自从上次中断后，确保下载的资源没有发生改变

    ```
    If-Range: <星期>, <日> <月> <年> <时>:<分>:<秒> GMT
    If-Range: <etag>
    ```

41. If-Unmodified-Since：用于请求中，使得当前请求称为条件式请求：只有当资源在指定的时间之后没有进行过修改的情况下，服务器才会返回请求的资源，或是接受POST或其他non-safe方法的请求。如果所请求的资源在指定的时间之后发生了修改，那么会返回412错误

    应用场景：

    - 与non-safe方式如POST搭配使用，可以用来优化并发控制
    - 与含有If-Range消息头的范围请求搭配使用，用来确保新的请求片段来自于未经修改的文档

42. Keep-Alive（非标准）：允许消息发送者暗示连接的状态，还可以用来设置超时时长和最大请求数

43. Large-Allocation(非标准)：用来告诉浏览器加载该页面可能需要申请大内存。当前只有Firefox实现。WebAssembly或者asm.js会使用比较大的连续内存空间。Large-Allocation告诉浏览器将要加载的页面可能需要申请一个大的连续内存空间，浏览器依据该头部可能会单独启动一个专有的进程用于处理该页面

    指令：0- 是一个特殊值，代表分配的大小不确定（动态允许） <**megabytes**>- 预期需要申请的内存大小，以M为单位

44. Last-Modified：响应首部，包含源头服务器认定的资源作出修改的日期及时间。

45. Location：首部指定的是需要将页面重新定向至的地址（状态码为303、307、308、301、302）或者新创建的文件的URL（状态为201）。一般在响应码为3XX的响应中才会有意义

46. Origin：请求首部，指示请求来自于哪个站点。该字段指示服务器名称，并不包含任何路径信息。该首部用于**POST**或者**CORS**请求

47. Proxy-Authenticate：响应首部，指定了获取proxy server（代理服务器）上的资源访问权限而采用的身份验证方式。代理服务器对请求进行验证，以便进一步传递请求。

48. Proxy-Authentization：请求首部，其中包含了用户代理提供给代理服务器的用于身份验证的凭证

49. Range：请求首部，告知服务器返回文件的哪一部分。在一个Range首部中，可以一次性请求多个部分，服务器会以multipart文件的形式将其返回。如果服务器返回的是范围响应，需要使用206状态码。

    ```
    Range: <unit>=<range-start>-
    Range: <unit>=<range-start>-<range-end>
    Range: <unit>=<range-start>-<range-end>, <range-start>-<range-end>
    Range: <unit>=<range-start>-<range-end>, <range-start>-<range-end>, <range-start>-<range-end>
    ```

50. Referer：包含了当前请求页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。服务端一般用该首部识别访问来源。

    ```
    Referer首部可能暴露用户的浏览历史，涉及到用户的隐私问题
    ```

    在以下两种情况下，Referer不会被发送：

    - 来源页面采用的协议为表示本地文件的 "file" 或者 "data" URI；
    - 当前请求页面采用的是非安全协议，而来源页面采用的是安全协议（HTTPS）

51. Referrer-Policy：用来监管哪些访问来源信息—会在Referer中发送—应该被包含在生成的请求当中

    指令：

    - no-referrer- 整个referer首部会被移除
    - no-referrer-when-downgrade（默认值）- 在没有指定任何策略的情况下用户代理的默认行为。在同等安全级别的情况下，引用页面的地址会被发送（HTTPS -> HTTPS），但是在降级的情况下不会被发送（HTTPS->HTTP）
    - origin- 在任何情况下，仅发送**文件的源**作为引用地址
    - origin-when-cross-origin- 对于**同源的请求**，会发送**完整的URL**作为引用地址，但是对于**非同源请求**仅发送**文件的源**
    - same-origin- 对于同源的请求会发送引用地址，非同源不会发送
    - strict-origin- 在同等安全级别的情况下，发送文件的源作为引用地址，降级的情况不会发送
    - strict-origin-when-cross-origin- 对于同源的请求，会发送完整的URL作为引用地址；在同等安全级别的情况下，发送文件的源作为引用地址；在降级的情况下不发送此首部
    - unsafe-url- 无论是同源请求还是非同源请求，都发送完整的URL作为引用地址

    例子[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy)

52. Retry-After：响应首部，表示用户代理需要等待多长时间之后才能继续发送请求

    - 当与503（当前服务不存在）响应一起发送的时候，表示服务下线的预期时长
    - 当与重定向响应一起发送的时候，如301（永久迁移），表示用户代理在发送重定向请求之前需要等待的最短时间

53. Set-Cookie：响应首部，被用来由服务器向客户端发送cookie

    指令：

    **Expires**=<**date**> cookie的最长有效时间，形式为符合HTTP-date规范的时间戳。如果没有设置这个属性，表示是一个**会话期cookie**

    **Max-Age**=<**non-zero-digit**> 在cookie失效之前需要经过的秒数。老的浏览器（ie6 7 8）不支持这个属性。Expires和Max-Age同时存在，Max-Age优先级更高

    **Domain**=<**domain-value** > 指定cookie可以送达的主机名

    **Path**=<**path-value**> 指定一个URL路径，这个路径必须出现在要请求的资源的路径中才可以发送Cookie首部。如果path=/docs，那么"/docs"，"/docs/Web/"或者"/docs/Web/HTTP"都满足匹配的条件

    **Secure** 只有在请求使用SSL和HTTPS协议的时候才会被发送到服务器

    **HttpOnly** 设置了HttpOnly属性的cookie不能使用Javascript经由Document.cookie属性、XMLHttpRequest和Request API上进行访问，防范跨站脚本攻击（XSS）

    **SameSite**=**Strict/Lax** 设置后cookie不随跨域请求一起发送，一定程度上防范跨站请求伪造攻击（CSRF）

54. SourceMap HTTP响应头连接生成的代码到一个source map，使浏览器能够重建原始的资源然后显示在调试器里

55. User-Agent 首部包含了一个特征字符串，用来让网络协议的对端来识别发起请求的用户代理软件的应用类型、操作系统、软件开发商以及版本号

    ```
    User-Agent: <product> / <product-version> <comment>
    ```

    ```
    Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0
    Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0
    ```

56. Vary 响应头，决定了对于未来的一个请求头，应该用一个缓存的回复（response）还是向源服务器请求一个新的回复

### Post和Get区别

- Get请求能缓存，Post不能
- Post相对Get安全一点，因为Get请求都包含在URL里，且会被浏览器保存历史记录，Post不会，但是抓包还是一样
- Post可以通过request body来传输比Get更多的数据
- URL有长度限制，会影响Get请求，但是这个长度限制是浏览器规定的，不是RFC规定的
- Post支持更多的编码类型且不对数据类型限制
