# Interview

## 基本类型

string、number、boolean、null、undefined、Symbol

除了null和undefined之外，所有基本类型都有包裹这个基本类型值的等价对象：

String、Number、Boolean、Symbol，对象的valueOf()方法返回基本类型值

## 浮点数的坑

![float-hole](http://www.reyshieh.com/assets/float-hole.png)

想必以上的输出程序员在编写代码的时候都见过，这就是浮点数运算的锅。

在JavaScript中，浮点数是采用IEEE-754格式定义的，即双精度格式，每个浮点数占**64位**，包括整数。

其中，第1位为**标记位**，表示正数或负数。中间11位表示**指数**，允许指数最大到**2047**（0-2047），如果指数部分的值在0到2047之间（不含两个端点），那么有效数字的第一位默认总是1^?^，不保存在64位浮点数之中，也就是，有效数字这时总是**1.xx…xx**的形式，其中**xx…xx**的部分保存在64位浮点数之中，最长可能为52位，因此，**JavaScript提供的有效数字最长为53个二进制位**。剩下52位是**尾数(有效数字)**，也就是允许精度到52位以后。因此，不难看出，Javascript中是存在+0和-0的，Infinity和NaN也被编码为浮点数，指数取最大值，尾数为0，它表示为正无穷或负无限。

```
(-1)^符号位 * 1.xx...xx * 2^指数部分
```

该公式是正常情况下(指数部分在0到2047之间)，一个数在JavaScript内部实际的表示形式

对于不理解浮点数在计算机中是如何表示，可以通过[IEEE754 64-bit](http://www.binaryconvert.com/convert_double.html)可视化界面来帮助理解~

精度最多只能到53个二进制位，意味着，绝对值小于2的53次方的整数，即-2^53^到2^53^，都可以精确表示

```js
Math.pow(2, 53)
// 9007199254740992
 
Math.pow(2, 53) + 1
// 9007199254740992

Math.pow(2, 53) + 2
// 9007199254740994

Math.pow(2, 53) + 3
// 9007199254740996

Math.pow(2, 53) + 4
// 9007199254740996
```

由于2的53次方是一个16位的十进制数值，所以，换句话说，**JavaScript对15位的十进制数都可以精确处理**

```js
Math.pow(2, 53)
// 9007199254740992

// 多出的三个有效数字，将无法保存
9007199254740992111
// 9007199254740992000
```

JavaScript在几种情况下，**会自动将数值转为科学计数法表示，其他情况都采用字面形式直接表示**：

1. 小数点前的数字多与21位

   ```js
   1234567890123456789012
   // 1.2345678901234568e+21
   
   123456789012345678901
   // 123456789012345680000
   ```

2. 小数点后的零多余5个

   ```js
   // 小数点后紧跟5个以上的零，
   // 就自动转为科学计数法
   0.0000003 // 3e-7
   
   // 否则，就保持原来的字面形式
   0.000003 // 0.000003
   ```

指数用11个二进制位，分成一半负数，[0,1022]表示负数(阶码对应为-1023~-1)，[1024-2047]表示正数(阶码对应为1~1024)。1023(01111111111)实际代码阶码为0，也就是JavaScript能表示的数值范围为2^1024^到2^-1023^（开区间）之间，超出的数无法表示。

> 浮点数的阶码是用移码计算的，即对真值补码的符号位取反
>
> 正整数的符号位0，反码和补码等同于原码
>
> 负整数符号位固定为1，原码，反码和补码的表示都不相同，有原码表示法变成反码和补码的规则如下：
>
> 1. 原码符号位为1不变，整数的每一位二进制数位求反得反码
> 2. 反码符号位为1不变，反码数值位最低位加1得补码

实际公式为:

```js
V = (-1)^S * 2^(E-1023) * (1.M)
// S:符号位
// E: 指数位
// M: 尾数位，超出的部分自动进一舍零

// 双精度浮点数，阶码的计算 E-1023,其中1023是由移码计算得来，即符号位为0，其他位数都为1，
// 因此不难看出，单精度浮点数，阶码的计算则为 E-2^7 === E-127
// 所以，单精度浮点数的表示公式为
// V = (-1)^S * 2^(E-127) * (1.M)
```

如果一个数大于等于2的1024次方，那么就会发生"正向溢出"，即JavaScript无法表示这么大的数，这时会返回Infinity

```js
Math.pow(2, 1024) // Infinity
```

如果一个数小于2的-1075次方（指数部分最小值-1023，再加上小数部分的52位），那么就是"负向溢出"，即JavaScript无法表示这么小的数，这时会直接返回0

```js
Math.pow(2, -1075) // 0
```

**特殊数值**

- 正零和负零

  在正常的场合，正零和负零都会被当做正常的0

  只有在把+0和-0当做分母，返回的值才是不相等的

  ```js
  (1 / +0) === (1 / -0) // false, +Infinity和-Infinity
  ```

- NaN

  主要出现在字符串解析成数字出错的场合

  ```js
  5 - 'x' // NaN
  ```

  一些数学函数的运算结果也会出现NaN，如Math.acos(2)，Math.log(-1)，Math.sqrt(-1)等

  **0除以0也会得到NaN**

  NaN不是独立的数据类型，而是一个特殊数据值，**它的数据类型依然属于Number**，使用typeof运算符可以看得出来

  ```js
  typeof NaN // 'number'
  ```

  NaN不等于任何值，包括它本身

  ```js
  NaN === NaN // false
  ```

  数组的**indexOf**方法内部使用的是严格相等运算符，所以该方法对NaN不成立

  ```js
  [NaN].indexOf(NaN) // -1
  ```

  NaN在布尔运算时被当做false

  ```js
  Boolean(NaN) // false
  ```

- Infinity

  “无穷”，用来表示两种场景。一种是一个正的数值太大，或一个负的数值太小，无法表示；另一种是非0数值除以0，得到Infinity

  ```js
  Math.pow(2, 1024) // Infinity
  
  0 / 0 // NaN
  1 / 0 // Infinity
  ```

  Infinity大于一切数值(除了NaN)，-Infinity小于一切数值(除了NaN)

  ```js
  Infinity > 1000 // true
  -Infinity < -1000 // true
  ```

  Infinity与NaN比较，总是返回false

  ```js
  Infinity > NaN // false
  -Infinity > NaN // false
  ```

  0乘以Infinity，返回NaN；0除以Infinity，返回0；Infinity除以0，返回Infinity

  ```js
  0 * Infinity // NaN
  0 / Infinity // 0
  Infinity / 0 // Infinity
  ```

  Infinity加或乘以Infinity，返回的还是Infinity

  ```js
  Infinity + Infinity // Infinity
  Infinity * Infinity // Infinity
  ```

  Infinity减或除以Infinify，得到NaN

  ```js
  Infinity - Infinity // NaN
  Infinity / Infinity // NaN
  ```

  Infinity与null计算时，**null会转成0**，等同于与0计算

  ```js
  null * Infinity // NaN
  null / Infinity // 0
  Infinity / null // Infinity
  ```

  Infinity与undefined计算都是NaN

  ```js
  undefined + Infinity // NaN
  undefined - Infinity // NaN
  undefined * Infinity // NaN
  undefined / Infinity // NaN
  Infinity / undefined // NaN
  ```

推荐处理浮点数可以使用像[mathjs](https://github.com/josdejong/mathjs)这样的库。

> ?: 为什么指数部分的值在0到2047之间（不含两个端点），那么有效数字的第一位默认总是1？
>
> 在计算机中，二进制数值都会转换成对应的科学计数法表示。如4.5，转换成二进制是100.1，特学技术法表示是1.001 * 2^2，因此，不难看出，第1位，在非零情况下，都为1.

资料：https://github.com/camsong/blog/issues/9

## 值类型和引用类型

值类型（string、number、boolean、null、undefined）

- 占用空间固定，保存在**栈**中（当一个方法执行时，每个方法都会建立自己的内存栈，在这个方法内定义的变量将会逐个放入这块栈内存里，随着方法的执行结束，这个方法的内存栈也将自然销毁。因此，所有在方法中定义的变量都是放在栈内存中的；**栈中存储的是基础变量以及一些对象的引用变量，基础变量的值是存储在栈中，而引用变量存储在栈中的是指向堆中的数组或者对象的地址，因此，修改引用类型总会影响到其他指向这个地址的引用变量**）
- **保存和复制的是值本身**
- 使用typeof检测数据的类型
- 基本类型数据是值类型

引用类型（object、array、function）

- 占用空间不固定，保存在**堆**中（当在程序中创建一个对象时，对象将被保存到运行时数据区中，以便反复利用，这个运行时数据区就是堆内存。堆内存中的对象不会随方法的结束而销毁，即使方法结束后，这个对象还可能被另一个引用变量引用，则这个对象依然不会被销毁，只有当一个对象没有任何引用变量引用时，系统的垃圾回收机制才会回收它）
- **保存与复制的是指向对象的一个指针**
- 使用instanceof检测数据类型
- 使用new()方法构造出的对象是引用型

### 纯函数

对于一个函数，给定一个输入，返回一个唯一的输出。除此之外，不会对外部环境产生任何附带影响，称为纯函数。所有函数内部定义的变量在函数返回之后都被垃圾回收掉。

如果函数的输入是对象(Array、Function、Object)，虽然还是按值传递，但对于对象来说，应该说是**按共享传递**比较合适。实际传递的是该对象的副本，因此修改了该副本中某个值，还是会影响到对象本身。但如果对该对象直接替换，会导致找不到原值，而不会修改原值。

e.g.

```js
// 非纯函数
function changeAgelmpure(person) {
    person.age = 25;
    return person;
}
var reyshieh = {
    name: 'reyshieh',
    age: 26
};
var changedRey = changeAgelmpure(reyshieh);
console.log(reyshieh); // {name: 'reyshieh', age: 25}
console.log(changedRey); // {name: 'reyshieh', age: 25}

// 纯函数
function changeAgeImpure(person) {
    var newPersonObj = JSON.parse(JSON.stringify(person));
    newPersonObj.age = 25;
    return newPersonObj;
}
var reyshieh = {
    name: 'reyshieh',
    age: 26
};
var changedRey = changeAgelmpure(reyshieh);
console.log(reyshieh); // {name: 'reyshieh', age: 26}
console.log(changedRey); // {name: 'reyshieh', age: 25}
```

```js
function changeAgeAndReference(person) {
    person.age = 25; // 此时还没有修改对象本身，修改属性后，影响原来的对象
    person = {
        name: 'John',
        age: 50
    }; // 修改了对象本身，不再具有引用关系
    
    return person;
}
var personObj1 = {
    name: 'Alex',
    age: 30
};
var personObj2 = changeAgeAndReference(personObj1);
console.log(personObj1); // -> ? {name: "Alex", age: 25}
console.log(personObj2); // -> ? {name: "John", age: 50}
```

## 强转换

### 隐式转换为布尔："truthy"和"falsy"

当转换布尔值时，任何值都可以被使用。以下这些值会被转换为false：

- undefined，null
- Boolean：false
- Number：-0，+0，NaN
- String：''

所有其他值都会认为是true

被转换成'false'的值称为falsy；被转换成'true'的值称为truthy

### 典型运算符操作结果

```js
// 比较
[] == ![] // true 左边取toString取到空字符串再转数字得到0，右边被!强制转为boolean得到false再转数字
NaN !== NaN // true
false == []; // true boolean转数字，数组取toString得到空字符串再转数字
false == {}; // false boolean转数字，对象取valueOf得到空对象"[object Object]"
"" == []; // true 字符串转数字，数组取toString得到空字符串再转数字
"" == {}; // false 字符串转数字，对象取valueOf得到空对象"[object Object]"
"" == [null]; // true 数组取toString得到空字符串，转数字后得到0
0 == '\n'; // true '\n'即为''，转数字后得到0
0 == []; // true
0 == {}; // false
1 == true // true
2 == true // false
"2" == true // flase

null == false; // false，null和undefined比较为true，null和1或0比较都为false
null == true; // false
null == undefined; // true
null > 0 // false
null < 0 // false
null == 0 // false
null >= 0 // true

// 加法
true + 1 // 1
undefined + 1 // NaN

let obj = {};

{} + 1 // 1，这里的 {} 被当成了代码块
{ 1 + 1 } + 1 // 1

obj + 1 // [object Object]1
{} + {} // Chrome 上显示 "[object Object][object Object]"，Firefox 显示 NaN

[] + {} // [object Object] []转为空字符串，{}转为字符串'[object Object]'
[] + a // [object Object]
+ [] // 等价于 + "" => 0
{} + [] // 0 {}被当成空而无作用，+[]被强制转型为数字
a + [] // [object Object]

[2,3] + [1,2] // '2,31,2'
[2] + 1 // '21'
[2] + (-1) // "2-1"

// 减法或其他操作，无法进行字符串连接，因此在错误的字符串格式下返回 NaN
[2] - 1 // 1
[2,3] - 1 // NaN
{} - 1 // -1
```

### JSON的字符串化

JSON.stringify将值序列化为JSON字符串，和ToString有关，但并不等于强制转型

- 若为简单值，字符串、数字、boolean、null，规则和ToString相同
- 若字符串中有非法值undefined、function、symbol、具有循环的对象，JSON.stringify会自动忽略这些非法值或抛出异常。若某个元素的值为非法值，则会自动转为null；若其中的一个属性为非法值(如function)，会排除这个属性
- 若待转换的对象中带有**toJSON方法**，会优先调用该方法，并将该方法返回的值作为序列化的结果

```js
JSON.stringify(undefined) // undefined，忽略非法值
JSON.stringify(function() {}) // undefined，忽略非法值
JSON.stringify(Symbol()) // undefined，忽略非法值
JSON.stringify([1, 2, 3, undefined]) // "[1,2,3,null]"，非法值以 null 取代
JSON.stringify({ a: 2, b: function() {}}) // "{"a":2}"，忽略非法屬性
```

```js
// 循环错误
const a = { someProperty: 'Jack' };
const b = { anotherProperty: a };
a.b = b;
JSON.stringify(a) // Uncaught TypeError: Converting circular structure to JSON
JSON.stringify(b) // Uncaught TypeError: Converting circular structure to JSON
```

toJSON e.g.

```js
const someObj = {
  a: 2,
  b: function() {}, // 非法!
  toJSON: function() {
    return {
      a: 3, // 序列化過程只包含 a 屬性
    }
  },
}

JSON.stringify(someObj); // "{"a":3}"
```

用toJSON解决循环错误

```js
const a = {
    someProperty: 'Jack',
    toJSON: function() {
        return {
            prompt: 'Hello World'
        }
    },
};

const b = {
    anotherProperty: a,
    toJSON: function() {
        return {
            prompt: 'Hello World'
        }
    },
};

a.b = b;

// 序列化成功！不會被報錯了！
JSON.stringify(a) // "{"prompt":"Hello World"}"
JSON.stringify(b) // "{"prompt":"Hello World"}"
```

JSON.stringify可传入第二个选择性参数(取代器)来过滤需要序列化的属性

- 取代器是数组时，数组内的元素为指定要包含的属性名称。

  ```js
  // e.g.
  const someObj = {
      a: 2,
      b: function() {},
  }
  
  JSON.stringify(someObj, ['a']); // "{"a": 2}"
  ```

- 取代器是函数时，函数是用来返回需要做序列化的属性的值。

  ```js
  const someObj = {
    a: 2,
    b: function() {},
  }
  
  JSON.stringify(someObj, function(key, value) {
    if (key !== 'b') {
      return value
    }
  });
  
  // "{"a":2}"
  ```

### ToNumber

规则

- undefined -> NaN

- null -> +0 即0

- boolean true -> 1 false -> +0 即0

- string -> NaN

- **object**，尤其重要

  - **若有定义valueOf方法，优先使用valueOf取基本类型值**
  - **若没有valueOF方法，则改用toString方法取得基本类型值，再用ToNumber转为数字**
  - **Object.create(null)建立的null没有valueOf或toString方法**

  ```js
  const a = {
    name: 'Apple',
    valueOf: function() {
      return '999'
    }
  }
  
  Number(a) // 999
  ```

### 类型转换技巧

- 使用一元正/负运算符转换

  ```js
  +('123') // 123
  -('-123') // 123
  
  // 用该方式将日期转换为时间戳，等价于Date.now()或.getTime()
  const timestamp = +new Date();
  timestamp // 1539236301262
  ```

- 使用一元位元否定运算符(bitwise not, ~)

  该运算符用来进行二进制的补码运算(~x => -(x+1), 如 ~42 => -43)

  ```js
  const str = 'Hello World';
  
  function find(target) {
    const result = str.indexOf(target);
  
    if (~result) {
      console.log(`找到了，索引值原本是 ${result}，被轉為 ${~result}`);
    } else {
      console.log(`找不到，回傳結果原本是 ${result}，被轉為 ${~result}`);
    }
  }
  
  find('llo'); // 找到了，索引值原本是 2，被轉為 -3
  find('abc') // 找不到，回傳結果原本是 -1，被轉為 0
  ```

- 使用~~将浮点数转为整数

  其运算方式与运行两次~操作，同时截断小数的结果，类似!!的真假判断两次

  使用**x | 0也可以得到与~~的结果相同**，区别在于 ~~运算符的优先级更高，遇到四则运算时不用包括号

  它与**Math.floor()运算的结果不同**

  ```js
  Math.floor(-29.8) // -30
  ~~-29.8 // -29
  -29.8 | 0 // -29
  ```

### 关系比较

规则

1. 若一个是null，另一个是undefined，返回true
2. 若一个是null，另一个是非undefined和null，返回false

3. 若两个运算符都是字符串，直接依照字母顺序比较

4. 除了1，2，3点之外的状况，遵循以下

- **先使用ToPrimitive做强制转型-先使用valueOf取得值，再用toString方法转为字符串**
- **若有任一值转型后的结果不是字符串，就是用ToNumber的规则转为数字，来做数字上的比较**

e.g.

```js
const a = [12];
const b = ['13'];

a < b // true, '12' < '13'
a > b // false
```

下例比较有意思

```js
const a = { b: 12 };
const b = { b: 13 };

a < b // false, '[object Object]' < '[object Object]'
a > b // false，其实是比较b < a， '[object Object]' < '[object Object]'
a == b // false，其实是比较两实例的引用

// 以下两个难以理解
a >= b // true，其实是!(b > a)，因此!false得到true
a <= b // true
```

### ==、===、Object.is比较

| x                   | y                   | `==`    | `===`   | `Object.is` |
| ------------------- | ------------------- | ------- | ------- | ----------- |
| `undefined`         | `undefined`         | `true`  | `true`  | `true`      |
| `null`              | `null`              | `true`  | `true`  | `true`      |
| `true`              | `true`              | `true`  | `true`  | `true`      |
| `false`             | `false`             | `true`  | `true`  | `true`      |
| `"foo"`             | `"foo"`             | `true`  | `true`  | `true`      |
| `{ foo: "bar" }`    | `x`                 | `true`  | `true`  | `true`      |
| `0`                 | `0`                 | `true`  | `true`  | `true`      |
| `+0`                | `-0`                | `true`  | `true`  | `false`     |
| `0`                 | `false`             | `true`  | `false` | `false`     |
| `""`                | `false`             | `true`  | `false` | `false`     |
| `""`                | `0`                 | `true`  | `false` | `false`     |
| `"0"`               | `0`                 | `true`  | `false` | `false`     |
| `"17"`              | `17`                | `true`  | `false` | `false`     |
| `[1,2]`             | `"1,2"`             | `true`  | `false` | `false`     |
| `new String("foo")` | `"foo"`             | `true`  | `false` | `false`     |
| `null`              | `undefined`         | `true`  | `false` | `false`     |
| `null`              | `false`             | `false` | `false` | `false`     |
| `undefined`         | `false`             | `false` | `false` | `false`     |
| `{ foo: "bar" }`    | `{ foo: "bar" }`    | `false` | `false` | `false`     |
| `new String("foo")` | `new String("foo")` | `false` | `false` | `false`     |
| `0`                 | `null`              | `false` | `false` | `false`     |
| `0`                 | `NaN`               | `false` | `false` | `false`     |
| `"foo"`             | `NaN`               | `false` | `false` | `false`     |
| `NaN`               | `NaN`               | `false` | `false` | `true`      |

## typeof

返回一个字符串，来表示数据的类型

| 数据类型                             | Type                     |
| ------------------------------------ | ------------------------ |
| Undefined                            | "undefined"              |
| Null                                 | "object"                 |
| 布尔值                               | "boolean"                |
| 数值                                 | "number"                 |
| 字符串                               | "string"                 |
| Symbol                               | "symbol"                 |
| 宿主对象（JS环境提供的，比如浏览器） | Implementation-dependent |
| 函数对象                             | "function"               |
| 任何其他对象                         | "object"                 |

来几个e.g.

```js
// 例1
var y = 1, x = y = typeof x;
x;//"undefined"
// 表达式是从右往左的，x由于变量提升，类型不是null，而是undefined，所以x=y=”undefined”

// 例2
(function f(f){
  return typeof f();//"number"
})(function(){ return 1; });
// 传入的参数为f也就是function(){ return 1; }这个函数。通过f()执行后，得到结果1，所以typeof 1返回”number”

// 例3
var foo = {
  bar: function() { return this.baz; },
  baz: 1
};
(function(){
  return typeof arguments[0]();//"undefined"
})(foo.bar);
// this永远指向函数执行时的上下文，而不是定义时的（ES6的箭头函数不算）。当arguments执行时，this已经指向了window对象。所以是”undefined”

// 例4
var foo = {
  bar: function(){ return this.baz; },
  baz: 1
}
typeof (f = foo.bar)();//undefined
// 同样是this的指向问题

// 例5
var f = (function f(){ return "1"; }, function g(){ return 2; })();
typeof f;//"number"
// 分组选择符，举例
// var a = (1,2,3);
// document.write(a);//3,会以最后一个为准
// 因此上例实际是返回第二个函数

// 例6
var x = 1;
if (function f(){}) {
  x += typeof f;
}
x;//"1undefined"
// 这是一个javascript语言规范上的问题，在条件判断中加入函数声明。这个声明语句本身没有错，也会返回true，但是javascript引擎在搜索的时候却找不到该函数。所以结果为”1undefined”

// 例7
(function(foo){
  return typeof foo.bar;
})({ foo: { bar: 1 } }); // "undefined"
// 形参的foo指向的是{ foo: { bar: 1 } }这个整体
```

typeof在两种情况下会返回"undefined"

- 变量没有被声明
- 变量的值是`undefined`

e.g.

```js
typeof undeclareVariable === "undefined" // true

var declareVariable;
typeof declareVariable // 'undefined'

typeof undefined // 'undefined'
```

但如果在一个未声明的变量上，直接判断当前值是否是undefined，就会抛出异常，因为只有`typeof`才可以正常检测未声明的变量的同时还不报错

e.g.

```js
undeclareVariable === undefined
// ReferenceError: undeclareVariable is not defined
```

未初始化的变量，没有被传入参数的形参，不存在的属性，都不会出现上面的问题，因为它们总是可访问的，值总是`undefined`

```js
var declaredVariable;
declaredVariable === undefined; // true

(function (x) { return x === undefined }())
// true

({}).foo === undefined
// true
```

可以使用Object.prototype.toString来判断类型，判断的结果是准确的

```js
Object.prototype.toString.call(1) // "[object Number]"

Object.prototype.toString.call('hi') // "[object String]"

Object.prototype.toString.call({a:'hi'}) // "[object Object]"

Object.prototype.toString.call([1,'a']) // "[object Array]"

Object.prototype.toString.call(true) // "[object Boolean]"

Object.prototype.toString.call(() => {}) // "[object Function]"

Object.prototype.toString.call(null) // "[object Null]"

Object.prototype.toString.call(undefined) // "[object Undefined]"

Object.prototype.toString.call(Symbol(1)) // "[object Symbol]"
```

## instanceof

伪代码

```js
function new_instance_of(leftValue, rightValue) {
    let rightProto = rightValue.prototype; // 取右表达式的prototype值
    leftValue = leftValue.__proto__;
    
    while (true) {
		if (leftValue === null) {
            return false;
		}
		if (leftValue === rightValue) {
            return true;
		}
		leftValue = leftValue.__proto__;
	}
}
```

实际上，instanceof的主要实现原理就是对__ proto __ 和prototype的理解，下面有对这两个做分析

### __ proto __和prototype

-  方法(Function)是对象，方法的原型(Function.prototype)是对象。因此无论是方法还是方法的原型，都具有对象共有的特征
- 对象在创建实例后，实例需要和对象构造函数原型产生引用，他们之间是通过__ proto __隐式指向的，这样实例就能够访问在构造函数原型中定义的属性和方法
- 原型对象也有一个属性，constructor，这个属性包含一个指针，指回原构造函数

引用一张关系图（经典图，引自网络）

![prototype-and-proto](http://www.reyshieh.com/assets/prototype-and-proto.png)

解释：

1. 构造函数Foo() -- 构造函数的原型属性Foo.prototype指向了原型对象，在原型对象里共有的方法，所有构造函数声明的实例(如f1，f2)都可以共享方法

2. 原型对象Foo.prototype — 保存着实例共享的方法，有一个指针constructor指回构造函数

3. 实例 — f1和f2是Foo对象的两个实例，这两个对象也有属性__ proto __，指向构造函数的原型对象，这样就可以像1中所述访问原型对象的所有方法

4. 构造函数Foo()除了是方法，还是对象，也同样有__ proto __属性，会指向它的构造函数的原型对象，也就是Function。

   因此，__ proto __ 指向了Function.prototype

5. 逐级往上指向，再指向Object.prototype，最后Object.prototype的 __ proto __ 属性指向null

由该图，可以推断出

```js
Object instanceof Object // true，由图可知，Object的prototype属性是Object.prototype，而由于Object本身是一个函数，由Function所创建，所以Object.__proto__的值是Function.prototype，而Function.prototype的__proto__属性是Object.prototype，所以可以判断出为true
Function instanceof Function // true
Function instanceof Object // true，由图可知，Foo函数的prototype属性时Foo.prototype，而Foo的__proto__属性是Function.prototype，而Function.prototype的__proto__属性并没有指向Foo.prototype，因此可以判断出为false
Foo instanceof Foo // false
Foo instanceof Object // true
Foo instanceof Function // true
```

最后总结：

- 实例有属性__ proto __，指向该实例对应对象的构造函数的原型

- 对象有属性__ proto __，还有属性prototype，prototype指向该对象的原型对象

  __ proto __指向对象构造函数的构造函数的原型

## this、this(箭头函数)、call、apply、bind

### this

永远指向最后调用它的那个对象，或理解为***运行时***所在的对象

### this(箭头函数)

总是指向***定义时***所在的对象(**针对于普通对象的理解**)，或理解为指向**所在函数**运行时的this(**针对于函数的解释，函数只有运行后，箭头函数才能按照定义生成this指向**)。有这么一句话："箭头函数没有this绑定，必须通过查找作用域链来决定其值，如果箭头函数被非箭头函数包含，则this绑定的是最后一层非箭头函数的this，否则，this为undefined"。

### call

改变this的指向

```js
fun.call(thisArg[, arg1[, arg2[, ...]]])
```

### apply

改变this的指向

```js
fun.apply(thisArg, [argsArray])
```

### bind

改变this的指向，创建一个新的函数，但需要手动去调用

e.g.

```js
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
// 输出如下：
//    real {a: 100}
//    js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//    js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//    js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//    es6 {a: 100}
//    es6 {a: 100}
//    es6 {a: 100}
fn()
// 输出如下：
//	real Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//	js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//	js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//	js Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//	es6 Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//	es6 Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
//	es6 Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
// 因为 fn函数只有运行后，箭头函数才会按照定义生成this指向，因此此时箭头函数定义时的所在对象恰好是fn运行时所在的对象。
// 上例中的两个输出，第一个输出，因为fn运行时所指向的对象是{a: 100},因此箭头函数的定义时指向也为{a: 100};第二个输出，因为fn运行时所指向的对象是window，因此箭头函数的定义时指向也为window

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

// 输出：
// id: 1
// id: 1
// id: 1
// 原因很简单 因为f在运行时已经确定了此时的箭头函数的定义时指向，接下来的运行时的变化将不会影响this的指向

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

// demo4
var name = "windowsName";

var a = {
    name : "Cherry",

    func1: function () {
        console.log(this.name)     
    },

    func2: function () {
        setTimeout( () => {
            this.func1()
        },100);
    }

};

a.func2()     // Cherry
var b = func2;
b(); // Uncaught TypeError: this.func1 is not a function
```

## 闭包

闭包是能读取其他函数内部变量的函数

闭包的用处：

- 可以读取函数内部的变量
- 让变量的值始终在内存中

```js
function init() {
    var name = 'Mozilla'; // name 是一个被init创建的局部变量
    function displayName() { // displayName()是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

e.g.

```js
var name = "The Window";

var object = {
    name : "My Object",
    getNameFunc : function(){
        return function(){
            return this.name;
        };
    }
};

alert(object.getNameFunc()());
// getNameFunc方法返回的函数是挂在window上的，所以this指向window，弹出框显示The Window
```

```js
var name = "The Window";

var object = {
    name : "My Object",
    getNameFunc : function(){
        var that = this;
        return function(){
    		return that.name;
    	};
	}
};

alert(object.getNameFunc()());
//  因为this指针用内部的代替了，所以返回的是My Object
```

```js
var makeCounter = function() {
    var privateCounter = 0;
    function changeBy(val) {
        privateCounter += val;
    }
    return {
        increment: function() {
            changeBy(1);
        },
        decrement: function() {
            changeBy(-1);
        },
        value: function() {
            return privateCounter;
        }
    }
};

var Counter1 = makeCounter();
var Counter2 = makeCounter();
console.log(Counter1.value()); // 0
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); // 2
console.log(Coutner2.value()); // 0
```

上例可以看出两个不同的计数器，是相互独立的。每个闭包都是引用自己的词法作用域内的变量privateCounter

## 作用域

> 作用域是程序源代码中定义变量的区域，是用于确定在何处以及如何查找变量(标识符)的规则
>
> 作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限
>
> ECMAScript 6之前只有**全局作用域**和**函数作用域**

### 静态作用域(词法作用域)

函数的作用域在函数定义的时候就决定了。

```js
function fn1(x) {
    var y = x + 4;
    function f2(z) {
        console.log(x, y, z);
    }
    fn2(y * 5);
}
fn1(6); // 6 10 50
```

词法作用域在书写代码时函数声明的位置就决定了。编译阶段已经能够知道全部标识符在哪里以及是如何声明的，所以词法作用域是静态的作用域，也就是词法作用域能够预测在执行代码的过程中如何查找标识符

### 动态作用域

函数的作用域在函数调用的时候才决定

## 函数式编程

借助数组的map方法，可以很方便的实现数组的函数式

```js
const nextCharForNumStr = (str) => [str]
	.map(s => s.trim())
	.map(s => parseInt(s))
	.map(i => i + 1)
	.map(i => String.fromCharCode(i))

nextCharForNumStr(' 64 ') // ['A']
```

这里的技巧在于，可以将需要变换的字符串，放在数组中，将对字符串的操作拆解成多个小步骤

根据上面的思路，可以创建一个新的类型，在类型中定义map方法，实现和数组map相似的功能

```js
const Box = (x) => ({
    map: f => Box(f(x)),		// 返回容器为了链式调用
    fold: f => f(x),			// 将元素从容器中取出
    inspect: () => `Box(${x})`	// 看容器里有什么内容
});

const nextCharForNumStr = (str) => Box(str)
	.map(s => s.trim())
	.map(i => parseInt(i))
	.map(i => i + 1)
	.map(i => String.fromCharCode(i))
	.fold(c => c.toLowerCase());
	
nextCharForNumStr(' 64 '); // a
```

https://github.com/BuptStEve/blog/issues/15

## JS表达式(expressions)与语句(statements)

**一个表达式返回一个值**，可以在任何需要值的地方使用表达式，也就是，会在我们使用它的地方期望得到一个值。举例如调用function中的参数(arguments)，或者声明=的右边都属于expressions的位置

下面的每一行都是一个expression

```js
myvar
100 + x
fn("a", "b")
```

可以粗略的将一个语句描述为**一个行为**，循环结构和if语句就是语句的例子。程序基本上是一系列语句的结合(**基础声明除外**)，如在MDN中定义的if语句

```js
if (condition)
	statement1
[else
	statement2]
```

当JavaScript需要编写一条语句时，均可以写入一个表达式，这样的语句称为**表达式语句**，例如在`statement1`的地方写入一个`function`，这个function就称为`expression statement`，属于特殊的statement，这个function自然可以return一个值，同时也可以在内部产生一些`side effect`，不过如果我们重点放在`side effect`部分时，通常会返回`undefined`。

```js
function say() {
    console.log('hello');
}

say();

// undefined
// hello
```

> 通常一个statement是独立的，只会完成某项任务，不过如果它影响了整个程序，例如：改变了内部的状态，或者影响后面的statement，这些造成的改变就称为side effect(副作用)

但不能编写一条语句来代替表达式。如，if语句不能成为函数的参数

总结下关系:

- syntax
  - statements
    - expression statements
  - expressions

有些语句和表达式之间是有相似的功能的。

### if条件语句和条件运算符(三元运算符)

e.g.

```js
// if语句和条件运算符
var x;
if (y >= 0) {
    x = y;
} else {
    x = -y;
}
// 条件运算符
var x = (y >= 0 ? y : -y);
// 等号和封号之间的代码是一个表达式。括号不是必要的，括号是为了是代码更加清晰易懂
```

### 封号和逗号运算符

封号用来连接不同的语句

```js
foo(); bar();
```

逗号运算符计算两个表达式的值并返回第二个表达式的值

```js
"a", "b" // 输出 'b'

var x = ("a", "b")
x // 输出 'b'

console.log(("a", "b")) // 输出 b
```

存在某些expressions看起来很像是statements。e.g.

### 对象字面量(object literal)和块级作用域(block)

对象字面量，属于expression，用来产生一个对象，e.g.

```js
{
    foo: bar(3, 5)
}
```

> object literal是一个通过`{}`与`,`逗号分隔的键值对列表，如`var o = {name: 'Object'}`写法

同时，上述代码是一个合法的语句，它具备：

- 代码块：花括号中的一系列语句
- 标签：在任意语句前添加标签，这里的标签是foo
- 语句：表达式语句bar(3, 5)

{}可用于定义作用域或对象字面量

e.g.

```js
1 + 'string' // '1string'
1 + undefined // NaN
1 + null // 1
1 + [2, 3,] // '12, 3'
1 + {name: 'reyshieh'} // '1[object Object]'
// 通过上面的示例，得知，除了undefined和null，基本上js会把对象先"toString()"再相加

[].toString() // ''
[1, 2, 3].toString() // '1, 2, 3'
var o = {};
o.toString(); // '[object Object]'

[] + {} // [object Object]

{} + [] // 0
```

这两个语句返回结果不一样。第二个语句的加号左边相当于一个代码块({})，后面加上一个[]，所以返回0

Javascript允许一个块级作用域既不充当循环也不充当if语句的一部分而独立存在。e.g.

```js
// 该例可以通过标签命名块级作用域，并在合适的时机跳出这个作用域，返回到上层作用域中
function test(printTwo) {
    priting: {
        console.log("One");
        if (!printTwo) break printing;
        console.log("Two");
    }
    console.log("Three");
}

test(false);
// 输出：
// One
// Three
test(true);
// 输出：
// One
// Two
// Three
```

从上面验证了`{}`语法如果遇到statements的位置，就会被当做statements，如果在expressions的位置就会被当成一个值

### 函数表达式(function expression)和函数声明(function声明)

下面是一个`function expression`

```js
function() {}
```

可以在这个表达式上加一个名字，将它变成命名后的函数表达式

```js
function foo() {}
```

命名后的函数表达式和函数声明仅从语句上是无法区分的(放在`=`右边是expression)，但效果截然不同

- 函数表达式产生一个值(函数)
- 函数声明是一个动作：创建一个变量，其值是函数

如果需要立即调用函数，必须使用函数表达式，不能使用函数声明

```js
(function() {})();
(function foo())();
```

### 使用对象字面量和函数表达式作为语句

因为有些表达式和语句无法区分开，意味着相同的代码由于上下文环境不同，作用也是不同的。

为了避免歧义，JavaScript语法**禁止表达式语句以大括号和关键字function开始**

换句话说，就是在JavaScript认定为statement的位置，使用了expression会变成expression statement。**这并不是expression，所以产生了一些特殊的{}会被当做block解释，function开头的语法会被当做函数声明**

如果想写一个以这两个标记中的任何一个开始的表达式语句，应该把它**放在括号里面**，它不会改变它的结果，但确保它出现在只有表达式的上下文中。

e.g.

```js
// eval 
// 在语句上下文中解析它所受到的参数。如果想让eval返回一个对象，则必须在对象字面量周围加上括号
eval("{foo: 123}") // 123
eval("({foo: 123})") // {foo: 123}
```

```js
// 自执行函数(IIFEs)
(function () {return "abc"}()) // 'abc'

// 如果省略括号，则会出现语法错误(函数声明不能声明匿名函数)
function() {return "abc"}() // SyntaxError

// 即使添加了名字也会返回语法错误(函数声明不能被立即调用)
function foo() {return "abc"}() // SyntaxError
```

另外，还有一种方式可以保证表达式在表达式上下文中被解析的方法，即在函数声明之前添加一个一元运算符(如+或!)，但是与括号不同的是，这些符号会改变输出的表示形式:

```js
+function() {console.log("hello")}() 
// 输出：
// hello
// NaN
// NaN出现正式由于+号运算undefined的结果，也可以使用void运算符：
void function() {console.log("hello")}()
// 输出：
// hello
// undefined
```

#### 连接多个IIFEs

要使用封号

```js
(function() {}())
(function() {}())
// TypeError: undefined is not a function
// 错误原因是JavaScript认为第二行是尝试将第一行的结果作为函数调用
// 解决方法是：
(function() {}());
(function() {}())
// OK
// 还可以使用一元运算符的操作符，可以省略封号，因为执行会自动添加封号
void function (){}()
void function (){}()
// OK
```

另外，关于JavaScript自动补上封号有几个建议

1. 在return，break，continue，++，—五中statement中，`换行字符`可完全等于`;`
2. var，if，do while，for，continue，break，return，with，switch，throw，try，debugger关键字开头，以及空的statement，上一行会自动补上封号
3. 遇到expression statement和function expression情况非常复杂，后面请务必要加上封号
4. 凡`(`和`{`开头的statements前面或上一句不加非常危险

总结：

- expressions: 会产生一个值，其意义就是代表一个值的表达式，例如`x+y`
- statements: 完成某项任务的操作。赋值，条件判断，声明都算是statements，如`if (condition) {console.log('WoW')}`
- expression statements: 属于一种statement，其产生一个值（或回传一个值），并完成某项任务。例如：x += 1或在statement执行一个side effect的函数调用
- 在statements位置放入expressions要小心（即expression statement），因为JavaScript对于expression和expression statement解释行为是不一样的
- 下面两种语法对于其位置尤其需要注意
  - function
    - statement位置：当作函数声明，即创建一个值为function的变量，不能立即调用（除了加()）
    - expression位置：为function expression产生一个为function的值，可以被立即调用(IIFE)
  - {}
    - statement位置：block，一个程序块，如for，label块。不能作为对象（除了加()）
    - expression位置：对象实体，建一个值，对象

引自:

https://segmentfault.com/a/1190000004565693

http://2ality.com/2012/09/expressions-vs-statements.html

## 变量提升

JavaScript中，函数及变量的声明都将被提升到函数的最顶部

JavaScript中，变量可以在使用后声明，也就是变量可以先使用再声明

> 注意：JavaScript初始化不会被提升
>
> JavaScript只有声明的变量会提升，初始化不会
>
> e.g.
>
> ```js
> var x = 5; // 初始化x
> var y = 7; // 初始化y
> elem = document.getElementById("demo");
> elem.innerHTML = x + " " + y; // 5 7
> ```
>
> ```js
> var x = 5; // 初始化 x
> 
> elem = document.getElementById("demo"); // 查找元素 
> elem.innerHTML = x + " " + y;           // 5 undefined
> 
> var y = 7; // 初始化 y，因为是初始化，不会被提升，导致上面的y是一个未定义的变量
> ```

**在严格模式(strict mode)下，不允许使用未声明的变量**

变量提升只对var命令声明的变量有效，如果一个变量不是用var命令声明的，就不会发生变量提升

```js
console.log(b);
b = 1;
// ReferenceError: b is not defined
```

**ES6引入块级作用域，块级作用域中使用let声明的变量同样会提升，只不过不允许在实际声明语句前使用**

函数提升同样会将声明提升至作用域头部，不过不同于变量提升，函数同样会将函数体定义提升至头部

```js
function b() {
    a = 10;
    return;
    function a() {}
}
// 编译器修改
function b() {
    function a() {}
    a = 10;
    return;
}
```

在创建创建步骤中，JavaScript解释器会通过function关键字识别出函数声明并且将其提升至头部；函数的生命周期会将声明、初始化、赋值三个步骤都提升到作用域头部

### JavaScript的解析机制

遇到script标签，js就进行预解析，将变量var和function声明提升，但不会执行function，然后进入上下文执行，上下文执行还是执行预解析同样操作，直到没有var和function，再开始执行上下文

在JavaScript中，所有绑定的声明会在控制流到达它们出现的作用域时被初始化，这里的作用域就是`执行上下文(Execution Context)`，每个执行上下文分为`内存分配(Memory Creation Phase)`与`执行(Execution)`两个阶段。

在内存分配阶段会进行变量创建，即开始进入了`变量的生命周期`；变量的生命周期包含`声明(Declaration phase)`、`初始化(Initialization phase)`、`赋值(Assignment phase)`三个过程。其中声明步骤会在作用域中注册变量，初始化步骤负责为变量分配内存并且创建作用域绑定。此时变量被初始化为undefined

ES6中的let与const关键字声明的变量会在作用域头部被初始化，不过这些变量仅允许在实际声明之后使用。在作用域头部与变量实际声明处之间的区域称为`暂时死域(Temporal Dead Zone)`，TDZ能避免传统的提升引起的潜在问题。

e.g.

```js
a = 5;
show();
var a;
function show() {};
```

预解析：

```js
function show() {};
var a;
a = 5;
show();
```

### 函数作用域

存在一个很常见的问题，粒度过大，在使用闭包或者其他特性时导致异常的变量传递，如下

```js
var callbacks = [];

// 这里的 i 被提升到了当前函数作用域头部
for (var i = 0; i <= 2; i++) {
    callbacks[i] = function () {
            return i * 2;
        };
}

console.log(callbacks[0]()); //6
console.log(callbacks[1]()); //6
console.log(callbacks[2]()); //6
// 因为函数作用域内的i是全局作用域中的，此时i已经被污染了，变成了3
```

### 块级作用域

类似于if、switch条件选择或者for、while这样的循环体即是所谓的块级作用域。在ES5中，要实现块级作用域，即需要在原来的函数作用域上包裹一层，即在需要限制变量提升的地方手动设置一个变量来替代原来的全局变量

```js
var callbacks = [];
for (var i = 0; i <= 2; i++) {
    (function (i) {
        // 这里的 i 仅归属于该函数作用域
        callbacks[i] = function () {
            return i * 2;
        };
    })(i);
}
callbacks[0]() === 0;
callbacks[1]() === 2;
callbacks[2]() === 4;
```

在ES6中，可以直接利用`let`关键字达成

```js
let callbacks = []
for (let i = 0; i <= 2; i++) {
    // 这里的 i 属于当前块作用域
    callbacks[i] = function () {
        return i * 2
    }
}
callbacks[0]() === 0
callbacks[1]() === 2
callbacks[2]() === 4
```

### 函数表达式

使用函数表达式的方式不存在函数提升，因为函数名称使用变量表示的，只存在变量提升。即函数表达式也会先声明函数名，然后赋值匿名函数给它

e.g.

例1

```js
var getName=function(){
  console.log(2);
}

function getName(){
  console.log(1);
}

getName(); // ?
```

按照正常思维，可能会认为返回的是1。但实际上，getName是变量，变量的声明将提升到顶部，而变量的赋值依然保留在原来的位置。注意，函数优先，虽然函数声明和变量声明都会提升，但是函数会首先被提升，然后才是变量，提升后为

```js
//函数、变量声明提升后
function getName(){    //函数声明提升到顶部
  console.log(1);
}

var getName;    //变量声明提升
getName = function(){    //变量赋值依然保留在原来的位置
  console.log(2);
}

getName(); // 最终输出：2
```

例2

```js
sayHello();

function sayHello () {
    function hello () {
        console.log('Hello!');
    }

    hello();

    var hello = function () {
        console.log('Hey!');
    }
}

// Hello!
```

例3

```js
sayHello();

function sayHello () {
    hello();

    var hello = function () {
        console.log('Hey!');
    }
}

// VM3376:5 Uncaught TypeError: hello is not a function
```

### 函数声明

相同命名的函数，后者将会覆盖前者

```js
say();
function say() {
    function hello() {
        console.log('Hello!');
    }
    hello();
    function hello() {
        console.log('Hey!');
    }
}
// Hey!
```

### 避免使用全局变量

- 函数自执行

  解决避免全局变量，可以用自执行创建一个新的作用域，这样变量就不会相互污染

  ```js
  (function(win) {
      var doc = win.document;
      // ...
  }(window));
  ```

- 模块化

### 作用域中的名称

在JavaScript中，作用域中的名称有以下四种

1. 语言自身定义：所有的作用域默认都会包含this和arguments
2. 函数形参：函数有名字的形参会进入到函数体的作用域中
3. 函数声明：通过function foo() {}的形式
4. 变量声明：通过var foo的形式

名称解析顺序就是按照以上排序进行。

## Promise

promise是代表了异步操作最终完成或者失败的对象

- 一个promise可能有三种状态：等待(pending)、已完成(fulfilled)、已拒绝(rejected)
- 一个promise的状态只能从"等待"转到"完成"态或者"拒绝"态，不能逆向转换，同时"完成"态和"拒绝"态不能相互转换
- promise必须实现then方法

## 立即执行函数，模块化，命名空间

### 立即执行函数(IIFE)

e.g.

例1

```js
(function(window, undefined) {
    // ...
}(window))
// or
(function(window, undefined) {
    // ...
})(window)
```

前面讲解了expressions和statements，如果是函数声明，此时代表的是statements，expression statements是不允许以`function`或者`{`开头的，解析时会抛异常，所以函数声明的立即执行函数是必须加上括号的。但如果函数变量赋值，就不需要加括号，因为此时是expression

```js
var a = function(a) {return a;}(1);
a // 1
```

除了括号以外，还可以使用二元运算符开头达到同样效果，如在函数声明前增加`~`、`+`

```js
~function() {
    // 代码
}();
// or
+function() {
    // 代码
}();
```

在例1中，观察细致的朋友应该会发现，传入的参数多了一个`undefined`，这是为啥？

> 因为在IIFE执行时，实参只有一个，形参有两个，自然undefined会被赋值为undefined
>
> 为了防止特殊值undefined被恶意代码篡改：低版本浏览器，undefined是支持被修改的，因此
>
> ```js
> if (wall === undefined) {
>     // ...
> }
> ```
>
> 会得到你不想要的答案
>
> 多增加一个形参，目的就是为了防止恶意修改。只要在这个IIFE作用域内，undefined就能正常获取
>
> 其次，如果将undefined作为形参，压缩工具就可以对这些定义进行压缩，减小文件体积

#### 放大模式

在作用域内对传入的形参进行判断，如果非空，在原有的对象基础上叠加新功能，再将新对象返回，可以将一个冗长的对象代码段拆分成多个小代码段进行加载，同时可以重复var声明，因为取得最后一个将会是完整的对象

e.g.

```js
var rey = (function(window, REY, undefined) {
    if (typeof REY === 'undefined') REY = {};
    // 绑定方法say
    REY.say = function() {
        console.log('hello');
    };
    return REY;
}(window, rey));
var rey = (function(window, REY, undefined) {
    if (typeof REY === 'undefined') REY = {};
    // 绑定方法whoIam
    Rey.whoIam = function() {
        console.log('rey');
    };
    reutrn REY;
}(window, rey));
// 调用
rey.say();
rey.whoIam();
```

#### 宽放大模式

在实参部分，第二参数为`window.rey || (window.rey = {})`

该模式也同样可以把大文件切分成多个小文件加载，不必考虑文件加载的先后顺序，不存在强耦合关系

e.g.

```js
(function(window, REY, undefined) {
    REY.say = function() {
        console.log('hello');
    };
}(window, window.rey || (window.rey = {})));
(function(window, REY, undefined) {
    REY.whoIam = function() {
        console.log('rey');
    };
}(window, window.rey || (window.rey = {})));
```

#### 分文件加载IIFE要注意

前面讲解expressions和statements时介绍过，如果多个IIFEs连接时，必须要在两个IIFE之间添加`;`，否则在执行的时候，会把第一个IIFE当做函数调用名下一个IIFE的`()`内容当做实参，导致代码报错

解决这个问题，可以在IIFE最前面添加一个`;`，这样就防止了这类事情的发生

e.g.

```js
;(function(window, REY, undefined) {
    REY.say = function(){
        console.log('hello');
    };
}(window, window.rey) || (window.rey = {}));
```

### 模块

#### 立即执行函数+闭包

立即执行函数可以创建作用域，闭包可以读取其他函数的变量。结合两者，可以做一个不受别的作用域影响的函数

e.g.

```js
var module = (function() {
    var privateName = 'inner';
    var privateFunc = function() {
        console.log('私有函数');
    }
    
    return {
        name: privateName,
        sayName: function() {
            console.log(this.name);
        }
    }
}());

module.sayName(); // inner
module.name; // inner
```

## 递归

### 递归调用栈

e.g.

```js
function factorial(n) {
    console.trace() // 该方法可以查看每一次当前的调用栈的状态
    if (n === 0) {
        return 1
    }

    return n * factorial(n - 1)
}

factorial(2)
```

现在观察调用栈。第一次打印

```js
// 调用栈包含了一个factorial函数的调用，这里是factorial(3)
console.trace
factorial @ VM3766:2
(anonymous) @ VM3766:10
```

第二次打印

```js
// 调用栈中出现了两个函数的调用
VM3766:2 console.trace
factorial @ VM3766:2
factorial @ VM3766:7
(anonymous) @ VM3766:10
```

第三次打印

```js
// 调用栈中出现了三个函数的调用
VM3766:2 console.trace
factorial @ VM3766:2
factorial @ VM3766:7
factorial @ VM3766:7
(anonymous) @ VM3766:10
```

可以看出，如果传入的参数特别大，那调用栈将会变得非常大，最终可能超出调用栈的缓存大小而崩溃导致执行失败。解决这个问题，应该使用`尾递归`

### 尾调用

当一个函数执行时的最后一个步骤是返回另一个函数的调用，就是尾调用

函数的调用方式可以是以下几种方式

- 函数调用：func(...)
- 方法调用: Obj.method(...)
- call调用：func.call(...)
- apply调用：func.apply(...)

并且只有以下表达式包含尾调用:

- 条件操作符：? ：

  ```js
  const a = x => x ? f() : g();
  // f() 和 g()都在尾部
  ```

- 逻辑或：||

  ```js
  const a = () => f() || g();
  // g()有可能是尾调用，f()不是
  // 等价
  const a = () => {
      const fResult = f()
      if (fResult) {
          return fResult // 不是尾调用
      } else {
          return g() // 尾调用
      }
  }
  // 只有当f()的结果为falsy时，g()才是尾调用
  ```

- 逻辑与：&&

  ```js
  const a = () => f() && g()
  // g()有可能是尾调用，f()不是
  // 等价
  const a = () => {
      const fResult = f(); // 不是尾调用
      if (fResult) {
          return g(); // 尾调用
      } else {
          return fResult;
      }
  }
  // 只有当f()的结果为truthy时，g()才是尾调用
  ```

- 逗号：,

  ```js
  const a = () => (f(), g())
  // g()是尾调用
  // 等价
  const a = () => {
      f();
      return g();
  }
  ```

### 尾调用优化

函数在调用的时候会在调用栈(call stack)中存有记录，每一条记录叫做一个调用帧(call frame)，每调用一个函数就向栈中push一条记录，函数执行结束后一次向外弹出，直到清空调用栈

**尾调用优化只在严格模式下有效**

尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用记录，只要直接用内层函数的调用记录取代外层函数的调用就可以，调用栈中始终只保持一条调用帧，从而节省很大一部分的内存，这就是尾调用优化的意义

### 尾递归

尾递归是一种递归的写法，可以避免不断的将函数压栈最终导致堆栈溢出。

修改之前的函数

e.g.

```js
function factorial(n, total = 1) {
    console.trace()
    if (n === 0) {
        return total
    }

    return factorial(n - 1, n * total)
}

factorial(2)
```

按照理想情况，上述例子应该不再需要多次对factorial进行压栈处理，因为每一个递归调用都不在依赖于上一个递归调用的值，空间复杂度为o(1)而不是o(n)

但是在chrome中调试，发现第三次压栈后

```js
console.trace
factorial @ VM5050:3
factorial @ VM5050:8
factorial @ VM5050:8
(anonymous) @ VM5050:11
```

不仅仅是`chrome`，`firefox`、`nodejs低版本`的均没有开启尾调用优化

在`safari`里进行了尾调用优化

在Nodejs v6以下，可以通过开启`strict mode`，并使用`--harmony_tailcalls`来开启尾递归优化

node新版本已经移除了--harmony_tailcalls功能

e.g.

```js
'use strict'

function factorial(n, total = 1) {
    console.trace()
    if (n === 0) {
        return total
    }

    return factorial(n - 1, n * total)
}

factorial(3)

// 使用命令
// node --harmony_tailcalls factorial.js
```

调用栈信息永远只有一个在堆栈中

```js
console.trace
factorial @ VM5050:3
```

总结：

- 尾递归不一定会将代码执行速度提高；相反，可能会变慢

- 尾递归可以使用更少的内存，让递归函数更加安全

## 混合对象类

### 构造函数(constructor)

每个原型都有一个constructor属性指向关联的构造函数

```js
function Person() {}
var person = new Person();
person.name = 'reyshieh';
console.log(person.name);
console.log(person.__proto__ === Person.prototype); // true
console.log(Person === Person.prototype.constructor); // true
console.log(person.constructor === Person); // true
```

Person是构造函数，使用new创建一个实例对象person

#### new内部机制

1. 创建新对象，同时继承对象类的原型，即Person.prototype
2. 执行对象类的构造函数，同时该实例的属性和方法被this引用，即this指向新构造的实例
3. 如果构造函数return了一个新的"对象"，这个对象会取代整个new出来的结果。如果构造函数没有return对象，机会返回步骤1创建的对象，即隐式返回this

代码阐述

```js
// let p = new Person('reyshieh')；
let p = (function() {
    let obj = {};
    obj.__proto__ = Person.prototype;
    //其他赋值语句 ...
    return obj;
}());

// new的运行过程
var objectFactory = function() {
    var obj = new Object(), // 从Object.Prototype上克隆一个空的对象
    	Constructor = [].shift.call(arguments); // 取出外部传入的构造器，为Person
    obj.__proto__ = Constructor.prototype; // 指向正确的原型
    var ret = Constructor.apply(obj, arguments); // 借用外部传入的构造器给obj设置属性
    return typeof ret === 'object' ? ret : obj; // 确保构造器总是会返回一个对象
}

var p = obejctFactory(Person, 'reyshieh'); // 该方法会和 new Person('reyshieh')返回一样的对象
```

### 继承多种方式

#### 借用构造函数(经典继承)

```js
function Parent() {
    this.names = ['rey', 'shieh'];
}
function Child() {
    Parent.call(this);
}
var child1 = new Child();
child1.names.push('cain');
console.log(child1.names); // ['rey', 'shieh', 'cain']
var child2 = new Child();
console.log(child2.names); // ['rey', 'shieh']
```

问题：

1. 避免了引用类型的属性被所有实例共享

2. 可以在Child中向Parent传参

   ```js
   function Parent(name) {
   	this.name = name;
   }
   function Child(name) {
       Parent.call(this, name);
   }
   var child1 = new Child('rey');
   console.log(child1.name); // 'rey'
   var child2 = new Child('shieh');
   console.log(child2.name); // 'shieh'
   ```

#### 组合继承(原型链继承+经典继承)

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

优点:融合原型链继承和经典继承的优点，最常用的继承模式

##原型

### 原型继承

> JavaScript给对象提供了一个名为__ proto __ 的隐藏属性，某个对象的 __ proto __属性默认会指向它的构造器的原型对象，即{Constructor}.prototype
>
> var a = new Object();
>
> console.log(a.__ proto __ === Object.prototype); // true
>
> 实际上，__ proto __就是对象跟“对象构造器的原型”联系起来的纽带
>
> 继承总是发生在对象和对象之间，如
>
> ```js
> var A = function() {};
> A.prototype = { name: 'reyshieh' };
> var B = function() {};
> B.prototype = new A(); // 继承发生在对象和对象之间
> // 上一句等价于B.prototype.__proto__ = A.prototype;
> var b = new B();
> console.log(b.name); // reyshieh
> 
> // 但如果A中有name，就不能等价于B.prototype.__proto__ = A.prototype，因为new A()不仅仅只是做构造器的原型绑定，还有做一些初始设置的操作
> var A = function() { this.name = 'jamescain' };
> A.prototype = { name: 'reyshieh' };
> var B = function() {};
> B.prototype = new A(); // 继承发生在对象和对象之间
> // B.prototype.__proto__ = A.prototype; // 以下会输出reyshieh
> var b = new B();
> console.log(b.name); // jamescain
> ```

####原型链继承

```js
function Parent() {
    this.name = 'reyshieh';
}
Parent.prototype.getName = function () {
    console.log(this.name);
}
function Child() {}
Child.prototype = new Parent();
var child1 = new Child();
console.log(child1.getName()); // reyshieh
```

问题:

1. 引用类型的属性被所有实例共享
2. 在创建Child的实例时，不能向Parent传参

#### 原型式继承

```js
function createObj(o) {
    function F() {}
    F.prototype = o;
    return new F();
}
```

Object.create的模拟实现，将传入的对象作为创建的对象的原型

缺点：包含引用类型的属性值始终都会共享响应的值，跟原型链继承一样

## 消息队列和事件循环

Javascript是单线程语言，受限于需要和用户互动，以及操作DOM。因此，所有任务需要排队，前一个任务结束，才会执行下一个任务。如果前一个任务耗时很长，后一个任务就不得不一直等待

我们可以将这些任务分为**同步任务(synchronous)**和**异步任务(asynchronous)**两种。同步任务指在**主线程**上排队执行的任务，只有前一个任务执行完毕，才能执行下一个任务；异步任务指不进入主线程，进入**任务队列(task queue)**的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行

除了主线程，还存在其他的线程，如：处理Ajax请求的线程、处理DOM事件的线程、定时器线程、读写文件的线程等

![event-loop](http://reyshieh.com/assets/event-loop.png)

异步执行的运行机制如下：

1. 所有同步任务在主线程上执行，形成一个执行栈(execution context stack)
2. 主线程之外，还存在一个"任务队列"。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件
3. "执行栈"中的所有同步任务执行完毕，就会读取"任务队列"。对应的异步任务结束等待状态，进入执行栈，开始执行
4. 主线程不断循环第三步

"任务队列"可以放置定时事件，主要由setTimeout()和setInterval()两个函数来完成

HTML5标准规定setTimeout()的第二个参数的最小值(最短间隔)，不得低于4毫秒，如果低于这个值，就会自动增加。对于那些DOM的变动，通常不会立即执行，而是每16毫秒执行一次。这时使用requestAnimationFrame()的效果要好于setTimeout()

**setTimeout()只是将事件插入了"任务队列"，必须等到当前执行栈执行完，主线程才会去执行指定的回调函数。要是当前代码耗时很长，就需要等待很久，事件没有办法保证**

###Nodejs的事件循环

在nodejs中，事件循环的运行机制会不同于浏览器环境

![node-event-loop](http://www.reyshieh.com/assets/node-event-loop.png)

运行机制如下

1. V8引擎解析JavaScript脚本
2. 解析后的代码，调用Node API
3. [libuv库](http://libuv.org)负责Node API的执行。将不同的任务分配给不同的线程，形成一个EventLoop，以异步的方式将任务的执行结果返回给V8引擎
4. V8引擎再将结果返回给用户

Node.js不仅提供了setTimeout()和setInterval()两个方法，还有另外两个：process.nextTick()和setImmediate()

- process.nextTick()方法指定的任务总是发生在所有异步任务之前
- setImmediate()方法是在当前"任务队列"的尾部添加事件，也就是指定的任务总是在下一次EventLoop时执行

理解宏任务和微任务，先举个例子

```js
console.log('script start');
setTimeout(function() {
    console.log('setTimeout');
}, 0);
Promise.resolve().then(function() {
    console.log('promise1');
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

正确的执行顺序是：script start, script end, promise1, promise2, setTimeout

但实际在不同的浏览器里执行出来的效果是不一样的

### 宏任务（macrotask/task）

浏览器为了使JS内部task与DOM任务能够有序执行，会在一个task执行结束后，在下一个task执行之前，对页面进行重新渲染（task -> 渲染 -> task -> ...）

**setTimeout的作用是等待给定的时间后为它的回调产生一个新的宏任务。**这就是为什么'setTimeout'在'script end'之后打印，因为打印 'script end'是第一个宏任务里的事情，而'setTimeout'是另一个独立的任务里打印的

### 微任务（microtasks/jobs）

微任务通常就是需要在当前task执行结束后立即执行的任务，如对一些动作反馈，并不需要分配一个新的task，而只是异步的立即执行任务，这样便可以减小一点性能的开销。

**只要执行栈中没有其他的js代码正在执行且宏任务执行完，微任务队列会立即执行。**

如果在微任务执行期间微任务队列加入了新的微任务，会将新的微任务加入队列尾部，之后也会执行。

### 宏任务、微任务实例

```html
<div class="outer">
	<div class="inner"></div>
</div>
```

```js
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

new MutationObserver(function() {
    console.log('mutate');
}).observe(outer, {
    attributes: true
});

function onClick() {
    console.log('click');
    setTimeout(function() {
        console.log('timeout');
    }, 0);
    Promise.resolve().then(function() {
        console.log('promise');
    });
    outer.setAttribute('data-random', Math.Random());
}
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

结果如下：

click promise mutate click promise mutate timeout timeout

## 多进程浏览器

- 浏览器是多进程的
- 系统给浏览器进程都会分配资源(cpu、内存)
- 每打开一个Tab页，就相当于创建了一个独立的浏览器进程

浏览器包括这些进程

- **Browser进程** - 浏览器主进程（负责协调、主控），只有一个
  - 负责浏览器界面显示，与用户交互。如前进、后退等
  - 负责各个页面的管理，创建和销毁其他进程
  - 将Renderer进程得到的内存中的Bitmap，绘制到用户界面上
  - 网络资源的管理、下载等
- **第三方插件进程**
- **GPU进程** - 最多一个，用于绘制3D等
- **浏览器渲染进程（浏览器内核）**（Renderer进程，内部是多线程的）：默认每个Tab页面一个进程，互不影响
  - 页面渲染
  - 脚本执行
  - 事件处理

之所以多进程，原因

- 避免单个页面 crash，影响整个浏览器
- 避免第三方插件 crash影响整个浏览器
- 多进程充分利用多核优势
- 方便使用沙盒模型隔离插件等进程，提高浏览器稳定性
- 如果浏览器是单进程，那么某个Tab崩溃了，就会影响到整个浏览器，体验差；插件崩溃了，也会影响到整个浏览器

### 浏览器内核（渲染进程）

主要完成：

- 页面的渲染
- JS的执行
- 事件的循环

**渲染进程是多线程的**

- GUI渲染线程
  - 负责渲染浏览器界面，解析HTML、CSS，构建DOM树和RenderObject树，布局和绘制等
  - 当界面需要重绘(Repaint)或由某种操作引发回流(reflow)时，线程就会执行
  - **GUI渲染线程与JS引擎线程是互斥的。**当JS引起执行时GUI线程会被挂起，GUI更新会被保存在一个队列中等到JS引擎空闲时立即被执行
- JS引擎线程
  - JS内核，负责处理JavaScript脚本程序（如V8引擎）
  - JS引擎线程负责解析JavaScript脚本，运行代码
  - JS引擎一直等待着任务队列中任务的到来，然后加以处理，一个Tab页（renderer进程）中有且只有一个JS线程在运行JS程序
  - 如果JS执行的时间过长，会造成页面的渲染不连贯，导致页面渲染加载阻塞
- 事件触发线程
  - **归属于浏览器**而不是JS引擎，用来控制事件循环
  - 当JS引擎执行代码块如setTimeout时，(或来自浏览器内核的其他线程，如鼠标点击、AJAX异步请求等)，会将对应任务添加到事件线程中
  - 当对应的事件符合触发条件被触发时，该线程会把事件添加到待处理队列的队尾，等待JS引擎的处理
  - 由于JS是单线程，所以这些待处理了队列中的事件都得排队等待JS引擎处理（Event Loop）
- 定时触发器线程
  - setInterval和setTimeout所在线程
  - 浏览器定时计数器并不是由Javascript引擎计数的
  - 通过单独线程来计时并触发定时（Event Loop）
- 异步http请求线程
  - 在XMLHttpRequest连接后通过浏览器新开一个线程请求
  - 将检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调放入事件队列中。再给到JavaScript引擎执行

#### Browser进程和浏览器内核（Renderer进程）通信

每次打开一个浏览器，任务管理器中会出现两个进程（**一个是主控进程，另一个是打开Tab页的渲染进程**）。

- Browser进程收到用户请求，首先需要获取页面内容（如通过网络下载资源），将该任务通过RendererHost接口传递给Render进程
- Renderer进程的Renderer接口收到消息，交给渲染进程，然后开始渲染
  - 渲染线程接收到请求，加载网页并渲染网页，也许需要Browser进程获取资源和需要GPU进程来帮助渲染
  - 也会有JS线程操作DOM，有可能会造成回流重绘
  - Render进程将结果传递给Browser进程
- Browser进程接收到结果并将结果绘制出来

#### 浏览器内核中线程之间的关系

- GUI渲染线程与JS引擎线程互斥

  JavaScript是可操作DOM的，如果在修改元素属性同时渲染界面（即JS线程与UI线程同时运行），渲染线程前后获得的元素数据就可能不一致了

  为了防止渲染出现不可预期的结果，浏览器设置GUI渲染线程与JS引擎为互斥的关系，当JS引擎执行时GUI线程会被挂起，GUI更新则会被保存在一个队列中等到JS引擎线程空闲时立即被执行

- JS阻塞页面加载

  如果JS引擎中有巨大的计算量，此时GUI有更新，也会被保存到队列中，等待JS引擎空闲后执行。就会导致页面变得十分卡

  要尽量避免JS执行时间过长，这样会造成页面的渲染不连贯，导致页面渲染加载阻塞的感觉

  为了解决这个问题，HTML5引入了**Web Worker**

  1. 创建worker时，JS引擎向浏览器申请开一个子线程（子线程是浏览器开的，完全受主线程控制，而且不能操作DOM）
  2. JS引擎线程与worker线程间通过特定的方式通信(postMessage API，序列化对象来与线程交互特定的数据)

  因为Web Worker是线程级的，只能在当前Render进程中使用。为了能让Worker可以在所有页面中共享，又引入了**SharedWorker**，二者区别

  - WebWorker只属于某个页面，不会和其他页面的Render进程共享。
  - SharedWorker是浏览器所有页面共享的，不能采用与WebWorker一样的实现机制，不属于某个Render进程，可以为多个Render进程共享使用。因此，在浏览器中每个相同的JavaScript只存在一个SharedWorker进程，不管被创建多少次
  - 因此，WebWorker属于Render进程下的一个线程；SharedWorker属于独立的进程管理

#### 浏览器渲染流程

渲染之前操作，浏览器输入url，浏览器主进程接管，打开下载线程，进行Http请求，然后等待响应，获取内容，随后将内容通过RenderHost转交给Render进程。之后开始渲染流程

- 解析html建立DOM树
- 解析CSS构建CSSOM
- 结合DOM和CSSOM，生成render树
- 布局render树(Layout/reflow)，负责各元素尺寸、位置计算
- 绘制render树（Paint），绘制页面像素信息
- 浏览器将各层的信息发送给GPU，GPU将各层合成（composite），显示在屏幕上

##### load事件与DOMContentLoaded事件先后

- DOMContentLoaded事件触发时，仅当DOM加载完成，不包括样式表，图片
- load事件触发时，页面上所有的DOM、样式表、脚本、图片都已经加载完成了，即渲染完毕

DOMContentLoaded -> load

#### 普通图层和复合图层

浏览器渲染的图层分为普通图层和复合图层

**普通文档流**为一个复合图层（**默认复合层**，不管添加多少元素，都是在同一个复合图层中）；absolute、fixed布局虽然可以脱离文档流，但仍然属于默认复合层

**可以通过硬件加速的方式，声明一个新的复合图层，会单独分配资源，即不管这个复合图层怎么变化，都不会影响默认复合层里的回流重绘**

那么，如何才能变成复合图层呢？答案是**硬件加速**

- 最常用的方式：translate3d、translateZ
- opacity属性/过渡动画（需要动画执行的过程中才会创建合成层，动画没有开始或结束后元素还会回到之前的状态）
- < video> < iframe> < canvas> < webgl >元素都会

**absolute和硬件加速的区别?**

absolute虽然脱离普通文档流，但还是无法脱离默认复合层。所以即使absolute中信息改变也不会改变文档流中render树，但浏览器最终绘制时，是整个复合层绘制，所以absolute中信息的改变，仍然会影响整个复合层的绘制。

**硬件加速时尽量使用index**。基于浏览器的CSS3原理，元素添加了硬件加速，并且index层级比较低，那么在这个元素后面的其他元素(如果层级更高或者相同，并带relative或absolute属性相同)，会默认变为复合层渲染，影响性能

## Object.assign()

```js
Object.assign(target, ...sources)
```

函数参数为一个目标对象(该对象作为最终的返回值)，源对象(任意多个)

通过调用该函数可以拷贝所有可被枚举的自有属性值到目标对象中

**可枚举属性由enumerable值决定**。可枚举性决定了这个属性是否能被for...in查找遍历到。对象不可枚举，方法for...in，JSON.stringify()，Object.keys()都会失效

**null或undefined源被视为空对象对待，不会对目标对象产生任何影响**

**不可枚举对象也不会对目标对象产生影响**

**如果目标对象不可写，将会引发TypeError**

Object.assign不仅返回一个新拼接出来的值，同时也会改变第一个参数(target)的值，e.g.

```js
var obj = Object.create({ foo: 1 }, {
    bar: {
        value: 2 // bar是一个不可枚举的属性
    },
    baz: {
        value: 3,
        enumerable: true // baz是一个可枚举属性
    }
});
var copy = Object.assign({}, obj);
console.log(copy); // {baz: 3}
```

## Object.create()

```js
Object.create(proto [, propertiesObject ])
```

该是ES5提出的对象创建方式，第一参数是要继承的原型，如果不是一个子函数，可以传入null，第二个参数是对象的属性描述符，这个参数是可选的。返回一个具有指定的内部原型且包含指定的属性（如果有）的新对象。

满足以下任一条件，则将引发TypeError异常：

- prototype参数不是对象且不为null
- descriptors参数中的描述符具有value或writable特性，并具有get或set特性
- descriptors参数中的描述符具有不为函数的get或set特性

**如果要停止原型链，可以使用采用了null prototype参数的函数，所创建的对象将没有原型。**

```js
function Car (desc) {
    this.desc = desc;
    this.color = "red";
}

Car.prototype = {
    getInfo: function() {
      return 'A ' + this.color + ' ' + this.desc + '.';
    }
};
//instantiate object using the constructor function
var car =  Object.create(Car.prototype);
car.color = "blue";
alert(car.getInfo()); // 弹出A blue undefined
```

## Object.defineProperty()

```js
Object.defineProperty(obj, prop, descriptor)
```

- Obj: 目标对象
- prop: 需要定义的属性或方法的名字
- descriptor: 目标属性所拥有的特性

### 特性特性

- value：属性的值
- writable：是否可以随意重写
- configurable：是否能删除或被删除
- enumerable：是否能for...in循环遍历或Object.keys中列举出来
- get：目标属性被访问就会调用此方法，并将方法的运算结果返回用户
- set：目标属性被赋值，就会调用此方法

## 类型化数组(Typed Arrays)

一些新功能，如音视频编辑、访问WebSockets的原始数据等，直接对原始的二进制数据操作会更加快速

类型数组将实现拆分为**缓冲**和**视图**两部分

- 缓冲 - 由ArrayBuffer对象实现，描述的是一个数据块

- 视图 - 为了访问在缓冲对象中包含的内存，不要使用视图。视图提供了上下文，即数据类型、起始偏移量和元素数，将数据转换为实际有类型的数组

  ![arraybuffer](http://www.reyshieh.com/assets/arraybuffer.png)

### ArrayBuffer

是一种数据类型，用来表示一个通用的、固定长度的二进制数据缓冲区。不能直接操纵ArrayBuffer中的内容，需要创建一个类型化数组或一个描述缓冲数据格式的DataView，使用它们来读写缓冲区中的内容

### 类型数组视图

类型化数组视图具有自描述行的名字和所有常用的数值类型，如Int8、Uint32、Float64等

使用e.g.

```js
var buffer = new ArrayBuffer(16)
var int32View = new Int32Array(buffer)
for(var i=0; i<int32View.length; i++) {
	int32View[i] = i*2;
	console.log("Entry " + i +":" + int32View[i])
}
// Entry 0:0
// Entry 1:2
// Entry 2:4
// Entry 3:6

var int16View = new Int16Array(buffer)
for(var i=0; i<int16View.length; i++) {
	console.log("Entry " + i +":" + int16View[i])
}
// Entry 0:0
// Entry 1:0
// Entry 2:2
// Entry 3:0
// Entry 4:4
// Entry 5:0
// Entry 6:6
// Entry 7:0
```

> ArrayBuffer对比Blob？

Blob是Binary Large Object(大型二进制对象)的缩写。代表原始的二进制数据。和ArrayBuffer类似，都是二进制数据的容器

```js
// 可以用字符串构建Blob
var blob = new Blob(['rey shieh']);

// ArrayBuffer
var blob = new Blob([new ArrayBuffer(10)]);
```

可以看出，ArrayBuffer是Blob的底层，Blob内部使用了ArrayBuffer。并且构造好的一个Blob实体就是一个raw data。为什么要设计Blob和ArrayBuffer？ArrayBuffer更底层，所以专注细节，比如说按字节读写文件；Blob更像一个整体，就是一个原始的Binary Data，只要来回传输就行

> blob和ArrayBuffer使用？

在HTML5中，file对象的内部就是使用Blob，从< input >标签中获取的File对象即使一个Blob实例

blob文件的转换，可以使用FileReader对象：

```js
var fd = new FileReader();

// fd有几个文件读取方法，可以得到ArrayBuffer、Blob或String数据

// 使用ArrayBuffer读取方式，得到一个ArrayBuffer实例
fd.readAsArrayBuffer(file);

// 使用blob的方式，得到一个blob对象
fd.readAsBinaryString(file);

fd.onload = function(e) {
    // 读取成功后得到ArrayBuffer
    buffer = e.target.result;
}
```

将一个blob文件以ArrayBuffer的形式进行读取，得到一个ArrayBuffer的实例，目的为何？因为这样就可以对文件的字节进行读写，比如要判断一个文件的类型，就可以读取它的前两个字节，与Hash表进行匹配等

在实际数据交互中，发送的数据往往是Binary Data，很少需要使用ArrayBuffer按byte来手动构造数据

这么解释，blob和ArrayBuffer就都有存在的必要了

blob除了以上，还可以构造URL

URL对象的createObjectURL方法允许传入一个blob，得到一个临时的URL

```js
var URI = URL.createObjectURL(xhr.response);
var img = document.cerateElement('img');
img.src = URI;
document.append(img);
```

> 如何实现Blob与ArrayBuffer、TypeArray和字符串String之间转换？

- 将字符串转换成Blob对象

  ```js
  var blob = new Blob(['rey shieh'], {
      type: 'text/plain'
  });
  console.info(blob);
  console.info(blob.slice(1, 3, 'text/plain'));
  ```

- 将TypeArray转换成Blob对象

  ```js
  var array = new Uint16Array([97, 32, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33]);
  var blob = new Blob([array]);
  var reader = new FileReader();
  // 将Blob对象读成字符串
  reader.readAsText(blob, 'utf-8');
  reader.onload = function(e) {
      console.info(reader.result); // a Hello world!
  }
  ```

  ArrayBuffer转Blob

  ```js
  var buffer = new ArrayBuffer(32);
  var blob = new Blob([buffer]);
  ```

- 将Blob对象转换成String字符串，使用FileReader的`readAsText`方法

  ```js
  var blob = new Blob(['rey shieh'], {
      type: 'text/plain'
  });
  // 将Blob对象转换成字符串
  var reader = new FileReader();
  reader.readAsText(blob, 'utf-8');
  reader.onload = function(e) {
      console.info(reader.result);
  };
  ```

- 将Blob对象转换成ArrayBuffer，使用FileReader的`readAsArrayBuffer`方法

  ```js
  var blob = new Blob(['rey shieh'], {
      type: 'text/plain'
  });
  var reader = new FileReader();
  reader.readAsArrayBuffer(blob);
  reader.onload = function(e) {
      console.info(reader.result);
  }
  ```

- 将文件转换成Blob，使用FileReader的`readerAsBinaryString`方法

### 转换为普通数组

可以使用`Array.from`，或者`Array.prototype.slice.call(typedArray)`

```js
var typedArray = new Uint8Array([1, 2, 3, 4]),
    normalArray = Array.prototype.slice.call(typedArray);
normalArray.length === 4;
normalArray.constructor === Array;
```

> 注意：在计算机中字节序的排序存在大端(big endian)和小端(little endian)。这里采用的是大端，即地址最低位到最高位存储的数据为真实数据的高位到低位，因此存在下面这个例子的问题
>
> ```
> var arraybuffer = new ArrayBuffer(4);
> var aView = new Int8Array(arraybuffer);  //从0开始到内存末尾
> var bView = new Int16Array(arraybuffer,2); //从2开始到末尾
> 
> aView[0] = 1;
> aView[1] = 2;
> aView[2] = 3;
> aView[3] = 4;
> 
> bView[0] = 500;
> bView[1] = 8;
> 
> console.log(aView[2] );      //return   -12
> console.log(aView[3] );      //return   1
> ```
>
> 500在计算机中二进制表示为 00000001 11110100
>
> aView是有符号8位数组，11110100代表的是-12
>
> 根据大端的存储规则，aView[2]代表的是-12，aView[3]代表的是1
>
> 如果将上面的aView改为Uint8Array，如下
>
> ```
> var arraybuffer = new ArrayBuffer(4);
> var aView = new Uint8Array(arraybuffer);  //从0开始到内存末尾
> var bView = new Int16Array(arraybuffer,2); //从2开始到末尾
> 
> aView[0] = 1;
> aView[1] = 2;
> aView[2] = 3;
> aView[3] = 4;
> 
> bView[0] = 500;
> bView[1] = 8;
> 
> console.log(aView[2] );      //return   244
> console.log(aView[3] );      //return   1
> ```

## Memoization

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

## 原码、反码、补码、移码

### 原码

原码是符号位加上真值的绝对值，即用第一位表示符号，其余位表示值，以8位二进制：

```
[+1]原 = 0000 0001
[-1]原 = 1000 0001
```

取值范围

```
[1111 1111, 0111 1111]
即
[-127, 127]
```

### 反码

正数的反码是其本身；负数的反码是在其原码的基础上，符号位不变，其余各位取反

```
[+1]原 = [0000 0001]原 = [0000 0001]反
[-1]反 = [1000 0001]原 = [1111 1110]反
```

### 补码

正数的补码是其本身；**负数的补码是在其原码的基础上，符号位不变，其余各位取反，最后+1**（即在反码的基础上+1）

```
[+1]原 = [0000 0001]原 = [0000 0001]反 = [0000 0001]补
[-1]反 = [1000 0001]原 = [1111 1110]反 = [1111 1111]补
```

**补码用于解决计算机的减法运算问题**，因为原码计算减法算出的结果是错误的，反码算出的结果0会带上-，但实际这个符号是没有任何意义的

```
1-1 = 1+(-1) = [0000 0001]原 + [1000 0001]原 = [0000 0001]补 + [1111 1111]补 = [0000 0000]补 = [0000 0000]原

(-1) + (-127) = [1000 0001]原 + [1111 1111]原 = [1111 1111]补 + [1000 0001]补 = [1000 0000]补
因为[1000 0000]补代表的是-128，使用的是-0的补码表示出来的，所以-128并没有原码和反码表示
```

**使用8位二进制，原码或反码表示的范围[-127, +127]，补码表示的范围[-128, 127]**

32位int类型，表示范围是[-2^31, 2^31-1]

#### JS中的按位非(~)

实际该符号操作只需记住公式 **任意数值x进行按位非操作的结果为-(x + 1)**，即~5结果为-6

计算步骤为（e.g. ~1）

- 将1转二进制 = 0000 0001
- 按位取反 = 1111 1110
- 接下来采用补码逻辑 = 1000 0010
- 转换为十进制 = -2

接着举例

```js
var n = -4.9;
console.log(n); //4.9
n = ~n;
console.log(n);//3
n = ~n;
console.log(n);//-4

console.log('~null: ', ~null);       // => -1
console.log('~undefined: ', ~undefined);  // => -1
console.log('~0: ', ~0);          // => -1
console.log('~{}: ', ~{});         // => -1
console.log('~[]: ', ~[]);         // => -1
console.log('~(1/0): ', ~(1/0));      // => -1
console.log('~false: ', ~false);      // => -1
console.log('~true: ', ~true);       // => -2
console.log('~1.2543: ', ~1.2543);     // => -2
console.log('~4.9: ', ~4.9);       // => -5
console.log('~(-2.999): ', ~(-2.999));   // => 1
```

~~x，可以用这个方法代理parseInt(value)，而且效率更加高效 e.g.

```js
console.log('~~null: ', ~~null);       // => 0
console.log('~~undefined: ', ~~undefined);  // => 0
console.log('~~0: ', ~~0);          // => 0
console.log('~~{}: ', ~~{});         // => 0
console.log('~~[]: ', ~~[]);         // => 0
console.log('~~(1/0): ', ~~(1/0));      // => 0
console.log('~~false: ', ~~false);      // => 0
console.log('~~true: ', ~~true);       // => 1
console.log('~~1.2543: ', ~~1.2543);     // => 1
console.log('~~4.9: ', ~~4.9);       // => 4
console.log('~~(-2.999): ', ~~(-2.999));   // => -2
```

为什么带小数位会去除？

### 移码

移码是将补码的符号位取反即可

```
[+1]原 = [0000 0001]原 = [0000 0001]反 = [0000 0001]补 = [1000 0001]移
[-1]反 = [1000 0001]原 = [1111 1110]反 = [1111 1111]补 = [0111 1111]移
```

**移码表示法是在数x上增加一个偏移量来定义的，常用来表示浮点数中的阶码，所以是整数**

如果机器字长为n，规定偏移量为2^(n-1)。若x是整数，则x移 = 2^(n-1) + x。e.g.

```
[+1]移 = [1000 0000] + [0000 0001]补 = [1000 0001]移
[-1]反 = [1000 0000] + [1111 1111]补 = [0111 1111]移
```

## 浏览器渲染过程

https://github.com/zhansingsong/js-leakage-patterns/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8%E6%B8%B2%E6%9F%93%E7%AE%80%E8%BF%B0/%E6%B5%8F%E8%A7%88%E5%99%A8%E6%B8%B2%E6%9F%93%E7%AE%80%E8%BF%B0.md

https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/

[**查看修改任何指定 CSS 样式会触发 layout、paint、composite 中的哪一个**](https://csstriggers.com/)

## 字符编码

### ASCII码

一个字节一共可以用来表示256中不同的状态，每一个状态对应一个符号，就是256个符号，从`0000 0000`到`1111 1111`

`ASCII码`一共规定了128个字符的编码，比如空格`SPACE`是32(二进制0010 0000)

### Unicode

Unicode让每一种符号都给予一个独一无二的编码，就不会出现乱码问题，这是一种所有符号的编码

Unicode是分区定义的。每个区可以存放65536个(2^16)字符，称为一个平面（plane）。目前，一共有17个(1+2^4)平面。所以整个Unicode字符集的大小现在为2^21

上面提到的17个平面，包括1个基本平面(BMP)，码点从0到2^16 - 1，写成16进制就是从U+0000到U+FFFF；剩下的为辅助平面(SMP)，码点从U+010000到U+10FFFF

### UTF-8

UTF-8是Unicode的实现方式之一

它是一种变长的编码方式，可以使用1-4个字节来表示一个符号，根据不同的符号而变化字节长度

UTF-8的编码规则有两个:

- 对于单字节的符号，字节的第一位设为0，后面7位为符号的Unicode码。因此，英语字母，UTF-8和ASCII码是相同的
- 对于n字节的符号(n > 1)，第一个字节的前n位都设为1，第n+1为设为0，后面字节的前两位一律设为10。剩下位数填Unicode码

| Unicode符号范围(十六进制) | UTF-8编码方式(二进制)                   |
| ------------------------- | --------------------------------------- |
| 0000 0000 - 0000 007F     | 0xxx xxxx                               |
| 0000 0080 - 0000 07FF     | 110x xxxx 10xx xxxx                     |
| 0000 0800 - 0000 FFFF     | 1110 xxxx 10xx xxxx 10xx xxxx           |
| 0001 0000 - 0010 FFFF     | 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx |

### UTF-32

UTF-32编码采用的是字节意义对应码点的方式，该种方式最为简单，但是**浪费空间，比形同ASCII编码文件大四倍**比如码点0，用四个字节的0表示，码点597D就在前面加上两个字节的0

```js
// 以下为16进制
U+0000 = 0x0000 0000
U+597D = 0x0000 597D
```

但是也有优点，**查找效率高，时间复杂度o(1)**

但因为致命的缺点，导致实际上没有人使用这种编码方式

### UTF-16

UTF-16编码介于UTF-8和UTF-32之间，同时结合了定长和变长两种编码方法的特点

规则为：**基于基本平面的字符占用2个字节，辅助平面的字符占用4个字节**

因此，**UTF-16的编码长度很好区分，U+0000到U+FFFF为2个字节，U+010000到U+10FFFF为4个字节**

但是，在UTF-16中，要如何区分2个字节和4个字节的解读呢？

在基本平面中，存在U+D800到U+DFFF是一个空段，即这些码点不对应任何字符。因此，就可以用这些空段来做文章

**辅助平面因为字符总共需要20位来表示，可以将这20位拆分成两段，前10位映射在U+D800到U+DBFF（空间大小为2^10），称为高位(H)，后10位映射在U+DC00到U+DFFF（空间大小2^10），称为低位（L）**

所以当遇到两个字节，发现码点在U+D800到U+DBFF之间，就可以断定，紧跟在后面的两个字节的码点，应该在U+DC00到U+DFFF之间，四个字节要放在一起解读

### UCS-2

JavaScript也采用Unicode字符集，但是使用的编码方式为UCS-2

UCS-2实际上就是用2个字符表示码点的字符，而UTF-16取代了UCS-2，可以借助辅助平面用4个字节表示字符

因为**在JavaScript语言出现的时候，还没有UTF-16编码，所以采用的是UCS-2**

正因如此，JavaScript对所有字节的处理都是2个字节，如果是4个字节的字符，会当做两个双字节的字符处理，导致无法返回正常的结果

为了解决无法表示4字节字符的问题，必须通过对码点进行判断，然后手动调整，可以如下操作

```js
// 遍历字符串，对码点进行判断，只要码点落在0xD800到0xDBFF之间，就连同后面2个字节一起读取
while (++index < length) {
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        output.push(character + string.charAt(++index));
    } else {
        output.push(character);
    }
}
```

JavaScript在ECMAScript6到来之前，所有的字符操作函数都存在这个问题，诸如

```js
String.prototype.replace()
String.prototype.substring()
String.prototype.slice()
// ...
```

#### ES6中的Unicode

ES6自动识别4个字节的码点。遍历字符串就简单多了

```js
for (let s of string) {
    // ...
}
```

但为了保持兼容，length属性还是原来的行为方式。为了得到字符串的正确长度，可以用`Array.from(string).length`

JavaScript允许直接用码点表示Unicode字符，写法为`"反斜杆+u+码点"`，如

```js
'好' === '\u597D' // true
```

在原来的JS中，这种表示方法对4字节的码点是无效的。ES6可以把码点放在大括号中，正确表示，如

```js
'𝌆' === '\u{1D306}' // true
'𝌆' === '\u1D306' // false
```

ES6中还新增了几个专门处理4字节码点的函数

```js
String.fromCodePoint() // 从Unicode码点返回对应字符
String.prototype.codePointAt() // 从字符返回对应的码点
String.prototype.at() // 返回字符串给定位置的字符
```

### Unicode复合显示

![Unicode-composite](http://reyshieh.com/assets/Unicode-composite.png)

有些字符除了主体字符外，会和附加符号组合显示成一个码点，即两个码点表示一个字符

但是，个别情况下，Unicode提供了两种表示方法。一种是带附加符号的单个字符，即一个码点表示一个字符，如Ǒ的码点是U+01D1；另一种是将附加符号单独作为一个码点，与主体字符符合显示，比如Ǒ可以写成O（U+004F） + ˇ（U+030C）

两种表达方式表示的字符是相同的，但是在JavaScript中无法辨别

```js
'\u01D1'==='\u004F\u030C' //false
```

ES6提供了normalize方法，允许"Unicode正规化"，即两种方法转为同样的序列

```js
'\u01D1'.normalize() === '\u004F\u030C'.normalize() // true
```

## 算法

 ### 排序算法

- 稳定 - a在b前，且a=b，排序后仍然a在b前
- 不稳定 - a在b前，且a=b，排序后a可能出现在b后
- 内排序 - 所有排序操作在内存中完成
- 外排序 - 数据太大，会把数据放在磁盘中，排序要通过磁盘和内存的数据传输才能进行
- 时间复杂度 - 算法执行所耗费的时间
- 空间复杂度 - 运行完一个程序所需内存的大小

![sort-algorithms](http://www.reyshieh.com/assets/sort-algorithms.png)



