<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Delete, Plus} from "@element-plus/icons-vue";
import {PermitModel} from "@/models/permit";
import {ElMessage, ElMessageBox, ElTable} from "element-plus";
import NoPhotoForm from "@/components/noPhotoForm.vue";
import {statusStore} from "@/stores";

const StatusStore = statusStore()
const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const aForm = ref<InstanceType<typeof NoPhotoForm>>(null)
const headHeight = ref<number>(0)
const permitPageSize = ref<number>(0)
const permitList = ref<PermitModel[]>([])
const search = ref<string>('')
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<PermitModel[]>([])
const tableHeight = ref<number>(0);
const page = reactive<Page<PermitModel>>({
  records: [],
  pages: 0,
  size: 2,
  current: 1,
  total: 0
})


defineExpose({
  getMultipleSelection() {
    return multipleSelection.value
  }
})

const getPermitList = async () => {
  await $http({
    url: '/api/permit/list',
    method: 'get',
    params: $http.adornParams({current: page.current, size: page.size, keyword: search.value}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<PermitModel>> = response.data
    console.log(result.data)
    permitList.value = result.data.records
    page.pages = result.data.pages
    page.current = result.data.current
    page.size = result.data.size
    page.total = result.data.total
    permitPageSize.value = result.data.records.length
    headHeight.value = multipleTableRef.value?.$el.querySelector('.el-table__header-wrapper').offsetHeight
  })
}

const handleCurrentChange = (toPage: number) => {
  page.current = toPage
  getPermitList()
}
const handleSelectionChange = (val: PermitModel[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}


const deletePermit = (permit: PermitModel) => {
  ElMessageBox.confirm(`是否删除${permit.cakePermitDescription}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/permit/delete',
      method: 'delete',
      params: $http.adornParams({id: permit.cakePermitId}),
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getPermitList()
        ElMessage.success("删除成功")
      } else {
        ElMessage.warning("删除失败")
      }
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })
}


const deletePermitList = () => {
  let idList: number[] = []
  let nameList: string[] = []
  for (let i = 0; i < multipleSelection.value.length; i++) {
    idList.push(multipleSelection.value[i].cakePermitId);
    nameList.push(multipleSelection.value[i].cakePermitName)
  }

  ElMessageBox.confirm(`是否删除${nameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/permit/deleteList?' + $http.adornData({ids: idList}, 'form'),
      method: 'delete',
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getPermitList()
        ElMessage.success("删除成功")
      } else {
        ElMessage.warning("删除失败")
      }
    }).catch(() => {
      ElMessage.error("未知错误")
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })
}

const editPermit = (permit: PermitModel) => {
  aForm.value!.setDialogVisibleAndForm<PermitModel>("permit", permit, !aForm.value!.getDialogVisible())
}

const addPermit = () => {
  aForm.value!.setDialogVisible("permit", !aForm.value!.getDialogVisible())
}

const searchByName = () => {
  getPermitList()
}

const clearSearch = () => {
  search.value = ''
  getPermitList()
}

const initTableHeight = () => {
  tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  window.onresize = () => {
    tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  };
}


onMounted(() => {
  StatusStore.setStatus(true)
  getPermitList()
  initTableHeight()
})
</script>

<template>
  <div class="permit-container">
    <div class="but-button" v-show="StatusStore.status">
      <el-button class="mt-4" :icon="Plus" type="primary" @click="addPermit"
      >添加权限
      </el-button>
      <el-button class="mt-4" :icon="Delete" type="danger" @click="deletePermitList"
      >删除勾选权限
      </el-button>
    </div>
    <div class="table-page">
      <el-table
          ref="multipleTableRef"
          :data="permitList"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          :row-style="{height: (tableHeight - headHeight) / permitPageSize + 'px'}"
      >
        <el-table-column type="selection" min-width="5%"/>
        <el-table-column label="创建时间" min-width="15%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakePermitName" label="权限名称" min-width="15%"/>
        <el-table-column prop="cakePermitDescription" label="权限描述" min-width="15%"/>
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
                  @click.prevent="deletePermit(scope.row)"
                  :disabled="!StatusStore.status"
              >
                删除
              </el-button>
              <el-button
                  link
                  type="primary"
                  size="large"
                  @click.prevent="editPermit(scope.row)"
                  :disabled="!StatusStore.status"
              >
                编辑
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
      <no-photo-form ref="aForm" @getPermitList="getPermitList"></no-photo-form>
    </div>
  </div>
</template>

<style scoped>
.permit-container {
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