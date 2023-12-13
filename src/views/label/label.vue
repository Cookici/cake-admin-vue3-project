<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Delete, Plus} from "@element-plus/icons-vue";
import {LabelModel} from "@/models/label";
import {ElMessage, ElMessageBox, ElTable} from "element-plus";
import NoPhotoForm from "@/components/noPhotoForm.vue";
import {statusStore} from "@/stores";

const StatusStore = statusStore()
const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const aForm = ref<InstanceType<typeof NoPhotoForm>>(null)
const headHeight = ref<number>(0)
const labelPageSize = ref<number>(0)
const labelList = ref<LabelModel[]>([])
const search = ref<string>('')
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<LabelModel[]>([])
const tableHeight = ref<number>(0);
const page = reactive<Page<LabelModel>>({
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

const getLabelList = async () => {
  await $http({
    url: '/api/label/list',
    method: 'get',
    params: $http.adornParams({current: page.current, size: page.size, keyword: search.value}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<LabelModel>> = response.data
    labelList.value = result.data.records
    page.pages = result.data.pages
    page.current = result.data.current
    page.size = result.data.size
    page.total = result.data.total
    labelPageSize.value = result.data.records.length
    headHeight.value = multipleTableRef.value?.$el.querySelector('.el-table__header-wrapper').offsetHeight
  })
}

const handleCurrentChange = (toPage: number) => {
  page.current = toPage
  getLabelList()
}
const handleSelectionChange = (val: LabelModel[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}


const deleteLabel = (label: LabelModel) => {
  ElMessageBox.confirm(`是否删除${label.cakeLabelName}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/label/delete',
      method: 'delete',
      params: $http.adornParams({id: label.cakeLabelId}),
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getLabelList()
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


const deleteLabelList = () => {
  let idList: number[] = []
  let nameList: string[] = []
  for (let i = 0; i < multipleSelection.value.length; i++) {
    idList.push(multipleSelection.value[i].cakeLabelId);
    nameList.push(multipleSelection.value[i].cakeLabelName)
  }

  ElMessageBox.confirm(`是否删除${nameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/label/deleteList?' + $http.adornData({ids: idList}, 'form'),
      method: 'delete',
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getLabelList()
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

const editLabel = (label: LabelModel) => {
  aForm.value!.setDialogVisibleAndForm<LabelModel>("label", label, !aForm.value!.getDialogVisible())
}

const addLabel = () => {
  aForm.value!.setDialogVisible("label", !aForm.value!.getDialogVisible())
}

const searchByName = () => {
  getLabelList()
}

const clearSearch = () => {
  search.value = ''
  getLabelList()
}

const initTableHeight = () => {
  tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  window.onresize = () => {
    tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  };
}

onMounted(() => {
  StatusStore.setStatus(true)
  getLabelList()
  initTableHeight()
})
</script>

<template>
  <div class="label-container">
    <div class="but-button" v-show="StatusStore.status">
      <el-button class="mt-4" :icon="Plus" type="primary" @click="addLabel"
      >添加标签
      </el-button>
      <el-button class="mt-4" :icon="Delete" type="danger" @click="deleteLabelList"
      >删除勾选标签
      </el-button>
    </div>
    <div class="table-page">
      <el-table
          ref="multipleTableRef"
          :data="labelList"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          :row-style="{height: (tableHeight - headHeight) / labelPageSize + 'px'}"
      >
        <el-table-column type="selection" min-width="5%"/>
        <el-table-column label="创建时间" min-width="15%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakeLabelName" label="标签名字" min-width="15%"/>
        <el-table-column label="标签图标(Font Awesome)" min-width="15%">
          <template #default="scope">
            <font-awesome-icon :icon="scope.row.cakeLabelIcon" style="margin-right: 10px;"/>
            {{ scope.row.cakeLabelIcon }}
          </template>
        </el-table-column>
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
                  @click.prevent="deleteLabel(scope.row)"
                  :disabled="!StatusStore.status"
              >
                删除
              </el-button>
              <el-button
                  link
                  type="primary"
                  size="large"
                  @click.prevent="editLabel(scope.row)"
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
      <no-photo-form ref="aForm" @getLabelList="getLabelList"></no-photo-form>
    </div>
  </div>
</template>

<style scoped>
.label-container {
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