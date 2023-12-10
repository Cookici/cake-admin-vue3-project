<script setup lang="ts">
import {ref} from "vue";
import axios from "axios";
import {Data} from "@/models/data";
import {ElMessage} from "element-plus";
import {tokenStore} from "@/stores/modules/token";
import {userStore} from "@/stores/modules/user"
import {User} from "@/models/user";
import {useRouter} from "vue-router";


const TokenStore = tokenStore()
const UserStore = userStore()
const router = useRouter()

const username = ref('');
const password = ref('');

const login = async () => {
  await axios({
    method: 'post',
    url: "http://localhost:9000/login",
    params: {
      username: username.value,
      password: password.value
    },
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }).then(response => {

    let result: Data<User> = response.data

    if (result.code !== 200) {
      ElMessage.error(result.message)
      return;
    }
    console.log(response)
    ElMessage.success("登录成功")
    let token = response.headers['authorization']
    TokenStore.setToken(token)
    UserStore.setUser(result.data)

    router.push({path: '/home'})

  });
};


const clear = () => {
  username.value = ''
  password.value = ''
}

</script>

<template>
  <div class="login-container">
    <!-- box容器放置图片 -->
    <div class="img-box">
      <img src="https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/default.jpg" alt="Image Description" />
    </div>
    <div class="login-info">
      <!-- box1容器把登录表单和按钮放在同一容器中，便于整体改变他们的位置 -->
      <div class="login-box">
        <el-form label-width="60px">
          <h1 class="title">用户登录</h1>
          <el-form-item label="用户名:">
            <el-input
                type="text"
                v-model="username"
                placeholder="登录账号"
                autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码:">
            <el-input
                type="password"
                v-model="password"
                placeholder="登录密码"
                autocomplete="off"
                show-password
            ></el-input>
          </el-form-item>
        </el-form>
        <div class="login-btn">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="clear" type="info">重置</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  background-color: #2d3a4b;
  display: flex;
  justify-content: center;
  align-items: center;

  .img-box {
    width: 400px;
    height: 400px;
    border-radius: 50px 0 0 50px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50px 0 0 50px;
    }
  }

  .login-info {
    width: 400px;
    height: 400px;
    border-radius: 0 50px 50px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgb(253,253,253);
    .title {
      font-size: 23px;
      font-weight: 600;
      text-align: center;
    }

    .el-form-item {
      padding: 5px;
      .el-input {
        width: 280px;
      }
    }

    .login-btn {
      box-sizing: border-box;
      text-align: center;
    }
  }
}

.login-box {
  padding: 86px;
}

</style>
