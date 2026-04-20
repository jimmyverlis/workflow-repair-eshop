import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '@/stores/app';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/products',
    name: 'ProductCatalog',
    component: () => import('@/views/ProductCatalog.vue'),
    meta: { title: 'Products' },
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: () => import('@/views/WarehouseView.vue'),
    meta: { title: 'Warehouse' },
  },
  {
    path: '/brands/:brand',
    name: 'BrandCatalog',
    component: () => import('@/views/ProductCatalog.vue'),
    meta: { title: 'Brand' },
  },
  {
    path: '/compatibility/:brand/:model?',
    name: 'CompatibilityCatalog',
    component: () => import('@/views/ProductCatalog.vue'),
    meta: { title: 'Compatibility' },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: 'Product' },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: 'Cart' },
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: () => import('@/views/WishlistView.vue'),
    meta: { title: 'Wishlist' },
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/CompareView.vue'),
    meta: { title: 'Compare' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: 'Checkout' },
  },
  {
    path: '/repair-booking',
    name: 'RepairBooking',
    component: () => import('@/views/RepairBooking.vue'),
    meta: { title: 'Repair Booking' },
  },
  {
    path: '/track-repair/:deviceId',
    name: 'RepairTracking',
    component: () => import('@/views/RepairTracking.vue'),
    meta: { title: 'Repair Tracking' },
  },
  {
    path: '/repair-offer/:token',
    name: 'RepairOfferPayment',
    component: () => import('@/views/RepairOfferPayment.vue'),
    meta: { title: 'Repair Offer' },
  },
  {
    path: '/account',
    name: 'CustomerPortal',
    component: () => import('@/views/CustomerPortal.vue'),
    meta: { requiresAuth: true, title: 'My Account' },
  },
  {
    path: '/order/:orderId',
    name: 'OrderTracking',
    component: () => import('@/views/OrderTracking.vue'),
    meta: { title: 'Order Tracking' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: 'Login' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { title: 'Forgot Password' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { title: 'Reset Password' },
  },
  {
    path: '/about',
    name: 'AboutPage',
    component: () => import('@/views/PageView.vue'),
    props: { pageKey: 'about' },
    meta: { title: 'About' },
  },
  {
    path: '/contact',
    name: 'ContactPage',
    component: () => import('@/views/PageView.vue'),
    props: { pageKey: 'contact' },
    meta: { title: 'Contact' },
  },
  {
    path: '/shipping',
    name: 'ShippingPage',
    component: () => import('@/views/PageView.vue'),
    props: { pageKey: 'shipping' },
    meta: { title: 'Shipping' },
  },
  {
    path: '/returns',
    name: 'ReturnsPage',
    component: () => import('@/views/PageView.vue'),
    props: { pageKey: 'returns' },
    meta: { title: 'Returns' },
  },
  {
    path: '/privacy',
    name: 'PrivacyPage',
    component: () => import('@/views/PageView.vue'),
    props: { pageKey: 'privacy' },
    meta: { title: 'Privacy' },
  },
  {
    path: '/terms',
    name: 'TermsPage',
    component: () => import('@/views/PageView.vue'),
    props: { pageKey: 'terms' },
    meta: { title: 'Terms' },
  },
  {
    path: '/stores',
    name: 'StoreLocator',
    component: () => import('@/views/StoreLocator.vue'),
    meta: { title: 'Store Locator' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const appStore = useAppStore();

  document.title = `${to.meta.title || 'E-Shop'} - ${appStore.storeName}`;

  if (to.meta.requiresAuth && !appStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  next();
});

export default router;
