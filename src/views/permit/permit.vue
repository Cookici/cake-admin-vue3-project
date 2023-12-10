<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Permit} from "@/models/permit";


const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const getPermitList = async () => {

  await $http({
    url: '/api/permit/list',
    method: 'get',
    params: $http.adornParams({current: 1, size: 1}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<Permit>> = response.data
    console.log(result.data);
  })
}

onMounted(() => {
  getPermitList()
})
</script>

<template>

</template>

<style scoped>

</style>