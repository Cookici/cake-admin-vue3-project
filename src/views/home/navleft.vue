<script setup lang="ts">

import {Document, Edit, CollectionTag} from "@element-plus/icons-vue";

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<template>
  <div class="aside-container">
    <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="#fff"
        router
        @open="handleOpen"
        @close="handleClose"
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon>
            <Edit/>
          </el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item index="/home/product">产品管理</el-menu-item>
        <el-menu-item index="/home/item">配料管理</el-menu-item>
      </el-sub-menu>


      <el-sub-menu index="2">
        <template #title>
          <el-icon>
            <User/>
          </el-icon>
          <span>访问管理</span>
        </template>
        <el-menu-item index="/home/user">用户管理</el-menu-item>
        <el-menu-item index="/home/role">角色管理</el-menu-item>
        <el-menu-item index="/home/permit">权限管理</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3" disabled="disabled">
        <template #title>
          <el-icon>
            <Document/>
          </el-icon>
          <span>订单细则</span>
        </template>
        <el-menu-item index="3-1">下单日志</el-menu-item>
        <el-menu-item index="3-2">退款日志</el-menu-item>
      </el-sub-menu>


      <el-menu-item index="/home/label">
        <el-icon>
          <CollectionTag/>
        </el-icon>
        <span>标签管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.aside-container {
  width: 100%;
  height: 100%;

}
</style>