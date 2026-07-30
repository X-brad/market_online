import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/connexion',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/inscription',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
  },
  {
    path: '/client/dashboard',
    name: 'ClientDashboard',
    component: () => import('../views/client/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'client' }
  },
  {
    path: '/coursiere/dashboard',
    name: 'CouriereDashboard',
    component: () => import('../views/coursiere/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'coursiere' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/profil',
    name: 'Profil',
    component: () => import('../views/Profil.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/coursiere/onboarding',
    name: 'CoursiereOnboarding',
    component: () => import('../views/coursiere/Onboarding.vue'),
    meta: { requiresAuth: true, role: 'coursiere' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Si connecté et essaie d'aller sur login/inscription → rediriger dashboard
  if ((to.name === 'Login' || to.name === 'Register') && authStore.token) {
    return next(authStore.getDashboardRoute())
  }

  if (to.meta.requiresAuth && !authStore.token) {
    return next('/connexion')
  }

  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    const role = authStore.user?.role
    if (role === 'client') return next('/client/dashboard')
    if (role === 'coursiere') return next('/coursiere/dashboard')
    if (role === 'admin') return next('/admin/dashboard')
    return next('/')
  }

  next()
})

export default router