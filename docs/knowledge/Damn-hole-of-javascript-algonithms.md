# JavaScript数据结构

## 列表

列表是一组有序的数组。每个列表中的数据项称为**元素**。在JavaScript中，列表中的元素可以是任意数据类型。列表中可以保存多少元素并没有事先限定，**实际使用时元素的数量收到程序内存的限制**。

不包含任何元素的列表称为**空列表**。列表中包含元素的个数称为列表的**length**。在内部实现上，用一个变量**listSize**保存列表中元素的个数。可以在列表末尾**append**一个元素，也可以在一个给定元素后或列表的起始位置**insert**一个元素。使用**remove**方法从列表中删除元素，使用**clear**方法清空列表中所有的元素。可以使用**toString()**方法显示列表中所有的元素，使用**getElement()**方法显示当前元素。列表第一个元素位置用**front()**返回，结尾用**end()**方法。使用**next()**方法从当前元素移动到下一个元素，使用**prev()**方法可以移动当前元素的前一个元素。可以使用**moveTo(n)**方法直接移动到指定位置，**currPos()**方法返回列表当前位置。

```typescript
// 列表
/**
 * ListInterface 接口
 * @param listSize 列表的元素个数
 * @param pos 列表的当前位置
 * @param length 该方法返回列表中元素的个数
 * @param clear 该方法清空列表中的所有元素
 * @param toString 该方法返回列表的字符串形式
 * @param getElement 该方法返回当前位置的元素
 * @param insert 该方法在指定元素后插入新元素
 * @param append 该方法在列表的末尾添加新元素
 * @param remove 该方法从列表中删除元素
 * @param front 该方法将列表的当前位置移动到第一个元素
 * @param end 该方法将列表的当前位置移动到最后一个元素
 * @param prev 该方法将当前位置前移一位
 * @param next 该方法将当前位置后移一位
 * @param hasNext 该方法判断是否有后一位
 * @param hasPrev 该方法判断是否有前一位
 * @param currPos 该方法返回列表的当前位置
 * @param moveTo 该方法将当前位置移动到指定位置
 * @param find 该方法返回是否找到要找的元素，并返回所在位置
 * @param contain 该方法返回是否找到要找的元素，并返回布尔值
 */
interface ListInterface {
  listSize: number;
  pos: number;
  length(): number;
  clear(): void;
  toString(): any;
  getElement(): any;
  insert(element: any, after: any): boolean;
  append(element: any): void;
  remove(element: any): boolean;
  front(): void;
  end(): void;
  prev(): void;
  next(): void;
  hasNext(): boolean;
  hasPrev(): boolean;
  currPos(): number;
  moveTo(position: number): void;
  find(element: any): number;
  contain(element: any): boolean;
}

class List implements ListInterface {
  listSize = 0;
  pos = 0;
  dataStore = [];

  length() {
    return this.dataStore.length;
  }

  clear() {
    delete this.dataStore;
    this.dataStore.length = 0;
    this.listSize = this.pos = 0;
  }

  toString() {
    return this.dataStore;
  }

  getElement() {
    return this.dataStore[this.pos];
  }

  insert(element: any, after: any) {
    const insertPos = this.find(after);
    if (insertPos > -1) {
      this.dataStore.splice(insertPos + 1, 0, element);
      this.listSize++;
      return true;
    }
    return false;
  }

  append(element: any) {
    this.dataStore[this.listSize++] = element;
  }

  remove(element: any) {
    const foundAt = this.find(element);
    if (foundAt > -1) {
      this.dataStore.splice(foundAt, 1);
      this.listSize--;
      return true;
    }
    return false;
  }

  front() {
    this.pos = 0;
  }

  end() {
    this.pos = this.listSize - 1;
  }

  prev() {
    --this.pos;
  }

  next() {
    if (this.pos < this.listSize) {
      ++this.pos;
    }
  }

  hasNext() {
    return this.pos < this.listSize;
  }

  hasPrev() {
    return this.pos >= 0;
  }

  currPos() {
    return this.pos;
  }

  moveTo(position: number) {
    this.pos = position;
  }

  find(element: any) {
    for (let i = 0; i < this.listSize; i++) {
      if (this.dataStore[i] === element) {
        return i;
      }
    }
    return -1;
  }

  contain(element: any) {
    for (let i = 0; i < this.listSize; i++) {
      if (this.dataStore[i] === element) {
        return true;
      }
    }
    return false;
  }
}

var names = new List();
names.append('Rey');
names.append('Shieh');
names.append('James');
names.append('Cain');

names.front();
console.log(names.getElement());
// Rey

names.next();
console.log(names.getElement());
// Shieh

names.next();
names.next();
names.prev();
console.log(names.getElement());
// James
```

⚠️使用迭代器，可以不必关系数据的内部存储方式，以实现对列表的遍历。因此在例子中提到的方法front()、end()、prev()、next()和currPos()可以很方便的实现一个list类的迭代器，与数组索引方式相比，使用迭代器的有点有：

- 访问列表元素时不必关心底层的数据存储结构
- 当为列表添加一个元素时，索引的值就不对了，此时只用更新列表，而不用更新迭代器
- 可以用不同类型的数据存储方法实现List类，迭代器为访问列表里的元素提供了一种统一的方式

```js
for (names.front(); names.hasNext(); names.next()) {
    console.log(names.getElement());
}
```

## 栈

栈是一种高效的数据结构，数据只能从栈顶添加或删除，栈被称为是一种**后入先出**(LIFO,list-in-first-out)的数据结构。

对栈的两种主要操作是将一个元素压入栈和将一个元素弹出栈。入栈使用**push()**方法，出栈用**pop()**方法。

预览栈顶的元素使用**peek()**方法。

清除栈内所有元素用**clear()**方法。**length**属性记录栈内元素的个数。**empty**属性用来表示栈内是否含有元素。

```typescript
// 栈
/**
 * StackInterface 接口
 * @param dataStore 存放所有数据数组
 * @param top 记录栈顶位置，被构造函数初始化为0，表示栈顶对应数组的起始位置0，要和数组下标区分，找对应栈顶元素时要用top-1
 * @param push 该方法用来入栈
 * @param pop 该方法用来出栈
 * @param peek 该方法用来返回栈顶元素
 */
interface StackInterface {
  dataStore: any[];
  top: number;
  push(element: any): void;
  pop(): any;
  peek(): any;
  length(): number;
  clear(): any;
}

class Stack implements StackInterface {
  dataStore = [];
  top = 0;

  push(element) {
    this.dataStore[this.top++] = element;
  }

  pop() {
    return this.dataStore[--this.top];
  }

  peek() {
    return this.dataStore[this.top - 1];
  }

  length() {
    return this.top;
  }

  clear() {
    this.top = 0;
  }
}

const s = new Stack();
s.push('rey');
s.push('shieh');
s.push('james');
s.push('cain');
console.log(s);
// Stack { dataStore: [ 'rey', 'shieh', 'james', 'cain' ], top: 4 }

var l = s.pop();
console.log(l);
// cain
```

在实际编程中，有很多问题可以用栈来解决比较合适

- 数制间的相互转换

- 回文问题，即从前往后和从后往前排序的字符串相等

- 递归问题

  ```js
  function fact(n) {
    var s = new Stack();
    while (n > 1) s.push(n--);
    var product = 1;
    while (s.length() > 0) product *= s.pop();
    return product;
  }
  
  console.log(fact(5)); // 120
  ```

## 队列

队列是一种列表，不同的是队列只能在队尾插入元素，在队首删除元素。队列是一种**先进先出**(FIFO, First-In-First-Out)的数据结构。队列可以用在很多地方，如提交操作系统执行的一系列进程、打印任务池等，一些仿真系统用队列来模拟银行或杂货店里排队的顾客。

队列的两种主要操作是：向队列中**插入新元素**和**删除队列中的元素**。入队操作在队尾插入新元素，出队操作删除对头的元素。队列读取对头的元素的操作为**peek()**。队列中存储了多少元素，使用**length**属性。清空队列中的所有元素，使用**clear()**方法。

```typescript
// 队列
/**
 * QueueInterface 接口
 * @param dataStore 存放所有数据数组
 * @param enqueue 入队方法
 * @param dequeue 出队方法
 * @param front 获取队首元素
 * @param back 获取队尾元素
 * @param toString 显示队列内的所有元素
 * @param empty 判断队列是否为空 
 */
interface QueueInterface {
  dataStore: any[];
  enqueue(element: any): void;
  dequeue(): any;
  front(): any;
  back(): any;
  toString(): string;
  empty(): boolean;
}

class Queue implements QueueInterface {
  dataStore = [];

  enqueue(element) {
    this.dataStore.push(element);
  }

  dequeue() {
    return this.dataStore.shift();
  }

  front() {
    return this.dataStore[0];
  }

  back() {
    return this.dataStore[this.dataStore.length - 1];
  }

  toString() {
    var retStr = '';
    for (var i = 0; i < this.dataStore.length; i++) {
      retStr += this.dataStore[i] + '\n';
    }
    return retStr;
  }

  empty() {
    if (this.dataStore.length === 0) {
      return true;
    } else {
      return false;
    }
  }
}

var q = new Queue();

q.enqueue('rey');
q.enqueue('shieh');
q.enqueue('james');
q.enqueue('cain');

console.log(q.toString());

q.dequeue();

console.log(q.toString());
// rey
// shieh
// james
// cain

// shieh
// james
// cain
```

