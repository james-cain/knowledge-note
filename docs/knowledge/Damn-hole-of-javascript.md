# JavaScript

## async和await

```js
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

## Proxy

```js
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

## 0.1 +  0.2 != 0.3 的处理

```js
parseFloat((0.1 + 0.2).toFixed(10))
```

## 正则表达式

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

## 数组去重

方法一：排序后去重，支持自定义规则如何视为相同元素，如字母大小写视为一致

```js
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

```js
var array = [1, 2, 1, 1, '1'];

function unique(array) {
    return array.concat().sort().filter(function (item, index, array) {
		return !index || item !== array[index - 1];
	});
}

console.log(unique(array));
```

方法三：用Object键值对实现

```js
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

```js
var array = [1, 2, 1];

var unique = (array) => [...new Set(array)];

unique(array);
```

## 类型判断

**最常见使用的是typeof**

| 类型                     | typeof                   |
| ------------------------ | ------------------------ |
| Undefined                | undefined                |
| **Null**                 | **object**               |
| Boolean                  | boolean                  |
| Number                   | number                   |
| String                   | string                   |
| Symbol                   | symbol                   |
| 宿主对象（由JS环境提供） | Implementation-dependent |
| 函数对象                 | function                 |
| Object(任何其他对象)     | object                   |

显然，typeof对object的检测是不精确的，Object还有很多细分类型，如Date，Function，Array，RegExp，Error等，对于这些返回的都是object

为了解决上面的问题，可以采用**Object.propotype.toString**，toString方法被调用的时候，会执行下面的步骤：

1. 如果this值是undefined，就返回[object Undefined]
2. 如果this值是null，就返回[object Null]
3. 让O成为ToObject(this)的结果
4. 让class成为O的内部属性[[class]]的值
5. 最后返回由"[object" 和class和"]"三部分组成的字符串

```js
// 写个demo
console.log(Object.prototype.toString.call(undefined)) // [object Undefined]
console.log(Object.prototype.toString.call(null)) // [object Null]

var date = new Date()
console.log(Object.prototype.toString.call(date)) // [object Date]
```

除了以上例子之外，Object.prototype.toString实际可以判断至少12中类型（14种）

```js
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

```js
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

```js
$.isPlainObject({}) // true
$.isPlainObject(new Object) // true
$.isPlainObject(Object.create(null)) // true
$.isPlainObject(Object.assign({ a: 1 }, { b: 2 })) // true
$.isPlainObject(new Person('xx')) // false
$.isPlainObject(Object.create({})) // false
```

因此除了{}和new Object创建的对象外，没有原型的对象也是一个纯粹的对象

jquery3.0中的源码

```js
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

```js
console.log(hasOwn.toString.call(Ctor)); // function Object() { [native code] }
console.log(Object.prototype.toString.call(Ctor)); // [object Function]
```

发现返回值并不一样，因为hasOwn.toString调用的其实是Function.prototype.toString，已经覆盖了Object继承来的toString。该方法返回的包括function关键字，形参列表，大括号，以及函数体中的内容

**EmptyObject**：判断对象是否是空对象，只要遍历对象，有属性，即为非空

```js
function isEmptyObject(obj) {
    var name;
    
    for (name in obj) {
        return false;
    }
    
    return true;
}
```

**Window对象**：判断window对象，只需判断该对象中是否有指向自身的window属性

```js
function isWindow(obj) {
    return obj != null && obj === obj.window;
}
```

**isArrayLike**：该函数判断类数组对象和数组，都会返回true

```js
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

```js
function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
}
```

## 数组的浅拷贝

concat和slice是浅拷贝

```js
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

## 数组的深拷贝

简单粗暴的方式

```js
var new_arr = JSON.parse(JSON.stringify(arr));
console.log(new_arr);
```

但是该方法不能拷贝函数

实现深拷贝，只需在浅拷贝的基础上，如果是对象，就递归调用深拷贝函数就可以

```js
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

## 数组扁平化

用reduce实现

```js
var arr = [1, [2, [3, 4]]];

function flatten(arr) {
    return arr.reduce(function(prev, next) {
        return prev.concat(Array.isArray(next) ? flatten(next) : next);
    });
}

console.log(flatten(arr));
```

