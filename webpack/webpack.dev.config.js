const { join } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const basicConfig = require('./webpack.base.config')

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
}

console.log(process.env.NODE_ENV)

const resolve = dir => join(__dirname, '..', dir)

module.exports = merge(basicConfig, {
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
})
