# 详解package.json

### essentials

package中最重要的是**name**和**version**

#### name

package的名称。通常当做urls，命令行的参数和node_modules的包名

e.g.

​	yarn add [name]

​	node_modules/[name]

​	https://registry.npmjs.org/[name]/-/[name]-[version].tgz

##### Rules

- 必须小于或等于214个字节（包括@scope）
- 禁止以 . 开头 或者_ 下划线开头
- 禁止名称有大写字母
- 必须用URL-safe的字符串

#### version

当前包的版本号

### Info

#### description

描述只是用来让使用者了解包的使用目的。

#### keywords

用于包管理员搜索包的关键字

#### license

```
{
    "license": "MIT",
    "license": "(MIT or GPL-3.0)",
    "license": "SEE LICENSE IN LICENSE_FILENAME.txt",
    "license": "UNLICENSED"
}
```

### Links

#### homepage

用来填写包的登录页或者文档URL

#### bugs

跟踪项目issue的URL，通常也可以填email地址，提供给使用者如何提交issues的地址

#### repository

实际包的代码路径

### Maintainers

#### author

作者信息，作者只能是一个人

#### contributors

贡献者信息，是一个数组

```
{
    "contributors": [
        {},
        {}
    ]
}
```

### Files

#### files

```
{
    "files": [
        "filename.js",
        "directory/",
        "glob/*.{jsm,json}"
    ]
}
```

填写的是项目中包含的文件。可以是单一的文件，文件夹机或者通配符

#### main

```
{
    "main": "filename.js"
}
```

项目的入口函数

#### bin

```
{
    "bin": "bin.js",
    "bin": {
        "command-name": "bin/command-name.js",
        "other-command": "bin/other-command.js"
    }
}
```

#### man

```
{
    "man": "./man/doc.1",
    "man": ["./man/doc.1", "./man/doc.2"]
}
```

#### directories

### Tasks

#### scripts

自动化执行包命令的方法

#### config

```
{
    "config": {
        "port": "8080"
    }
}
```

配置options或者parameters用于scripts

### Dependencies

#### dependencies

开发或者生产环境的包

#### devDependencies

只能用在开发环境

#### peerDependencies

用于声明你的包和别的包的版本之间的兼容性情况

#### optionalDependencies

选择性的包，并不是必要的，如果没有找到，一样会继续执行

#### bundleDependencies

依赖打包是当发布你的包时，会一并将该对象中的包打包在一起

### System

#### engines

用于检查process.versions的版本号是否符合包中规定的版本号

#### os

```
{
    "os": ["darwin", "linux"],
    "os": ["!win32"]
}
```

标注操作系统，用来检查process.platform的系统和包规定的是否一致

#### cpu

```
{
    "cpu": ["x64", "ia32"],
    "cpu": ["!arm", "!mips"]
}
```

用来检查process.arch 系统架构和包规定的是否一致

### Publishing

#### private

如果不想让包可见，设置为true

#### publishConfig

用于发布包时使用，例如，标注tag

### Yarn

#### flat

设置为true，其他依赖于你的包的包都必须同样设置为true，或者用yarn install —flat来安装依赖

#### resolutions

### Lerna+Yarn

#### workspaces

If `--use-workspaces` is true then `packages` will be overridden by the value from `package.json/workspaces`.

### Bolt

#### bolt

```
{
    "bolt": {
        "workspaces": [
            "utils/*",
            "apps/*"
        ]
    }
}
```

### unpkg

#### unpkg

### TypeScript

#### types

### browserslist

#### browserslist

诸多前端工具用到了该属性

- Autoprefixer
- babel-preset-env
- postcss-preset-env
- eslint-plugin-compat
- stylelint-no-unsupported-browser-features
- postcss-normalize

```
{
    "browserslist": [
        ">1%",
        "last 2 versions"
    ]
}
```

### Package bundlers

#### module

