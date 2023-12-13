<script setup lang="ts">
import {reactive, ref, ComponentInternalInstance, getCurrentInstance} from "vue";
import SingleFileUpload from "@/components/singleFileUpload.vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {ElMessage, UploadUserFile} from "element-plus";
import {Form} from "@/models/form";
import {Product} from "@/models/product";
import {Item} from "@/models/item";

const title = ref<string>('')
const buttonName = ref<string>('')
const type = ref<string>('')
const photoUrl = ref<string>('')
const oldPhotoUrl = ref<string>('')
const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const disabled = ref<boolean>(false)
const dialogVisible = ref(false)
const form = reactive<Form>({
  other: "",
  id: 0,
  name: '',
  price: 0,
  photoUrl: '',
  level: 0
})
const edit = ref<boolean>(false)
const emits = defineEmits(['getProductList', 'getItemList']);
const aUpload = ref<typeof SingleFileUpload>(null)
const fileList = ref<UploadUserFile[]>([])


const uploadAndProcessProduct = async () => {
  disabled.value = true
  if (edit.value === false && !aUpload.value.getChangeStatus()) {
    ElMessage.error("请上传图片")
    return;
  }
  if (edit.value === true && !aUpload.value.getChangeStatus()) {
    await idEdit()
    return
  }
  await aUpload.value.uploadComponentToUpload()
  form.photoUrl = await aUpload.value.getPhotoUrl();
  if (edit.value === false) {
    await isAdd()
  } else {
    await idEdit()
  }
  await aUpload.value?.setChangeStatus(false)
}


const isAdd = async () => {
  await $http({
    url: `/api/${type.value}/add`,
    method: 'post',
    data: type.value === 'product' ?
        {cakeProductName: form.name, cakeProductPrice: form.price, cakeProductPhoto: form.photoUrl} :
        {cakeItemName: form.name, cakeItemPrice: form.price, cakeItemPhoto: form.photoUrl}
  }).then((response: AxiosResponse) => {
    let result: Data<string> = response.data
    if (result.code === 200) {
      ElMessage.success(result.data)
      freshList()
    } else {
      freshList()
      ElMessage.error(result.message)
    }
  }).catch(() => {
    freshList()
    ElMessage.error("检查是否添加重复数据")
  })
}


const deletePhoto = async (deletePhotoUrl: string) => {
  await $http({
    url: '/api/oss/deleteFile',
    method: 'delete',
    data: deletePhotoUrl
  })
}

const idEdit = async () => {
  let data
  if (!aUpload.value.getChangeStatus()) {
    data = type.value === 'product' ?
        {cakeProductId: form.id, cakeProductName: form.name, cakeProductPrice: form.price} :
        {cakeItemId: form.id, cakeItemName: form.name, cakeItemPrice: form.price}
  } else {
    data = type.value === 'product' ?
        {
          cakeProductId: form.id,
          cakeProductName: form.name,
          cakeProductPrice: form.price,
          cakeProductPhoto: form.photoUrl
        } :
        {cakeItemId: form.id, cakeItemName: form.name, cakeItemPrice: form.price, cakeItemPhoto: form.photoUrl}
  }

  await $http({
    url: `/api/${type.value}/edit`,
    method: 'put',
    data: data
  }).then((response: AxiosResponse) => {
    let result: Data<string> = response.data
    if (result.code === 200) {
      finishProcess(oldPhotoUrl.value)
      ElMessage.success(result.data)
      dialogVisible.value = false
    } else {
      finishProcess(form.photoUrl)
      ElMessage.error(result.message)
      dialogVisible.value = false
    }
  }).catch(() => {
    finishProcess(form.photoUrl)
    dialogVisible.value = false
    ElMessage.error("检查修改后数据是否重复")
  })
}

const freshList = async () => {
  await setTimeout(async () => {
    if (type.value === 'product') {
      await emits('getProductList')
    } else if (type.value === 'item') {
      await emits('getItemList')
    }
  }, 1000)

}

