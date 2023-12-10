<script setup lang="ts">
import {ComponentInternalInstance, getCurrentInstance} from "vue";
import {AxiosResponse} from "axios";
import {Data} from "@/models/data";
import {onMounted} from "vue";
import {Page} from "@/models/page";
import {Label} from "@/models/label";


const {$http} = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties
const getLabelList = async () => {

  await $http({
    url: '/api/label/list',
    method: 'get',
    params: $http.adornParams({current: 1, size: 1}),
  }).then((response: AxiosResponse) => {
    let result: Data<Page<Label>> = response.data
    console.log(result.data);
  })
}

onMounted(() => {
  getLabelList()
})
</script>

<template>

</template>

<style scoped>

</style>