## 判断两个对象相等

这里相等的范畴，不仅包括===的形式，还包括：

1. NaN 和NaN相等
2. [1]和[1]相等
3. {value: 1}和{value: 1}相等
4. 1和new Number(1)相等
5. 'xx'和new String('xx')相等
6. true和new Boolean(true)相等

**判断NaN相等**

```js
function eq(a, b) {
    if (a !== a) return b !== b;
}

console.log(eq(NaN, NaN));
```

**String对象**

Object.prototype.toString方法判断结果却是一致的，如下

```js
var toString = Object.prototype.toString;
toString.call('xx'); // "[object String]"
toString.call(new String('xx')); // "[object String]"
```

但是同样还是不能比较字符串和字符串包装对象是相等的，可以利用隐式类型转换

```js
console.log('xx' + '' === new String('xx') + ''); // true
```

因此，先比较a和b的Object.prototype.toString的结果是否一致，如果都是"[object String]"，再使用'' + a === ' ' + b进行判断

**更多对象**

通过String对象的比较抛砖引玉，相同的思路，利用隐式类型转换，可以比较Boolean、Date、RegExp对象

**Boolean**

```js
var a = true;
var b = new Boolean(true);

console.log(+a === +b); // true
```

**Date**

```js
var a = new Date(2018, 7, 21);
var b = new Date(2018, 7, 21);

console.log(+a === +b); // true
```

**RegExp**

```js
var a = /a/i;
var b = new RegExp(/a/i);

console.log(+a === +b); // true
```

Number 会比较特殊些，存在Number(NaN)，永远和NaN都不等，需要加上之前的NaN相等的比较方式

```js
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

```js
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

## 函数柯里化

第一版

``` js
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

```js
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

## 偏函数/局部应用（Partial application）

与柯里化联系

**柯里化是将一个多参数函数转换成多个单参数函数，也就是将一个n元函数转换成n个一元函数**

**局部应用是固定一个函数的一个或者多个参数，也就是将一个n元函数转换成一个n-x元函数**

**简单的局部应用**

```js
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

## 函数组合

```js
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

```js
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

## 函数记忆

实现原理只用把参数和对应的结果数据存到一个对象中，调用时，判断参数对应的数据是否存在，存在就返回对应的结果数据

第一版，来自《Javascript权威指南》

```js
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

```js
var propValue = function(obj){
    return obj.value
}

var memoizedAdd = memoize(propValue)

console.log(memoizedAdd({value: 1})) // 1
console.log(memoizedAdd({value: 2})) // 1
```

返回的值是一致的。

第二版，来自underscore实现

```js
var memorize = function (func, hasher) {
    var memorize = function (key) {
        var cache = memorize.cache;
        var address = '' + (hasher ? hasher.apply(this, arguments) : key);
        if (!cache[address]) {
            cache[address] = func.apply(this, arguments);
        }
        return cache[address];
    }
    memorize.cache = {};
    return memorize;
}
```

如果该函数是单参数，不传入hasher也是可以的，因为address只取了第一个实参。若要支持多参数，就必须要传入hasher函数，具体实现可以使用JSON.stringify，demo如下

```js
var memorizeAdd = memorize(add, function() {
    var args = Array.prototype.slice.call(arguments);
    return JSON.stringify(args);
});

console.log(memorizeAdd(1, 2, 3)) // 6
console.log(memorizeAdd(1, 2, 4)) // 7
```

## 递归

当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。对于阶乘函数执行来说，js会不断的创建执行上下文压入执行上下文栈，这就必须要用**尾调用**。尾调用是指函数内部的最后一个动作是函数调用。该调用的返回值，直接返回给函数。

**对于为什么必须要用尾调用，可以这么理解**。如果函数最后执行的单纯的一个函数调用，相当于对于本函数来说已经完成了自己的任务了，就可以释放了。那个函数想怎么样就怎样，不关我的事。但是如果还有别的操作，就必须等待对方的返回值，计算完后，才能释放，只有若干个的递归还吃得消，若是成千的递归，那性能可想而知。

### Memoization

在多次调用递归函数时，会遇到大量的不可避免的重复调用。可以加入缓存方案来使整个计算更加简便·

