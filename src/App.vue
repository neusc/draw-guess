<template>
  <div>
    <router-link :to="{path:'/draw'}">我来画</router-link>
    <router-link :to="{path:'/show'}">我来猜</router-link>
    <!-- <router-view> 用于渲染匹配的组件 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
  body {
    background: #fff;
  }
</style>
