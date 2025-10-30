import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('/src/components/HomePage.vue'),
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