```js
function memfactorial(n) {
    if (!memfactorial.cache) {
        memfactorial.cache = {
            "0": 1,
            "1": 1,
        };
    }
    
    if (!memfactorial.cache.hasOwnProperty(n)) {
        memfactorial.cache[n] = n * memfactorial(n-1);
    }
    
    return memfactorial.cache[n];
}
```

以上是递归乘法的优化写法，大大减小了递归发生的运算时间

因此，依照这种思路，可以封装一个基本的memoize()函数

```js
function memoize(fundamental, cache) {
    cache = cache || {};
    var shell = function(arg) {
        if (!cache.hasOwnProperty(arg)) {
            cache[arg] = fundamental(arg);
        }
        return cache[arg];
    };
    return shell;
}
```

## 构造函数（constructor）、实例原型（prototype）、实例之间的关系

例如

```js
function Person() {}
var person = new Person();
person.name = 'xx';
console.log(person.name);
```

Person就是**构造函数**，使用new创建了一个实例对象person

**__ proto __**：每一个js对象（除了null）都具有这个属性，指向该对象的原型

```js
function Person() {}
var person = new Person();
console.log(person.__proto__ === Person.prototype); // true
```

**constructor**：每个原型都有一个constructor属性指向关联的构造函数

```js
function Person() {}

var person = new Person();
console.log(Person === Person.prototype.constructor); // true
console.log(person.constructor === Person) // true

// 这里需要注意的，当获取person.constructor时，其实person中并没有constructor属性，当不能读取到constructor属性时，会从person的原型也就是Person.prototype中获取，正好原型中有该属性
```

综上描述，可以得出

```js
function Person() {}
var person = new Person();

console.log(person.__proto__ === Person.prototype) // true
console.log(Person.prototype.constructor === Person) // true
console.log(Object.getPrototypeOf(person) === Person.prototype) // true es5获取对象的原型
```

**Object.prototype的原型是什么？**

```js
console.log(Object.prototype.__proto__ === null) // true
```

## 参数按值传递

ECMAScript中规定，所有函数的参数都是按值传递，可以理解为把函数外部的值复制给函数内部的参数，就和把值从一个变量复制到另一个变量一样。

但是，同样存在困惑，如下例子

```js
var obj = {
    value: 1
};
function foo (o) {
    o.value = 2;
    console.log(o.value); // 2
}
foo(obj);
console.log(obj.value); // 2
```

不是说是按值传递吗？为什么这里看着就像引用传递呢？同样在看一个例子

```js
var obj = {
    value: 1
};
function foo(o) {
    o = 2;
    console.log(o); // 2
}
foo(obj);
console.log(obj.value); // 1
```

怎么上例中又不发生改变呢？

> 其实，在传递方式，还有一种叫做共享传递。即在传递对象的时候，传递对象的引用的副本，其实还是按值传递

**注意：按引用传递传递对象的引用，而按共享传递是传递对象的引用的副本**

所以，不难理解，当修改o.value，可以通过引用找到原值，但是直接修改o，并不会修改原值。

## 创建对象的多种方式及优缺点

**工厂模式**

```js
function createPerson(name) {
    var o = new Object();
    o.name = name;
    o.getName = function() {
        console.log(this.name);
    }
    return o;
}
var person1 = createPerson('xx');
console.log(person1 instanceof createPerson); // false
console.log(person1 instanceof Object); // true
```

缺点：对象无法识别，因为所有的实例都指向一个原型

**构造函数模式**

```js
function Person(name) {
    this.name = name;
    this.getName = function () {
        console.log(this.name);
    }
}

var person2 = new Person('xx');
console.log(person2 instanceof Person); // true
console.log(person2 instanceof Object); // true
```

优点：实例可以识别为一个特定的类型

缺点：每次创建实例时，每个方法都要被创建一次

**构造函数模式优化**

```js
function Person(name) {
    this.name = name;
    this.getName = getName;
}
function getName () {
    console.log(this.name);
}

var person3 = new Person('xx');
```

优点：解决了每个方法都要被重新创建的问题

缺点：这个不算是封装

**原型模式**

```js
function Person(name) {}
Person.prototype.name = 'xx';
Person.prototype.getName = function () {
    console.log(this.name);
}

var person4 = new Person();
```

