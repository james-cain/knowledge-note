# ES6

## 箭头函数与this（Arrows and Lexical This）

**所有的箭头函数都没有自己的this，都指向外层**，**箭头函数与包裹它的代码共享相同的this对象**，如果箭头函数在其他函数的内部，它将共享该函数的arguments变量。

“箭头函数”的`this`，**总是指向定义时所在的对象**，而不是运行时所在的对象。还有一种描述**总是指向所在函数运行时的this**

```
// demo1
var a = {
    name: 'A',
    fn: function () {
        console.log(this)
    },
    fnArrow: () => console.log(this)
}
a.fn()  // {name: "A", fn: ƒ, fnArrow: ƒ}
a.fnArrow() // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …} 因为箭头函数指向定义时的对象，此时定义在window，指向window
a.fn.call({name: 'B'})  // {name: "B"}
a.fnArrow.call({name: 'B'}) // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …} 因为箭头函数指向定义时的对象，此时定义在window，指向window
var fn1 = a.fn
fn1()  // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
var fn2 = a.fnArrow
fn2() // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …} 因为箭头函数指向定义时的对象，此时定义在window，指向window

// demo2
function fn() {
    console.log('real', this)
    var arr = [1, 2, 3]
    // 普通 JS
    arr.map(function (item) {
        console.log('js', this)
        return item + 1
    })
    // 箭头函数
    arr.map(item => {
        console.log('es6', this)
        return item + 1
    })
}
fn.call({a: 100})
输出如下：
    real {a: 100}
    js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
    js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
    js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
    es6 {a: 100}
    es6 {a: 100}
    es6 {a: 100}
fn()
输出如下：
	real Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
	js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
	js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
	js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
	es6 Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
	es6 Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
	es6 Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
因为 fn函数只有运行后，箭头函数才会按照定义生成this指向，因此此时箭头函数定义时的所在对象恰好是fn运行时所在的对象。上例中的两个输出，第一个输出，因为fn运行时所指向的对象是{a: 100},因此箭头函数的定义时指向也为{a: 100};第二个输出，因为fn运行时所指向的对象是window，因此箭头函数的定义时指向也为window

// demo3
function foo() {
  return () => {
    return () => {
      return () => {
        console.log("id:", this.id);
      };
    };
  };
}

var f = foo.call({id: 1});

var t1 = f.call({id: 2})()();
var t2 = f().call({id: 3})();
var t3 = f()().call({id: 4});

输出：
id: 1
id: 1
id: 1
原因很简单 因为f在运行时已经确定了此时的箭头函数的定义时指向，接下来的运行时的变化将不会影响this的指向
```

```
// this 对象
var bob = {
    _name: "Bob",
    _friends: [],
    printFriends() {
        this._friends.forEach(f => console.log(this._name + " knows " + f));
    }
}

// arguments 对象
function square() {
    let example = () => {
        let numbers = [];
        for (let number of arguments) {
            numbers.push(number * number);
        }
        return numbers;
    };
    return example();
};

square(2, 4, 7.5, 8); // returns: [4, 16, 56,25, 64]
```

## 类（Classes）

语法糖。类支持基于原型的继承，调用父类的构造函数，生成实例，静态方法和构造函数

## 增强的对象字面量（Enhanced Object Literials）

允许在结构中设置原型，简化foo: foo 这样的赋值，定义方法和调用父级。

```
var obj = {
    // 设置 prototype
    __proto__: theProtoObj,
    // 计算属性不会重复设置__proto__,或者将直接出发错误
    ['__proto__']: somethingElse,
    // 'handler: handler' 简写
    handler,
    // 方法
    toString() {
        // 调用父级方法
        return "d " + super.toString();
    },
    // 设置动态的属性名
    [ "prop_" + (() => 42)() ]: 42 
}
```

## 模板字符串（Template Strings）

## 解构（Destructuring）

解构允许使用模式匹配的方式进行绑定，并支持匹配数组和对象。解构具有一定的容错机制，就像查找普通对象foo['foo']，当没有找到时会返回undefined（而不会直接报错）

> 注：当上层结构都不存在时，解构会报错，如const [{id: id}] = [],解构数组为空，导致整个obj为undefined，此时再去找obj.id就会报错

