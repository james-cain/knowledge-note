## Damn hole of javascript

1. async和await

   ```
   var a = 0
   var b = async () => {
     a = a + await 10
     console.log('2', a) // -> '2' 10
     a = (await 10) + a
     console.log('3', a) // -> '3' 20
   }
   b()
   a++
   console.log('1', a) // -> '1' 1
   ```

   对于以上代码你可能会有疑惑，这里说明下原理

   - 首先函数 `b` 先执行，在执行到 `await 10` 之前变量 `a` 还是 0，因为在 `await` 内部实现了 `generators` ，`generators` 会保留堆栈中东西，所以这时候 `a = 0` 被保存了下来
   - 因为 `await` 是异步操作，所以会先执行 `console.log('1', a)`
   - 这时候同步代码执行完毕，开始执行异步代码，将保存下来的值拿出来使用，这时候 `a = 10`
   - 然后后面就是常规执行代码了

2. Proxy

   ```
   // 用proxy实现数据绑定和监听
   let onWatch = (obj, setBind, getLogger) => {
       let handler = {
           get(target, property, receiver) {
               getLogger(target, property);
               return Reflect.get(target, property, receiver);
           },
           set(target, property, value, receiver) {
               setBind(value);
               return Reflect.set(target, property, value);
           }
       }
       return new Proxy(obj, handler);
   }
   let obj = { a: 1 };
   let value;
   let p = onWatch(obj, (v) => {
       value = v;
   }, (target, property) => {
       console.log(`Get '${property}' = ${target[property]}`);
   });
   p.a = 2; // bind 'value' to '2'
   p.a // -> Get 'a' = 2
   ```

3. 0.1 +  0.2 != 0.3 的处理

   ```
   parseFloat((0.1 + 0.2).toFixed(10))
   ```

4. 正则表达式

   - 元字符

   . 匹配任意字符除了换行符和回车符

   [] 匹配方括号内的任意字符，比如[0-9]可以用来匹配任意数字

   ^ ^9 这样使用匹配以9开头。[**^**9]这样使用代表匹配方括号内除了9的字符

   {1, 2} 匹配1到2位字符

   (yck) 只匹配和yck相同字符串

   | 匹配|前后任意字符

   \ 转义

   ***** 只匹配出现-1次以上* 前的字符

   **+** 只匹配出现0次以上+前的字符

   ? ？之前字符可选

   - 修饰符

   i 忽略大小写

   g 全局搜索

   m 多行

   - 字符简写

   \w 匹配字母数字或下划线

   \W 和上面相反

   \s 匹配任意的空白符

   \S 和上面相反

   \d 匹配数字

   \D 和上面相反

   \b 匹配单词的开始或结束

   \B 和上面相反

5. 