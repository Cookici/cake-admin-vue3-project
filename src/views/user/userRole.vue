<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, onMounted, ref, watch} from "vue";
import {RoleModel} from "@/models/role";
import Role from "@/views/role/role.vue";
import {statusStore} from "@/stores/modules/status.ts";
import {useRouter} from "vue-router";
import {User} from "@/models/user";
import {ElMessage} from "element-plus";
import {userStore} from "@/stores";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";

const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const aRole = ref<InstanceType<typeof Role>>()
const user = ref<User>({})
const role = ref<RoleModel>({})
const StatusStore = statusStore()
const router = useRouter()
const wantRole = ref<RoleModel>()
const UserStore = userStore()
const userEditRole = () => {
  console.log("选择的 ===> ",wantRole.value)
  if(wantRole.value === undefined){
    ElMessage.warning("请选择要修改的角色")
    return;
  }
  if(wantRole.value?.cakeRoleLevel > UserStore.user?.cakeRole.cakeRoleLevel){
    ElMessage.warning('你要修改到的角色高于你')
    aRole.value?.clearMultipleSelection()
    return;
  }
  $http({
    url:'/api/user/update',
    method:'put',
    data:{cakeUserId:user.value.cakeUserId,cakeRoleId:wantRole.value?.cakeRoleId}
  }).then((response: AxiosResponse) => {
    let result: Data<string> = response.data
    if (result.code === 200) {
      ElMessage.success(result.data)
      user.value.cakeRole = wantRole.value
      router.push({path: '/home/user'}).then(() => {
        router.push({path: '/home/userRole', state: {user: JSON.stringify(user.value)}})
      })
    } else {
      ElMessage.warning(result.message)
    }
  }).catch(() => {
    ElMessage.error('服务器错误')
  })

}

watch(
    () => aRole.value?.multipleSelection,
    (newValue, oldValue) => {
      wantRole.value = newValue?.reverse()[0]
      if (newValue!.length > 1) {
        aRole.value?.clearMultipleSelection()
        aRole.value?.setMultipleSelection(wantRole.value)
        console.log("want ===> ", wantRole.value, "MultipleSelection ===>", aRole.value?.getMultipleSelection())
      }
    }
)

onMounted(() => {
  StatusStore.setStatus(false)
  if (history.state.user !== undefined) {
    user.value = JSON.parse(history.state.user)
    role.value = user.value.cakeRole
    console.log(user.value,user.value.cakeRole)
  }
})

</script>

<template>
  <div class="all-container">
    <div class="product-detail">
      <el-row :gutter="20">
        <el-col :span="16">
          <span>
            用户头像：<el-image style="height: 40px;width: 40px;"
                               :src="user.cakeUserAvatar"/>
          </span>
          &nbsp;&nbsp;&nbsp;
          <span>
            用户账号：{{ user.cakeUserUsername }}
          </span>
          &nbsp;&nbsp;&nbsp;
          <span>
            用户角色：{{ role.cakeRoleDescription }}
          </span>
        </el-col>
        <el-col :span="8">
          <el-button style="width: 40%;margin-top: 10px;margin-bottom: 10px" type="primary"
                     @click="userEditRole">修改角色
          </el-button>
        </el-col>
      </el-row>
    </div>
    <role ref="aRole" class="role-container"></role>
  </div>
</template>

<style scoped lang="scss">

</style>