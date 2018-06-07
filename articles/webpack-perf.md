## Webpack打包优化—以blog站点开发为例

前段花了时间阅读了部分的webpack的源码，意识到webpack对于前端开发的重要性，于是下定决心，以开发一个blog为例，记录我学习webpack打包优化的心得。

当今打包工具众多，诸如`grunt`，`gulp`，`rollup`，`webpack`，`parcel`... webpack从中脱颖而出，各大框架基本都基于webpack做了自己的cli。本人开发技术栈为vue、react，之前一直都是使用官方scaffold，并没有花心思研究webpack，因为现在遇到了相关的需求，导致一发不可收拾。

blog的webpack版本为：`4.11.1`

### 初构webpack配置

配置中引用的包如图

![webpack-configuration](images/webpack-configuration.png)

![webpack-configuration2](images/webpack-configuration2.png)

配置`webpack.base.config.js`

```
module: {
    rules: [
    {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
    },
    {
        enforce: 'pre',
        test: /\.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
    },
    {
        test: /\.js$/,
        loader: 'happypack/loader?id=happy-babel-js',
        exclude: '/node_modules/',
        include: [resolve('src')]
    },
    {
        test: /\.css$/,
        use: [
            env !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader'
        ]
    },
    {
        test: /\.less$/,
        use: [
            env !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader, // create style nodes from js string
            'css-loader', // translate css into commonjs
            'less-loader' // compile less to css
    	]
    },
    {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
            limit: 10000,
            name: 'img/[name].[hash:8].[ext]'
        }
    },
    {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
            limit: 10000,
            name: 'fonts/[names].[hash:8].[ext]'
        }
    },
    {
        test: /\.md$/,
        loader: 'happypack/loader?id=happy-md',
        options: markdown
    },
    {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [resolve('src')],
        exclude: /node_modules/,
        options: {
            loaders: {
                css: [
                    env !== 'production' ? 'vue-style-loader' : MiniCssExtractPlugin.loader
                ],
                less: [
                    env !== 'production' ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                    'less-loader'
                ]
            }
    	}
    }
    ]
},
plugins: [
    new ProgressBarPlugin({
        format: '  build [:bar]' + chalk.green.bold(':percent') + ':elapsed seconds'
    }),
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
    createHappyPlugin('happy-babel-js', ['babel-loader']),
    createHappyPlugin('happy-md', ['vue-markdown-loader']),
    // eslint-loader seem to try to access this.options which was removed.
    new webpack.LoaderOptionsPlugin({ options: {} })
],
resolve: {
    extensions: ['.vue', '.js', '.json'],
    modules: [
    	resolve('src'),
    	'node_modules'
    ],
    alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src')
    }
}
```

配置`webpack.dev.config.js`

```
mode: 'development',
entry: {
	app: './src/main.js'
},
output: {
    filename: 'js/[name].js',
    path: resolve('dist'),
    publicPath: '/'
},
devtool: '#cheap-module-eval-source-map',
devServer: {
    contentBase: resolve('/'),
    compress: true,
    hot: true,
    inline: true,
    publicPath: '/',
    port: '1574',
    stats: 'minimal',
    host: 'localhost'
},
plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.html',
        inject: true,
        chunks: ['app']
    })
]
```

配置`webpack.build.config.js`

```
mode: 'production',
// v1.0 vendor include vue/vue-router/vuex
entry: {
    'app': './src/main.js',
    'vendor': [
        'vue',
        'vue-router',
        'vuex'
    ]
},
output: {
    path: resolve('my-blog'),
    publicPath: '/my-blog/',
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[id].[chunhash:8].js'
},
plugins: [
    // scope hoisting(作用域提升)
    new webpack.optimize.ModuleConcatenationPlugin(),
    // extract css into its own file
    new MiniCssExtractPlugin({
    	filename: 'css/[name].[contenthash:8].css'
    }),
    // compress extracted css.
    new OptimizeCSSAssetsPlugin({}),
    new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }),
    // replace 'uglifyjs-webpack-plugin'
    new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
            output: {
                comments: false,
                beautify: false
            },
            compress: {
                warnings: false,
                drop_console: true,
                collapse_vars: true
            }
        }
    }),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.html',
        inject: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
        },
        chunks: ['vendor', 'app'],
        chunksSortMode: 'dependency'
    })
]
```