在实际编程中，经常用队列来模拟排队的人，还可以用来对数据进行排序。

**基数排序**就是用队列实现的排序，它不是最快的排序算法，但展示了一些有趣的队列使用方法。

对于0-99的数字，基数排序将数据集扫描两次。第一次按个位上的数字进行排序，第二次按十位上的数字进行排序。每个数字根据对应位上的数值被分在不同的盒子里。对于n位数，那就需要扫描n次。

优先队列问题是特殊的队列，在删除元素时不遵守先进先出的约定。从优先队列中删除元素时，需要考虑优先权的限制。以医院就诊为例，病人进入候诊室时，分帧护士会评估患者病情的严重程度，然后给优先级代码。高优先级的患者先于低优先级患者就医，同样优先级的患者按照先来先服务的顺序就医。

```typescript
/**
 * 优先队列 ：优先队列问题是特殊的队列，在删除元素时不遵守先进先出的约定。
 */
class Patient {
  name;
  code;

  constructor(name, code) {
    this.name = name;
    this.code = code;
  }
}

interface QueueInterface {
  dataStore: Patient[];
  enqueue(element: Patient): void;
  dequeue(): Patient;
  front(): Patient;
  back(): Patient;
  toString(): string;
  empty(): boolean;
}

class Queue implements QueueInterface {
  dataStore: Patient[] = [];

  enqueue(element: Patient) {
    this.dataStore.push(element);
  }

  /**
   * 不同的在出队函数
   */
  dequeue() {
    var entry = 0;
    for (var i = 0; i < this.dataStore.length; i++) {
      if (this.dataStore[i].code < this.dataStore[entry].code) {
        entry = i;
      }
    }
    return this.dataStore.splice(entry, 1)[0];
  }

  front() {
    return this.dataStore[0];
  }

  back() {
    return this.dataStore[this.dataStore.length - 1];
  }

  toString() {
    var retStr = '';
    for (var i = 0; i < this.dataStore.length; i++) {
      retStr += this.dataStore[i].name + ' code: ' + this.dataStore[i].code + '\n';
    }
    return retStr;
  }

  empty() {
    if (this.dataStore.length === 0) {
      return true;
    } else {
      return false;
    }
  }
}

var p = new Patient('rey', 5);
var ed = new Queue();
ed.enqueue(p);
p = new Patient('shieh', 4);
ed.enqueue(p);
p = new Patient('James', 6);
ed.enqueue(p);
p = new Patient('Cain', 1);
ed.enqueue(p);
p = new Patient('cora', 1);
ed.enqueue(p);
p = new Patient('xie', 3);
ed.enqueue(p);

console.log(ed.toString());
// rey code: 5
// shieh code: 4
// James code: 6
// Cain code: 1
// cora code: 1
// xie code: 3

var seen = ed.dequeue();
console.log('Patient being treated: ' + seen.name + '\n');
console.log(ed.toString());
// Patient being treated: Cain

// rey code: 5
// shieh code: 4
// James code: 6
// cora code: 1
// xie code: 3
```

## 链表

链表是由一组节点组成的集合。每个节点都使用一个对象的引用指向它的后继。指向另一个节点的引用叫做**链**。

遍历链表，就是跟着链接，从链表的首元素一直走到尾元素，链表的尾元素指向一个null节点。

许多链表的实现都在链表最前面有一个特殊节点，叫做头节点。

向链表插入一个节点，需要修改它前面的节点（前驱），使其指向新加入的节点，而新加入的节点则指向原来前驱指向的节点。

链表中删除节点，从待删除节点的前驱节点指向待删除节点的后继节点，同时将待删除节点指向null，节点就删除成功。

```typescript
// 单向链表
/**
 * NodeItem 类
 * @param element 保存节点上的数据
 * @param next 保存指向下一个节点的链接
 */
class NodeItem {
  element;
  next = null;

  constructor(element: any) {
    this.element = element;
    this.next = null;
  }
};

/**
 * LList类: 提供对链表的操作的方法，功能包括插入删除及诶单，在列表中查找给定的值
 * @param head head节点的next属性被初始化为null，当有新元素插入时，next会指向新的元素
 */
class LList {
  head;
  constructor() {
    this.head = new NodeItem('head');
  }

  /**
   * 遍历链表，查找给定数据
   * 如果找到数据，该方法返回保存该数据的节点
   * @param item 需要查找的数据
   */
  find(item) {
    var currNode = this.head;
    while (currNode.element !== item) {
      currNode = currNode.next;
    }
    return currNode;
  }

  /**
   * insert: 将新节点插入链表
   * @param newElement 待插入的节点
   * @param item newElement将插入到该节点之后
   */
  insert(newElement, item) {
    var newNode = new NodeItem(newElement);
    var current = this.find(item);
    newNode.next = current.next;
    current.next = newNode;
  }

  /**
   * display: 显示链表中的数据
   */
  display() {
    var currNode = this.head;
    while (!(currNode.next === null)) {
      console.log(currNode.next.element);
      currNode = currNode.next;
    }
  }

  /**
   * findPrevious: 该方法是用来删除节点前使用的
   * 因为在删除一个节点之前，需知道该节点的前一个节点，这样才可以修改它的next属性
   * @param item 待删除的节点
   * @return currNode 返回待删除节点的前个节点
   */
  findPrevious(item) {
    var currNode = this.head;
    while (!(currNode.next == null) && (currNode.next.element != item)) {
      currNode = currNode.next;
    }
    return currNode;
  }

  /**
   * remove: 删除节点
   */
  remove(item) {
    var prevNode = this.findPrevious(item);
    if (!(prevNode.next == null)) {
      prevNode.next = prevNode.next.next;
    }
  }
}

var cities = new LList();

cities.insert('Shenzhen', 'head');
cities.insert('Guangzhou', 'Shenzhen');
cities.insert('Fuzhou', 'Guangzhou');

cities.display();
// Shenzhen
// Guangzhou
// Fuzhou

cities.remove('Guangzhou');
cities.display();
// Shenzhen
// Fuzhou
```

单向链表虽然使链表从头节点遍历到尾节点很容易，但反过来却没那么简单。

为了解决这个问题，可以使用**双向链表**。即让节点都正确的指向对应的前驱和后继。从删除节点的角度来看，效率提高了，不需要再查找该及诶单的前驱节点。

```typescript
// 双向列表
/**
 * NodeItem类 和单向列表不同之处，该对象中增加了一个previous属性
 * @param element 保存节点上的数据
 * @param next 保存指向下一个节点的链接
 * @param previous 保存指向上一个节点的链接
 */
class NodeItem {
  element;
  next = null;
  previous = null;

  constructor(element: any) {
    this.element = element;
    this.next = null;
    this.previous = null;
  }
};

/**
 * DLList类: 提供对链表的操作的方法，功能包括插入删除及诶单，在列表中查找给定的值
 * @param head head节点的next属性被初始化为null，当有新元素插入时，next会指向新的元素
 */
class DLList {
  head;
  constructor() {
    this.head = new NodeItem('head');
  }

  /**
   * 遍历链表，查找给定数据
   * 如果找到数据，该方法返回保存该数据的节点
   * @param item 需要查找的数据
   */
  find(item) {
    var currNode = this.head;
    while (currNode.element !== item) {
      currNode = currNode.next;
    }
    return currNode;
  }

  /**
   * insert: 将新节点插入链表
   * @param newElement 待插入的节点
   * @param item newElement将插入到该节点之后
   */
  insert(newElement, item) {
    var newNode = new NodeItem(newElement);
    var current = this.find(item);
    newNode.next = current.next;
    if (current.next && current.next.previous) current.next.previous = newNode;
    newNode.previous = current;
    current.next = newNode;
  }

  /**
   * display: 显示链表中的数据
   */
  display() {
    var currNode = this.head;
    while (!(currNode.next === null)) {
      console.log(currNode.next.element);
      currNode = currNode.next;
    }
  }

  /**
   * remove: 删除节点
   */
  remove(item) {
    var currNode = this.find(item);
    if (!(currNode.next == null)) {
      currNode.previous.next = currNode.next;
      if (currNode.next && currNode.next.previous) currNode.next.previous = currNode.previous;
      currNode.next = null;
      currNode.previous = null;
    }
  }

  /**
   * findLast: 为了完成反序显示链表中元素，增加查找最后的节点方法
   */
  findLast() {
    var currNode = this.head;
    while (!(currNode.next == null)) {
      currNode = currNode.next;
    }
    return currNode;
  }

  /**
   * dispReverse: 反序显示双向链表中的元素
   */
  dispReverse() {
    var currNode = this.findLast();
    while (!(currNode.previous == null)) {
      console.log(currNode.element);
      currNode = currNode.previous;
    }
  }
}

var cities = new DLList();

cities.insert('Shenzhen', 'head');
cities.insert('Guangzhou', 'Shenzhen');
cities.insert('Fuzhou', 'Guangzhou');

cities.display();
// Shenzhen
// Guangzhou
// Fuzhou

cities.remove('Guangzhou');
cities.display();
// Shenzhen
// Fuzhou

cities.dispReverse();
// Fuzhou
// Shenzhen
```

