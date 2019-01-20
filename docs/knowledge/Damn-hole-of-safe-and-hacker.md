# 网络安全

## 信息探测

### Google Hack

搜集Web信息

Google常用语法

| 关键字   | 说明                   |
| -------- | ---------------------- |
| Site     | 指定域名               |
| intext   | 正文中存在关键字的网页 |
| intitle  | 标题中存在关键字的网页 |
| info     | 一些基本信息           |
| inurl    | URL存在关键字的网页    |
| filetype | 搜索指定文件类型       |

## 同源策略（Same Origin Policy，SOP）

同源策略是Web应用程序的一种安全模型，控制了网页中DOM之间的访问。SOP影响范围包括：普通的HTTP请求、XMLHttpRequest、XSLT、XBL

### 如何判断同源？

给定一个页面，如果另外一个页面使用的协议、端口、主机名都相同，则认为两个页面具有相同的源。例如：

目标页面http://sub.eth.space/level/flower.html

| 是否同源 | URI                                                   |
| -------- | ----------------------------------------------------- |
| 同源     | http://sub.eth.space/level2/fruit.html                |
| 同源     | http://sub.eth.space:80/level/anotherlevel/fruit.html |
| 不同源   | https://sub.eth.space/level/flower.html               |
| 不同源   | http://sub.eth.space:81/level/flower.html             |
| 不同源   | http://mania.eth.space/level3/flower.html             |
| **同源** | http://red.sub.eth.space/level3/flower.html           |

**同源策略没有禁止脚本的执行，而是禁止读取HTTP回复。**SOP其实在防止CSRF上作用非常有限，CSRF的请求往往在发送出去的瞬间就已经达到攻击的目的，比如发送一段敏感数据，或请求一个具体的功能。一般静态资源通常不受同源策略限制，如js/css/jpg/png等

## SQL注入

常见的SQL注入类型包括：**数字型**和**字符型**

但不管注入类型如何，攻击者的目的只有一点，那就是绕过程序限制，使用户输入的数据带入数据库执行，利用数据库的特殊性获取更多的信息或者更大的权限。

### 数字型注入

当输入的参数为整形时，如果存在注入漏洞，即为数字型注入。数字型注入最多出现在PHP等弱类型语言中，弱类型语言会自动推导变量类型。对于Java等强类型语言，如果试图把一个字符串转换为int类型，则会抛出异常，语法继续执行。

### 字符型注入

当输入的参数为字符串时，称为字符型。字符串类型一般要使用单引号来闭合。e.g.

```sql
select * from table where username='admin'

/* 攻击者可以利用字符串闭合来发起注入 
	输入admin' and 1=1 -- */
select * from table where username = 'admin' and 1=1 --
```

一些常见的注入叫法

- POST注入：注入字段在POST数据中
- Cookie注入：注入字段在Cookie数据中
- 延时注入：使用数据库延时特性注入
- 搜索注入：注入处为搜索的地点
- base64注入：注入字符串需要经过base64加密

### 防止SQL注入

#### 严格的数据类型

Java等强类型语言几乎可以完全忽略数字型注入。即使攻击者想在代码中注入，也是不可能的，因为程序在接收参数后，做了一次数据类型的转换。如果接收的不是字符串，就会在转换的时候抛出异常。

而针对弱类型语言，其实防范也不难。只需要在程序中严格判断数据类型即可。如就用is_numeric()等函数判断数据类型，即可解决数字型注入。

#### 特殊字符转义

通过加强数据类型验证可以解决数字型的SQL注入，字符型的却不可以，最好的办法是**对特殊字符进行转义**。

防止SQL注入应该在程序中判断字符串是否存在敏感字符，如果存在，则根据相应的数据库进行转义。如MySQL使用"\\"转义。如果不知道需要转义哪些特殊字符，可以参考OWASP ESAPI，提供了专门对数据库字符转码的接口，还对不同的数据库实现了不同的编码器。

#### 使用预编译语句

Java等语言都提供了预编译语句，PreparedStatement表示预编译SQL语句的对象。可以有效的防御SQL注入。但是必须使用它提供的setter方法。

## XSS(Cross site scripting)跨站点指令码

分为三种类型：反射型，存储型，DOM-based

### 如何防御

转义输入输出的内容，对于引号，尖括号，斜杠转义

```
& -> &amp;
< -> &lt;
> -> &gt;
" -> &quto;
' -> &##39;
` -> &##96;
\/ -> &##x2F;
```

对于显示富文本来说，通常采用白名单过滤的办法[ js-xss](https://github.com/leizongmin/js-xss)

CSP 内容安全策略

CSP是一个额外的安全层，用于检测并削弱某些特定类型的攻击，包括跨站脚本（XSS）和数据注入攻击等。无论是数据盗取、网站内容污染还是散发恶意软件

CSP本质是建立白名单，规定浏览器只能执行特定来源的代码

通常可以通过HTTP header中的Content-Security-Policy来开启CSP

- 只允许加载本站资源

  ```
  Content-Security-Policy: default-src 'self'
  ```

- 只允许加载HTTPS协议图片

  ```
  Content-Security-Policy: img-src https://*
  ```

- 允许加载任何来源框架

  ```
  Content-Security-Policy: child-src 'none'
  ```

## CSRF/XSRF(Cross-site request forgery)跨站请求伪造

是一种挟制用户在当前已登录的Web应用程序上执行非本意的操作的攻击方式。其实就是利用用户的登录态发起的恶意请求

### 如何防御

遵循几种规则：

- Get请求不对数据进行修改
- 不让第三方网站访问到用户Cookie
- 阻止第三方网站请求接口
- 请求时附带验证信息，比如验证码或者token

SameSite

> 可以对Cookie设置SameSite属性。该属性设置Cookie不随跨域请求发送，该属性可以很大程度减少CSRF的攻击，但不是所有浏览器都兼容

验证Referer

> 对于需要防范CSRF的请求，我们可以通过验证Referer来判断该请求是否为第三方网站发起的

Token

## 密码安全

### 加盐

通常需要对密码加盐，再进行几次不同加密算法的加密

```
// 加盐也就是给原密码添加字符串，增加原密码长度
sha256(sha1(md5(salt + password+ salt)))
```

