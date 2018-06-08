const { join } = require('path')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

const resolve = dir => join(__dirname, '..', dir)

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        vendor: [
            'vue/dist/vue.min.js',
            'vue-router',
            'vuex'
        ]
    },
    output: {
        path: resolve('static/js'),
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimizer: [
            new ParallelUglifyPlugin({
                cache: true,
                sourceMap: true
            }),
            new OptimizeCssAssetsPlugin({})
        ]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DllPlugin({
            path: resolve('webpack/[name]-manifest.json'),
            name: '[name]_library'
        })
    ]
}