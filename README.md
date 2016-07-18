> 项目地址：https://github.com/neusc/draw-guess.git
## 下载&运行

```
git clone https://github.com/neusc/draw-guess.git

cd draw-guess

npm install

node ws-server.js // 开启websocket服务器

npm run dev  // node server.js运行客户端程序

然后浏览器打开localhost:8080即可
```


## 整体架构

首先分析整体架构部分：
![图片描述][1]

可以看到，整体架构非常简单，仅仅是一台服务器和两个客户端。
- WebSocket服务器：提供数据同步，内容分发功能，采用nodejs写成。
- 绘图画布：进行绘图的区域，同时能够获取关键词，其绘制的内容会同步到猜图画布中。
- 猜图画布：同步自绘图画布，输入框能够提交关键词，检测答案是否正确。

下面来看具体的代码实现。

## WebSocket服务器
服务器采用`node.js`进行搭建，使用了[`ws`库][2]实现websocket功能。新建一个名为`ws-socket.js`的文件，代码如下：
```
/*** ws-socket.js ***/

'use strict'
// 实例化WebSocketServer对象，监听8090端口
const WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8090})

// 定义关键词数组
let wordArr = ['Monkey', 'Dog', 'Bear', 'Flower', 'Girl']

wss.on('connection', (ws) => {
    console.log('connected.')
    
    // 随机获取一个关键词
    let keyWord = ((arr) => {
            let num = Math.floor(Math.random()*arr.length)
            return arr[num]
        })(wordArr)
        
    // 当服务器接收到客户端传来的消息时
    // 判断消息内容与关键词是否相等
    // 同时向所有客户端派发消息
    ws.on('message', (message) => {
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
    
    // 服务器初始化时即向客户端提供一个关键词
    wss.clients.forEach((client) => {
        client.send('keyword:' + keyWord)
    })
})
```
使用方法基本按照[`ws`库][3]的文档即可。其中`ws.on('message', (message) => { .. })`方法会在接收到从客户端传来消息时执行，利用这个方法，我们可以从绘图画布不断地向服务器发送绘图位点的坐标，再通过`.send()`方法把坐标分发出去，在猜图画布中获取坐标，实现绘图数据的同步。

## 客户端结构
作为客户端，我选择了`vue`进行开发，原因是因为`vue`使用简单快速。事先说明，本项目仅仅作为日常学习练手的项目而非vue的使用，所以有蛮多地方我是图方便暴力使用诸如`document.getElementById()`之类的写法的，以后有机会再改成符合`vue`审美的代码吧~

客户端结构如下：
```
|
|-- script
|       |-- components
|       |        |-- drawing-board.vue
|       |        |-- showing-board.vue
|       |
|       |-- App.vue
|       |
|       |-- index.js
|
|-- index.html
```
详细代码请直接浏览[项目][4]，这里仅对关键部分代码进行剖析。

