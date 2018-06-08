if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
}

const { join } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const basicConfig = require('./webpack.base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const resolve = dir => join(__dirname, '..', dir)

const webpackConfig = merge(basicConfig, {
    mode: 'production',
    // v1.0 vendor include vue/vue-router/vuex
    // v1.1 将vue、vuerouter、vuex拆分成三个chunk
    // v1.2 删除vue，vuerouter，vuex入口，改用Dll抽离
    entry: {
        'app': './src/main.js'
    },
    output: {
        path: resolve('my-blog'),
        publicPath: '/my-blog/',
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[id].[chunkhash:8].js'
    },
    // optimization: {
    //     minimizer: [
    //         new ParallelUglifyPlugin({
    //             cache: true,
    //             sourceMap: true
    //         }),
    //         new OptimizeCSSAssetsPlugin({})
    //     ]
    // },
    plugins: [
        // v1.2 增加了DllReferencePlugin配置
        new webpack.DllReferencePlugin({
            context: resolve(''),
            manifest: require('./vendor-manifest.json')
        }),
        // scope hoisting(作用域提升)
        new webpack.optimize.ModuleConcatenationPlugin(),
        // extract css into its own file
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css'
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
        new webpack.optimize.SplitChunksPlugin({
            // initial/async/all:初始块/按需块/所有块
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequest: 5,
            maxInitialRequest: 3,
            name: true
        }),
        // v1.0 直接分成两个chunk
        // 优化项：scope hoisting，
        // chunks: app/vendor
        // v1.1 将vue、vuerouter、vuex拆分成三个chunk
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.ejs',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // chunks: ['vue', 'vuerouter', 'vuex', 'app'],
            chunksSortMode: 'dependency'
        }),
        new CopyWebpackPlugin([
            {
                from: resolve('static'),
                to: resolve('my-blog/static'),
                ignore: ['.*']
            }
        ]),
        new CleanWebpackPlugin(['my-blog'], {
            root: resolve('./')
        })
    ]
})

if (process.env.npm_config_report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
