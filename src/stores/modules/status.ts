import {defineStore} from "pinia";

export const statusStore = defineStore('status', {

    state: () => {
        return {
            status: true
        }
    },
    actions: {
        setStatus(nowStatus: boolean) {
            this.status = nowStatus
        },
    }

})