## 字典

字典是一种以键-值对形式存储数据的数据结构。键是用来查找的东西，值是查找得到的结果。

Dictionary类的键为字符串。JavaScript中是不能对对象的属性进行排序的。

```typescript
// 字典
class Dictionary {
  dataStore = [];

  /**
   * add: 增加键值方法
   */
  add(key, value) {
    this.dataStore[key] = value;
  }

  /**
   * find: 以键作为参数，返回关联的值
   */
  find(key) {
    return this.dataStore[key];
  }

  /**
   * remove: 删除键值
   */
  remove(key) {
    delete this.dataStore[key];
  }

  /**
   * showAll: 展示字典所有键值对
   */
  showAll() {
    Object.keys(this.dataStore).forEach((key) => {
      console.log(key + ' -> ' + this.dataStore[key]);
    });
  }

  /**
   * count: 查看字典中的 元素个数
   */
  count() {
    var n = 0;
    for (var key in Object.keys(this.dataStore)) n++;
    return n;
  }

  /**
   * clear: 清除字典中所有元素
   */
  clear() {
    for (var key in Object.keys(this.dataStore)) delete this.dataStore[key];
  }

  /**
   * sortShowAll: 排序后显示
   */
  sortShowAll() {
    Object.keys(this.dataStore).sort().forEach((key) => {
      console.log(key + ' -> ' + this.dataStore[key]);
    });
  }
}

var pbook = new Dictionary();
pbook.add('rey', 123);
pbook.add('shieh', 234);
pbook.add('james', 456);
pbook.showAll();
// rey -> 123
// shieh -> 234
// james -> 456
pbook.sortShowAll();
// james -> 456
// rey -> 123
// shieh -> 234

pbook.remove('shieh');
console.log(pbook.count());
// 2
pbook.showAll();
// rey -> 123
// james -> 456

pbook.clear();
pbook.showAll();
// 清空了
```

## 散列

散列使用的数据结构叫做**散列表**。在散列表上插入、删除和取用数据都非常快，但是对于查找操作来说却效率低下。

散列表是基于**数组**进行设计的。数组的长度是预先预定的，如有需要，可以随时增加。所有元素根据和该元素对应的键，保存在数组的特定位置。

理想情况下，**散列函数会将每个键值映射为一个唯一的数组索引**。键的数量是无限的，但数组的长度是有限的。

**即使使用一个高效的散列函数，仍然存在将两个键映射成同一个值的可能，这种现象称为碰撞(collision)**。

散列表中的数组长度应该是一个**质数**。

**散列函数**的选择依赖于键值的数据类型。如果键是整型，最简单的散列函数就是以数组的长度对键取余(**除留取余法**)。

```typescript
// 散列
/**
 * hashTable 数组长度一般设置为质数，例如设置为137，最简单的散列函数使用ASCII码值的和除以数组长度的余数
 */
class HashTable {
  table = [];
  constructor() {
    this.table = new Array(137);
  }

  put(data) {
    var pos = this.simpleHash(data);
    this.table[pos] = data;
  }

  simpleHash(data) {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      total += data.charCodeAt(i);
    }
    return total % this.table.length;
  }

  showDistro() {
    var n = 0;
    for (var i = 0; i < this.table.length; i++) {
      if (this.table[i] != undefined) {
        console.log(i + ': ' + this.table[i]);
      }
    }
  }
}

var someNames = ['David', 'Jennifer', 'Donnie', 'Raymond', 'Cynthia', 'Mike', 'Clayton', 'Danny', 'Jonathan'];
var hTable = new HashTable();
for (var i = 0; i < someNames.length; i++) {
  hTable.put(someNames[i]);
}
hTable.showDistro();
// 35: Cynthia
// 45: Clayton
// 57: Donnie
// 77: David
// 95: Danny
// 116: Mike
// 132: Jennifer
// 134: Jonathan

// 发现，数据并不是均匀分布，人名向数组的两端集中
// 并且初始数组中的人名并没有全部显示。
// 原因是字符串"Clayton"和"Raymond"的散列值是一样的，产生了碰撞
```

**为了避免碰撞，首先要确保散列表中用来存储数据的数组其大小是个质数**。数组的长度应该在100以上，这是为了让数据在散列表中分布得更加均匀。试验发现，比100大且不会让数据产生碰撞的第一个质数是**137**。使用其他更接近100的质数，在该数据集上依然会产生碰撞。

更好的散列函数可以使用霍纳算法，该算法仍然先计算字符串中各字符的ASCII码值，**求和时每次要乘以一个质数。**

```typescript
/**
 * betterHash: 采用霍纳算法
 */
class HashTable {
  table = [];
  constructor() {
    this.table = new Array(137);
  }

  put(data) {
    var pos = this.betterHash(data);
    this.table[pos] = data;
  }

  betterHash(data) {
    var H = 37;
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      total = H * total + data.charCodeAt(i);
    }
    total = total % this.table.length;
    if (total < 0) {
      total += this.table.length - 1;
    }
    return total;
  }

  showDistro() {
    var n = 0;
    for (var i = 0; i < this.table.length; i++) {
      if (this.table[i] != undefined) {
        console.log(i + ': ' + this.table[i]);
      }
    }
  }
}

var someNames = ['David', 'Jennifer', 'Donnie', 'Raymond', 'Cynthia', 'Mike', 'Clayton', 'Danny', 'Jonathan'];
var hTable = new HashTable();
for (var i = 0; i < someNames.length; i++) {
  hTable.put(someNames[i]);
}
hTable.showDistro();
// 10: Mike
// 12: Danny
// 72: David
// 73: Jonathan
// 88: Clayton
// 92: Raymond
// 104: Donnie
// 109: Jennifer
// 133: Cynthia
```

对于碰撞处理，有两种解决方法：**开链法**和**线性探测法**

- 开链法：是指实现散列表的底层数组中，每个数组元素又是一个新的数据结构，比如里面为数组，就能存储多个键
- 线性探测法：当发生碰撞时，线性探测法检查散列表中的下一个位置是否为空。如果为空，就将数据存入该位置；如果不为空，则继续检查下一个位置，直到找到一个空的位置为止

当存储数据使用的数组特别大时，选择线性探测法要比开链法好。**如果数组的大小是待存储数据个数的1.5倍，那么使用开链法；如果数组的大小是待存储数据的两倍或两倍以上时，那么使用线性探测法。**

## 集合

集合是一种包含不同元素的数据结构。集合中的元素称为成员。集合的两个重要特性：**集合中的成员是无序的；集合中不允许相同成员存在。**

集合的定义：

- 不包含任何成员的集合称为**空集**，**全集**则是包含一切可能成员的集合
- 如果两个集合的成员完全相同，则称两个集合相等
- 如果一个集合中所有的成员都属于另外一个集合，则前一集合称为后一集合的子集

对集合的基本操作:

- **并集** 将两个集合中的成员进行合并，得到一个新集合
- **交集** 两个集合中共同存在的成员责成一个新的集合
- **补集** 属于一个集合而不属于另一个集合的成员组成的集合

```typescript
// 集合
class Set {
  dataStore = [];

  /**
   * add: 集合中不能包含相同的元素，在调用add方法时要先判断是否已经存在数据，如果不存在才能存入
   * @param data 待存入数据
   * @return 返回布尔值，告诉我们是否将一个元素成功加入到了集合中
   */
  add(data) {
    if (this.dataStore.indexOf(data) < 0) {
      this.dataStore.push(data);
      return true;
    }
    return false;
  }

  /**
   * remove: 首先检查待删元素是否在数组中，如果在，删除元素并返回true，否在返回false
   * @param data 待删除数据
   * @return 返回布尔值
   */
  remove(data) {
    var pos = this.dataStore.indexOf(data);
    if (pos > -1) {
      this.dataStore.splice(pos, 1);
      return true;
    }
    return false;
  }

  /**
   * show: 展示数据
   */
  show() {
    return this.dataStore;
  }

  /**
   * contains: 检查一个成员是否属于该集合
   * @param data 待检查数据
   * @return 布尔值
   */
  contains(data) {
    if (this.dataStore.indexOf(data) > -1) return true;
    return false;
  }

  /**
   * union: 返回并集结果
   * @param set 待拼接Set对象
   * @return 并集结果Set对象
   */
  union(set) {
    var tempSet = new Set();
    for (var i = 0; i < this.dataStore.length; i++) {
      tempSet.add(this.dataStore[i]);
    }
    for (var i = 0; i< set.dataStore.length; i++) {
      if (!tempSet.contains(set.dataStore[i])) tempSet.add(set.dataStore[i]);
    }
    return tempSet;
  }

  /**
   * intersect: 返回两个集合的交集
   * @param set 待检查集合Set对象
   * @return 交集结果Set对象
   */
  intersect(set) {
    var tempSet = new Set();
    for (var i = 0; i < this.dataStore.length; i++) {
      if (set.contains(this.dataStore[i])) {
        tempSet.add(this.dataStore[i]);
      }
    }
    return tempSet;
  }

  /**
   * difference: 返回两个集合的补集，即属于第一个集合但不属于第二个集合
   * @param set 待比较集合Set对象
   * @return 补集结果Set对象
   */
  difference(set) {
    var tempSet = new Set();
    for (var i = 0; i < this.dataStore.length; i++) {
      if (!set.contains(this.dataStore[i])) {
        tempSet.add(this.dataStore[i]);
      }
    }
    return tempSet;
  }

  /**
   * subSet: 判断是否是子集
   * @param set 待检查集合Set元素
   * @return 布尔值
   */
  subSet(set) {
    if (this.dataStore.length > set.dataStore.length) return false;
    for (var i = 0; i < this.dataStore.length; i++) {
      if (!set.contains(this.dataStore[i])) return false;
    }
    return true;
  }
}

var names = new Set();
names.add('rey');
names.add('shieh');
names.add('james');
names.add('cain');

if (names.add('rey')) {
  console.log('add success');
} else {
  console.log('add fail');
}
// add fail
console.log(names.show());
// [ 'rey', 'shieh', 'james', 'cain' ]

if (names.remove('james')) {
  console.log('remove success');
} else {
  console.log('remove fail');
}
// remove success
console.log(names.show());
// [ 'rey', 'shieh', 'cain' ]
if (names.remove('james')) {
  console.log('remove success');
} else {
  console.log('remove fail');
}
// remove fail

var dmp = new Set();
dmp.add('cora');
dmp.add('james');
dmp.add('cain');

var it = new Set();
it = names.union(dmp);
console.log(it.show());
// [ 'rey', 'shieh', 'cain', 'cora', 'james' ]

var inset = new Set();
inset = names.intersect(dmp);
console.log(inset.show());
// [ 'cain' ]

console.log(dmp.subSet(names));
// false

var diff = new Set();
diff = names.difference(dmp);
console.log(diff.show());
// [ 'rey', 'shieh' ]
```

