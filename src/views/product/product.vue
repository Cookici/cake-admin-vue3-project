<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Product} from "@/models/product";
import {ElMessage, ElMessageBox, ElTable} from "element-plus";
import {Delete, Plus} from "@element-plus/icons-vue";
import PhotoForm from "@/components/photoForm.vue";
import {useRouter} from "vue-router";
import {statusStore} from "@/stores";


const StatusStore = statusStore()
const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const router = useRouter()
const aForm = ref<InstanceType<typeof PhotoForm>>(null)
const headHeight = ref<number>(0)
const productPageSize = ref<number>(0)
const productList = ref<Product[]>([])
const search = ref<string>('')
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<Product[]>([])
const tableHeight = ref<number>(0);
const page = reactive<Page<Product>>({
  records: [],
  pages: 0,
  size: 4,
  current: 1,
  total: 0
})

const getProductList = () => {
  $http({
    url: '/api/product/list',
    method: 'get',
    params: $http.adornParams({current: page.current, size: page.size, keyword: search.value}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<Product>> = response.data
    console.log(result.data)
    productList.value = result.data.records
    page.pages = result.data.pages
    page.current = result.data.current
    page.size = result.data.size
    page.total = result.data.total
    productPageSize.value = result.data.records.length
    headHeight.value = multipleTableRef.value?.$el.querySelector('.el-table__header-wrapper').offsetHeight
  })
}

const handleCurrentChange = (toPage: number) => {
  page.current = toPage
  getProductList()
}
const handleSelectionChange = (val: Product[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}


const deleteProduct = (product: Product) => {
  ElMessageBox.confirm(`是否删除${product.cakeProductName}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/product/delete',
      method: 'delete',
      params: $http.adornParams({id: product.cakeProductId}),
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getProductList()
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


const deleteProductList = () => {


  let idList: number[] = []
  let nameList: string[] = []
  for (let i = 0; i < multipleSelection.value.length; i++) {
    idList.push(multipleSelection.value[i].cakeProductId);
    nameList.push(multipleSelection.value[i].cakeProductName)
  }

  ElMessageBox.confirm(`是否删除${nameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    $http({
      url: '/api/product/deleteList?' + $http.adornData({ids: idList}, 'form'),
      method: 'delete',
    }).then((response: AxiosResponse) => {
      let result: Data<string> = response.data
      if (result.code === 200) {
        getProductList()
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

const searchByName = () => {
  getProductList()
}

const clearSearch = () => {
  search.value = ''
  getProductList()
}

const editProduct = (product: Product) => {
  aForm.value!.setDialogVisibleAndForm<Product>('product', product, !aForm.value!.getDialogVisible())
}

const addProduct = () => {
  aForm.value!.setDialogVisible("product", !aForm.value!.getDialogVisible())
}


const initTableHeight = () => {
  tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  window.onresize = () => {
    tableHeight.value = window.innerHeight - multipleTableRef.value?.$el.offsetTop - 85;
  };
}

const editProductLabel = (product: Product) => {
  router.push({name: 'ProductLabel', state: {product: JSON.stringify(product)}})
}


onMounted(() => {
  StatusStore.setStatus(true)
  getProductList()
  initTableHeight()
})
</script>

<template>
  <div class="product-container">
    <div class="but-button">
      <el-button class="mt-4" :icon="Plus" type="primary" @click="addProduct"
      >添加产品
      </el-button>
      <el-button class="mt-4" :icon="Delete" type="danger" @click="deleteProductList"
      >删除勾选产品
      </el-button>
    </div>
    <div class="table-page">
      <el-table
          ref="multipleTableRef"
          :data="productList"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          :row-style="{height: (tableHeight - headHeight) / productPageSize + 'px'}"
      >
        <el-table-column type="selection" min-width="5%"/>
        <el-table-column label="创建时间" min-width="15%">
          <template #default="scope">{{ scope.row.createTime.substring(0, 10) }}</template>
        </el-table-column>
        <el-table-column prop="cakeProductPhoto" label="产品图片" min-width="15%">
          <template #default="scope">
            <el-image style="width: 80px" :src="scope.row.cakeProductPhoto" fit="contain"/>
          </template>
        </el-table-column>
        <el-table-column prop="cakeProductName" label="产品名字" min-width="15%"/>
        <el-table-column prop="cakeProductPrice" label="产品价格(分)" min-width="15%"/>
        <el-table-column label="标签" prop="cakeLabelList" min-width="15%">
          <template #default="scope" style="height: 100%">
            <div style="display: flex;flex-wrap: wrap;">
              <div v-for="(label,index) in scope.row.cakeLabelList" :key="index">
                <el-button style="width: 100px;margin-top: 5px;margin-bottom:5px " type="warning" round>
                  <font-awesome-icon :icon="label.cakeLabelIcon" style="margin-right: 10px;"/>
                  {{
                    label.cakeLabelName
                  }}
                </el-button>
              </div>
            </div>
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
                  @click.prevent="deleteProduct(scope.row)"
              >
                删除
              </el-button>
              <el-button
                  link
                  type="primary"
                  size="large"
                  @click.prevent="editProduct(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                  link
                  type="warning"
                  size="large"
                  @click.prevent="editProductLabel(scope.row)"
              >
                标签
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
    <photo-form ref="aForm" @getProductList="getProductList"></photo-form>
  </div>

</template>

<style lang="scss" scoped>
.product-container {
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