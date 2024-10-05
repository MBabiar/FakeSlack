import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
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

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
