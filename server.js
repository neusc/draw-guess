/*
* webpack-dev-server是一个小型的node.js Express服务器,
* 使用它，可以为webpack打包生成的资源文件提供Web服务
* */

//Node提供了exports和require两个对象,其中exports是模块公开的接口
//require用于从外部获取一个模块接口,即所获取模块的exports对象
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.dev.js');
var compiler = webpack(config);

new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
}).listen(8080, 'localhost', function (err) {
    if (err) {
        console.log(err);
    }
    console.log('Listening at localhost:8080');
});