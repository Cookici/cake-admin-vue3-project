<script setup lang="ts">

import {ComponentInternalInstance, getCurrentInstance, reactive, ref} from "vue";
import {Form} from "@/models/form";
import {LabelModel} from "@/models/label";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {ElMessage} from "element-plus";
import {RoleModel} from "@/models/role";
import {PermitModel} from "@/models/permit";


const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const edit = ref<boolean>(false)
const type = ref<string>('')
const title = ref<string>('')
const buttonName = ref<string>('')
const form = reactive<Form>({
  photoUrl: "",
  price: 0,
  id: 0,
  name: '',
  other: '',
  level: 0,
})
const dialogVisible = ref(false)
const emits = defineEmits(['getLabelList', 'getRoleList', 'getPermitList']);

const closeThis = () => {
  dialogVisible.value = false
}

const editOrAdd = () => {
  if (edit.value === true) {
    idEdit()
  } else if (edit.value === false) {
    isAdd()
  }

}

const isAdd = async () => {
  await $http({
    url: `/api/${type.value}/add`,
    method: 'post',
    data: setAddData(),
  }).then((response: AxiosResponse) => {
    let result: Data<string> = response.data
    if (result.code === 200) {
      ElMessage.success(result.data)
      freshList()
      dialogVisible.value = false
    } else {
      freshList()
      dialogVisible.value = true
      ElMessage.error(result.message)
    }
  }).catch(() => {
    freshList()
    dialogVisible.value = false
    ElMessage.error("检查是否添加重数据")
  })
}

const idEdit = async () => {
  await $http({
    url: `/api/${type.value}/edit`,
    method: 'put',
    data: setEditData()
  }).then((response: AxiosResponse) => {
    let result: Data<string> = response.data
    if (result.code === 200) {
      freshList()
      ElMessage.success(result.data)
      dialogVisible.value = false
    } else {
      freshList()
      ElMessage.error(result.message)
      dialogVisible.value = true
    }
  }).catch(() => {
    freshList()
    dialogVisible.value = false
    ElMessage.error("检查修改后数据是否重复")
  })
}


const freshList = () => {
  setTimeout(() => {
    if (type.value === 'label') {
      emits('getLabelList')
    } else if (type.value === 'role') {
      emits('getRoleList')
    } else if (type.value === 'permit') {
      emits('getPermitList')
    }
  }, 1000)
}

function setTypeName() {
  if (type.value === 'label') {
    return '标签'
  } else if (type.value === 'role') {
    return '角色'
  } else if (type.value === 'permit') {
    return '权限'
  }
}

function setAddData() {
  if (type.value === 'label') {
    return {cakeLabelName: form.name, cakeLabelIcon: form.other}
  } else if (type.value === 'role') {
    return {cakeRoleName: form.name, cakeRoleDescription: form.other, cakeRoleLevel: form.level}
  } else if (type.value === 'permit') {
    return {cakePermitName: form.name, cakePermitDescription: form.other}
  }
}

function setEditData() {
  if (type.value === 'label') {
    return {cakeLabelId: form.id, cakeLabelName: form.name, cakeLabelIcon: form.other}
  } else if (type.value === 'role') {
    return {cakeRoleId: form.id, cakeRoleName: form.name, cakeRoleDescription: form.other, cakeRoleLevel: form.level}
  } else if (type.value === 'permit') {
    return {cakePermitId: form.id, cakePermitName: form.name, cakePermitDescription: form.other}
  }
}

function setOther() {
  if (type.value === 'label') {
    return '图标字母'
  } else if (type.value === 'role') {
    return '角色描述'
  } else if (type.value == 'permit') {
    return '权限描述'
  }

}


defineExpose({
  setDialogVisible(aType: string, isShow: boolean) {
    edit.value = false
    type.value = aType
    form.name = ''
    form.other = ''
    form.level = 0
    dialogVisible.value = isShow
    title.value = (edit.value === true ? '修改' : '添加') + setTypeName()
    buttonName.value = edit.value === true ? '修改' : '添加'
  },
  getDialogVisible() {
    return dialogVisible.value
  },
  setDialogVisibleAndForm<T>(aType: string, t: T, isShow: boolean) {
    edit.value = true
    console.log(type.value)
    type.value = aType
    if (aType === 'label') {
      const label = t as LabelModel;
      form.id = label.cakeLabelId
      form.name = label.cakeLabelName
      form.other = label.cakeLabelIcon
    } else if (aType == 'role') {
      const role = t as RoleModel;
      form.id = role.cakeRoleId
      form.name = role.cakeRoleName
      form.other = role.cakeRoleDescription
      form.level = role.cakeRoleLevel
    } else if (aType == 'permit') {
      const permit = t as PermitModel
      form.id = permit.cakePermitId
      form.name = permit.cakePermitName
      form.other = permit.cakePermitDescription
    }
    dialogVisible.value = isShow
    title.value = (edit.value === true ? '修改' : '添加') + setTypeName()
    buttonName.value = edit.value === true ? '修改' : '添加'
  },
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
      width: 30%;
      margin-top: 15%;
"
  >
    <el-form
        ref="formRef"
        label-width="80px"
        class="common-form"
        :model="form"
    >
      <el-form-item label="名称">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item :label="setOther()">
        <el-input v-model="form.other"/>
      </el-form-item>
      <el-form-item v-if="type === 'role'" label="角色等级">
        <el-input v-model="form.level"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="editOrAdd">{{ buttonName }}
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
