# Interview

## 基本类型

string、number、boolean、null、undefined、Symbol

除了null和undefined之外，所有基本类型都有包裹这个基本类型值的等价对象：

String、Number、Boolean、Symbol，对象的valueOf()方法返回基本类型值

## 浮点数的坑

![float-hole](http://reyshieh.com/assets/float-hole.png)

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

JSON.stringify将值序列化为JOSN字符串，和ToString有关，但并不等于强制转型

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

