/**
 * Dev mode config
 */

var webpack = require('webpack');
// NodeJS中的Path对象，用于处理目录的对象，提高开发效率
var path = require('path');

module.exports = {
    // 入口文件地址
    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/dev-server',
        './scripts/index'
    ],
    //输出
    output: {
        //当前模块文件所在目录的完整绝对路径
        path: __dirname,
        filename: 'bundle.js',
        // 公共文件生成的地址
        publicPath: '/dist/'
    },
    resolve: {
        // require时省略的扩展名，如：require('module') 不需要module.js
        extensions: ['', '.js']
    },
    // 开启source-map，webpack有多种source-map，在官网文档可以查到
    devtool: 'eval-source-map',
    plugins: [
        //热模块替换,在前端代码变动的时候无需整个刷新页面，只把变化的部分替换掉
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    //加载器模块
    module: {
        //加载器
        loaders: [
            // 转化ES6的语法
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: path.join(__dirname, 'scripts')
            }, {
                test: /\.less?$/,
                loader: 'style!css!less'
            },
            // 解析.vue文件
            {
                test: /\.vue$/,
                loader: 'vue'
            }
        ]
    },
    vue: {
        loaders: {
            js: 'babel'
                // js: 'babel!eslint'
        }
    },
}
