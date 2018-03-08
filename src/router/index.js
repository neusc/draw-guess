import Vue from 'vue'
import Router from 'vue-router'
import index from '../App'
import draw from '../components/drawing-board'
import show from '../components/showing-board'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/index',
      component: index
    },
    {
      path: '/draw',
      component: draw
    },
    {
      path: '/show',
      component: show
    }
  ]
})
