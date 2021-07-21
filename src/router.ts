import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import MainView from "@/components/MainView.vue";

const routes: RouteRecordRaw[] = [
    {
        component: MainView,
        path: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
