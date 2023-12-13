<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref, watch} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Delete, Plus} from "@element-plus/icons-vue";
import {RoleModel} from "@/models/role";
import {ElMessage, ElMessageBox, ElTable} from "element-plus";
import NoPhotoForm from "@/components/noPhotoForm.vue";
import {statusStore} from "@/stores";
import {useRouter} from "vue-router";

const router = useRouter()
const StatusStore = statusStore()
const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const aForm = ref<InstanceType<typeof NoPhotoForm>>(null)
const headHeight = ref<number>(0)
const rolePageSize = ref<number>(0)
const roleList = ref<RoleModel[]>([])
const search = ref<string>('')
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<RoleModel[]>([])
const tableHeight = ref<number>(0);
const page = reactive<Page<RoleModel>>({
  records: [],
  pages: 0,
  size: 2,
  current: 1,
  total: 0
})


defineExpose({
  multipleSelection,
  getMultipleSelection() {
    return multipleSelection.value
  },
  clearMultipleSelection() {
    multipleTableRef.value!.clearSelection()
  },
  setMultipleSelection(value: RoleModel) {
    multipleTableRef.value!.clearSelection()
    multipleTableRef.value!.toggleRowSelection(value,undefined)
    multipleSelection.value[0] = value
  }
})

const getRoleList = async () => {
  await $http({
    url: '/api/role/list',
    method: 'get',
    params: $http.adornParams({current: page.current, size: page.size, keyword: search.value}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<RoleModel>> = response.data
    roleList.value = result.data.records
    page.pages = result.data.pages
    page.current = result.data.current
    page.size = result.data.size
    page.total = result.data.total
    rolePageSize.value = result.data.records.length
    headHeight.value = multipleTableRef.value?.$el.querySelector('.el-table__header-wrapper').offsetHeight
  })
}

const handleCurrentChange = (toPage: number) => {
  page.current = toPage
  getRoleList()
}
const handleSelectionChange = (val: RoleModel[]) => {
  multipleSelection.value = val
}


const deleteRole = (role: RoleModel) => {
  ElMessageBox.confirm(`是否删除${role.cakeRoleDescription}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/role/delete',
      method: 'delete',
      params: $http.adornParams({id: role.cakeRoleId}),
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getRoleList()
        ElMessage.success("删除成功")
      } else {
        ElMessage.warning(result.message)
      }
    }).catch(() => {
      ElMessage.error("未知错误")
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })
}


const deleteRoleList = () => {
  let idList: number[] = []
  let nameList: string[] = []
  for (let i = 0; i < multipleSelection.value.length; i++) {
    idList.push(multipleSelection.value[i].cakeRoleId);
    nameList.push(multipleSelection.value[i].cakeRoleName)
  }

  ElMessageBox.confirm(`是否删除${nameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/role/deleteList?' + $http.adornData({ids: idList}, 'form'),
      method: 'delete',
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getRoleList()
        ElMessage.success("删除成功")
      } else {
        ElMessage.warning(result.message)
      }
    }).catch(() => {
      ElMessage.error("未知错误")
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })
}

const editRolePermit = (role: RoleModel) => {
  router.push({path: '/home/rolePermit', state: {role: JSON.stringify(role)}})
}

const editRole = (role: RoleModel) => {
  aForm.value!.setDialogVisibleAndForm<RoleModel>("role", role, !aForm.value!.getDialogVisible())
}

const addRole = () => {
  aForm.value!.setDialogVisible("role", !aForm.value!.getDialogVisible())
}

const searchByName = () => {
  getRoleList()
}

const clearSearch = () => {
  search.value = ''
  getRoleList()
}

const initTableHeight = () => {
  tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  window.onresize = () => {
    tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  };
}


onMounted(() => {
  StatusStore.setStatus(true)
  getRoleList()
  initTableHeight()
})
</script>

<template>
  <div class="role-container">
    <div class="but-button" v-show="StatusStore.status">
      <el-button class="mt-4" :icon="Plus" type="primary" @click="addRole"
      >添加角色
      </el-button>
      <el-button class="mt-4" :icon="Delete" type="danger" @click="deleteRoleList"
      >删除勾选角色
      </el-button>
    </div>
    <div class="table-page">
      <el-table
          ref="multipleTableRef"
          :data="roleList"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          :row-style="{height: (tableHeight - headHeight) / rolePageSize + 'px'}"
      >
        <el-table-column type="selection" min-width="5%"/>
        <el-table-column label="创建时间" min-width="15%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakeRoleName" label="角色名字" min-width="15%"/>
        <el-table-column prop="cakeRoleDescription" label="角色描述" min-width="15%"/>
        <el-table-column prop="cakeRoleLevel" label="角色等级" min-width="15%"/>
        <el-table-column fixed="right" min-width="20%">
          <template #header>
            <el-input style="width: 65%" v-model="search" size="large" placeholder="输入名称搜索"
                      @keyup.enter="searchByName"/>
            <el-button size="large" style="width: 20%;margin-left: 5%" @click="clearSearch">重置</el-button>
          </template>
          <template #default="scope">
            <div class="op-button">
              <el-button
                  link
                  type="danger"
                  size="large"
                  @click.prevent="deleteRole(scope.row)"
                  :disabled="!StatusStore.status"
              >
                删除
              </el-button>
              <el-button
                  link
                  type="primary"
                  size="large"
                  @click.prevent="editRole(scope.row)"
                  :disabled="!StatusStore.status"
              >
                编辑
              </el-button>
              <el-button
                  link
                  type="warning"
                  size="large"
                  @click.prevent="editRolePermit(scope.row)"
              >
                权限
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
      <no-photo-form ref="aForm" @getRoleList="getRoleList"></no-photo-form>
    </div>
  </div>
</template>

<style scoped>
.role-container {
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