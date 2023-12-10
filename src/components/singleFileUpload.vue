<script setup lang="ts">
import {UploadFilled} from "@element-plus/icons-vue";
import {
  ElMessage,
  genFileId, UploadFile, UploadFiles,
  UploadInstance,
  UploadRawFile,
  UploadUserFile
} from "element-plus";
import {reactive, ref, onMounted, watch} from "vue";
import {policy} from "@/utils/policy.js";
import {Data} from "@/models/data";
import {Oss} from "@/models/oss";
import {v4} from "uuid";


const props = defineProps({
  edit: Boolean,
  disabled: Boolean,
  dialogVisible: Boolean,
  fileList: Array,
})

const photoUrl = ref<string>('')
const upload = ref<UploadInstance>()
const suffer = ref<string>('.png')
const fileList = ref<UploadUserFile[]>(props.fileList)
const oss = reactive({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})
const changeStatus = ref<boolean>(false)
console.log("changeStatus , ", changeStatus.value)

const emit = defineEmits(['changeButtonDisabledToFalse', 'changeButtonDisabledToTrue', 'changeDialogVisibleToFalse', 'changeDialogVisibleToTure'])


watch(
    () => props.fileList,
    (newVal, oldVal) => {
      fileList.value = newVal
      console.log("singleFIleUpload fileList.value ===> {}", fileList.value)
    }, {
      immediate: true,
      deep: true
    }
)


watch(
    () => changeStatus.value,
    (newVal, oldVal) => {
      console.log(new Date(), " :  changeStatus: ", oldVal, " ===> ", newVal)
    }, {
      immediate: true,
      deep: true
    }
)


const uploadComponentToUpload = async () => {
  await getPolicy();
  await upload.value!.submit();
}


const getPolicy = async () => {
  await policy().then((data: Data<Oss>) => {
    oss.policy = data.data.policy;
    oss.signature = data.data.signature;
    oss.ossaccessKeyId = data.data.accessid;
    oss.key = data.data.dir + v4() + suffer.value;
    oss.dir = data.data.dir;
    oss.host = data.data.host;
    photoUrl.value = oss.host + "/" + oss.key
  })
}


const changeHandler = async (uploadFile: UploadFile, uploadFiles: UploadFiles) => {

  changeStatus.value = true

  const isLt5M = uploadFile.size / 1024 / 1024 > 5;
  if (isLt5M) {
    ElMessage.warning('上传文件大小不能超过 5MB')
    await emit('changeButtonDisabledToTrue')
    return;
  }

  if (props.disabled) {
    await emit('changeButtonDisabledToFalse')
  }

}

const handleExceed: (files: UploadRawFile[]) => void = (files: UploadRawFile[]) => {

  changeStatus.value = true

  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}


const removeHandler = () => {
  emit('changeButtonDisabledToTrue')
}


const successHandler = async () => {
  await emit('changeButtonDisabledToTrue')
  await emit('changeDialogVisibleToFalse')
  changeStatus.value = false
}

const errorHandler = async () => {
  await emit('changeButtonDisabledToTrue')
  await emit('changeDialogVisibleToFalse')
  changeStatus.value = false
}

defineExpose({
  uploadComponentToUpload,
  setPhotoUrl(newPhotoUrl: string) {
    photoUrl.value = newPhotoUrl
  },
  getPhotoUrl() {
    return photoUrl.value
  },
  getChangeStatus() {
    return changeStatus.value
  },
  setChangeStatus(options: boolean) {
    changeStatus.value = options
  },
})


onMounted(() => {

})


</script>

<template>
  <el-upload
      ref="upload"
      drag
      list-type='picture'
      action="https://lrh-cake-project.oss-cn-beijing.aliyuncs.com"
      style="width: 100%;"
      :limit="1"
      :on-exceed="handleExceed"
      :auto-upload="false"
      :data="oss"
      :file-list="fileList"
      :on-remove="removeHandler"
      :on-change="changeHandler"
      :on-success="successHandler"
      :on-error="errorHandler"
  >
    <el-icon class="el-icon--upload">
      <upload-filled/>
    </el-icon>
    <div class="el-upload__text">
      拖动文件到这里或<em>点击上传</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        limit 1 file, new file will cover the old file
      </div>
    </template>
  </el-upload>
</template>


<style lang="scss" scoped>
.el-upload {
  width: 100%;
  height: 100%;
}
</style>