const finishProcess = async (deletePhotoUrl: string) => {
  if (aUpload.value.getChangeStatus() === true && edit.value === true) {
    await deletePhoto(deletePhotoUrl);
  }
  await freshList();
}

const changeButtonDisabledToFalse = () => {
  disabled.value = false
}

const changeButtonDisabledToTrue = () => {
  disabled.value = true
}
const changeDialogVisibleToFalse = () => {
  dialogVisible.value = false
}

const changeDialogVisibleToTure = () => {
  dialogVisible.value = true
}

const closeThis = () => {
  dialogVisible.value = false
}


defineExpose({
  setDialogVisible(aType: string, isShow: boolean) {
    type.value = aType
    form.name = ''
    form.price = 0
    photoUrl.value = ''
    console.log("setDialogVisible fileList.value.length ===> ", fileList.value.length)
    fileList.value = []
    disabled.value = false
    dialogVisible.value = isShow
    edit.value = false
    title.value = (edit.value === true ? '修改' : '添加') + (type.value === 'item' ? '配料' : '产品')
    buttonName.value = edit.value === true ? '修改' : '添加'
  },
  getDialogVisible() {
    return dialogVisible.value
  },
  setDialogVisibleAndForm<T>(aType: string, t: T, isShow: boolean) {
    type.value = aType
    if (aType === 'product') {
      const product = t as Product;
      form.id = product.cakeProductId
      form.name = product.cakeProductName
      form.price = product.cakeProductPrice
      photoUrl.value = product.cakeProductPhoto
      oldPhotoUrl.value = product.cakeProductPhoto
      fileList.value = []
      fileList.value.push(
          {
            name: product.cakeProductPhoto.substring(product.cakeProductPhoto.lastIndexOf("/") + 1),
            url: product.cakeProductPhoto
          }
      )
    } else if (aType === 'item') {
      const item = t as Item;
      form.id = item.cakeItemId
      form.name = item.cakeItemName
      form.price = item.cakeItemPrice
      photoUrl.value = item.cakeItemPhoto
      oldPhotoUrl.value = item.cakeItemPhoto
      fileList.value = []
      fileList.value.push(
          {
            name: item.cakeItemPhoto.substring(item.cakeItemPhoto.lastIndexOf("/") + 1),
            url: item.cakeItemPhoto
          }
      )
    }
    disabled.value = false
    edit.value = true
    dialogVisible.value = isShow
    title.value = (edit.value === true ? '修改' : '添加') + (type.value === 'item' ? '配料' : '产品')
    buttonName.value = edit.value === true ? '修改' : '添加'
  }
})

</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      :title="title"
      style="  font-size: 16px;
      line-height: 1.5;
      color: #333;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
      height: auto;
      width: 30%;"
  >
    <el-form
        ref="formRef"
        label-width="60px"
        class="common-form"
        :model="form"
    >
      <el-form-item label="名称">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="form.price"/>
      </el-form-item>
      <el-form-item>
        <single-file-upload
            ref="aUpload"
            :edit="edit"
            :dialogVisible="dialogVisible"
            :disabled="disabled"
            :fileList="fileList"
            @changeButtonDisabledToFalse="changeButtonDisabledToFalse"
            @changeButtonDisabledToTrue="changeButtonDisabledToTrue"
            @changeDialogVisibleToFalse="changeDialogVisibleToFalse"
            @changeDialogVisibleToTure="changeDialogVisibleToTure"
        ></single-file-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="disabled" @click="uploadAndProcessProduct">{{ buttonName }}
        </el-button>
        <el-button @click="closeThis">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>


</template>

<style scoped lang="scss">

.el-dialog {


  .el-form {
    &.common-form {
      display: flex;
      flex-direction: column;
      align-items: center;

      .el-form-item {
        width: 100%;
      }

      .el-button {
        width: 40%;
      }
    }
  }
}
</style>