## 二叉树和二叉查找树

树是一种非线性的数据结构，以分层的方式来存储数据。树被用来**存储具有层次关系的数据**，比如文件系统中的文件；树还被用来存储有序列表。

树由一组以边连接的节点组成的。一棵树最上面的节点称为**根节点**，如果一个节点下面连接多个节点，那么该节点称为**父节点**，它下面的节点称为**子节点**。没有任何子节点的节点称为**叶子节点**。

树从一个节点到另一个及诶单的这一组边称为**路径**，以某种特定顺序访问树中所有的节点称为**树的遍历**。

二叉树是一种特殊的树，它的子节点个数不超过两个。在**查找方面速度快**(在链表上查找则不是这样)，在**添加或删除元素也非常快**（对数组执行添加或删除操作则不是这样）。一个父节点的两个子节点分别称为**左节点**和**右节点**。

二叉查找树是一种特殊的二叉树，**相对较小的值保存在左节点中，较大的值保存在右节点中**。这一特性使得查找的效率很高，对于数值型和非数值型的数据，比如单词和字符串，都是如此。

实现二叉查找树(BST)

1. 需要有插入insert()方法，向树中加入新节点
2. 其次遍历二叉查找树。遍历有三种方式：**中序**、**先序**和**后序**。

- **中序遍历**按照节点上的键值，以升序访问BST上的所有节点
- **先序遍历**先访问根节点，然后以同样方式访问左子树和右子树
- **后序遍历**先访问叶子节点，从左子树到右子树，再到根节点

1. 查找
   - 查找给定值
   - 查找最小值
   - 查找最大值
2. 删除节点

```typescript
// 二叉查找树(BST)
/**
 * NodeItem: 节点对象
 */
class NodeItem {
  data;
  left;
  right;
  /**
   * 构造函数
   * @param data 数据
   * @param left 左节点
   * @param right 右节点
   */
  constructor(data, left, right) {
    this.data = data;
    this.left = left;
    this.right = right;
  }

  /**
   * show: 显示保存在节点中的数据
   */
  show() {
    return this.data;
  }
}

/**
 * 二叉查找树，该类的构造函数将根节点初始化为null，以此创建一个空节点
 * BST首先要有一个insert()方法，用来向树中加入新节点。过程如下：
 *  首先要创建一个Node对象，将数据传入该对象保存
 *  其次检查BST是否有根节点，如果没有，那么是课新树，该节点就是根节点，到此完成。否则，进入下一步
 *  如果待插入节点不是根节点，那么就需要准备遍历BST，找到插入的适当位置。该过程类似于遍历链表。用一个变量存储当前节点，一层层地遍历BST
 *  进入BST后，下一步就要决定将节点放在哪个地方。找到正确的插入点时，会跳出循环。查找插入点的算法如下
 *    1. 设根节点为当前节点
 *    2. 如果待插入节点保存的数据小于当前节点，则设新的当前节点为原节点的左节点；反之，执行第4步
 *    3. 如果当前节点的左节点为null，就将新的节点插入这个位置，退出循环；反之，继续执行下一次循环
 *    4. 设新的当前节点为原节点的右节点
 *    5. 如果当前节点的右节点为null，就将新的节点插入这个位置，退出循环；反之，继续执行下一次循环
 */
class BST {
  root = null;

  insert(data) {
    var n = new NodeItem(data, null, null);
    if (this.root == null) {
      this.root = n;
    } else {
      var current = this.root;
      var parent;
      while (true) {
        parent = current;
        if (data < current.data) {
          current = current.left;
          if (current == null) {
            parent.left = n;
            break;
          }
        } else {
          current = current.right;
          if (current == null) {
            parent.right = n;
            break;
          }
        }
      }
    }
  }

  /**
   * inOrder: 中序遍历，以递增的方式输出
   */
  inOrder(node) {
    if (node != null) {
      this.inOrder(node.left);
      console.log(node.show() + ' ');
      this.inOrder(node.right);
    }
  }

  /**
   * preOrder: 先序遍历
   */
  preOrder(node) {
    if (node != null) {
      console.log(node.show() + ' ');
      this.preOrder(node.left);
      this.preOrder(node.right);
    }
  }

  /**
   * postOrder: 后序遍历
   */
  postOrder(node) {
    if (node != null) {
      this.postOrder(node.left);
      this.postOrder(node.right);
      console.log(node.show() + ' ');
    }
  }

  /**
   * getMin: 查找最小值
   * 较小值总是在左节点上，在BST上查找最小值，只需要遍历左子树，直到找到最后一个节点
   */
  getMin() {
    var current = this.root;
    while (!(current.left == null)) {
      current = current.left;
    }
    return current.data;
  }

  /**
   * getMax: 查找最大值
   * 较大值总是在右节点上，只需遍历右子树
   */
  getMax() {
    var current = this.root;
    while (!(current.right == null)) {
      current = current.right;
    }
    return current.data;
  }

  /**
   * find: 查找给定值，需要比较该值和当前节点上的值的大小。通过比较，确定如果给定值不在当前及诶单时，该向左遍历还是向右遍历
   */
  find(data) {
    var current = this.root;
    while (current != null) {
      if (current.data == data) return current;
      else if (data < current.data) current = current.left;
      else current = current.right;
    }
    return null;
  }

  /**
   * remove
   */
}

var nums = new BST();
nums.insert(23);
nums.insert(45);
nums.insert(67);
nums.insert(5);
nums.insert(99);
nums.insert(34);
//    23
// 5      45
//     34    67
//              99

nums.inOrder(nums.root);
// 5
// 23
// 34
// 45
// 67
// 99
nums.preOrder(nums.root);
// 23
// 5
// 45
// 34
// 67
// 99
nums.postOrder(nums.root);
// 5
// 34
// 99
// 67
// 45
// 23
console.log(nums.getMin());
// 5
console.log(nums.getMax());
// 99
console.log(nums.find(45));
// NodeItem {
//   data: 45,
//   left: NodeItem { data: 34, left: null, right: null },
//   right:
//    NodeItem {
//      data: 67,
//      left: null,
//      right: NodeItem { data: 99, left: null, right: null } } }
```

## 图和图算法

图由**边的集合**及**顶点**的集合组成。边由顶点对(v1, v2)来定义，v1和v2分别是图中的两个顶点。顶点也有权重，称为成本。如果一个图的顶点对是有序的，则称为**有向图**。在对有向图中的顶点对排序后，便可以在两个顶点之间绘制一个箭头。有向图表明了顶点的流向。如果是无序的，则称为**无序图**，或无向图。

图中的一系列顶点构成**路径**，路径中所有的顶点都由**边连接**。**路径的长度**用路径中第一个顶点到最后一个顶点之间边的数量表示。由指向自身的顶点组成的路径称为**环**，环的长度为0。

**圈**是至少有一条边的路径，且路径的第一个顶点和最后一个顶点相同。无论是有向图还是无向图，只要是没有重复边或重复顶点的圈，就是一个**简单圈**。除了第一个和最后一个顶点以外，路径的其他顶点有重复的圈称为**平凡圈**。

如果两个顶点之间有路径，那么这两个顶点就是**强连通**的。如果有向图的所有的顶点都是**强连通**的，那么这个有向图也是**强连通**的。

图在现实生活中经常被使用。如交通流量建模，运输系统建模，局域网和广域网等。

