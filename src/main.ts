import { createApp } from 'vue'
import App from '@/App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import pinia from '@/stores/index.ts'
import router from "@/router/index";
import http from '@/utils/http.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

app.config.globalProperties.$http = http

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus).use(pinia).use(router)

app.mount('#app')
