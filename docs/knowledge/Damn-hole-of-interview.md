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
  0 * Infinity // NaN
  0 / Infinity // 0
  Infinity / 0 // Infinity
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

