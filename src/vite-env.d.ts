/// <reference types="vite/client" />
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module "@/utils/http.js"
declare module '@/utils/policy.js'
declare module "uuid"
declare module '@/utils/valid.js'