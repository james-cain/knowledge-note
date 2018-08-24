# ionic

## Running on iOS

这里介绍Cordova方式打包

1. 获取package ID

   没有开发者权限，获取不到唯一标识id，导致不能生成ipa

## Running on android

Cordova 打包生成后编译遇到几个问题

1. CordovaLib中的build.gradle的classPath的版本和ide对应的版本不一致，修改打包后的版本
2. 多个文件中配置的maven {}在下载的时候链接超时，注释掉换成google()即可