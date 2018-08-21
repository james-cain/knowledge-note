## Damn hole of performance

- google devtools https://developers.google.com/web/tools/chrome-devtools/
- navigation timing performance resource 一个页面的渲染完成耗时
- http2.0
- 1000000长列表性能，用户无感知渲染
- http://taobaofed.org/blog/2016/04/25/performance-composite/
- pwa
- https://github.com/barretlee/performance-column/issues
- https://github.com/fouber/blog/issues/3
- https://developer.yahoo.com/performance/rules.html?guccounter=1
- http://velocity.oreilly.com.cn/2010/ppts/VelocityChina2010Dec7StaticResource.pdf
- http://velocity.oreilly.com.cn/2011/ppts/MobilePerformanceVelocity2011_DavidWei.pdf
- https://developers.google.com/speed/docs/insights/rules?csw=1
- https://developers.google.com/speed/docs/insights/mobile
- https://developers.google.com/web/fundamentals/performance/rendering/?hl=zh-cn
- https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/?hl=zh-cn
- https://developers.google.com/web/fundamentals/performance/critical-rendering-path/
- 《[高性能网站建设指南](http://book.douban.com/subject/3132277/)》《[高性能网站建设进阶指南](http://book.douban.com/subject/4719162/)》《[Web性能权威指南](http://book.douban.com/subject/25856314/)》
- https://www.cnblogs.com/CraryPrimitiveMan/p/3795086.html
- https://www.cnblogs.com/-simon/p/5883336.html
- https://www.cnblogs.com/callmeguxi/p/6846447.html



1. DNS预解析,可以通过预解析的方式来预先获得域名所对应的IP

   ```
   <link rel="dns-prefetch" href="//xxx.com">
   ```

2. 缓存：强缓存（Expires、Cache-Control）和协商缓存（Last-Modified、If-Modified-Since和Etag、If-None-Match）

   在一些特殊的地方可能需要选择特殊的缓存策略

   - 对于不需要缓存的资源，可以使用Cache-Control: no-store，表示资源不需要缓存
   - 对于频繁变动的资源，可以使用Cache-Control: no-cache并配合Etag使用，表示资源已被缓存，但是每次都会发送请求询问资源是否更新
   - 对于代码文件来说，通常使用Cache-Control:  max-age=31536000并配合策略缓存使用，然后对文件进行指纹处理，一旦文件名变动就会立刻下载新的文件

3. HTTP2.0

   HTTP/1.1每个请求都会建立和断开，消耗好几个RTT时间，并且由于TCP慢启动，加载体积大的文件需要更多的时间。

   HTTP2.0引入了多路复用，能让多个请求使用同一个TCP链接，加快了网页的加载速度。并且还支持Header压缩，进一步减少请求的数据大小

4. 预加载，是声明式的fetch，强制浏览器请求资源，并且不会阻塞onload事件

   ```
   <link rel="preload" href="https://example.com">
   ```

   预加载在一定程度上降低首屏的加载时间，但兼容性不好

5. 预渲染，可以通过预渲染将下载的文件先放在后台渲染

   ```
   <link rel="prerender" href="https://example.com">
   ```

6. 懒执行，将某些逻辑延迟到使用时再计算。该技术可以用于首屏优化，懒执行需要唤醒，一般可以通过定时器或者事件的调用来唤醒

7. 懒加载，将不关键的资源延后加载。原理是只加载自定义区域（通常是可视区域，也可以是即将进入可视区域）内需要加载的东西。懒加载不仅可以用于图片，也可以使用在别的资源上，比如进入可视区域才开始播放视频等等。

8. 如何渲染几万条数据并不卡住界面

   ```
   可以通过requestAnimationFrame来每16ms刷新一次
   
   setTimeout(() => {
       // 插入10万条数据
       const total = 100000;
       // 一次插入20条，如果觉得性能不好就减少
       const once = 20;
       // 渲染数据总共需要几次
       const loopCount = total / once;
       let countOfRender = 0;
       let ul = document.querySelector("ul");
       function add() {
           //优化性能，插入不会造成回流
           const fragment = document.createDocumentFragment();
           for(let i = 0; i < once; i++) {
               const li = document.createElement("li");
               li.innerText = Math.floor(Math.random() * total);
               fragment.appendChild(li);
           }
           ul.appendChild(fragment);
           countOfRender += 1;
           loop();
       }
       function loop() {
           if (countOfRender < loopCount) {
               window.requestAnimationFrame(add);
           }
       }
       loop();
   }, 0);
   ```

9. 防抖（debounce）

   原理：尽管触发事件，但是一定在事件触发n秒后才执行，如果在事件触发的n秒内又触发了这个事件，就以新的事件的时间为准，n秒后才执行，总之，就是要等触发完事件n秒内不再触发事件，才执行。

   例子

   ```
   <!DOCTYPE html>
   <html lang="zh-cmn-Hans">
   
   <head>
       <meta charset="utf-8">
       <meta http-equiv="x-ua-compatible" content="IE=edge, chrome=1">
       <title>debounce</title>
       <style>
           #container{
               width: 100%; height: 200px; line-height: 200px; text-align: center; color: #fff; background-color: #444; font-size: 30px;
           }
       </style>
   </head>
   
   <body>
       <div id="container"></div>
       <script src="debounce.js"></script>
   </body>
   	<script>
   		var count = 1;
           var container = document.getElementById('container');
   
           function getUserAction(e) {
               container.innerHTML = count++;
           };
   
           var setUseAction = debounce(getUserAction, 10000, true);
   
           container.onmousemove = setUseAction;
   
           document.getElementById("button").addEventListener('click', function(){
               setUseAction.cancel();
           })
   	</script>
   </html>
   ```

   Debounce.js

   ```
   function debounce(func, wait, immediate) {
   
       var timeout, result;
   
       var debounced = function () {
           var context = this;
           var args = arguments;
   
           if (timeout) clearTimeout(timeout);
           if (immediate) {
               // 如果已经执行过，不再执行
               var callNow = !timeout;
               timeout = setTimeout(function(){
                   timeout = null;
               }, wait)
               if (callNow) result = func.apply(context, args)
           }
           else {
               timeout = setTimeout(function(){
                   func.apply(context, args)
               }, wait);
           }
           return result;
       };
   
       debounced.cancel = function() {
           clearTimeout(timeout);
           timeout = null;
       };
   
       return debounced;
   }
   ```

   注意：当涉及函数有返回值时，debounce中同样要返回函数的执行结果，但是当immediate为false的时候，因为使用功能了setTimeout，将func.apply(context, args)的返回值赋给变量，最后再return的时候，值将会一直是undefined，所以只在immediate为true的时候返回函数的执行结果

10. 节流（throttle）

   方法一：使用时间戳，当触发事件的时候，取出当前的时间戳，然后减去之前的时间戳（最一开始值设为0），如果大于设置的时间周期，就执行函数，然后更新时间戳为当前的时间戳，如果小于，就不执行

   ```
   function throttle(func, wait) {
       var context, args;
       var previous = 0;
   
       return function() {
           var now = +new Date();
           context = this;
           args = arguments;
           if (now - previous > wait) {
               func.apply(context, args);
               previous = now;
           }
       }
   }
   ```

   方法二：使用定时器，当触发事件的时候，设置一个定时器，再触发事件的时候，如果定时器存在，就不执行，直到定时器执行，然后执行函数，清空定时器，设置下个定时器

   ```
   function throttle(func, wait) {
       var timeout;
       var previous = 0;
   
       return function() {
           context = this;
           args = arguments;
           if (!timeout) {
               timeout = setTimeout(function(){
                   timeout = null;
                   func.apply(context, args)
               }, wait)
           }
   
       }
   }
   ```

   方法三：结合以上两者的优势，做到鼠标移入立刻执行，停止触发的时候还能再执行一次。

   ```
   function throttle(func, wait) {
       var timeout, context, args, result;
       var previous = 0;
   
       var later = function() {
           previous = +new Date();
           timeout = null;
           func.apply(context, args)
       };
   
       var throttled = function() {
           var now = +new Date();
           //下次触发 func 剩余的时间
           var remaining = wait - (now - previous);
           context = this;
           args = arguments;
            // 如果没有剩余的时间了或者你改了系统时间
           if (remaining <= 0 || remaining > wait) {
               if (timeout) {
                   clearTimeout(timeout);
                   timeout = null;
               }
               previous = now;
               func.apply(context, args);
           } else if (!timeout) {
               timeout = setTimeout(later, remaining);
           }
       };
       return throttled;
   }
   ```

11. 数组去重

    方法一：排序后去重，支持自定义规则如何视为相同元素，如字母大小写视为一致

    ```
    var array = [1, 1, '1'];
    
    function unique(array, iteratee) {
        var res = [];
        var sortedArray = array.concat().sort();
        var seen;
        for (var i = 0, len = sortedArray.length; i < len; i++) {
        	var value = sortedArray[i];
        	var computed = iteratee ? iteratee(value);
            // 如果是第一个元素或者相邻的元素不相同
            if (!i || seen !== computed) {
                res.push(value);
            }
            seen = value;
        }
        return res;
    }
    
    console.log(unique(array, function(item) {
        return typeof item == 'string' ? item.toLowerCase() : item;
    }));
    ```

    方法二：用filter简化外层循环

    ```
    var array = [1, 2, 1, 1, '1'];
    
    function unique(array) {
        return array.concat().sort().filter(function (item, index, array) {
    		return !index || item !== array[index - 1];
    	});
    }
    
    console.log(unique(array));
    ```

    方法三：用Object键值对实现

    ```
    var array = [1, 2, 1, 1, '1'];
    
    function unique(array) {
        var obj = {};
        return array.filter(function (item, index, array) {
            return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true);
        });
    }
    
    console.log(unique(array));
    ```

    方法四：es6 set

    ```
    var array = [1, 2, 1];
    
    var unique = (array) => [...new Set(array)];
    
    unique(array);
    ```

12. 类型判断

    **最常见使用的是typeof**

    | 类型      | typeof     |
    | --------- | ---------- |
    | Undefined | undefined  |
    | **Null**  | **object** |
    | Boolean   | boolean    |
    | Number    | number     |
    | String    | string     |
    | Object    | object     |

    显然，typeof对object的检测是不精确的，Object还有很多细分类型，如Date，Function，Array，RegExp，Error等，对于这些返回的都是object

    为了解决上面的问题，可以采用**Object.propotype.toString**，toString方法被调用的时候，会执行下面的步骤：

    1. 如果this值是undefined，就返回[object Undefined]
    2. 如果this值是null，就返回[object Null]
    3. 让O成为ToObject(this)的结果
    4. 让class成为O的内部属性[[class]]的值
    5. 最后返回由"[object" 和class和"]"三部分组成的字符串

    ```
    // 写个demo
    console.log(Object.prototype.toString.call(undefined)) // [object Undefined]
    console.log(Object.prototype.toString.call(null)) // [object Null]
    
    var date = new Date()
    console.log(Object.prototype.toString.call(date)) // [object Date]
    ```

    除了以上例子之外，Object.prototype.toString实际可以判断至少12中类型（14种）

    ```
    var number = 1; // [object Number]
    var string = '123'; // [object String]
    var boolean = true; // [object Boolean]
    var und = undefined; // [object Undefined]
    var nul = null; // [object Null]
    var obj = { a: 1 }; // [object Object]
    var array = [1, 2, 3]; // [object Array]
    var date = new Date(); // [object Date]
    var error = new Error(); // [object Error]
    var reg = new RegExp(); // [object RegExp]
    var func = function a(){} // [object Function]
    Object.prototype.toString.call(Math) // [object Math]
    Object.prototype.toString.call(JSON) // [object JSON]
    Object.prototype.toString.call(arguments) // [object Arguments]
    ```

    基于上述typeof 和 Object.prototype.toString可以封装一个判断类型函数，当为基础类型，使用typeof，引用类型使用toString，同时，在es6中，null和undefined会被Object.prototype.toString 识别为[object Object]，需要兼容这种情况

    ```
    var class2type = {};
    
    // 生成class2type映射
    "Boolean Number String Function Array Date RegExp Object Error".split(" ").map((item, index) => {
        class2type["[object " + item + "]"] = item.toLowerCase();
    });
    
    function type(obj) {
        if (obj == null) {
            return obj + '';
        }
        return typeof obj === 'object' || typeof obj === 'function' ? class2type[Object.prototype.toString.call(obj)] || 'object' : typeof obj;
    }
    ```

    **plainObject**：翻译成中文，称为“纯粹的对象”，就是该对象是通过"{}"或"new Object"创建的，该对象含有零个或者多个键值对。plainObject的目的使用来区别别的js对象如null，数组，宿主对象（documents）等。以jquery为例

    ```
    $.isPlainObject({}) // true
    $.isPlainObject(new Object) // true
    $.isPlainObject(Object.create(null)) // true
    $.isPlainObject(Object.assign({ a: 1 }, { b: 2 })) // true
    $.isPlainObject(new Person('xx')) // false
    $.isPlainObject(Object.create({})) // false
    ```

    因此除了{}和new Object创建的对象外，没有原型的对象也是一个纯粹的对象

    jquery3.0中的源码

    ```
    var class2type = {};
    
    // 相当于 Object.prototype.toString
    var toString = class2type.toString;
    
    // 相当于 Object.prototype.hasOwnProperty
    var hasOwn = class2type.hasOwnProperty;
    
    function isPlainObject(obj) {
        var proto, Ctor;
    
        // 排除掉明显不是obj的以及一些宿主对象如Window
        if (!obj || toString.call(obj) !== "[object Object]") {
            return false;
        }
    
        /**
         * getPrototypeOf es5 方法，获取 obj 的原型
         * 以 new Object 创建的对象为例的话
         * obj.__proto__ === Object.prototype
         */
        proto = Object.getPrototypeOf(obj);
    
        // 没有原型的对象是纯粹的，Object.create(null) 就在这里返回 true
        if (!proto) {
            return true;
        }
    
        /**
         * 以下判断通过 new Object 方式创建的对象
         * 判断 proto 是否有 constructor 属性，如果有就让 Ctor 的值为 proto.constructor
         * 如果是 Object 函数创建的对象，Ctor 在这里就等于 Object 构造函数
         */
        Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    
        // 在这里判断 Ctor 构造函数是不是 Object 构造函数，用于区分自定义构造函数和 Object 构造函数
        return typeof Ctor === "function" && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
    }
    ```

    注意：判断Ctor构造函数是不是Object构造函数，用的是hasOwn.toString.call(Ctor)，并不是Object.prototype.toString，可测试

    ```
    console.log(hasOwn.toString.call(Ctor)); // function Object() { [native code] }
    console.log(Object.prototype.toString.call(Ctor)); // [object Function]
    ```

    发现返回值并不一样，因为hasOwn.toString调用的其实是Function.prototype.toString，已经覆盖了Object继承来的toString。该方法返回的包括function关键字，形参列表，大括号，以及函数体中的内容

    **EmptyObject**：判断对象是否是空对象，只要遍历对象，有属性，即为非空

    ```
    function isEmptyObject(obj) {
        var name;
        
        for (name in obj) {
            return false;
        }
        
        return true;
    }
    ```

    **Window对象**：判断window对象，只需判断该对象中是否有指向自身的window属性

    ```
    function isWindow(obj) {
        return obj != null && obj === obj.window;
    }
    ```

    **isArrayLike**：该函数判断类数组对象和数组，都会返回true

    ```
    function isArrayLike(obj) {
        // obj 必须有length属性
        var length = !!obj && "length" in obj && obj.length;
        var typeRes = type(obj); // 返回类型
        
        // 排除函数和window对象
        if (typeRes === 'function' || isWindow(obj)) return false;
        
        return typeRes === 'array' || length === 0 || type length === 'number' && length > 0 && (length - 1) in obj;
    }
    ```

    看最后的return，可以看出需要满足的情况包括：

    1. 是数组
    2. 长度为0，以arguments为例
    3. length属性大于0的数字类型，并且obj[length -1]必须存在

    **isElement**：判断是不是DOM元素

    ```
    function isElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }
    ```

13. 数组的浅拷贝

    concat和slice是浅拷贝

    ```
    var shallowCopy = function(obj) {
        if (typeof obj !== 'object') return;
        // 根据obj的类型判断是新建一个数组还是对象
        var newObj = obj instanceof Array ? [] : {};
        // 遍历obj，并且判断是obj的属性才拷贝
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }
    ```

14. 数组的深拷贝

    简单粗暴的方式

    ```
    var new_arr = JSON.parse(JSON.stringify(arr));
    console.log(new_arr);
    ```

    但是该方法不能拷贝函数

    实现深拷贝，只需在浅拷贝的基础上，如果是对象，就递归调用深拷贝函数就可以

    ```
    var deepClone = function (obj) {
        if (typeof obj !== 'object') return;
        var newObj = obj instanceof Array ? [] : {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
            }
        }
        return newObj;
    }
    ```

15. 数组扁平化

    用reduce实现

    ```
    var arr = [1, [2, [3, 4]]];
    
    function flatten(arr) {
        return arr.reduce(function(prev, next) {
            return prev.concat(Array.isArray(next) ? flatten(next) : next);
        });
    }
    
    console.log(flatten(arr));
    ```

16. 判断两个对象相等

    这里相等的范畴，不仅包括===的形式，还包括：

    1. NaN 和NaN相等
    2. [1]和[1]相等
    3. {value: 1}和{value: 1}相等
    4. 1和new Number(1)相等
    5. 'xx'和new String('xx')相等
    6. true和new Boolean(true)相等

    **判断NaN相等**

    ```
    function eq(a, b) {
        if (a !== a) return b !== b;
    }
    
    console.log(eq(NaN, NaN));
    ```

    **String对象**

    Object.prototype.toString方法判断结果却是一致的，如下

    ```
    var toString = Object.prototype.toString;
    toString.call('xx'); // "[object String]"
    toString.call(new String('xx')); // "[object String]"
    ```

    但是同样还是不能比较字符串和字符串包装对象是相等的，可以利用隐式类型转换

    ```
    console.log('xx' + '' === new String('xx') + ''); // true
    ```

    因此，先比较a和b的Object.prototype.toString的结果是否一致，如果都是"[object String]"，再使用'' + a === ' ' + b进行判断

    **更多对象**

    通过String对象的比较抛砖引玉，相同的思路，利用隐式类型转换，可以比较Boolean、Date、RegExp对象

    **Boolean**

    ```
    var a = true;
    var b = new Boolean(true);
    
    console.log(+a === +b); // true
    ```

    **Date**

    ```
    var a = new Date(2018, 7, 21);
    var b = new Date(2018, 7, 21);
    
    console.log(+a === +b); // true
    ```

    **RegExp**

    ```
    var a = /a/i;
    var b = new RegExp(/a/i);
    
    console.log(+a === +b); // true
    ```

    Number 会比较特殊些，存在Number(NaN)，永远和NaN都不等，需要加上之前的NaN相等的比较方式

    ```
    var a = Number(NaN);
    var b = Number(NaN);
    
    function eq() {
    	// 判断Number(NaN) Object(NaN)等情况
    	if (+a !== +a) return +b !== !b;
    	
    	// 排除NaN情况的正常比较
    	...
    }
    
    console.log(eq(a, b)); // true
    ```

    **简版deepEq函数**

    ```
    var toString = Object.prototype.toString;
    
    function deepEq(a, b) {
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        
        switch(className) {
            case '[object RegExp]':
            case '[object String]':
            	return '' + a === '' + b;
            case '[object Number]':
            	if (+a !== +a) return +b !== +b;
            	return +a === 0 ? 1 / +a === 1 / +b : +a === +b; // 判断+0 和-0，规定二者不等
            case '[object Date]':
            case '[object Boolean]':
            	return +a === +b;
        }
        
        // 其他判断
    }
    ```

17. 函数柯里化

    第一版

    ``` 
    var curry = function (fn) {
        var args = [].slice.call(arguments, 1);
        return function () {
            var newArgs = args.concat([].slice.call(arguments));
            return fn.apply(this, newArgs);
        }
    }
    
    // 使用
    function add(a, b) {
        return a + b;
    }
    
    var addCurry = curry(add, 1, 2);
    addCurry() // 3
    // 或者
    var addCurry = curry(add, 1);
    addCurry(2) // 3
    // 或者
    var addCurry = curry(add);
    addCurry(1, 2); // 3
    ```

    第二版，实现合并数组

    ```
    function sub_curry(fn) {
        var args = [].slice.call(arguments, 1);
        return function () {
            return fn.apply(this, args.concat([].slice.call(arguments)));
        };
    }
    function curry(fn, length) {
    	length = length || fn.length;
    	var slice = Array.prototype.slice;
    	return function () {
            if (arguments.length < length) {
                var combined = [fn].concat(slice.call(arguments));
                return curry(sub_curry.apply(this, combined), length - arguments.length);
            } else {
                return fn.apply(this, arguments);
            }
    	}
    }
    
    // 测试
    var fn = curry(function (a, b, c) {
        return [a, b, c];
    });
    
    fn("a", "b", "c") // ["a", "b", "c"]
    fn("a")("b")("c") // ["a", "b", "c"]
    ```

18. 偏函数/局部应用（Partial application）

    与柯里化联系

    柯里化是将一个多参数函数转换成多个单参数函数，也就是将一个n元函数转换成n个一元函数

    局部应用是固定一个函数的一个或者多个参数，也就是将一个n元函数转换成一个n-x元函数

    **简单的局部应用**

    ```
    function partial(fn) {
        var args = [].slice.call(arguments, 1);
        return function () {
            var newArgs = args.concat([].slice.call(arguments));
            return fn.apply(this, newArgs);
        }
    }
    
    // demo
    function add(a, b) {
        return a + b + this.value;
    }
    
    // var addOne = add.bind(null, 1);
    var addOne = partial(add, 1);
    var value = 1;
    var obj = {
        value: 2,
        addOne: addOne
    }
    obj.addOne(2);
    // 使用bind时，结果为4
    // 使用partial时，结果为5
    ```

19. 函数组合

    ```
    function compose() {
        var args = arguments;
        var start = args.length - 1;
        return function () {
            var i = start;
            var result = args[start].apply(this, arguments);
            while (i--) result = args[i].call(this, result);
            return result;
        }
    }
    ```

    结合柯里化（curry）和函数组合（compose）：

    **pointfree**指的是函数无须提及将要操作的数据是什么样的。

    ```
    // 需求：输入 'kevin daisy kelly'，返回'K.D.K'
    // 非pointfree，因为提到了数据name
    var initials = function (name) {
        return name.split(' ').map(compose(toUpperCase, head)).join('. ');
    }
    
    // pointfree
    // 先定义基本运算
    var split = curry(function(separator, str) { return str.split(separator) })
    var head = function (str) { return str.slice(0, 1) }
    var toUpperCase = function (str) { return str.toUpperCase() }
    var join = curry(function(separator, arr) { return arr.join(separator) })
    var map = curry(function(fn, arr) { return arr.map(fn) })
    
    var initials = compose(join('.'), map(compose(toUpperCase, head)), split(' '));
    initials("kevin daisy kelly");
    ```

    > pointfree的本质就是使用一些通用的函数，组合出各种复杂运算。上层运算不要直接操作数据，而是通过底层函数去处理。即不使用所要处理的值，只合成运算过程。

20. 函数记忆

    实现原理只用把参数和对应的结果数据存到一个对象中，调用时，判断参数对应的数据是否存在，存在就返回对应的结果数据

    第一版，来自《Javascript权威指南》

    ```
    function memorize(f) {
        var cache = {};
        return function () {
            var key = arguments.length + Array.prototype.join.call(arguments, ",");
            if (key in cache) {
                return cache[key];
            } else {
                return cache[key] = f.apply(this, arguments);
            }
        }
    }
    
    // demo
    var add = function(a, b, c) {
        return a + b + c;
    }
    var memorizeAdd = memorize(add);
    console.time('use memorize');
    for(var i = 0; i < 100000; i++) {
        memorizeAdd(1, 2, 3)
    }
    console.timeEnd('use memorize');
    
    console.time('not use memorize')
    for(var i = 0; i < 100000; i++) {
        add(1, 2, 3)
    }
    console.timeEnd('not use memorize')
    ```

    很不幸上面的方法，有函数记忆消耗60ms，没有才1.3ms左右！

    但是以上的方法是有问题的，当参数是对象的时候，就会自动调用toString方法转换成[Object object]，再拼接字符串作为key值，因此，以下

    ```
    var propValue = function(obj){
        return obj.value
    }
    
    var memoizedAdd = memoize(propValue)
    
    console.log(memoizedAdd({value: 1})) // 1
    console.log(memoizedAdd({value: 2})) // 1
    ```

    返回的值是一致的。

