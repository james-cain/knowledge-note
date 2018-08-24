# React

### 生命周期

#### V16生命周期用法和建议

```
class ExampleComponent extends React.Component {
  // 用于初始化 state
  constructor() {}
  // 用于替换 `componentWillReceiveProps` ，该函数会在初始化和 `update` 时被调用
  // 因为该函数是静态函数，所以取不到 `this`
  // 如果需要对比 `prevProps` 需要单独在 `state` 中维护
  static getDerivedStateFromProps(nextProps, prevState) {}
  // 判断是否需要更新组件，多用于组件性能优化
  shouldComponentUpdate(nextProps, nextState) {}
  // 组件挂载后调用
  // 可以在该函数中进行请求或者订阅
  componentDidMount() {}
  // 用于获得最新的 DOM 数据
  getSnapshotBeforeUpdate() {}
  // 组件即将销毁
  // 可以在此处移除订阅，定时器等等
  componentWillUnmount() {}
  // 组件销毁后调用
  componentDidUnMount() {}
  // 组件更新后调用
  componentDidUpdate() {}
  // 渲染组件函数
  render() {}
  // 以下函数不建议使用
  UNSAFE_componentWillMount() {}
  UNSAFE_componentWillUpdate(nextProps, nextState) {}
  UNSAFE_componentWillReceiveProps(nextProps) {}
}
```

### setState

该API是异步的

设计目的减少重绘，将多次调用放在队列中，在恰当的时候统一进行更新过程

假如有一个需求，需要对state.count连续调用三次，每次都加一，最终要获取到为3的结果

若使用以下方式

```
handle() {
    this.setState({count: this.state.count + 1})
    this.setState({count: this.state.count + 1})
    this.setState({count: this.state.count + 1})
}
```

并不会得到想要的结果，等同于如下的代码

```
Object.assign(
	{},
	{count: this.state.count + 1},
	{count: this.state.count + 1},
	{count: this.state.count + 1},
}
```

正确的方式应该在setState内使用函数

```
handle() {
    this.setState((prevState) => ({ count: prevState.count + 1 }))
    this.setState((prevState) => ({ count: prevState.count + 1 }))
    this.setState((prevState) => ({ count: prevState.count + 1 }))
}
```

如果想每次调用后获得正确的state，可以在setState中传入第二个回调函数

```
handle() {
    this.setState((prevState) => ({ count: prevState.count + 1 }), () => {
        console.log(this.state);
    })
}
```

