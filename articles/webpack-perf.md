## Webpack打包优化—以blog站点开发为例

前段花了时间阅读了部分的webpack的源码，意识到webpack对于前端开发的重要性，于是下定决心，以开发一个blog为例，记录我学习webpack打包优化的心得。

当今打包工具众多，诸如grunt，gulp，rollup，webpack，parcel... webpack从中脱颖而出，各大框架基本都基于webpack做了自己的cli。本人开发技术栈为vue、react，之前一直都是使用官方scaffold，并没有花心思研究webpack，因为现在遇到了相关的需求，导致一发不可收拾。

blog的webpack版本为：4.11.1

### 初构webpack配置

配置中引用的包如图

![webpack-configuration](images/webpack-configuration.png)

![webpack-configuration2](images/webpack-configuration2.png)