## 默认参数（Default）+不定参数（Rest）+扩展运算符（Spread）

默认参数（default）的功能是在函数被调用时对参数做自动估值

扩展运算符(spread)可以将数组转换为连续的参数

不定参数（rest）用在参数末尾，将最末尾的参数转换成数组，不定参数让我们不在需要arguments

```
// default
function f(x, y=12) {
    return x + y;
}

// rest
function f(x, ...y) {
    return x * y.length;
}
f(3, "hello", true) // 6

//spread
function (x, y, z) {
    return x + y + z;
}
f(...[1, 2, 3]) == 6
```

## 定义变量（Let）+定义常量（Const）

## 迭代器（Iterators）+For...Of循环

> 注：使用迭代器要引入Babel的polyfill

```
let fibonacci = {
    [Symbol.iterator]() {
        let pre = 0, cur = 1;
        return {
            next() {
                [pre, cur] =[cur, pre + cur];
                return { done: false, value: cur }
            }
        }
    }
}

for (var n of fibonacci) {
	// 循环将在n > 1000时结束
    if (n > 1000) break;
    console.log(n);
}
```

## Generators

通过使用function* 和yield关键字简化了迭代器的编写

```
let fibonacci = {
    [Symbol.iterator]: function*() {
        let pre = 0, cur = 1;
        for (;;) {
            let temp = pre;
            pre = cur;
            cur += temp;
            yield cur;
        }
    }
}

for (var n of fibonacci) {
	// 循环将在n > 1000时结束
    if (n > 1000) break;
    console.log(n);
}
```

> 注：需要在项目中包含Babel的polyfill

## 模块（Modules）

由宿主环境的默认加载器定义模块运行时的行为，采取隐式异步模式—在模块可以被获取和加载前不会有代码执行

```
export function sum(){}
export var pi = xx
export default
export *
import * as math from 'xx'
import {sum, pi} from 'xx'
```

## Map+Set+WeakMap+WeakSet

WeakMap和WeakSet的理解？

weakMaps提供了对对象的弱引用（不会被垃圾回收计数）

> 注：需要使用Babel的polyfill

## 代理对象（Proxies）

需理解。。

proxies允许创建一个可以全范围控制宿主对象行为的对象，可用于拦截，对象的虚拟化，日志记录/性能分析等

```
// 代理普通对象
var target = {}
var handler = {
    get: function(receiver, name) {
        return `hello, ${name}`;
    }
}
var p = new Proxy(target, handler)
p.world === "hello, world"

// 代理函数对象
var target = function() {return "I am the target";}
var handler = {
    apply: function(receiver, ...args) {
        return "I am the proxy"
    }
}
var p = new Proxy(target, handler)
p() === "I am the proxy"
```

```
// 所有元操作(meta-operations)
var handler =
{
  // target.prop
  get: ...,
  // target.prop = value
  set: ...,
  // 'prop' in target
  has: ...,
  // delete target.prop
  deleteProperty: ...,
  // target(...args)
  apply: ...,
  // new target(...args)
  construct: ...,
  // Object.getOwnPropertyDescriptor(target, 'prop')
  getOwnPropertyDescriptor: ...,
  // Object.defineProperty(target, 'prop', descriptor)
  defineProperty: ...,
  // Object.getPrototypeOf(target), Reflect.getPrototypeOf(target),
  // target.__proto__, object.isPrototypeOf(target), object instanceof target
  getPrototypeOf: ...,
  // Object.setPrototypeOf(target), Reflect.setPrototypeOf(target)
  setPrototypeOf: ...,
  // for (let i in target) {}
  enumerate: ...,
  // Object.keys(target)
  ownKeys: ...,
  // Object.preventExtensions(target)
  preventExtensions: ...,
  // Object.isExtensible(target)
  isExtensible :...
}
```

> 注：由于ES5的局限性，Proxies无法被转换或者通过polyfill兼容

## Symbols

需理解。。

Symbol对对象的状态进行访问控制

> 注：通过polyfill部分实现：
>
> 部分功能不能转换或通过polyfill兼容

## Promises

## Reflect API

需理解。。