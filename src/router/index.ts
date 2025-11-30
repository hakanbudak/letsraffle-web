import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/services/authHelpers'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        beforeEnter: (to, from, next) => {
            if (isAuthenticated()) {
                next('/dashboard')
            } else {
                next()
            }
        },
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
    },
    {
        path: '/draw/manual',
        name: 'draw-manuel',
        component: () => import('@/views/DrawView.vue'),
    },
    {
        path: '/draw/dynamic',
        name: 'draw-dynamic',
        component: () => import('@/views/DrawView.vue'),
    },
    {
        path: '/draws/:inviteCode',
        name: 'draw-invite-detail',
        component: () => import('@/views/DrawView.vue'),
    },
    {
        path: '/draw/join/:inviteCode?',
        name: 'join-draw',
        component: () => import('@/views/JoinDrawView.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
