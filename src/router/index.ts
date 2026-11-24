import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/services/authHelpers'

const routes = [
    // public pages: Turkish without a prefix, English under /en (see src/i18n/localized.ts)
    {
        path: '/:lang(en)?',
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
        path: '/:lang(en)?/draw/join/:inviteCode?',
        name: 'join-draw',
        component: () => import('@/views/JoinDrawView.vue'),
    },
    {
        path: '/reveal/:token',
        name: 'reveal',
        component: () => import('@/views/RevealView.vue'),
    },
    { path: '/gizlilik', redirect: '/privacy' },
    {
        path: '/:lang(en)?/privacy',
        name: 'privacy',
        component: () => import('@/views/LegalView.vue'),
        props: { doc: 'privacy' },
    },
    { path: '/kosullar', redirect: '/terms' },
    {
        path: '/:lang(en)?/terms',
        name: 'terms',
        component: () => import('@/views/LegalView.vue'),
        props: { doc: 'terms' },
    },
    { path: '/destek', redirect: '/support' },
    {
        path: '/:lang(en)?/support',
        name: 'support',
        component: () => import('@/views/LegalView.vue'),
        props: { doc: 'support' },
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
