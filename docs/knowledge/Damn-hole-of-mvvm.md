# MVVM

由三部分组成

- View：界面
- Model：数据模型
- ViewModel：作为桥梁负责沟通View和Model

在MVVM中，最核心的就是数据双向绑定，例如ng的脏数据检测，vue中的数据劫持

### 脏数据检测

当触发了指定事件后会进入脏数据检测，这时会调用**$digest**循环遍历所有的数据观察者，判断当前是否和先前的值有区别，如果检测到变化的话，会调用**$watch**函数，然后再次调用$digest循环到发现没有变化。循环至少为两次，至多为十次

赞数据检测虽然存在低效的问题，但是不关心数据是通过什么方式改变的，都可以完成任务，但是这在Vue中的双向绑定是存在问题的。并且脏数据检测可以实现批量检测出更新的值，再统一更新UI，大大减少操作DOM的次数。因此，低效也是相对的

### 数据劫持

Vue内部使用了Object.defineProperty()来实现双向数据绑定，通过函数可以监听到set和get的事件

```
var data = { name: 'xl' };
observe(data);
let name = data.name;
data.name = 'yx';

function obserse(obj) {
    // 判断类型
    if (!obj || typeof obj !== 'object') {
        return;
    }
    Object.keys(data).forEach(key => {
        defineReactive(data, key, data[key]);
    })
}
function defineReactive(obj, key, val) {
	// 递归子属性
    observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: false,
        set: function reactiveSetter (newVal) {
            console.log('change value');
            val = newVal;
        },
        get: function reactiveGetter () {
            console.log('get value');
            return val;
        }
    })
}
```

### Proxy与Object.defineProperty对比

Object.defineProperty缺陷

1. 只能对属性进行数据劫持，需要深度便利整个对象
2. 对于数组不能监听到数据的变化

反观Proxy，原生支持监听数组变化，并且可以直接对整个对象进行拦截

### Virtual Dom算法

时间复杂度o(n)

关键只对比同层的节点，而不是跨层对比

步骤：

1. 首先从上至下，从左往右遍历对象，也就是树的深度遍历，这一步中会给每个节点添加索引，便于最后渲染差异
2. 一旦节点有子元素，就去判断子元素是否有不同