优点：解决方法不会重新创建

缺点：1.所有的属性和方法都共享 2.不能初始化参数

**组合模式**

构造函数模式与原型模式双剑合璧

```js
function Person(name) {
    this.name = name;
}
Person.prototype = {
    constructor: Person,
    getName: function () {
        console.log(this.name);
    }
}

var person5 = new Person();
```

优点：该共享的共享，该私有的私有

缺点：希望全都都写在一起，即更好的封装性

**动态原型模式**

```js
function Person(name) {
    this.name = name;
    if (typeof this.getName != "function") {
        Person.prototype.getName = function () {
            console.log(this.name);
        }
    }
}

var person6 = new Person('xx');
```

但是用这个方式时，**不能用对象字面量重新原型**

如下解释：

```js
function Person(name) {
    this.name = name;
    if (typeof this.getName != "function") {
        Person.prototype = {
            constructor: Person,
            getName: function () {
                console.log(this.name);
            }
        }
    }
}

var person1 = new Person('kevin');
var person2 = new Person('daisy');

// 报错 并没有该方法
person1.getName();

// 注释掉上面的代码，这句是可以执行的。
person2.getName();
```

原因很简单，new的具体实现步骤为：

- 首先创建一个对象
- 然后将对象的原型指向Person.prototype
- 然后Person.apply(obj)
- 返回这个对象

在执行obj.Person方法时，person1的prototype属性指向了员原来实例的原型，这里使用字面量方式直接覆盖Person.prototype，并不会更改实例的原型的值，person1依然指向原来的原型，而不是Person.prototype，而之前的原型是没有getName方法的，所以就报错了。

**寄生构造函数模式**

```js
function Person (name) {
    var o = new Object();
    o.name = name;
    o.getName = function () {
        console.log(this.name);
    }
    return o;
}

var person7 = new Person('xx')
console.log(person7 instanceof Person); // false
console.log(person7 instanceof Object); // true
```

这种写法有一个好处，比如想给特殊数组创建方法，又不想直接修改Array构造函数，可以这样写：

```js
function SpecialArray() {
    var values = new Array();
    for (var i = 0, len = arguments.length; i < len; i++) {
        values.push(arguments[i]);
    }

    values.toPipedString = function () {
        return this.join("|");
    };
    return values;
}

var colors = new SpecialArray('red', 'blue', 'green');
var colors2 = SpecialArray('red', 'blue', 'green');

console.log(colors);
console.log(colors.toPipedString); // red|blue|green

console.log(colors2);
console.log(colors2.toPipedString); // red|blue|green
```

其实，寄生构造函数模式和工厂模式在创建对象的时候，就多使用了new，实际两者的结果是一样的

**稳妥构造函数模式**

```js
function person(name) {
	var o = new Object();
	o.sayName = function () {
        console.log(name);
	};
	return o;
}

var person9 = person('xx');
person9.sayName(); // xx
person9.name = 'xx2';
person9.sayName(); // xx
console.log(person9.name); //xx2
```

## 继承的多种方式和优缺点

**原型链继承**

```js
function Parent () {
    this.name = 'xx';
}
Parent.prototype.getName = function () {
    console.log(this.name);
}
function Child() {}
Child.prototype = new Parent();
var child1 = new Child();
console.log(child1.getName()); // xx
```

问题：

1. 引用类型的属性被所有实例共享
2. 在创建Child的实例时，不能向Parent传参

**借用构造函数(经典继承)**

```js
function Parent() {
    this.names = ['xl', 'cora'];
}
function Child() {
    Parent.call(this);
}
var child1 = new Child();
child1.names.push('cain');
console.log(child1.names); // ['xl', 'cora', 'cain']
var child2 = new Child();
console.log(child2.names); // ['xl', 'cora']
```

优点：

1. 避免了引用类型的属性被所有实例共享

2. 可以在Child中向Parent传参

   举个例子

   ```js
   function Parent (name) {
       this.name = name;
   }
   
   function Child (name) {
       Parent.call(this, name);
   }
   
   var child1 = new Child('kevin');
   
   console.log(child1.name); // kevin
   
   var child2 = new Child('daisy');
   
   console.log(child2.name); // daisy
   ```

缺点：

