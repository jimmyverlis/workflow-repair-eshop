import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '@/stores/app';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/products',
    name: 'ProductCatalog',
    component: () => import('@/views/ProductCatalog.vue'),
    meta: { title: 'Προϊόντα' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: 'Προϊόν' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: 'Καλάθι' }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: 'Checkout' }
  },
  {
    path: '/repair-booking',
    name: 'RepairBooking',
    component: () => import('@/views/RepairBooking.vue'),
    meta: { title: 'Κλείσιμο Επισκευής' }
  },
  {
    path: '/track-repair/:deviceId',
    name: 'RepairTracking',
    component: () => import('@/views/RepairTracking.vue'),
    meta: { title: 'Παρακολούθηση Επισκευής' }
  },
  {
    path: '/account',
    name: 'CustomerPortal',
    component: () => import('@/views/CustomerPortal.vue'),
    meta: { requiresAuth: true, title: 'Ο Λογαριασμός μου' }
  },
  {
    path: '/order/:orderId',
    name: 'OrderTracking',
    component: () => import('@/views/OrderTracking.vue'),
    meta: { title: 'Παρακολούθηση Παραγγελίας' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: 'Σύνδεση' }
  },
  {
    // Chain store locator — shown automatically by App.vue in chain mode,
    // but also reachable directly so the user can switch stores.
    path: '/stores',
    name: 'StoreLocator',
    component: () => import('@/views/StoreLocator.vue'),
    meta: { title: 'Επιλογή Καταστήματος' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  }
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const appStore = useAppStore();

  document.title = `${to.meta.title || 'E-Shop'} — ${appStore.storeName}`;

  if (to.meta.requiresAuth && !appStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
