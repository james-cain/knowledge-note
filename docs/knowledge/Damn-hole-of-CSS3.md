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

