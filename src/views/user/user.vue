<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Check, Close} from '@element-plus/icons-vue'
import {User} from "@/models/user";
import {ElMessage, ElTable} from "element-plus";
import {userStore} from "@/stores";
import {useRouter} from "vue-router";

const aSwitch = ref(null)
const router = useRouter()
const UserStore = userStore()
const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const headHeight = ref<number>(0)
const userPageSize = ref<number>(0)
const userList = ref<User[]>([])
const search = ref<string>('')
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])
const tableHeight = ref<number>(0);
const page = reactive<Page<User>>({
  records: [],
  pages: 0,
  size: 2,
  current: 1,
  total: 0
})
import {statusStore} from "@/stores";


const StatusStore = statusStore()

const handleCurrentChange = (toPage: number) => {
  page.current = toPage
  getUserList()
}
const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}

const getUserList = async () => {

  await $http({
    url: '/api/user/list',
    method: 'get',
    params: $http.adornParams({current: page.current, size: page.size, keyword: search.value}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<User>> = response.data
    console.log(result.data.records)
    userList.value = result.data.records
    page.pages = result.data.pages
    page.current = result.data.current
    page.size = result.data.size
    page.total = result.data.total
    userPageSize.value = result.data.records.length
    headHeight.value = multipleTableRef.value?.$el.querySelector('.el-table__header-wrapper').offsetHeight
  })
}

const initTableHeight = () => {
  tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  window.onresize = () => {
    tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  };
}

const searchByName = () => {
  getUserList()
}

const clearSearch = () => {
  search.value = ''
  getUserList()
}

const changeHandler = (status: number, user: User) => {
  $http({
    url: '/api/user/update',
    method: 'put',
    data: {cakeUserId: user.cakeUserId, cakeRoleId: user.cakeRole.cakeRoleId, cakeUserStatus: status}
  }).then((response: AxiosResponse) => {
    let result: Data<string> = response.data
    if (result.code === 200) {
      ElMessage.success(result.data)
    } else {
      ElMessage.warning(result.message)
    }
  }).catch(() => {
    ElMessage.error('服务器错误')
  })
}

const editRole = (user: User) => {
  router.push({name: 'UserRole', state: {user: JSON.stringify(user)}})
}

onMounted(() => {
  StatusStore.setStatus(true)
  getUserList()
  initTableHeight()
})
</script>

<template>
  <div class="user-container">
    <div class="but-button">
      <el-input style="width: 80%" v-model="search" size="large" placeholder="输入名称搜索"
                @keyup.enter="searchByName"/>
      <el-button size="large" style="width: 20%;margin-left: 5%" @click="clearSearch">重置</el-button>
    </div>
    <div class="table-page">
      <el-table
          ref="multipleTableRef"
          :data="userList"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          :row-style="{height: (tableHeight - headHeight) / userPageSize + 'px'}"
      >
        <el-table-column type="selection" min-width="5%"/>
        <el-table-column label="创建时间" min-width="10%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakeUserAvatar" label="用户头像" min-width="10%">
          <template #default="scope">
            <el-image style="width: 80px" :src="scope.row.cakeUserAvatar" fit="contain"/>
          </template>
        </el-table-column>
        <el-table-column prop="cakeUserUsername" label="用户账号" min-width="10%"/>
        <el-table-column prop="cakeUserNickName" label="用户昵称" min-width="10%"/>
        <el-table-column label="用户角色" min-width="10%">
          <template #default="scope">
            {{ scope.row.cakeRole.cakeRoleDescription }}
          </template>
        </el-table-column>
        <el-table-column prop="cakeUserIp" label="用户IP" min-width="10%"/>
        <el-table-column prop="cakeUserLevel" label="用户等级" min-width="10%"/>
        <el-table-column label="用户状态" min-width="10%">
          <template #default="scope">
            <el-switch
                ref="aSwitch"
                :active-value="0"
                :inactive-value="1"
                v-model="scope.row.cakeUserStatus"
                class="mt-2"
                style="margin-left: 24px"
                inline-prompt
                :active-icon="Check"
                :inactive-icon="Close"
                @change="changeHandler(scope.row.cakeUserStatus,scope.row)"
                :disabled="(scope.row.cakeUserId === UserStore.user?.cakeUserId) || (scope.row.cakeRole.cakeRoleLevel > UserStore.user!.cakeRole.cakeRoleLevel)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="10%">
          <template #default="scope">
            <div class="op-button">
              <el-button
                  link
                  type="warning"
                  size="large"
                  :disabled="UserStore?.user?.cakeUserUsername === scope.row.cakeUserUsername || UserStore?.user?.cakeRole.cakeRoleLevel < scope.row.cakeRole.cakeRoleLevel"
                  @click.prevent="editRole(scope.row)"
              >
                角色
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            background
            layout="prev, pager, next, jumper"
            :total="page.total"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-container {
  width: 100%;
  height: 100%;

  .but-button {
    display: flex;
    height: auto;
    align-items: center;
    margin-bottom: 10px;

    .el-button {
      width: 120px
    }

  }

  .table-page {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    flex-direction: column;

    .el-table {
      .op-button {
        display: flex;

        .el-button {
          flex: 1
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: auto;
    }

    .el-pagination {
      align-items: center;
      height: fit-content;
      margin: 20px;
    }
  }
}
</style>