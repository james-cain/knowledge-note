# Chromium

##介绍

中文文档参考[chromium_doc_zh](https://ahangchen.gitbooks.io/chromium_doc_zh/content/zh/Start_Here_Background_Reading/Multi-process_Architecture.html)

官方文档参考[chromium_doc_en](https://www.chromium.org/developers/design-documents)

## 背景阅读

### 多进程架构

浏览器的每个标签都是一个独立的进程，这样设计的目的是为了保护整个应用程序免受渲染引擎中的bug和故障的伤害。并且会限制每个渲染引擎进程的相互访问，以及他们与系统其它部分的访问。某些程度上，这为web浏览提供了内存保护，为操作系统提供了访问控制。