## 绘图画布
位于`./script/components/`的`drawing-board.vue`文件即为绘图画布组件。首先我们定义一个`Draw`类，里面是所有绘图相关的功能。
```
/*** drawing-board.vue ***/


'use strict'

class Draw {
    constructor(el) {
        this.el = el
        this.canvas = document.getElementById(this.el)
        this.cxt = this.canvas.getContext('2d')
        this.stage_info = canvas.getBoundingClientRect()
        // 记录绘图位点的坐标
        this.path = {
            beginX: 0,
            beginY: 0,
            endX: 0,
            endY: 0
        }
    }
    // 初始化
    init(ws, btn) {
        this.canvas.onmousedown = () => {
            this.drawBegin(event, ws)
        }
        this.canvas.onmouseup = () => {
            this.drawEnd()
            ws.send('stop')
        }
        this.clearCanvas(ws, btn)
    }
    
    drawBegin(e, ws) {
        window.getSelection() ? window.getSelection().removeAllRanges() : document.selection.empty()
        this.cxt.strokeStyle = "#000"
        
        // 开始新的路径（这一句很关键，你可以注释掉看看有什么不同）
        this.cxt.beginPath()
        this.cxt.moveTo(
            e.clientX - this.stage_info.left,
            e.clientY - this.stage_info.top
        )
        // 记录起点
        this.path.beginX = e.clientX - this.stage_info.left
        this.path.beginY = e.clientY - this.stage_info.top

        document.onmousemove = () => {
            this.drawing(event, ws)
        }
    }
    
    drawing(e, ws) {
        this.cxt.lineTo(
            e.clientX - this.stage_info.left,
            e.clientY - this.stage_info.top
        )
        // 记录终点
        this.path.endX = e.clientX - this.stage_info.left
        this.path.endY = e.clientY - this.stage_info.top
        // 把位图坐标发送到服务器
        ws.send(this.path.beginX + '.' + this.path.beginY + '.' + this.path.endX + '.' + this.path.endY)

        this.cxt.stroke()
    }
    
    drawEnd() {
        document.onmousemove = document.onmouseup = null
    }
    
    clearCanvas(ws, btn) {
        // 点击按钮清空画布
        btn.onclick = () => {
            this.cxt.clearRect(0, 0, 500, 500)
            ws.send('clear')
        }
    }
}
```
嗯，相信看代码很容易就看懂了当中逻辑，关键就是在`drawing()`的时候要不断地把坐标发送到服务器。

定义好`Draw`类以后，在`ready`阶段使用即可：
```
ready: () => {
        const ws = new WebSocket('ws://localhost:8090')
        let draw = new Draw('canvas')
        // 清空画布按钮
        let btn = document.getElementById('btn')
        // 与服务器建立连接后执行
        ws.onopen = () => {
            draw.init(ws, btn)
        }
        // 判断来自服务器的消息并操作
        ws.onmessage = (msg) => {
            msg.data.split(':')[0] == 'keyword' ?
                document.getElementById('keyword').innerHTML = msg.data.split(':')[1] :
                false
        }
    }
```

## 猜图画布
猜图画布很简单，只需要定义一个canvas画布，然后接收服务器发送来的坐标并绘制即可。看代码：
```
ready: () => {
            'use strict'
            const ws = new WebSocket('ws://localhost:8090');
            const canvas = document.getElementById('showing')
            const cxt = canvas.getContext('2d')
            // 是否重新设定路径起点
            // 为了避免把路径起点重复定义在同一个地方
            let moveToSwitch = 1
            ws.onmessage = (msg) => {
              let pathObj = msg.data.split('.')
              cxt.strokeStyle = "#000"
              
              if (moveToSwitch && msg.data != 'stop' && msg.data != 'clear') {
                  cxt.beginPath()
                  cxt.moveTo(pathObj[0], pathObj[1])
                  moveToSwitch = 0
              } else if (!moveToSwitch && msg.data == 'stop') {
                  cxt.beginPath()
                  cxt.moveTo(pathObj[0], pathObj[1])
                  moveToSwitch = 1
              } else if (moveToSwitch && msg.data == 'clear') {
                  cxt.clearRect(0, 0, 500, 500)
              } else if (msg.data == '答对了！！') {
                  alert('恭喜你答对了！！')
              }

              cxt.lineTo(pathObj[2], pathObj[3])
              cxt.stroke()
            }

            ws.onopen = () => {
                let submitBtn = document.getElementById('submit')
                // 发送答案到服务器
                submitBtn.onclick = () => {
                    let keyword = document.getElementById('answer').value
                    ws.send(keyword)
                }
            }
        }
```
到这里，游戏已经可以玩啦！不过还有很多细节是有待加强和修改的，比如可以给画笔选择颜色啊，多个用户抢答计分啊等等。

## 后记
使用node+websocket+vue+canvas构建的一个小游戏，对之前我所不熟悉的领域有了一个基本的了解,受益匪浅！
ES6语法确实比以往代码精简了许多，尤其是class和module的引入使代码清新了许多！

  [1]: https://segmentfault.com/img/bVyv9d
  [2]: https://github.com/websockets/ws
  [3]: https://github.com/websockets/ws
  [4]: https://github.com/neusc/draw-guess