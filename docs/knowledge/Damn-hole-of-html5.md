# html5

## Video

- <https://github.com/videojs/video.js>
- <https://github.com/surmon-china/vue-video-player>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement>
- https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLVideoElement
- https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video
- https://chimee.org/docs/chimee_player_preface.html

目前原生H5支持的媒体格式主要有MP4、OGG、WebM、M3U8等，但各大浏览器厂商之间对媒体格式的支持是不同的：

| 浏览器            | 支持的视频格式        |               |
| ----------------- | --------------------- | ------------- |
|                   | PC端                  | 移动端        |
| Chrome            | MP4,M3U8,FLV,RTMP协议 | MP4,WebM,M3U8 |
| Firefox           | MP4,M3U8,FLV,RTMP协议 | MP4,WebM,M3U8 |
| Internet Explorer | MP4,M3U8,FLV,RTMP协议 | MP4,M3U8      |

| 移动端平台 | 支持的视频格式 |
| ---------- | -------------- |
| Android    | MP4,M3U8       |
| iOS        | MP4,M3U8       |
| Safari     |                |

## Input重复上传同一文件问题

input[type=file]使用的是onchange，onchange监听的为input的value值，只有在内容发生改变的时候去触发，而value在上传文件的时候保存的是文件的内容，只需要在上传成功的回调里面，将当前input的value值置空即可。

```
event.target.value= '';
```

## Img srcset/sizes

## appmanifest

## Canvas

### HTMLCanvasElement

- 属性

  height

  width

- 方法

  ```js
  // 其中contextId可接受的参数有"2d"和"experimental-webgl"
  // getContext('2d')返回CanvasRenderingContext2D对象
  // getContext('experienmal-webgl')返回WebGLRenderingContext对象
  getContext(contextId)
  // 返回一个data:URL,根据type参数指定的类型将包含在canvas中的图片文件编码成字符串形式，type默认为image/png
  // 如果canvas的宽度或长度为0，返回字符串"data:,"
  // Chorme支持image/webp类型
  // type值为image/jpeg或image/webp，则第二个参数的值在0.0和1.0之间的话，会被看做是图片质量参数
  // 如果不在0.0和1.0之间，则会使用默认的图片质量
  toDataURL(type, ...args)
  // 返回Blob对象，表示包含在该canvas中的图片文件，type没有指定参数，默认使用image/png
  toBlob(callback, type, ...args)
  // e.g.
  function test() {
      var canvas = document.getElementById('canvas');
      canvas.toBlob(function(blob) {
          var newImg = document.createElement('img'),
          	url = URL.createObjectURL(blob);
          newImg.onload = function() {
              URL.revokeObjectURL(url);
          };
          newImg.src = url;
          document.body.appendChild(newImg);
      });
  }
  ```

### CanvasRenderingContext2D

该接口提供的2D渲染背景用来绘制<canvas>元素，需要在<canvas>上调用getContext()，并提供"2d"的参数：

```js
var canvas = document.getElementById('tutorial');
var ctx = canvas.getContext('2d');
```

#### 填充和描边样式

CanvasRenderingContext2D.fillStyle -- 图形内部的颜色和样式

CanvasRenderingContext2D.strokeStyle -- 图形边线的颜色和样式

#### 绘制图像

[`CanvasRenderingContext2D.drawImage()`](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage) -- 绘制指定的图片

```js
ctx.drawImage(image, dx, dy);
ctx.drawImage(image, dx, dy, dWidth, dHeight);
ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
```

![canvas_drawImage](http://reyshieh.com/assets/canvas_drawImage.png)

d -- destination s -- source

dx -- 目标画布的左上角在目标canvas上X轴的位置

dy -- 目标画布的左上角在目标canvas上Y轴的位置

dWidth -- 在目标画布上绘制图像的宽度

dHeight -- 在目标画布上绘制图像的高度

sx -- 需要绘制到目标上下文中的，源图像的矩形选择框的左上角X坐标

sy -- 需要绘制到目标上下文中的，源图像的矩形选择框的左上角Y坐标

sWidth -- 需要绘制到目标上下文中的，源图像的矩形选择框的宽度

sHeight -- 需要绘制到目标上下文中的，源图像的矩形选择框的高度

#### 像素控制

[`CanvasRenderingContext2D.createImageData()`](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createImageData) -- 使用指定的尺寸，创建一个新的ImageData对象。所有的像素在新的对象中都是透明的。

```js
ctx.createImageData(width, height);
ctx.createImageData(imageData); // 从现有的ImageData对象复制一个和其宽度和高度相同的对象。图像自身不允许被复制
```

[`CanvasRenderingContext2D.getImageData()`](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/getImageData) -- 返回一个ImageData对象，用来描述canvas区域隐含的像素数据，起始点为(sx, sy)、宽为sw、高为sh

```js
ctx.getImageData(sx, sy, sw, sh);
// sx 被提取图像数据矩形区域的左上角x坐标
// sy 被提取图像数据矩形区域的左上角y坐标
// sw 被提取的图像数据矩形区域的宽度
// sh 被提取的图像数据矩形区域的高度
```

[`CanvasRenderingContext2D.putImageData()`](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/putImageData) -- 将数据从已有的ImageData绘制到位图上

```js
ctx.putImageData(imagedata, dx, dy);
ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
// imagedata 包含像素值的数组对象
// dx 源图像数据在目标画布中的位置偏移量(x轴方向的偏移量)
// dy 源图像数据在目标画布中的位置偏移量(y轴方向的偏移量)

```



### ImageData

> 可以使用该属性，去除、填充背景等应用

```js
// 属性
ImageData.data // Uint8ClampedArray描述了一个以RGBA顺序数据的一维数组，数据使用0至255的整数
ImageData.height // 使用像素描述ImageData的实际高度
ImageData.width // 使用像素描述ImageData的实际宽度
```



