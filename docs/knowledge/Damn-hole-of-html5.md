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

## audio

可以运用<audio>和<embed>元素来实现浏览器兼容的网页声音调用及播放

- embed标签定义外部（非HTML）内容的容器，如果浏览器不支持该文件格式，没有插件的话就无法播放该音频
- audio元素为HTML5元素，在旧浏览器无作用

调用示例：

```html
<audio controls="controls">
    <source src="alex-car-00010.ogg" type="audio/ogg">
    <source src="alex-car-00010.mp3" type="audio/mp3">
    <embed height="40" width="100" autostart="false" src="alex-car-00010.m4a.wav">
</audio>
```

### PCM文件与WAV文件

> audio不支持.pcm文件播放

- PCM(Pulse Code Modulation，脉码编码调制)。PCM文件是模拟音频信号经模数转换(A/D变换)直接形成的二进制序列，没有附加文件头和文件结束标志。PCM的声音数据没有被压缩，如果是单声道的文件，采样数据按时间的先后顺序依次存入

  但只有这些数字化的音频二进制序列并不能够播放。

- WAVE(Waveform Audio File Format)，无损音频编码。WAV文件可以理解为PCM文件的wrapper，在查看PCM和WAV文件的hex文件，WAV文件只是在PCM文件的开头多了44bytes，来表征其声道数、采样频率和采样位数等信息。可以被基本所有的音频播放器播放，包括audio标签

  WAV是一种声音文件格式，符合RIFF(Resource Interchange File Format)文件规范，用于保存音频信息资源。RIFF文件都在数据块前有文件头

  ![wav](http://reyshieh.com/assets/wav.png)

  - 文件开头是RIFF头：0 4 数据块ID包含了“RIFF”在ASCII编码中的值（大端是0x52494646）；4 4 数据块大小 36 + subChunk2Size，即 4 + (8 + SubChunk1Size) + (8 + SubChunk2Size)，也即整个文件的大小减去ChunkID和ChunkSize所占8bytes；8 4 Format包含了字母“WAVE”（大端是0x57415645）。
  - “WAVE” format包含了2个子块：“fmt”和“data”
  - “fmt”子块描述了声音数据的格式：12 4 SubChunk1ID 包含了“fmt”（大端是0x666d7420）；16 4 SubChunk1Size是随后SubChunk的大小；20 2 AudioFormat；22 2 声道数，单声道是1，双声道是2；24 4 采样频率，一般有8000，44100等值；28 4 字节频率 = 采样频率 * 声道数 * 采样位数 / 8（ByteRate == SampleRate * NumChannels * BitsPerSample/8）；32 2 （BlockAlign == NumChannels * BitsPerSample/8 ）；34 2 采样位数，8对应8bits，16对应16bits
  - “data”子块包含音频数据大小和真实的声音数据：36 4 SubChunk2ID包含了字母“data”(大端格式下是0x64617461)‘；40 4 数据字节数(Subchunk2Size == NumSamples * NumChannels * BitsPerSample/8)；44 * 实际的声音数据

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



