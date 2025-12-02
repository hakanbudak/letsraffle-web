import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
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
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/ForgotPasswordView.vue'),
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('@/views/ResetPasswordView.vue'),
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
