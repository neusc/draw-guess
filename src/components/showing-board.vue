<template>
  <div>
    <canvas id="canvas" width="520" height="350" style="border: 1px solid #999;"></canvas>
    <div class="answer-box">
      <span>Answer: </span>
      <input class="answer" type="text" v-model.trim="answer">
      <button class="submit">提交</button>
    </div>
    <router-link :to="{path:'/'}">重新开始</router-link>
  </div>
</template>

<script>
export default {
  data () {
    return {
      answer: ''
    }
  },
  mounted () {
    let self = this
    const ws = new WebSocket('ws://localhost:8090')
    const canvas = document.getElementById('canvas')
    const cxt = canvas.getContext('2d')
    // 是否重新设定路径起点
    // 为了避免把路径起点重复定义在同一个地方
    let moveToSwitch = 1
    ws.onmessage = (msg) => {
      let pathObj = msg.data.split('.')
      cxt.strokeStyle = '#000'

      if (msg.data === '答对了！！' || msg.data === '答错了！！') {
        alert(msg.data)
      } else if (moveToSwitch && msg.data !== 'stop' && msg.data !== 'clear') { // moveToSwitch在开始作画之后置为0避免重新设定起点
        cxt.beginPath()
        cxt.moveTo(pathObj[0], pathObj[1])
        moveToSwitch = 0
      } else if (!moveToSwitch && msg.data === 'stop') {
        cxt.beginPath()
        cxt.moveTo(pathObj[0], pathObj[1])
        moveToSwitch = 1
      } else if (msg.data === 'clear') {
        cxt.clearRect(0, 0, 520, 520)
        self.answer = ''
      }
      // moveToSwitch置为0之后直接执行此函数
      cxt.lineTo(pathObj[2], pathObj[3])
      cxt.stroke()
    }

    ws.onopen = () => {
      let self = this
      let submitBtn = document.querySelector('.submit')
      // 发送答案到服务器
      submitBtn.onclick = () => {
        let keyword = self.answer
        ws.send(keyword)
      }
    }
  }
}
</script>

<style scoped>
  #canvas {
    background: lightblue;
  }

  .answer-box {
    margin: 10px 0;
  }
</style>
