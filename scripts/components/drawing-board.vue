<template>
    <canvas id="canvas" width="520" height="350" style="border: 1px solid #999;"></canvas>
    <div id="keyword-box">
        <span>Keyword: </span>
        <span id="keyword"></span>
    </div>
    <button id="btn">清空画布</button>
</template>

<script>
'use strict'

class Draw {
    constructor(el) {
        this.el = el
        this.canvas = document.getElementById(this.el)
        //取得绘图上下文的引用
        this.cxt = this.canvas.getContext('2d')
        //返回canvas画布矩形对象，包含四个属性：left、top、right和bottom,分别表示元素各边与页面上边和左边的距离
        this.stage_info = this.canvas.getBoundingClientRect()
        //记录绘图位点坐标
        this.path = {
            beginX: 0,
            beginY: 0,
            endX: 0,
            endY: 0
        }
    }

    //初始化
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
        //描边样式
        this.cxt.strokeStyle = "#000"

        //开始新的路径，清除以前的路径
        this.cxt.beginPath()
        //指定绘图起点
        this.cxt.moveTo(
            e.clientX - this.stage_info.left,
            e.clientY - this.stage_info.top
        )

        //记录起点坐标
        this.path.beginX = e.clientX - this.stage_info.left
        this.path.beginY = e.clientY - this.stage_info.top

        document.onmousemove = () => {
            this.drawing(event, ws)
        }
        // document.onmouseup = this.drawEnd
    }
    //不间断发送绘图坐标
    drawing(e, ws) {
        //绘制路径但并没有在网页中显示
        this.cxt.lineTo(
            e.clientX - this.stage_info.left,
            e.clientY - this.stage_info.top
        )

        //记录终点坐标
        this.path.endX = e.clientX - this.stage_info.left
        this.path.endY = e.clientY - this.stage_info.top
        //把位图坐标发送到服务器
        ws.send(this.path.beginX + '.' + this.path.beginY + '.' + this.path.endX + '.' + this.path.endY)

        //根据路径绘制路线
        this.cxt.stroke()
    }
    drawEnd() {
        document.onmousemove = document.onmouseup = null
    }
    clearCanvas(ws, btn) {
        //点击按钮清空画布
        btn.onclick = () => {
            this.cxt.clearRect(0, 0, 520, 520)
            ws.send('clear')
        }
    }
}

export default {
    //Vue提供的生命周期钩子函数
    ready() {
        const ws = new WebSocket('ws://localhost:8090')
        let draw = new Draw('canvas')
        //清空画布按钮
        let btn = document.getElementById('btn')
        //与服务器建立连接后执行
        ws.onopen = () => {
            draw.init(ws, btn)
        }
        //获取服务器随机生成的关键字
        ws.onmessage = (msg) => {
            msg.data.split(':')[0] == 'keyword' ?
                document.getElementById('keyword').innerHTML = msg.data.split(':')[1] : false
        }
    }
}
</script>

<style lang="less">
    #canvas {
        background: pink;
        cursor: default;
    }
    #keyword-box {
        margin: 10px 0;
    }
</style>