方法都在构造函数中定义，每次创建实例都会创建一遍方法。

**组合继承**

原型链继承和经典继承双剑合璧

```js
function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}
Parent.prototype.getName = function (){
    console.log(this.name);
}
function Child(name, age) {
    Parent.call(this, name);
    this.age = age;
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;

var child1 = new Child('kevin', '18');

child1.colors.push('black');

console.log(child1.name); // kevin
console.log(child1.age); // 18
console.log(child1.colors); // ["red", "blue", "green", "black"]

var child2 = new Child('daisy', '20');

console.log(child2.name); // daisy
console.log(child2.age); // 20
console.log(child2.colors); // ["red", "blue", "green"]
```

优点： 融合原型链继承和构造函数的优点，是Javacript中最常用的继承模式。

**原型式继承**

```js
function createObj(o) {
    function F(){}
    F.prototype = o;
    return new F();
}
```

Object.create的模拟实现，将传入的对象作为创建的对象的原型

缺点：包含引用类型的属性值始终都会共享响应的值跟原型链继承一样

```js
var person = {
    name: 'xl',
    friends: ['cora'],
}
var person1 = createObj(person);
var person2 = createObj(person);
person1.name = 'person1';
console.log(person2.name); // 
```

## Ajax

> 请求数据常用方式：XMLHttpRequest(XHR)、Dynamic script tag insertion(动态脚本注入)、Multipart XHR

### 动态脚本注入

能跨域请求数据。可使用JavaScript创建一个新的脚本标签，并设置src属性为不同域的URL。

```js
var scriptElement = document.createElement('script');
scriptElement.src = 'http://any-domain.com/javascript/lib.js';
document.getElementByTagName('head')[0].appendChild(scriptElement);

function jsonCallback(jsonString) {
    var data = eval('(' + jsonString + ')');
    // 处理数据...
}

// lib.js
jsonCallback({ "status": 1, "colors": ["#fff", "#000"] });
```

因为响应消息作为脚本标签的源码，必须是可执行的JavaScript代码。不能使用纯XML、纯JSON或其他任何格式的数据，无论哪种格式，都必须封装在一个回调函数中。

若发送的数据是很重要的数据，可以在发送失败的情况下重试：

```js
function xhrPost(url, params, callback) {
    var req = new XMLHttpRequest();
    req.onerror = function() {
        setTimeout(function() {
            xhrPost(url, params, callback);
        }, 1000);
    };
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (callback && typeof callback == 'function') {
                callback();
            }
        }
    };
    req.open('POST', url, true);
    req.send(params.json('&'));
}
```

### Beacons(信标)

类似于动态脚本注入。使用Javascript创建一个新的Image对象，并把src属性设置为服务器上脚本的URL

服务器会接收到数据并保存下来，无须向客户端发送任何回馈信息。

```js
var url = '/status_tracker.php';
var params = [
    'step=2',
    'time=1238027314'
];
var beacon = new Image();
beacon.src = url + '?' + params.join('&');
beacon.onload = function() {
    if (this.width == 1) {
        // 成功
    } else if (this.width == 2) {
        // 失败，请重试并创建另一个信标
    }
}
beacon.onerror = function() {
    // 出错，稍后重试并创建另一个信标
}
```



## 定时机制处理数组

```js
function timedProcessArray(items, process, callback) {
    var todo = item.concat();
    setTimeout(function() {
        var start = +new Date();
        do {
            process(todo.shift());
        } while(todo.length > 0 && (+new Date() - start < 50));
        if (todo.length > 0) {
            setTimeout(arguments.callee, 25);
        } else {
            callback(items);
        }
    });
}
```

## 定时器

前序

用于执行Javascript和更新用户界面的进程被称为"浏览器UI线程"。UI线程的工作基于一个简单的队列系统，任务会被保存到队列中直到进程空闲。这些任务包括运行JavaScript代码、执行UI更新，包括重绘和重排

> JavaScript中的定时器包括setTimeout()和setInterval()
>
> 这两个方法都会带两个参数：要执行的函数和执行前等待时间(单位ms)

注意点：

