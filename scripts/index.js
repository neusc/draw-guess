/*
* vue-router实现vue组件路由
*/
import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

// ES6语法引入组件
import index from './App.vue';
import draw from './components/drawing-board.vue';
import show from './components/showing-board.vue';

//开启debug模式
Vue.config.debug = true;

// new Vue(app);//新建一个vue实例，现在使用vue-router就不需要了。

// 路由器需要一个根组件
var App = Vue.extend({});

// 创建一个路由器实例
// 创建实例时可以传入配置参数进行定制，为保持简单，这里使用默认配置
var router = new VueRouter();

// 定义路由规则
// 每条路由规则应该映射到一个组件。这里的“组件”可以是一个使用 Vue.extend
// 创建的组件构造函数，也可以是一个组件选项对象
router.map({
    '/index': {
        name: 'index',
        // component:require("components/app.vue"),
        component: index
    },
    '/draw': {
        name: 'draw',
        component: draw
    },
    '/show': {
        name: 'show',
        component: show
    }
});
router.redirect({
    '*': "/index"
});

// 启动应用
// 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上
router.start(App, '#app');
