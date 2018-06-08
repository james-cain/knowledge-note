const { join } = require('path')
const os = require('os')
const chalk = require('chalk')
const webpack = require('webpack')
const Happypack = require('happypack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const hljs = require('highlight.js')
const env = process.env.NODE_ENV

const happyThreadPool = Happypack.ThreadPool({ size: os.cpus().length })
const markdown = require('markdown-it')({
    highlight (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>
                            ${hljs.highlight(lang, str, true).value}
                        </code></pre>`
            } catch (_) {
                console.log(_)
            }
        }
        return `<pre class="hljs"><code> ${markdown.utils.escapeHtml(str)}</code></pre>`
    }
})

const createHappyPlugin = (id, loaders) => {
    return new Happypack({
        id,
        loaders,
        threadPool: happyThreadPool
    })
}

const resolve = dir => join(__dirname, '..', dir)

module.exports = {
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     loader: 'eslint-loader',
            //     exclude: /node_modules/
            // },
            // {
            //     enforce: 'pre',
            //     test: /\.vue$/,
            //     loader: 'eslint-loader',
            //     exclude: /node_modules/
            // },
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
}
