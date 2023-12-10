<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import { Check, Close } from '@element-plus/icons-vue'
import {User} from "@/models/user";
import {ElTable} from "element-plus";

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
  size: 1,
  current: 1,
  total: 0
})

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
    params: $http.adornParams({current: page.current, size: page.size}),
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

const changeHandler = (v)=>{
  console.log(v)
}

onMounted(() => {
  getUserList()
  initTableHeight()
})
</script>

<template>
  <div class="user-container">
    <div class="but-button">
      <el-input style="width: 80%" v-model="search"  size="large" placeholder="输入名称搜索"
                @keyup.enter=""/>
      <el-button size="large" style="width: 20%;margin-left: 5%" @click="">重置</el-button>
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
        <el-table-column type="selection" min-width="4%"/>
        <el-table-column label="创建时间" min-width="15%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakeUserAvatar" label="用户头像" min-width="15%">
          <template #default="scope">
            <el-image style="width: 80px" :src="scope.row.cakeUserAvatar" fit="contain"/>
          </template>
        </el-table-column>
        <el-table-column prop="cakeUserUsername" label="用户账号" min-width="15%"/>
        <el-table-column prop="cakeUserNickName" label="用户昵称" min-width="15%"/>
        <el-table-column prop="cakeUserRole" label="用户角色" min-width="15%"/>
        <el-table-column prop="cakeUserIp" label="用户IP" min-width="15%"/>
        <el-table-column prop="cakeUserLevel" label="用户等级" min-width="15%"/>
        <el-table-column prop="cakeUserStatus" label="用户状态" min-width="10%">
          <template #default="scope">
            <el-switch
                v-model="scope.row.cakeUserStatus"
                class="mt-2"
                style="margin-left: 24px"
                inline-prompt
                :active-icon="Check"
                :inactive-icon="Close"
                @change="changeHandler"
                active-value="0"
                inactive-value="1"
            />
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