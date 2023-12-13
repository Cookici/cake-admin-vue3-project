<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance, onMounted, ref} from "vue";
import {Product} from "@/models/product";
import {LabelModel} from "@/models/label";
import Label from "@/views/label/label.vue";
import {statusStore} from "@/stores/modules/status.ts";
import {ElMessage, ElMessageBox} from "element-plus";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {useRouter} from "vue-router";

const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const aLabel = ref<InstanceType<typeof Label>>()
const product = ref<Product>({})
const StatusStore = statusStore()
const router = useRouter()

const productAddLabelList = () => {

  let selections = aLabel.value!.getMultipleSelection()
  let labelList: LabelModel[] = []
  let idList: number[] = []
  let labelNameList: string[] = []
  for (let i = 0; i < selections.length; i++) {
    labelNameList.push(selections[i].cakeLabelName)
  }

  if (product.value.cakeLabelList === null) {
    product.value.cakeLabelList = []
  }

  labelList = selections.filter(select => {
    return product.value.cakeLabelList.every((label: LabelModel) => {
      return label.cakeLabelId !== select.cakeLabelId
    })
  })

  for (let i = 0; i < labelList.length; i++) {
    idList.push(labelList[i].cakeLabelId)
  }


  ElMessageBox.confirm(`是否添加${labelNameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    console.log($http.adornData({cakeProductId: product.value.cakeProductId, cakeLabelIdList: idList}, 'json'))
    $http({
      url: '/api/product-label/add',
      method: 'post',
      data: $http.adornData({cakeProductId: product.value.cakeProductId, cakeLabelIdList: idList}, 'json')
    }).then((response: AxiosResponse) => {
      console.log(response)
      let result: Data<string> = response.data
      if (result.code === 200) {
        ElMessage.success(result.data)
        for (let i = 0; i < labelList.length; i++) {
          product.value.cakeLabelList.push(labelList[i])
        }
        router.push({path: '/home/product'}).then(() => {
          router.push({path: '/home/productLabel', state: {product: JSON.stringify(product.value)}})
        })
      } else {
        ElMessage.warning(result.data)
      }
    })
  }).catch(() => {
    ElMessage.success("取消添加")
  })


}


const productDeleteLabelList = () => {

  let selections = aLabel.value!.getMultipleSelection()
  let labelList: LabelModel[] = []
  let idList: number[] = []
  let labelNameList: string[] = []


  for (let i = 0; i < selections.length; i++) {
    labelNameList.push(selections[i].cakeLabelName)
  }

  if (product.value.cakeLabelList === null) {
    product.value.cakeLabelList = []
  }

  product.value.cakeLabelList.forEach((labelHave: LabelModel) => {
    selections.forEach((labelChoice: LabelModel) => {
      if (labelHave.cakeLabelId === labelChoice.cakeLabelId) {
        labelList.push(labelChoice)
      }
    })
  })

  for (let i = 0; i < labelList.length; i++) {
    idList.push(labelList[i].cakeLabelId)
  }


  ElMessageBox.confirm(`是否删除${labelNameList}?`, `提示`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    console.log($http.adornData({cakeProductId: product.value.cakeProductId, cakeLabelIdList: idList}, 'json'))
    $http({
      url: '/api/product-label/delete',
      method: 'delete',
      data: $http.adornData({cakeProductId: product.value.cakeProductId, cakeLabelIdList: idList}, 'json')
    }).then((response: AxiosResponse) => {
      console.log(response)
      let result: Data<string> = response.data
      if (result.code === 200) {
        ElMessage.success(result.data)

        for (let i = 0; i < labelList.length; i++) {
          product.value.cakeLabelList = product.value.cakeLabelList.filter((label: LabelModel) => {
            return label.cakeLabelId !== labelList[i].cakeLabelId
          })
        }

        router.push({path: '/home/product'}).then(() => {
          router.push({path: '/home/productLabel', state: {product: JSON.stringify(product.value)}})
        })
      } else {
        ElMessage.warning(result.data)
      }
    })
  }).catch(() => {
    ElMessage.success("取消添加")
  })


}

onMounted(() => {
  StatusStore.setStatus(false)
  if (history.state.product !== undefined) {
    product.value = JSON.parse(history.state.product)
  }
})

</script>

<template>
  <div class="all-container">
    <div class="product-detail">
      <el-row :gutter="20">
        <el-col :span="16">
          <span>
            产品图片：<el-image style="height: 40px;width: 40px;"
                               :src="product.cakeProductPhoto"/>
          </span>
          &nbsp;&nbsp;&nbsp;
          <span>
            产品名称：{{ product.cakeProductName }}
          </span>
          &nbsp;&nbsp;&nbsp;
          产品图标名称：
          <span v-for="(label,index) in (product.cakeLabelList as LabelModel[])" :key="index">
            <span>
              {{ label.cakeLabelName }}(
           <font-awesome-icon :icon="label.cakeLabelIcon"/>
            {{ label.cakeLabelIcon }})
              &nbsp;
        </span>
      </span>
        </el-col>
        <el-col :span="8">
          <el-button style="width: 40%;margin-top: 10px;margin-bottom: 10px" type="primary"
                     @click="productAddLabelList">添加所选标签
          </el-button>
          <el-button style="width: 40%;margin-top: 10px;margin-bottom: 10px" type="danger"
                     @click="productDeleteLabelList">删除所选标签
          </el-button>
        </el-col>
      </el-row>
    </div>
    <Label ref="aLabel" class="label-container"></Label>
  </div>
</template>

<style scoped lang="scss">

</style>