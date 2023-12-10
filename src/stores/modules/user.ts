import {defineStore} from 'pinia'
import {User} from "@/models/user";


export const userStore = defineStore("user", {
    state: () => {
        return {
            user: null as User | null,
        }
    },

    actions: {
        setUser(user: User) {
            this.user = user
        }
    },

    persist: {
        storage: {
            getItem(key) {
                return localStorage.getItem(key)
            },
            setItem(key, value) {
                return localStorage.setItem(key, value)
            },
        },
    },

})

