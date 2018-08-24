# 网络安全

#### XSS(Cross site scripting)跨站点指令码

分为三种类型：反射型，存储型，DOM-based

##### 如何防御

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

对于显示富文本来说，通常采用白名单过滤的办法 js-xss

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

#### CSRF/XSRF(Cross-site request forgery)跨站请求伪造

是一种挟制用户在当前已登录的Web应用程序上执行非本意的操作的攻击方式。其实就是利用用户的登录态发起的恶意请求

##### 如何防御

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

#### 密码安全

##### 加盐

通常需要对密码加盐，再进行几次不同加密算法的加密

```
// 加盐也就是给原密码添加字符串，增加原密码长度
sha256(sha1(md5(salt + password+ salt)))
```