- 第二个参数代表的任务何时**被添加到**UI队列中，而**不是**一定会在这段时间后**执行**，这个任务会等待队列中其他所有任务执行完毕才会执行。
- 无论发生何种情况，创建一个定时器会造成UI线程暂停，如同它从一个任务切换到下一个任务。因此，定时器代码会重置所有相关的浏览器限制，包括长时间运行脚本定时器。此外，调用栈也在定时器的代码中重置为0。这一特性使得定时器成为长时间运行JavaScript代码理想的跨浏览器解决方案。
- 定时器延迟的最小值建议为25ms（实际时间是15或30）以确保至少有15毫秒延迟。

## 浏览器中的DOM操作

> 浏览器中通常把DOM和JavaScript独立实现。以下是几个浏览器的情况

| 浏览器  | 渲染引擎                      | JavaScript引擎                  |
| ------- | ----------------------------- | ------------------------------- |
| IE      | Trident(放在mshtml.dll文件中) | JScript(放在jscript.dll文件中)  |
| Safari  | WebCore                       | JavaScriptCore(SquirrelFish)    |
| Google  | WebCore                       | V8                              |
| Firefox | Gecko                         | SpiderMonkey(新版叫JagerMonkey) |

因此，可以看出，要在JavaScript中调用DOM操作，其实是跨越了一个很长的桥梁，次数越多，成本就越高。减少它们之间的交互，让运算尽量留在ECMAScript这一端处理是重要的处理方式

优化方式：

- 更新一大段HTML时，用innerHMTL会是推荐方式

- 尽量克隆已有元素，而不是创建新元素--使用element.cloneNode()代替document.createElement()

- 访问集合元素时使用局部变量，就是尽量在函数中，定义局部变量来减少作用域链的频繁查找

- 使用新的能区分元素节点和其他类型节点的DOM元素，比如注释和文本节点(通常只是两个节点间的空格)。这样可以减少不必要的过滤，提升效率

  | 能区分元素节点和其他节点的DOM属性 | 被替换的属性      |
  | --------------------------------- | ----------------- |
  | children                          | childNodes        |
  | childElementCount                 | childNodes.length |
  | firstElementChild                 | firstChild        |
  | lastElementChild                  | lastChild         |
  | nextElementSibling                | nextSibling       |
  | previousElementSibling            | perviousSibling   |

- 重绘和重排

  以下情况会导致发生重排：

  - 添加或删除可见的DOM元素
  - 元素位置发生变化
  - 元素尺寸改变（包括：外边距、内边距、边框厚度、宽度、高度等属性改变）
  - 内容改变，例如：文本改变或图片被另一个不同尺寸的图片替代
  - 页面渲染器初始化
  - 浏览器窗口尺寸改变

  每次重排都会产生计算消耗，因此大多数浏览器都是通过队列化修改并批量执行来优化重排过程。

  以下操作会导致队列刷新：

  - offsetTop,offsetLeft,offsetWidth,offsetHeight
  - scrollTop,scrollLeft,scrollWidth,scrollHeight
  - clientTop,clientLeft,clientWidth,clientHeight
  - getComputedStyle()

  他们都会刷新渲染队列，即使是在获取最近未发生改变的或者与最新改变无关的布局信息

  **一个有效的方法是不要在布局信息改变时查询它。如读取computed样式的代码被移到末尾**

  ```js
  bodystyle.color = 'red';
  bodystyle.color = 'white';
  bodystyle.color = 'green';
  tmp = computed.backgroundColor;
  ```

  最小化重排和重绘

  - 合并多次对DOM和样式的修改，然后一次处理

  - 合并所有的改变然后一次处理，使用cssText属性实现方案

    ```
    var el = document.getElementById('mydiv');
    el.style.cssText = 'border-left: 1px; border-right: 2px;';
    ```

  - 可以通过以下步骤减少重绘和重排的次数：

    1. 使元素脱离文档流
    2. 对其应用多重改变
    3. 把元素待会文档中

    脱离文档流的方式也有三种：

    1. 隐藏元素，应用修改，重新显示
    2. 使用文档片段(document fragment)，在当前DOM之外构建一个子树，再把它拷贝回文档
    3. 将原始元素拷贝到一个脱离文档的节点中，修改副本，完成后再替换元素元素

  - 缓存布局信息。尽量减少布局信息的获取次数，获取后把它赋值给局部变量，然后在操作局部变量

    ```js
    // 低效做法
    myElement.style.left = 1 + myElement.offsetLeft + 'px';
    myElement.style.top = 1 + myElement.offsetTop + 'px';
    if (myElement.offsetLeft >= 500) {
        stopAnimation();
    }
    
    // 高效做法
    // 获取一次起始位置的值，然后将其赋值给一个变量，然后直接使用current变量而不再查询偏移
    var current = myElement.offsetLeft;
    current++;
    myElement.style.left = current + 'px';
    myElement.style.top = current + 'px';
    if (current >= 500) {
        stopAnimation();
    }
    ```

