# babel7

### preset-env

@babel/preset-env是@babel/preset-es2015、@babel/preset-es2016、@babel/preset-es2017的整合。推荐不使用babel-preset-latest

#### .browserslistrc

推荐使用该配置来自动检测编译

####useBuiltIns（usage|entry|false）

- usage

  会自动检测文件，将需要的polyfills自动导入到公共文件中，相同的polyfill只会加载一次

- entry

  只有在app中通过requrie('@babel/polyfill')方式引入，才能使用entry配置方式，若@babel/polyfill引用了多次将会抛出异常

- false

### plugin-transform-runtime

来源：

1. 由于Babel利用丰富的helpers充当通用functions。在之前情况中，这些相同的helpers会出现在每个文件中，造成文件的重复占用资源。@babel/plugin-transform-runtime诞生了，它依赖于@babel/runtime，这样使资源重复现象杜绝
2. 为你的代码创建一个sandboxed环境。之前情况中，使用@bebel/polyfill和built-ins，例如Promise、Set和Map，会在全局对象中创建方法，导致污染你的全局环境。在应用开发或者命令行工具中，影响较小，但在开发library时，这个就会很头疼，你无法保证在使用你的library的同事的开发环境是否会产生影响。
3. built-ins方式实际使用的是core-js，因此同样可以直接require core-js实现

options

- helpers（默认true）

  是否需要提取Babel helpers，减少不必要的冗余

- polyfill（默认true）

  是否需要使用built-ins（如Promise、Set、Map、etc.）转换成使用没有全局污染的polyfill

- regenerator（默认true）

  是否将generator functions 转换成使用generator runtime以不污染全局对象

- moduleName（默认@babel/runtime）

- useBuiltIns（默认flase）

  disabled（false）-将会使用core-js的polyfills

  enabled（true）-将不会使用core-js的polyfills

- useESModules（默认false）

  disabled（false）将会转换成__esModule方式

  enabled（true）-将不会通过@babel/plugin-transform-modules-commonjs执行

### tranform-runtime VS babel-polyfill

- babel-polyfill 是当前环境注入这些 es6+ 标准的垫片，好处是引用一次，不再担心兼容，而且它就是全局下的包，代码的任何地方都可以使用。缺点也很明显，它会污染原生的一些方法，polyfill 把原生的方法重写了，如果当前项目已经有一个 polyfill 的包了，那你只能保留其一。而且一次性引入这么一个包，会大大增加体积。如果你只是用几个特性，就没必要了，如果你是开发较大的应用，而且会频繁使用新特性并考虑兼容，那就直接引入吧。
- transform-runtime 是利用 plugin 自动识别并替换代码中的新特性，你不需要再引入，只需要装好 babel-runtime 和 配好 plugin 就可以了。好处是按需替换，检测到你需要哪个，就引入哪个 polyfill，如果只用了一部分，打包完的文件体积对比 babel-polyfill 会小很多。而且 transform-runtime 不会污染原生的对象，方法，也不会对其他 polyfill 产生影响。所以 transform-runtime 的方式更适合开发工具包，库，一方面是体积够小，另一方面是用户（开发者）不会因为引用了我们的工具，包而污染了全局的原生方法，产生副作用，还是应该留给用户自己去选择。缺点是随着应用的增大，相同的 polyfill 每个模块都要做重复的工作（检测，替换），虽然 polyfill 只是引用，编译效率不够高效。**另外，instance 上新添加的一些方法，babel-plugin-transform-runtime 是没有做处理的，比如 数组的 includes, filter, fill 等，这个算是一个关键问题吧，直接推荐用 polyfill。**

另外，关于 babel-runtime 为什么是 dependencies 依赖。它只是一个集中了 polyfill 的 library，对应需要的 polyfill 都是要引入项目中，并跟项目代码一起打包的。不过它不会都引入，你用了哪个，plugin 就给你 require 哪个。所以即使你最终项目只是 `require('babel-runtime/core-js/object/values')`其中的一个文件，但是对于这包来说，也是生产依赖的。

注意：babel-polyfill 并不是一定会污染全局环境，在引入这个 js，并运行的时候，它会先判断当前有没有这个方法，在看要不要重写。