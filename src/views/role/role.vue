<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Role} from "@/models/role";


const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const getRoleList = async () => {

  await $http({
    url: '/api/role/list',
    method: 'get',
    params: $http.adornParams({current: 1, size: 1}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<Role>> = response.data
    console.log(result.data);
  })
}

onMounted(() => {
  getRoleList()
})
</script>

<template>

</template>

<style scoped>

</style>