**表示图的边的方法**称为**邻接表或邻接表数组**。这种方法将边存储为由顶点的相邻顶点列表构成的数组，并以此顶点作为索引。还有一种表示图边的方法被称为**邻接矩阵**。它是一个二维数组，其中的元素表示两个顶点之间是否有一条边。

### 搜索图

图上可以执行两种基础搜索:**深度优先搜索**和**广度优先搜索**。

- 深度优先搜索 - 包括从一条路径的起始顶点开始追溯，直到到达最后一个顶点，然后回溯，继续追溯下一条路径，直到到达最后的顶点，如此往复，直到没有路径为止。
- 广度优先搜索 - 从第一个顶点开始，尝试访问尽可能靠近它的顶点。本质上，这种搜索在图上是逐层移动的，首先检查最靠近第一个顶点的层，再逐渐向下移动到离起始顶点最远的层。

### 查找最短路径

图最常见的操作之一就是寻找从一个顶点到另一个顶点的最短路径。

在执行广度优先搜索时，会自动查找从一个顶点到另一个相连顶点的最短路径。**可以通过修改广度优先搜索算法，找出最短路径。**

### 拓扑排序

对一个有向无环图(Directed Acyclic Graph,DAG)G进行拓扑排序，是将G中所有顶点排成一个线性序列，使得图中任意一对顶点u和v，若边(u,v)∈E(G)，则u在线性序列中出现在v之前。

拓扑排序对应施工的流程图具有特别重要的作用，它决定哪些子工程必须要先执行，哪些子工程要在某些工程执行后才可以执行。

实现步骤：

1. 在有向图中选一个没有前驱的顶点并且输出
2. 删除所有和它有关的边
3. 重复上述两步，直至所有顶点输出，或者当前图中不存在无前驱的顶点为止，后者代表有向图是有环的。

有两种方法实现拓扑排序**Kahn算法**和**基于DFS的拓扑排序算法**

1. Kahn算法- 先使用一个栈保存入度为0的顶点，然后输出栈顶元素并且将和栈顶元素有关的边删除，减少和栈顶元素有关的顶点的入度数量并且把入度减少到0的顶点也入栈。
2. 基于DFS的拓扑排序算法 - 深度优先搜索，每次都沿着一条路径一直往下搜索，直到某个顶点没有了**出度**时，就停止递归，保存该顶点，回退到之前的顶点重新执行，**其实就是Kahn算法的逆过程，从出度的角度出发，从没有出度的顶点一直往上排序，倒序就是Kahn算法的结果**。

```typescript
// 图
/**
 * 创建Vertex类保存顶点和边
 * Vertex类有两个数据成员：一个用于标识顶点，另一个表明这个顶点是否被访问过的布尔值
 * @param label
 * @param wasVisited
 */
class Vertex {
  label;
  wasVisited;

  constructor(label, wasVisited) {
    this.label = label;
    this.wasVisited = wasVisited;
  }
}
// 将所有顶点保存到数组中，在图类里，可以通过他们在数组中的位置引用他们
/**
 * 表示边：图的实际信息都保存在边上面，因为它们描述了图的结构
 * 表示图的边的方法称为邻接表或邻接表数组
 * 这种方法将边存储为由顶点的相邻顶点列表构成的数组，并以此顶点作为索引
 * 
 * 还有一种表示图边的方法被称为邻接矩阵。它是一个二维数组，其中的元素表示两个顶点之间是否有一条边
 */

 /**
  * 构建图: 该类会记录该图表示了多少条边，并使用一个长度与图的顶点树相同的数组来记录顶点的数量。
  * 通过for循环为数组中的每个元素添加一个子数组来存储所有的相邻顶点，并将所有元素初始化为空字符串
  * @param vertices 顶点数
  * @param edges 边的数量
  * @param adj 相邻顶点的邻接表数组
  * @param marked_dfs 用于深度优先搜索缓存已经访问过的顶点，true即为访问过
  * @param marked_bfs 用于广度优先搜索缓存已经访问过的顶点，true即为访问过
  * @param edgeTo 记录从一个顶点到下一个顶点的所有边的映射
  * @param marked_bfs_top_sort 用于基于DFS的拓扑排序，缓存已经访问过的顶点，true即为访问过
  * @param stack 用于基于DFS的拓扑排序，按顺序缓存所有出度为0的顶点
  */
class Graph {
  vertices;
  edges = 0;
  adj = [];
  marked_dfs = [];
  marked_bfs = [];
  edgeTo = [];
  marked_bfs_top_sort = [];
  stack = [];

  constructor(v) {
    this.vertices = v;
    for (var i = 0; i < this.vertices; i++) {
      this.adj[i] = [];
      this.marked_dfs.push(false);
      this.marked_bfs.push(false);
    }
  }

  /**
  * addEdge: 添加一条边
  * 传入顶点A和B，函数会先查找顶点A的邻接表，将顶点B添加到列表中，然后再查找顶点B的邻接表，将顶点A加入到列表。最后，这个函数会将边数加1
  * @param v 顶点A
  * @param w 顶点B
  */
  addEdge(v, w) {
    this.adj[v].push(w);
    this.adj[w].push(v);
    this.edges++;
  }

  /**
  * showGraph: 通过打印所有顶点及其相邻顶点列表的方式显示图
  */
  showGraph() {
    for (var i = 0; i < this.vertices; i++) {
      let str = i + '->';
      for (var j = 0; j < this.vertices; j++) {
        if (this.adj[i][j] != undefined) {
          str += this.adj[i][j] + ' ';
        }
      }
      console.log(str);
    }
  }

  // 搜索图：确定从一个指定的顶点可以到达其他哪些顶点，经常对图执行的操作。
  /**
   * dfs: 深度优先搜索。包括从一条路径的起始顶点开始追溯，直到到达最后一个顶点，然后回溯，继续追溯下一条路径，直到到达最后的顶点，如此往复，直到没有路径为止
   * 访问一个没有访问过的顶点，将它标记为已访问，再递归地去访问在初始顶点的邻接表中其他没有访问过的顶点
   * 要运行该算法，需要添加一个数组，用来存储已经访问过的顶点，将它所有元素的值全部初始化为false
   */
  dfs(v) {
    this.marked_dfs[v] = true;
    if (this.adj[v] != undefined) {
      console.log(`dfs Visited vertex: ${v}`);
    }
    for (var w = 0; w < this.adj[v].length; w++) {
      if (!this.marked_dfs[this.adj[v][w]]) {
        this.dfs(this.adj[v][w]);
      }
    }
  }

  /**
   * bfs: 广度优先搜索。从第一个顶点开始，尝试访问尽可能靠近它的顶点。本质上，这种搜索在图上是逐层移动的，首先检查最靠近第一个顶点的层，再逐渐向下移动到离起始顶点最远的层。
   * 广度优先搜索算法使用了抽象的队列而不是数组来对已访问过的顶点进行排序，工作原理
   *  1. 查找与当前顶点相邻的未访问顶点，将其添加到已访问顶点列表及队列中
   *  2. 从图中取出下一个顶点v，添加到已访问的顶点列表
   *  3. 将所有与v相邻的未访问顶点添加到队列
   */
  bfs(v) {
    var queue = [];
    this.marked_bfs[v] = true;
    queue.push(v);
    while (queue.length > 0) {
      var s = queue.shift();
      if (this.adj[s] !== undefined) {
        console.log(`bfs Visited vertex: ${s}`);
      }
      for (var w = 0; w < this.adj[s].length; w++) {
        if (!this.marked_bfs[this.adj[s][w]]) {
          // 增加下一行用于记录路径
          this.edgeTo[this.adj[s][w]] = s;
          this.marked_bfs[this.adj[s][w]] = true;
          queue.push(this.adj[s][w]);
        }
      }
    }
  }

  /**
   * pathTo: 用于展示图中连接到不同顶点的路径。创建一个栈，用来存储于指定顶点有共同边的所有顶点
   * 查找最短路径可以直接使用广度优先搜索算法来实现，广度优先搜索天然支持，先执行bfs()，再执行该方法遍历edgeTo数组找到最短路径
   * @param v 要到达的顶点
   */
  pathTo(v) {
    var source = 0;
    if (!this.hashPathTo(v)) return undefined;
    var path = [];
    for (var i = v; i != source; i = this.edgeTo[i]) path.push(i);
    path.push(source);
    return path;
  }

  /**
   * hashPathTo: 用于判断该顶点是否已经广度优先查询过
   */
  hashPathTo(v) {
    return this.marked_bfs[v];
  }


  /**
   * topSortByDfs: 基于DFS的拓扑排序算法实现步骤
   */
  topSortByDfs() {
    for (var i = 0; i < this.vertices; i++) this.marked_bfs_top_sort.push(false);
    for (var i = 0; i < this.vertices; i++) {
      if (!this.marked_bfs_top_sort[i]) this.topSortDFS(i);
    }
    for (var i = this.stack.length - 1; i >= 0; i--) console.log(`topSortByDfs: ${this.stack[i]}`);
  }

  /**
   * topSortDFS: 该方法为dfs的变形，为了编写DFS拓扑排序算法实现的变形
   * @param v 
   */
  topSortDFS(v) {
    this.marked_bfs_top_sort[v] = true;
    for (var w = 0; w < this.adj[v].length; w++) {
      if (!this.marked_bfs_top_sort[this.adj[v][w]]) {
        this.topSortDFS(this.adj[v][w]);
      }
    }
    this.stack.push(v);
  }
}

var g = new Graph(5);
g.addEdge(0, 1);
g.addEdge(0, 2);
g.addEdge(1, 3);
g.addEdge(2, 4);
g.showGraph();
// 0-> 1 2
// 1-> 0 3
// 2-> 0 4
// 3-> 1
// 4-> 2
g.dfs(0);
// dfs Visited vertex: 0
// dfs Visited vertex: 1
// dfs Visited vertex: 3
// dfs Visited vertex: 2
// dfs Visited vertex: 4
g.bfs(0);
// bfs Visited vertex: 0
// bfs Visited vertex: 1
// bfs Visited vertex: 2
// bfs Visited vertex: 3
// bfs Visited vertex: 4
var paths = g.pathTo(4);
var log = '';
while (paths.length > 0) {
  if (paths.length > 1) {
    log += paths.pop() + '-';
  } else {
    log += paths.pop();
  }
}
console.log(log);
// 0-2-4
g.topSortByDfs();
// topSortByDfs: 0
// topSortByDfs: 2
// topSortByDfs: 4
// topSortByDfs: 1
// topSortByDfs: 3
```

