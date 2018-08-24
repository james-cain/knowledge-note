# 用sonatype3搭建npm私服

#### 先安利几个不同方案的私服方案

Nexus:<https://help.sonatype.com/repomanager3> 

Verdaccio:[https://github.com/verdaccio/verdaccio](https://help.sonatype.com/repomanager3) 

Cnpm:<https://github.com/cnpm/cnpmjs.org> 

Sinopia:[https://github.com/rlidwka/sinopia](https://github.com/cnpm/cnpmjs.org) 

#### 接下来介绍Nexus方式搭建私服

> Nexus是一个私服创建系统，支持跨平台，可以创建maven、docker、npm、gradle等多种私服库。目前有version 2和3两个版本，3版本自带支持npm库创建。

Nexus具有三种代理方式：

代理（Proxying npm Registries）

内部私服（Private npm Registries）

混合式（Grouping npm Registries）

##### Nexus安装（以macos为例）

1. 下载tar包： <https://help.sonatype.com/repomanager3/download>

2. 解压tar –xzvf nexus-3.12.1-01-mac.tgz 解压成功后会生成两个文件夹，一个是nexus- 3.12.1-01 另外一个是sonatyoe-work，记得对这两个文件做一些授权处理
3. cd nexus- 3.12.1-01  执行： ./bin/nexus run
4. 浏览器访问 <http://localhost:8081/>
5. 登录以及改密码

##### 私服使用

1. Nexus服务器上，创建三种仓库

2. 终端设置npm代理，cmd中： npm config set registry <http://localhost:8081/repository/npm-all/> 也可以npm config edit，编辑npm的配置文件，添加： registry = <http://localhost:8081/repository/npm-all/>

3. npm --loglevel info install async

4. 方法一：用户登录认证 npm login --registry=http://localhost:8081/repository/npm-internal/。更多关于此点的可以查看npm的文档： <https://docs.npmjs.com/cli/adduser>

   方法二：授权认证。 echo -n ‘admin:admin123’ | openssl base64（windows中： c:\certutil /encode in.txt out.txt ），得到一串base64字符串。在npm配置中，添加：

   ```
   email=you@example.com
   
   always-auth=true
   
   _auth=base64字符串
   
   ```

5. 发布包 npm publish --registry http://localhost:8081/repository/npm-internal/或者在package.json中，增加配置：

   ```
   "publishConfig" : { 
   	"registry" : "http://localhost:8081/repository/npm-internal/" 
   },
   ```

##### 更多复杂的功能可以看官网

除了install、publish、deprecate等功能外，可以自己创建权限，用户统一管理





以上资料参照：

https://help.sonatype.com/repomanager3/quick-start-guide---proxying-maven-and-npm

https://help.sonatype.com/repomanager3/node-packaged-modules-and-npm-registries