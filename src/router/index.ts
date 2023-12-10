import {createRouter, createWebHistory, Router, RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import("@/views/login.vue"),
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import("@/views/home/home.vue"),
        children: [
            {
                path: '/home/item',
                name: 'Item',
                component: () => import("@/views/item/item.vue"),
            },
            {
                path: '/home/label',
                name: 'Label',
                component: () => import("@/views/label/label.vue"),
            },
            {
                path: '/home/permit',
                name: 'Permit',
                component: () => import("@/views/permit/permit.vue"),
            },
            {
                path: '/home/product',
                name: 'Product',
                component: () => import("@/views/product/product.vue"),
            },
            {
                path: '/home/role',
                name: 'Role',
                component: () => import("@/views/role/role.vue"),
            },
            {
                path: '/home/user',
                name: 'User',
                component: () => import("@/views/user/user.vue"),
            },
        ]
    },
]

const router: Router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    console.log("from ====> {}", from)
    if (to.name !== 'Login' && (localStorage.getItem('token') === null || localStorage.getItem('token') === undefined || localStorage.getItem('token') === '')
    ) {
        next({name: 'Login'})
    } else {
        next()
    }
})


export default router
