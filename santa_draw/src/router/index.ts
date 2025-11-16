import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
    },
    {
        path: '/draw/manual',
        name: 'draw-manuel',
        component: () => import('@/views/DrawView.vue'),
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
