import { createApp } from 'vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {far} from '@fortawesome/free-regular-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import App from '@/App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import pinia from '@/stores/index.ts'
import router from "@/router/index";
import http from '@/utils/http.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

library.add(fas, far, fab)

const app = createApp(App)

app.config.globalProperties.$http = http

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus).use(pinia).use(router).component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
