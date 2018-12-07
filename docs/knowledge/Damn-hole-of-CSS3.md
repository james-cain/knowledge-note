# CSS3

## touch-action: manipulation

Chrome, Safari, Edge and (soon) FireFox all [support](https://developers.google.com/web/updates/2013/12/300ms-tap-delay-gone-away?hl=en)) using `touch-action: manipulation` to disable the click delay without the side effects of FastClick.js

[https://developer.mozilla.org/zh-CN/docs/Web/CSS/touch-action](https://developer.mozilla.org/zh-CN/docs/Web/CSS/touch-action)

## position: sticky

注意事项：

1. 父元素不能`overflow:hidden`或者`overflow:auto`属性。
2. 必须指定`top`、`bottom`、`left`、`right`4个值之一，否则只会处于相对定位
3. 父元素的高度不能低于sticky元素的高度
4. sticky元素仅在其父元素内生效

推荐使用：

<https://github.com/dollarshaveclub/stickybits>

## CSS外边距(margin)重叠处理

> 外边距重叠是指两个或多个盒子(可能相邻也可能嵌套)的相邻边界(中间没有任何非空内容、补白、边框)重合在一起而形成一个单一边界

### 相邻margin重叠

#### 计算方式：

- 全部都为正数值，取最大值：
- 不全是正数值，则取绝对值，用正值最大值减去绝对值的最大值
- 没有正值，则都取绝对值，然后用0减去最大值

#### 解决办法

- 底部元素设置为浮动`float: left`
- 底部元素的position的值为absolute/fixed
- 在设置margin-top/bottom值时统一设置上或下

### 元素和父元素margin重叠

> 父元素没有设置`border`、`padding`、`inline content`、`clearance`时，子元素的margin-top/bottom会和父元素的margin产生重叠问题

#### 解决办法

- 外层元素添加`padding`
- 外层元素设置`overflow: hidden;`
- 外层元素透明边框`border: 1px solid transparent;`
- 内层元素绝对定位`position: absolute;`
- 内层元素设置`float: left;`或`display: inline-block;`