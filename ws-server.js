/*
 * 服务器采用node.js进行搭建，使用ws库实现websocket功能
 * */
'use strict'
//实例化WebSocketServer对象，监听8090端口
const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8090})

//定义关键词词组
let wordArr = ['Monkey', 'Dog', 'Bear', 'Flower', 'Girl']

//监听连接事件,连接事件触发时，调用回调函数
wss.on('connection', function (ws) {
    console.log('connected.')

    //随机获取一个关键词
    //"=>" 是function的简写形式，支持expression 和 statement 两种形式
    let keyWord = ((arr) => {
        let num = Math.floor(Math.random() * arr.length)
        return arr[num]
    })(wordArr)

    //服务器接收客户端传来的消息
    //判断消息内容是否与关键词相同
    //同时向所有客户端派发消息
    ws.on('message', function (message) {
        console.log('received: %s', message)
        if (message == keyWord) {
            console.log('correct')
            wss.clients.forEach((client) => {
                client.send('答对了！！')
            })
        } else {
            console.log('wrong')
            wss.clients.forEach((client) => {
                client.send(message)
            })
        }
    })

    //服务器初始化时向所有客户端提供一个关键词
    wss.clients.forEach((client) => {
        client.send('keyword:' + keyWord)
    })
})