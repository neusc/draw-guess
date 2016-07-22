<template>
    <button @click='draw'>我来画</button>
    <button @click='show'>我来猜</button>
    <!-- <router-view> 用于渲染匹配的组件 -->
    <router-view></router-view>
</template>

<script>
//    import Vue from 'vue'
//    import DrawingBoard from './components/drawing-board.vue'
//    import showingBoard from './components/showing-board.vue'

    //ES6
    export default {
        methods: {
            //添加到draw组件的路由
            draw() {
                this.$route.router.go({name: "draw"})
            },
            //添加到show组件的路由
            show() {
                this.$route.router.go({name: "show"})
            }
        }
    }
</script>

<style lang="less">
    body {
        background: #fff;
    }
</style>
