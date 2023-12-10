<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Item} from "@/models/item";
import {Delete, Plus} from "@element-plus/icons-vue";
import PhotoForm from "@/components/photoForm.vue";
import {ElMessage, ElMessageBox, ElTable} from "element-plus";


const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const aForm = ref(null)
const headHeight = ref<number>(0)
const itemPageSize = ref<number>(0)
const itemList = ref<Item[]>([])
const search = ref<string>('')
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<Item[]>([])
const tableHeight = ref<number>(0);
const page = reactive<Page<Item>>({
  records: [],
  pages: 0,
  size: 3,
  current: 1,
  total: 0
})

const getItemList = async () => {
  await $http({
    url: '/api/item/list',
    method: 'get',
    params: $http.adornParams({current: page.current, size: page.size, keyword: search.value}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<Item>> = response.data
    itemList.value = result.data.records
    page.pages = result.data.pages
    page.current = result.data.current
    page.size = result.data.size
    page.total = result.data.total
    itemPageSize.value = result.data.records.length
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
  getItemList()
}

const clearSearch = () => {
  search.value = ''
  getItemList()
}

const editItem = (item: Item) => {
  aForm.value.setDialogVisibleAndForm<Item>('item', item, !aForm.value.getDialogVisible())
}


const handleSelectionChange = (val: Item[]) => {
  multipleSelection.value = val
}


const deleteItemList = () => {

  let idList: number[] = []
  let nameList: string[] = []
  for (let i = 0; i < multipleSelection.value.length; i++) {
    idList.push(multipleSelection.value[i].cakeItemId);
    nameList.push(multipleSelection.value[i].cakeItemName)
  }

  ElMessageBox.confirm(`是否删除${nameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/item/deleteList?' + $http.adornData({ids: idList}, 'form'),
      method: 'delete',
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getItemList()
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
const deleteItem = (item: Item) => {
  ElMessageBox.confirm(`是否删除${item.cakeItemId}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/item/delete',
      method: 'delete',
      params: $http.adornParams({id: item.cakeItemId}),
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getItemList()
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
const addItem = () => {
  aForm.value.setDialogVisible("item", !aForm.value.getDialogVisible())
}

const handleCurrentChange = (toPage: number) => {
  page.current = toPage
  getItemList()
}

onMounted(() => {
  getItemList()
  initTableHeight()
})
</script>

<template>
  <div class="item-container">
    <div class="but-button">
      <el-button class="mt-4" :icon="Plus" type="primary" @click="addItem"
      >添加配料
      </el-button>
      <el-button class="mt-4" :icon="Delete" type="danger" @click="deleteItemList"
      >删除勾选配料
      </el-button>
    </div>
    <div class="table-page">
      <el-table
          ref="multipleTableRef"
          :data="itemList"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          :row-style="{height: (tableHeight - headHeight) / itemPageSize + 'px'}"
      >
        <el-table-column type="selection" min-width="4%"/>
        <el-table-column label="创建时间" min-width="18%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakeItemPhoto" label="配料图片" min-width="20%">
          <template #default="scope">
            <el-image style="width: 80px" :src="scope.row.cakeItemPhoto" fit="contain"/>
          </template>
        </el-table-column>
        <el-table-column prop="cakeItemName" label="配料名字" min-width="18%"/>
        <el-table-column prop="cakeItemPrice" label="配料价格(分)" min-width="18%"/>
        <el-table-column fixed="right" min-width="22%">
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
                  @click.prevent="deleteItem(scope.row)"
              >
                删除
              </el-button>
              <el-button
                  link
                  type="primary"
                  size="large"
                  @click.prevent="editItem(scope.row)"
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
    </div>
    <photo-form ref="aForm" @getItemList="getItemList"></photo-form>
  </div>
</template>

<style scoped>
.item-container {
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