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

