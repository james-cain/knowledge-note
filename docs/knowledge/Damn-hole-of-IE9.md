# IE9 兼容性

## @media

在head中加上

```
<meta http-equiv="X-UA-Compatible" content="IE=9">
```

##transform

transform要加上-ms-前缀，建议使用post的autoprefixer 自动添加前缀

## 输入框 placeholder无效

假如使用的vue+element-ui 可以使用https://github.com/james-cain/vue-element-placeholder-polyfill处理这个问题

如果不是，可以参考jquery的方式，或者同上方式另外写polyfill

