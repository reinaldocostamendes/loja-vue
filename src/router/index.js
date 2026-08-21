import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const StoreLayout = () => import('@/layouts/StoreLayout.vue')
const AdminLayout = () => import('@/layouts/AdminLayout.vue')

const routes = [
  {
    path: '/',
    component: StoreLayout,
    children: [
      { path: '', name: 'home', component: () => import('@/views/store/HomeView.vue') },
      { path: 'produtos/:id', name: 'product', component: () => import('@/views/store/ProductView.vue'), props: true },
      { path: 'carrinho', name: 'cart', component: () => import('@/views/store/CartView.vue') },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('@/views/store/CheckoutView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'encomendas',
        name: 'orders',
        component: () => import('@/views/store/OrdersView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'encomendas/:id',
        name: 'order-detail',
        component: () => import('@/views/store/OrderDetailView.vue'),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: 'conta',
        name: 'account',
        component: () => import('@/views/store/AccountView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'entrar',
        name: 'login',
        component: () => import('@/views/store/LoginView.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'registar',
        name: 'register',
        component: () => import('@/views/store/RegisterView.vue'),
        meta: { guestOnly: true },
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'produtos', name: 'admin-products', component: () => import('@/views/admin/ProductsView.vue') },
      { path: 'categorias', name: 'admin-categories', component: () => import('@/views/admin/CategoriesView.vue') },
      { path: 'encomendas', name: 'admin-orders', component: () => import('@/views/admin/OrdersView.vue') },
      { path: 'encomendas/:id', name: 'admin-order-detail', component: () => import('@/views/admin/OrderDetailView.vue'), props: true },
      { path: 'utilizadores', name: 'admin-users', component: () => import('@/views/admin/UsersView.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.ready) auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
  return true
})

export default router