## 排序

> 排序是对一组序列按照某个关键字进行排序，可以分为升序和降序

评价一个排序算法的优与否，是有几个评判标准的

- 稳定 - 即如果a和b两个数据相同，假设a在b的前面，排序完成后，a仍然在b的前面称为稳定，否则如果可能顺序会发生改变称为不稳定
- 时间复杂度 - 即排序算法的所耗费的时间
- 空间复杂度 - 即运行程序所需要的内存的大小

排序还分为**内排序**和**外排序**两种

- 内排序 - 所有排序操作都在内存中完成
- 外排序 - 数据太大，把数据移到磁盘中，要通过磁盘和内存的数据传输才能完成

排序算法方式很多，每种算法在上面所提到的评判标准都不一样，以下表格从网络中查找得到

| 排序算法 | 平均时间复杂度 | 最好情况    | 最坏情况    | 空间复杂度 | 排序方式  | 稳定性 |
| -------- | -------------- | ----------- | ----------- | ---------- | --------- | ------ |
| 冒泡排序 | O(n^2)         | O(n)        | O(n^2)      | O(1)       | In-place  | 稳定   |
| 选择排序 | O(n^2)         | O(n^2)      | O(n^2)      | O(1)       | In-place  | 不稳定 |
| 插入排序 | O(n^2)         | O(n)        | O(n^2)      | O(1)       | In-place  | 稳定   |
| 希尔排序 | O(n*log n)     | O(n*log2 n) | O(n*log2 n) | O(1)       | In-place  | 不稳定 |
| 归并排序 | O(n*log n)     | O(n*log n)  | O(n*log n)  | O(n)       | Out-place | 稳定   |
| 快速排序 | O(n*log n)     | O(n*log n)  | O(n^2)      | O(log n)   | In-place  | 不稳定 |
| 堆排序   | O(n*log n)     | O(n*log n)  | O(n*log n)  | O(1)       | In-place  | 不稳定 |
| 计数排序 | O(n + k)       | O(n + k)    | O(n + k)    | O(k)       | Out-place | 稳定   |
| 桶排序   | O(n + k)       | O(n + k)    | O(n^2)      | O(k)       | Out-place | 稳定   |
| 基数排序 | O(n * k)       | O(n * k)    | O(n * k)    | O(n + k)   | Out-place | 稳定   |

n: 数据规模 k: "桶"的个数 In-place: 占用常数内存，不占用额外内存 Out-place: 占用额外内存

