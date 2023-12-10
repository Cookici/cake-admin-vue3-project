<script setup lang="ts">

import Header from "@/views/home/header.vue";
import Navleft from "@/views/home/navleft.vue";
</script>

<template>
  <el-container class="home-container">
    <el-header height="80px">
      <Header></Header>
    </el-header>
    <el-container class="box">
      <el-aside width="200px">
        <Navleft></Navleft>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.home-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.el-header {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-container {
  overflow-y: auto;
  height: 100%;
}

.el-aside {
  background-color: #545c64;
  color: #fff;
  text-align: center;
  line-height: 200px;
  flex-shrink: 0;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}

body > .el-container {
  margin-bottom: 40px;
}


</style>