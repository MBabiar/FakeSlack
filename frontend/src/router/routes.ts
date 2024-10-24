import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue')
  },

  // Auth routes
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/auth/LoginPage.vue') }]
  },
  {
    path: '/register',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/auth/RegisterPage.vue') }]
  },

  // Main routes
  {
    path: '/index',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