![sort-algorithms](http://reyshieh.com/assets/sort-algorithms.png)

### 基本排序算法

#### 冒泡排序

```typescript
/**
 * CArray: 通用数组测试对象，封装常规操作：插入新数据，显示数组数据及调用不同的排序算法
 */
class CArray {
  dataStore = [];
  pos = 0;
  numElements;

  constructor(numElements) {
    this.numElements = numElements;
    this.pos = this.numElements;
  }

  /**
   * setData: 生成随机数组
   */
  setData() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
    }
  }

  /**
   * clear: 重置数组数据为0
   */
  clear() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = 0;
    }
  }

  /**
   * insert: 插入新数据
   * @param element 待插入数据
   */
  insert(element) {
    this.dataStore[this.pos++] = element;
  }

  /**
   * toString: 展示数组
   */
  toString() {
    let restr = '';
    for (let i = 0; i <= this.pos - 1; i++) {
      restr += this.dataStore[i] + ' ';
      if (i > 0 && i % 10 == 0) {
        restr += '\n';
      }
    }
    return restr;
  }

  /**
   * swap: 交换数组元素
   * @param arr 数组
   * @param index1 交换位置1
   * @param index2 交换位置2
   */
  swap(arr, index1, index2) {
    let tmp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tmp;
  }

  /**
   * bubbleSort: 冒泡排序是最慢的排序算法之一
   * 第一层for循环确认需要遍历的数组中的数据个数，原因是每一轮的遍历都会冒泡出一个处在正确位置的数据，就不需要再对这个数据进行比较的操作
   * 第二层for循环用于遍历第一层确认的个数的数组，做实际的排序
   */
  bubbleSort() {
    for (var outer = this.pos; outer >= 2; outer--)
      for (var inner = 0; inner < outer - 1; inner++) {
        if (this.dataStore[inner] > this.dataStore[inner + 1]) {
          this.swap(this.dataStore, inner, inner + 1);
        }
      }
  }
}

const myNums = new CArray(10);
myNums.setData();
console.log(myNums.toString());
myNums.bubbleSort();
console.log('After BubbleSort:');
console.log(myNums.toString());
// 0 1 1 7 9 9 0 9 0 0
// After BubbleSort:
// 0 0 0 0 1 1 7 9 9 9

```

#### 选择排序

```typescript
// 选择排序
/**
 * CArray: 通用数组测试对象，封装常规操作：插入新数据，显示数组数据及调用不同的排序算法
 */
class CArray {
  dataStore = [];
  pos = 0;
  numElements;

  constructor(numElements) {
    this.numElements = numElements;
    this.pos = this.numElements;
  }

  /**
   * setData: 生成随机数组
   */
  setData() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
    }
  }

  /**
   * clear: 重置数组数据为0
   */
  clear() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = 0;
    }
  }

  /**
   * insert: 插入新数据
   * @param element 待插入数据
   */
  insert(element) {
    this.dataStore[this.pos++] = element;
  }

  /**
   * toString: 展示数组
   */
  toString() {
    let restr = '';
    for (let i = 0; i <= this.pos - 1; i++) {
      restr += this.dataStore[i] + ' ';
      if (i > 0 && i % 10 == 0) {
        restr += '\n';
      }
    }
    return restr;
  }

  /**
   * swap: 交换数组元素
   * @param arr 数组
   * @param index1 交换位置1
   * @param index2 交换位置2
   */
  swap(arr, index1, index2) {
    let tmp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tmp;
  }

  /**
   * selectionSort: 选择排序从数组的开头开始，将第一个元素和其他元素进行比较
   * 检查完所有元素后，最小的元素会被放到数组的第一个位置，然后算法会从第二位置继续
   * 这个过程一直进行，当进行到数组的倒数第二个位置时，所有的数据便完成了排序
   * 外循环从数组的第一个元素移动到倒数第二个元素
   * 内循环从外循环所指向的下一个元素移动到最后一个元素，查找比当前外循环所指向的元素小的元素
   * 每次内循环迭代后，数组最小的值都会被赋值到合适的位置
   */
  selectionSort() {
    let min;
    for (var outer = 0; outer <= this.pos - 2; outer++) {
      min = outer;
      for (var inner = outer + 1; inner <= this.pos - 1; inner++) {
        if (this.dataStore[inner] < this.dataStore[min]) {
          min = inner;
        }
      }
      this.swap(this.dataStore, outer, min);
    }
  }
}

const myNums = new CArray(10);
myNums.setData();
console.log(myNums.toString());
myNums.selectionSort();
console.log('After SelectionSort:');
console.log(myNums.toString());
// 5 7 0 10 6 1 1 1 6 10
// After SelectionSort:
// 0 1 1 1 5 6 6 7 10 10
```

#### 插入排序

```typescript
// 插入排序
/**
 * CArray: 通用数组测试对象，封装常规操作：插入新数据，显示数组数据及调用不同的排序算法
 */
class CArray {
  dataStore = [];
  pos = 0;
  numElements;

  constructor(numElements) {
    this.numElements = numElements;
    this.pos = this.numElements;
  }

  /**
   * setData: 生成随机数组
   */
  setData() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
    }
  }

  /**
   * clear: 重置数组数据为0
   */
  clear() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = 0;
    }
  }

  /**
   * insert: 插入新数据
   * @param element 待插入数据
   */
  insert(element) {
    this.dataStore[this.pos++] = element;
  }

  /**
   * toString: 展示数组
   */
  toString() {
    let restr = '';
    for (let i = 0; i <= this.pos - 1; i++) {
      restr += this.dataStore[i] + ' ';
      if (i > 0 && i % 10 == 0) {
        restr += '\n';
      }
    }
    return restr;
  }

  /**
   * swap: 交换数组元素
   * @param arr 数组
   * @param index1 交换位置1
   * @param index2 交换位置2
   */
  swap(arr, index1, index2) {
    let tmp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tmp;
  }

  /**
   * insertionSort: 插入排序的过程类似于按数字或字母顺序对数据进行排序
   * 外循环将数据元素一一移动，而内循环则对外循环中选中的元素和它前面已经排过序的元素一一比较
   * 若外循环中选中的元素比内循环中选中的元素小，则内循环当前元素向右移动一位，直至内循环待比较的元素全部比较完成，将该元素放入到腾出空位的位置上
   * 依次操作即可
   */
  insertionSort() {
    let temp;
    let inner;
    for (var outer = 1; outer <= this.pos - 1; outer++) {
      temp = this.dataStore[outer];
      inner = outer;
      while (inner > 0 && this.dataStore[inner - 1] >= temp) {
        this.dataStore[inner] = this.dataStore[inner - 1];
        inner--;
      }
      this.dataStore[inner] = temp;
    }
  }
}

const myNums = new CArray(10);
myNums.setData();
console.log(myNums.toString());
myNums.insertionSort();
console.log('After InsertionSort:');
console.log(myNums.toString());
// 0 7 2 7 4 4 2 5 7 2
// After InsertionSort:
// 0 2 2 2 4 4 5 7 7 7
```

#### 基本排序算法的比较

**选择排序和插入排序要比冒泡排序快，插入排序是这三种算法中最快的。**

### 高级排序算法

高级算法通常被认为是处理大型数据集的最高效排序算法，他们处理的数据集可以达到上百万个元素，而不仅仅是几百个或者几千个。

#### 希尔排序

希尔排序在插入排序的基础上做了很大的改善。希尔排序的核心理念与插入排序不同，它会先比较距离较远的元素，而非相邻元素。和简单地比较相邻元素相比，使用这个方案可以使离正确位置很远的元素更快地回到合适的位置。当开始用这个算法遍历数据集时，所有元素之间的距离会不断减小，直到处理到数据集的末尾，这时算法比较的就是相邻元素了。

希尔排序的工作原理是，通过定义一个间隔序列来表示在排序过程中进行比较的元素之间有多远的间隔。可以动态定义这个间隔序列，但也可以提前定义好。公开定义的间隔序列可以为**701，301，132，57，23，10，4，1**。

```typescript
// 希尔排序
/**
 * CArray: 通用数组测试对象，封装常规操作：插入新数据，显示数组数据及调用不同的排序算法
 */
class CArray {
  dataStore = [];
  pos = 0;
  numElements;
  defaultGap = [5, 3, 1];

  constructor(numElements) {
    this.numElements = numElements;
    this.pos = this.numElements;
  }

  /**
   * setData: 生成随机数组
   */
  setData() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
    }
  }

  /**
   * clear: 重置数组数据为0
   */
  clear() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = 0;
    }
  }

  /**
   * insert: 插入新数据
   * @param element 待插入数据
   */
  insert(element) {
    this.dataStore[this.pos++] = element;
  }

  /**
   * toString: 展示数组
   */
  toString() {
    let restr = '';
    for (let i = 0; i <= this.pos - 1; i++) {
      restr += this.dataStore[i] + ' ';
      if (i > 0 && i % 10 == 0) {
        restr += '\n';
      }
    }
    return restr;
  }

  /**
   * swap: 交换数组元素
   * @param arr 数组
   * @param index1 交换位置1
   * @param index2 交换位置2
   */
  swap(arr, index1, index2) {
    let tmp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tmp;
  }

  /**
   * shellSort: 希尔排序是在插入排序的基础上做了很大的改进，希尔排序的核心理念是比较距离较远的元素，而非相邻的元素
   * 这样可以使离正确位置很远的元素更快地回到合适的位置
   * 希尔排序需要定义一个间隔序列来表示在排序过程中进行比较的元素之间的间隔
   * 以下算法中，使用defaultGap做为间隔，因此第一次处理数据时，会检查所有间隔为5的元素；下一次遍历检查所有间隔为3的元素。最后一次则会对间隔为1的元素，也就是相邻元素执行标准插入排序
   * 在开始做最后一次处理时，大部分元素都将在正确的位置，算法就不必对很多元素进行交换了。这就是希尔排序比插入排序更高效的地方
   */
  shellSort() {
    for (var g = 0; g < this.defaultGap.length; g++) {
      for (var i = this.defaultGap[g]; i < this.pos; i++) {
        var temp = this.dataStore[i];
        for (var j = i; j >= this.defaultGap[g] && this.dataStore[j - this.defaultGap[g]] > temp; j -= this.defaultGap[g]) {
          this.dataStore[j] = this.dataStore[j - this.defaultGap[g]];
        }
        this.dataStore[j] = temp;
      }
    }
  }
}

const myNums = new CArray(100);
myNums.setData();
console.log(myNums.toString());
myNums.shellSort();
console.log('After ShellSort:');
console.log(myNums.toString());
// 35 43 5 27 24 16 67 87 27 83 80 
// 52 98 82 82 20 91 24 43 38 2 
// 51 39 13 80 65 73 88 91 20 25 
// 90 20 97 94 59 8 57 9 91 34 
// 66 21 57 48 87 4 7 94 92 79 
// 97 55 100 84 8 93 12 35 58 25 
// 50 30 51 69 92 51 61 91 98 71 
// 93 65 24 24 25 93 42 14 39 84 
// 80 34 35 65 0 37 94 69 93 41 
// 69 13 46 48 78 44 20 17 28 
// After ShellSort:
// 0 2 4 5 7 8 8 9 12 13 13 
// 14 16 17 20 20 20 20 21 24 24 
// 24 24 25 25 25 27 27 28 30 34 
// 34 35 35 35 37 38 39 39 41 42 
// 43 43 44 46 48 48 50 51 51 51 
// 52 55 57 57 58 59 61 65 65 65 
// 66 67 69 69 69 71 73 78 79 80 
// 80 80 82 82 83 84 84 87 87 88 
// 90 91 91 91 91 92 92 93 93 93 
// 93 94 94 94 97 97 98 98 100 
```

间隔序列除了可以自己制定，还可以通过一个公式来动态计算这个间隔数组

```js
var N = this.dataStore.length;
var h = 1;
while (h < N/3) {
    h = 3 * h + 1;
}
```

可以在上面的算法中增加一个方法，取名为dynamicShellSort

```typescript
  /**
   * dynamicShellSort: 和上面的shellSort相比，该方法的区别在于间隔数组是通过公式计算的，是个动态的值
   */
  dynamicShellSort() {
    var N = this.dataStore.length;
    var h = 1;
    while (h < N/3) {
      h = 3 * h + 1;
    }
    while (h >= 1) {
      for (var i = h; i < N; i++) {
        for (var j = i; j >= h && this.dataStore[j] < this.dataStore[j - h]; j -= h) {
          this.swap(this.dataStore, j, j - h);
        }
      }
      h = (h - 1) / 3;
    }
  }
```

但是无论使用硬编码间隔序列还是动态间隔序列，实际算法的效率是一样的，可以随意使用。

#### 归并排序

把一系列排好序的子序列合并成一个大的完整有序序列。在实际情况中，归并算法存在一些问题，当我们用这个算法对一个很大的数据集进行排序时，需要相当大的空间来合并存储两个子数组。但对于现在内存不那么昂贵，空间不是问题。

采用自底向上的归并排序来实现，实际该过程是非递归的。首先将数据集分解为一组只有一个元素的数组。然后通过创建一组左右子数组将它们慢慢合并起来，每次合并都保存一部分排好序的数据，直到最后剩下的这个数组所有的数据都已排序完成。

```typescript
import { arrayMethods } from "../../../../toolrepo/vue-sourcecode-analysis/V2.x/src/core/observer/array";

// 归并排序
/**
 * CArray: 通用数组测试对象，封装常规操作：插入新数据，显示数组数据及调用不同的排序算法
 */
class CArray {
  dataStore = [];
  pos = 0;
  numElements;

  constructor(numElements) {
    this.numElements = numElements;
    this.pos = this.numElements;
  }

  /**
   * setData: 生成随机数组
   */
  setData() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
    }
  }

  /**
   * getData: 获取dataStore值
   */
  getData() {
    return this.dataStore;
  }

  /**
   * clear: 重置数组数据为0
   */
  clear() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = 0;
    }
  }

  /**
   * insert: 插入新数据
   * @param element 待插入数据
   */
  insert(element) {
    this.dataStore[this.pos++] = element;
  }

  /**
   * toString: 展示数组
   */
  toString() {
    let restr = '';
    for (let i = 0; i <= this.pos - 1; i++) {
      restr += this.dataStore[i] + ' ';
      if (i > 0 && i % 10 == 0) {
        restr += '\n';
      }
    }
    return restr;
  }

  /**
   * swap: 交换数组元素
   * @param arr 数组
   * @param index1 交换位置1
   * @param index2 交换位置2
   */
  swap(arr, index1, index2) {
    let tmp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tmp;
  }

  /**
   * mergeSort
   */
  mergeSort(arr) {
    if (arr.length < 2) return;
    var step = 1;
    var left, right;
    while (step < arr.length) {
      left = 0;
      right = step;
      while (right + step <= arr.length) {
        this.mergeArrays(arr, left, left + step, right, right + step);
        left = right + step;
        right = left + step;
      }
      if (right < arr.length) this.mergeArrays(arr, left, left + step, right, arr.length);
      step *= 2;
    }
  }
  
  /**
   * mergeArrays: 实际用来排序子数组方法，传入5个参数
   * @param arr 排序的原数组
   * @param startLeft left数组的开始数组下标
   * @param stopLeft left数组的结束数组下标
   * @param startRight right数组的开始数组下标
   * @param stopRight right数组的结束数组下标
   */
  mergeArrays(arr, startLeft, stopLeft, startRight, stopRight) {
    var rightArr = new Array(stopRight - startRight + 1);
    var leftArr = new Array(stopLeft - startLeft + 1);
    var k = startRight;
    for (var i = 0; i < (rightArr.length - 1); i++) {
      rightArr[i] = arr[k];
      k++;
    }
    k = startLeft;
    for (var i = 0; i < (leftArr.length - 1); i++) {
      leftArr[i] = arr[k];
      k++;
    }
    rightArr[rightArr.length - 1] = Infinity; // 哨兵值
    leftArr[leftArr.length - 1] = Infinity; // 哨兵值
    var m = 0;
    var n = 0;
    for (var k = startLeft; k < stopRight; k++) {
      if (leftArr[m] <= rightArr[n]) {
        arr[k] = leftArr[m];
        m++;
      } else {
        arr[k] = rightArr[n];
        n++;
      }
    }
    console.log('left array - ' + leftArr);
    console.log('right array - ' + rightArr);
  }
}

const myNums = new CArray(10);
myNums.setData();
console.log(myNums.toString());
myNums.mergeSort(myNums.getData());
console.log('After mergeSort:');
console.log(myNums.toString());
// 8 7 6 9 8 7 8 1 6 5 
// left array - 8,Infinity
// right array - 7,Infinity
// left array - 6,Infinity
// right array - 9,Infinity
// left array - 8,Infinity
// right array - 7,Infinity
// left array - 8,Infinity
// right array - 1,Infinity
// left array - 6,Infinity
// right array - 5,Infinity
// left array - 7,8,Infinity
// right array - 6,9,Infinity
// left array - 7,8,Infinity
// right array - 1,8,Infinity
// left array - 6,7,8,9,Infinity
// right array - 1,7,8,8,Infinity
// left array - 1,6,7,7,8,8,8,9,Infinity
// right array - 5,6,Infinity
// After ShellSort:
// 1 5 6 6 7 7 8 8 8 9 
```

#### 快速排序

快速排序是处理大数据集最快的排序算法之一。通过递归的方式将数据依次分解为包含较大元素和较小元素的不同子序列。算法首先要选定基准值(pivot)。数据排序依据基准值进行。

快速排序的算法如下：

1. 选择一个基准元素，将列表分隔成两个子序列
2. 对列表重新排序，将所有小于基准值的元素放在基准值前面，大于基准值的元素放在基准值的后面
3. 分别对较小元素的子序列和较大元素的子序列重复步骤1和2

但要注意，快速排序算法适用大数据集合，在处理小数据集时性能反而会下降

```javascript
// 快速排序
var quickSort = function(list) {
  if (list.length === 0) return [];
  var lesser = [];
  var greater = [];
  var pivot = list[0]; // 基准值，比该值小的数存入lesser中，比该值大的数存入greater中
  for (var i = 1; i < list.length; i++) {
    if (list[i] < pivot) {
      lesser.push(list[i]);
    } else {
      greater.push(list[i]);
    }
  }
  return quickSort(lesser).concat(pivot, quickSort(greater));
}

var a = [];
for (var i = 0; i < 10; i++) a[i] = Math.floor(Math.random() * 100) + 1;
console.log(a);

console.log(quickSort(a));
// [ 57, 18, 99, 38, 15, 96, 3, 19, 76, 41 ]
// [ 3, 15, 18, 19, 38, 41, 57, 76, 96, 99 ]
```

#### 堆排序

#### 计数排序

#### 桶排序

#### 基数排序

### 检索算法

在列表中查找数据有两种方式: **顺序查找**和**二分查找**。顺序查找适用于元素随机排列的列表；二分查找适用于元素已排序的列表。二分查找效率更高，但必须在进行查找之前花费额外的时间将列表中的元素排序。

#### 顺序查找

顺序查找又称为线性查找。属于暴力查找技巧的一种，在执行查找时可能会访问到数据结构里的所有元素。

##### 使用自组织数据

对于未排序的数据集来说，当被查找的数据位于数据集的起始位置时，查找是最快、最成功的。通过将成功找到的元素置于数据集的起始位置，可以保证在以后的操作中该元素能被更快地查找到。

"80-20原则"就是指对某一数据集执行的 80%的查找操作都是对其中20%的数据元素进行查找。自组织的方式最终会把这20%的数据置于数据集的起始位置，这样便可以通过一个简单的顺序查找快速找到它们。

实现自组织，可以有多种方式

**第一种，在查找数据时，将找到的数据与当前存储在上一个位置的数据进行交换**：

```js
function seqSearch(arr, data) {
	for (var i = 0; i < arr.length; i++) {
        if (arr[i] === data) {
            if (i > 0) {
                swap(arr, i, i - 1);
            }
            return true;
        }
	}
	return false;
}

function swap(arr, index, index1) {
    temp = arr[index];
    arr[index] = arr[index1];
    arr[index1] = temp;
}
```

**第二种，将找到的元素移动到数据集的起始位置，但是如果这个元素已经很接近起始位置，则不会对它的位置进行交换**，仅当数据位于数据集的前20%元素之外时，该数据才需要被重新移动到数据集的起始位置：

```js
function seqSerach(arr, data) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === data && i > (arr.length * 0.2)) {
            swap(arr, i, 0);
            return true;
        } else if (arr[i] === data) {
            return true;
        }
    }
    return false;
}

function swap(arr, index, index1) {
    temp = arr[index];
    arr[index] = arr[index1];
    arr[index1] = temp;
}
```

#### 二分查找算法

```typescript
// 二分查找
/**
 * CArray: 通用数组测试对象，封装常规操作：插入新数据，显示数组数据及调用不同的排序算法
 */
class CArray {
  dataStore = [];
  pos = 0;
  numElements;

  constructor(numElements) {
    this.numElements = numElements;
    this.pos = this.numElements;
  }

  /**
   * setData: 生成随机数组
   */
  setData() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
    }
  }

  getData() {
    return this.dataStore;
  }

  /**
   * clear: 重置数组数据为0
   */
  clear() {
    for (var i = 0; i < this.numElements; i++) {
      this.dataStore[i] = 0;
    }
  }

  /**
   * insert: 插入新数据
   * @param element 待插入数据
   */
  insert(element) {
    this.dataStore[this.pos++] = element;
  }

  /**
   * toString: 展示数组
   */
  toString() {
    let restr = '';
    for (let i = 0; i <= this.pos - 1; i++) {
      restr += this.dataStore[i] + ' ';
      if (i > 0 && i % 10 == 0) {
        restr += '\n';
      }
    }
    return restr;
  }

  /**
   * swap: 交换数组元素
   * @param arr 数组
   * @param index1 交换位置1
   * @param index2 交换位置2
   */
  swap(arr, index1, index2) {
    let tmp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tmp;
  }

  /**
   * bubbleSort: 冒泡排序是最慢的排序算法之一
   * 第一层for循环确认需要遍历的数组中的数据个数，原因是每一轮的遍历都会冒泡出一个处在正确位置的数据，就不需要再对这个数据进行比较的操作
   * 第二层for循环用于遍历第一层确认的个数的数组，做实际的排序
   */
  bubbleSort() {
    for (var outer = this.pos; outer >= 2; outer--)
      for (var inner = 0; inner < outer - 1; inner++) {
        if (this.dataStore[inner] > this.dataStore[inner + 1]) {
          this.swap(this.dataStore, inner, inner + 1);
        }
      }
  }

  /**
   * binSearch: 二分查找法
   */
  binSearch(arr, data) {
    var upperBound = arr.length - 1;
    var lowerBound = 0;
    while (lowerBound <= upperBound) {
      var mid = Math.floor((upperBound + lowerBound) / 2);
      if (arr[mid] < data) {
        lowerBound = mid + 1;
      } else if (arr[mid] > data) {
        upperBound = mid - 1;
      } else {
        return mid;
      }
    }
    return -1;
  }
}

const myNums = new CArray(10);
myNums.setData();
console.log(myNums.toString());
myNums.bubbleSort();
console.log('After BubbleSort:');
console.log(myNums.toString());
var retVal = myNums.binSearch(myNums.getData(), 2);
if (retVal >= 0) {
  console.log('Find...');
} else {
  console.log('Not find...')
}
```

处理大数据集时二分查找要比顺序查找速度快