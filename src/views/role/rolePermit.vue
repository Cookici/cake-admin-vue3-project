<script setup lang="ts">

import Permit from "@/views/permit/permit.vue";
import {ComponentInternalInstance, getCurrentInstance, onMounted, ref} from "vue";
import {PermitModel} from "@/models/permit";
import {statusStore} from "@/stores";
import {RoleModel} from "@/models/role";
import {ElMessage, ElMessageBox} from "element-plus";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {useRouter} from "vue-router";

const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const StatusStore = statusStore()
const role = ref<RoleModel>({})
const aPermit = ref<InstanceType<typeof Permit>>(null)
const router = useRouter()

const roleAddPermitList = () => {

  let selections = aPermit.value!.getMultipleSelection()
  let permitList: PermitModel[] = []
  let idList: number[] = []
  let permitNameList: string[] = []
  for (let i = 0; i < selections.length; i++) {
    permitNameList.push(selections[i].cakePermitName)
  }

  if (role.value.cakePermitList === null) {
    role.value.cakePermitList = []
  }

  permitList = selections.filter(select => {
    return role.value.cakePermitList.every((permit: PermitModel) => {
      return permit.cakePermitId !== select.cakePermitId
    })
  })

  for (let i = 0; i < permitList.length; i++) {
    idList.push(permitList[i].cakePermitId)
  }


  ElMessageBox.confirm(`是否添加${permitNameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/role-permit/add',
      method: 'post',
      data: $http.adornData({cakeRoleId: role.value.cakeRoleId, cakePermitIdList: idList}, 'json')
    }).then((response: AxiosResponse) => {
      console.log(response)
      let result: Data<string> = response.data
      if (result.code === 200) {
        ElMessage.success(result.data)
        for (let i = 0; i < permitList.length; i++) {
          role.value.cakePermitList.push(permitList[i])
        }
        router.push({path: '/home/role'}).then(() => {
          router.push({path: '/home/rolePermit', state: {role: JSON.stringify(role.value)}})
        })
      } else {
        ElMessage.warning(result.message)
      }
    })
  }).catch(() => {
    ElMessage.success("取消添加")
  })


}


const roleDeletePermitList = () => {

  let selections = aPermit.value!.getMultipleSelection()
  let permitList: PermitModel[] = []
  let idList: number[] = []
  let permitNameList: string[] = []


  for (let i = 0; i < selections.length; i++) {
    permitNameList.push(selections[i].cakePermitName)
  }

  if (role.value.cakePermitList === null) {
    role.value.cakePermitList = []
  }

  role.value.cakePermitList.forEach((permitHave: PermitModel) => {
    selections.forEach((permitChoice: PermitModel) => {
      if (permitHave.cakePermitId === permitChoice.cakePermitId) {
        permitList.push(permitChoice)
      }
    })
  })

  for (let i = 0; i < permitList.length; i++) {
    idList.push(permitList[i].cakePermitId)
  }


  ElMessageBox.confirm(`是否删除${permitNameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/role-permit/delete',
      method: 'delete',
      data: $http.adornData({cakeRoleId: role.value.cakeRoleId, cakePermitIdList: idList}, 'json')
    }).then((response: AxiosResponse) => {
      console.log(response)
      let result: Data<string> = response.data
      if (result.code === 200) {
        ElMessage.success(result.data)

        for (let i = 0; i < permitList.length; i++) {
          role.value.cakePermitList = role.value.cakePermitList.filter((permit: PermitModel) => {
            return permit.cakePermitId !== permitList[i].cakePermitId
          })
        }

        router.push({path: '/home/role'}).then(() => {
          router.push({path: '/home/rolePermit', state: {role: JSON.stringify(role.value)}})
        })
      } else {
        ElMessage.warning(result.message)
      }
    })
  }).catch(() => {
    ElMessage.success("取消添加")
  })


}

onMounted(() => {
  StatusStore.setStatus(false)
  if (history.state.role !== undefined) {
    role.value = JSON.parse(history.state.role)
    console.log("role ===> ", role.value)
  }
})

</script>

<template>
  <div class="all-container">
    <div class="product-detail">
      <el-row :gutter="20">
        <el-col :span="16">
          <span>
            角色名：{{ role.cakeRoleName }}
          </span>
          &nbsp;&nbsp;&nbsp;
          <span>
            角色描述：{{ role.cakeRoleDescription }}
          </span>
          &nbsp;&nbsp;&nbsp;
          <span>
            角色等级：{{ role.cakeRoleLevel }}
          </span>
          &nbsp;&nbsp;&nbsp;
          角色权限：
          <span v-for="(permit,index) in (role.cakePermitList as PermitModel[])" :key="index">
            <span>
            (  {{ permit.cakePermitName }}
            {{ permit.cakePermitDescription }}   )
              &nbsp;
            </span>
          </span>
          &nbsp;&nbsp;&nbsp;
        </el-col>
        <el-col :span="8">
          <el-button style="width: 40%;margin-top: 10px;margin-bottom: 10px" type="primary"
                     @click="roleAddPermitList">添加所选权限
          </el-button>
          <el-button style="width: 40%;margin-top: 10px;margin-bottom: 10px" type="danger"
                     @click="roleDeletePermitList">删除所选权限
          </el-button>
        </el-col>
      </el-row>
    </div>
    <permit ref="aPermit" class="permit-container"></permit>
  </div>
</template>

<style scoped lang="scss">

</style>