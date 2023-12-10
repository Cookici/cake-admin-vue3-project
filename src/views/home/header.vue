<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, onMounted} from "vue";
import {AxiosResponse} from "axios";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
import {userStore} from "@/stores";

const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const router = useRouter()
const UserStore = userStore()


const logout = async () => {
  await $http({
    url: '/api/logout',
    method: 'post'
  }).then((response: AxiosResponse) => {
    if (response.data.code) {
      router.push({path: '/'}).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        ElMessage.success("登出成功")
      })
    }
  })
}

onMounted(() => {

})

</script>

<template>
  <div class="header-container">
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="box-username">
          当前账号：{{ UserStore.user?.cakeUserUsername }}
        </div>
      </el-col>
      <el-col :span="16">
        <div class="box-header">管理后台</div>
      </el-col>
      <el-col :span="4">
        <span class="box-logout">
          <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar :size="50" :src="UserStore.user?.cakeUserAvatar"/>
          </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
          </el-dropdown>
        </span>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.header-container {
  height: 100%;
  width: 100%;

  .box-header {
    padding: 10px;
    font-size: 40px;
    font-weight: bold;
    text-align: center;
  }

  .box-username {
    padding: 7px;
  }

  .el-dropdown-link {
      margin-top: 18px;
      outline: none;
  }


  .box-logout {
    .example-showcase .el-dropdown-link {
      cursor: pointer;
      color: var(--el-color-primary);
      display: flex;
      align-items: center;
    }
  }

}
</style>