## 延迟加载

> 延迟加载时消除函数中的重复工作的方法之一。
>
> 一般的实现方式，先检查并决定使用哪种方法去绑定或取消绑定事件处理器。然后原始函数被包含正确操作的新函数覆盖。随后每次调用事件都不会再做检测，因为检测代码已经被新的函数覆盖。

e.g. 对比

```js
// 没有延迟加载
function addHandler(target, eventType, handler) {
    if (target.addEventListener) { // DOM2 Events
    	target.addEventListener(eventType, handler, false);
    } else { // IE
    	target.attachEvent("on" + eventType, handler);
    }
}
function removeHandler(target, eventType, handler) {
    if (target.removeEventListener) {
        target.removeEventListener(eventType, handler, false);
    } else {
        target.detachEvent("on" + eventType, handler);
    }
}

// 延迟加载方法
function addHandler(target, eventType, handler) {
    // 复写现有函数
    if (target.addEventListener) {
        addHandler = function(target, eventType, handler) {
            target.addEventListner(eventType, handler, false);
        };
    } else {
        addHandler = function(target, eventType, handler) {
            target.attachEvent("on" + eventType, handler);
        };
    }
    addHandler(target, eventType, handler);
}
function removeHandler(target, eventType, handler) {
    // 复写现有函数
    if (target.removeEventListener) {
        removeHandler = function(target, eventType, handler) {
            target.removeEventListener(eventType, handler, false);
        };
    } else {
        removeHandler = function(target, eventType, handler) {
            target.detachEvent("on" + eventType, handler);
        };
    }
    removeHandler(target, eventType, handler);
}
```

## 条件预加载(conditional advance loading)

> 条件预加载也是减少函数做相同工作的方式之一
>
> 与延迟加载相比，条件预加载将检测逻辑提前，而不是等到函数调用时才判断。检测的操作依然只有一次，只是它在过程中来的更早

e.g.

```js
var addHandler = document.body.addEventListener ?
	function(target, eventType, handler) {
        target.addEventListener(eventType, handler, false);
	} :
	function(target, eventType, handler) {
        target.attachEvent("on" + eventType, handler);
	};
	
var removeHandler = document.body.removeEventListener ?
	function(target, eventType, handler) {
        target.removeEventListener(eventType, handler, false);
	} :
	function(target, eventType, handler) {
        target.detachEvent("on" + eventType, handler);
	};
```

## 使用快速JavaScript代码

> 位操作是JavaScript中速度很快的运算。少去了从64位到32位的表示的转换过程

JavaScript中的位逻辑操作符包括：

- AND 位与 - 两个操作数的对应位都是1时，该位返回1
- OR 位或 - 两个操作数的对应位**只要有**一个为1时，该位返回1
- XOR 位异或 - 两个操作数的对应位**只有**一个为1时，该位返回1
- NOT 位取反 - 遇0则返1，反之亦然

e.g. 采用对2取模运算实现表格行颜色交替

```js
// 正常的实现方式
for (var i = 0, len = rows.length; i < len; i++) {
    if (i % 2) {
        className = 'even';
    } else {
        className = 'odd';
    }
}

// 直接用位操作
// 使用最低位二进制数判断，偶数最低位是0，奇数是1.然后再和1做位与运算，结果为0表示奇数，1表示偶数
for (var i = 0, len = row.length; i < len; i++) {
    if (i & 1) {
        className = 'even';
    } else {
        className = 'odd';
    }
}
```

使用位操作，代码虽然没有怎么发生变化，但是速度却比原来的版本加快了不少(取决于浏览器)。