<template>
  <div
    v-if="appStore.storeConfig?.banner_message"
    class="text-white text-center text-sm py-2 px-4 font-medium"
    style="background-color: var(--color-primary-700, #1d4ed8)"
  >
    {{ appStore.storeConfig.banner_message }}
  </div>

  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
    <div class="container mx-auto px-4">
      <div class="flex items-center gap-4 py-4">
        <RouterLink to="/" class="flex items-center gap-3 min-w-0">
          <img
            v-if="appStore.branding.logo"
            :src="appStore.branding.logo"
            :alt="appStore.storeName"
            class="h-10 w-auto object-contain"
          />
          <div v-else class="text-2xl font-bold text-primary-600 truncate">
            {{ appStore.storeName }}
          </div>
        </RouterLink>

        <nav class="hidden xl:flex items-center gap-5 ml-4">
          <button
            v-for="item in navItems"
            :key="`${item.label}-${item.url}`"
            type="button"
            class="text-sm font-medium transition-colors"
            :class="item.highlight ? 'text-primary-700' : 'text-gray-700 hover:text-primary-600'"
            @click="navigateTo(item.url, item.open_in_new_tab || item.openInNewTab)"
          >
            {{ item.label }}
          </button>
        </nav>

        <form
          v-if="appStore.searchVisible"
          class="hidden lg:flex ml-auto w-full max-w-md"
          @submit.prevent="submitSearch"
        >
          <div class="flex w-full items-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <Search class="ml-3 h-4 w-4 text-gray-400" />
            <input
              v-model.trim="searchTerm"
              type="text"
              placeholder="Search products..."
              class="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
            />
            <button type="submit" class="mr-1 rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              Search
            </button>
          </div>
        </form>

        <div class="ml-auto lg:ml-0 flex items-center gap-3">
          <RouterLink to="/cart" class="relative rounded-xl p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary-600">
            <ShoppingCart class="h-6 w-6" />
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white"
            >
              {{ cartStore.itemCount }}
            </span>
          </RouterLink>

          <div class="relative hidden md:block">
            <template v-if="appStore.isAuthenticated">
              <button
                type="button"
                class="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary-200 hover:text-primary-600"
                @click="accountOpen = !accountOpen"
              >
                <User class="h-5 w-5" />
                <span class="max-w-[140px] truncate">{{ appStore.userName || 'Account' }}</span>
                <ChevronDown class="h-4 w-4" />
              </button>

              <div
                v-if="accountOpen"
                class="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
              >
                <button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" @click="goToAccount">
                  <User class="h-4 w-4" />
                  My account
                </button>
                <button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" @click="goToOrders">
                  <Package class="h-4 w-4" />
                  Orders
                </button>
                <button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" @click="goToRepairs">
                  <Wrench class="h-4 w-4" />
                  Repairs
                </button>
                <button type="button" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" @click="handleSignOut">
                  <LogOut class="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </template>

            <div v-else class="flex items-center gap-2">
              <RouterLink to="/login" class="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Login
              </RouterLink>
              <RouterLink
                v-if="appStore.allowRegistration"
                to="/login?mode=register"
                class="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Register
              </RouterLink>
            </div>
          </div>

          <button
            type="button"
            class="rounded-xl p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div v-if="mobileMenuOpen" class="border-t border-gray-200 py-4 md:hidden">
        <form v-if="appStore.searchVisible" class="mb-4" @submit.prevent="submitSearchAndClose">
          <div class="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <Search class="ml-3 h-4 w-4 text-gray-400" />
            <input
              v-model.trim="searchTerm"
              type="text"
              placeholder="Search products..."
              class="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
            />
          </div>
        </form>

        <div class="flex flex-col gap-2">
          <button
            v-for="item in navItems"
            :key="`mobile-${item.label}-${item.url}`"
            type="button"
            class="rounded-xl px-3 py-2 text-left text-sm font-medium"
            :class="item.highlight ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
            @click="navigateAndClose(item.url, item.open_in_new_tab || item.openInNewTab)"
          >
            {{ item.label }}
          </button>

          <div class="mt-3 border-t border-gray-200 pt-3">
            <template v-if="appStore.isAuthenticated">
              <button type="button" class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50" @click="mobileAccount('account')">My account</button>
              <button type="button" class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50" @click="mobileAccount('orders')">Orders</button>
              <button type="button" class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50" @click="mobileAccount('repairs')">Repairs</button>
              <button type="button" class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50" @click="handleSignOut">Sign out</button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="mobileMenuOpen = false">Login</RouterLink>
              <RouterLink
                v-if="appStore.allowRegistration"
                to="/login?mode=register"
                class="mt-2 block rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white"
                @click="mobileMenuOpen = false"
              >
                Register
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import {
  ChevronDown,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  Wrench,
  X,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const cartStore = useCartStore();

const mobileMenuOpen = ref(false);
const accountOpen = ref(false);
const searchTerm = ref(route.query.q || '');

const navItems = computed(() => {
  if (appStore.navigationItems.length) {
    return appStore.navigationItems;
  }

  return [
    { label: 'Products', url: '/products' },
    { label: 'Parts', url: '/products?type=part' },
    { label: 'Devices', url: '/products?type=device' },
    { label: 'Accessories', url: '/products?type=general_product' },
    { label: 'Repairs', url: '/repair-booking', highlight: true },
  ];
});

watch(() => route.query.q, value => {
  searchTerm.value = value || '';
});

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false;
  accountOpen.value = false;
});

function navigateTo(url, openInNewTab = false) {
  accountOpen.value = false;

  if (!url) return;

  if (/^https?:\/\//i.test(url)) {
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.location.href = url;
    return;
  }

  router.push(url);
}

function navigateAndClose(url, openInNewTab = false) {
  mobileMenuOpen.value = false;
  navigateTo(url, openInNewTab);
}

function submitSearch() {
  router.push({
    path: '/products',
    query: searchTerm.value ? { q: searchTerm.value } : {},
  });
}

function submitSearchAndClose() {
  mobileMenuOpen.value = false;
  submitSearch();
}

function goToAccount() {
  accountOpen.value = false;
  router.push('/account');
}

function goToOrders() {
  accountOpen.value = false;
  router.push({ path: '/account', query: { tab: 'orders' } });
}

function goToRepairs() {
  accountOpen.value = false;
  router.push({ path: '/account', query: { tab: 'repairs' } });
}

function mobileAccount(target) {
  mobileMenuOpen.value = false;
  if (target === 'orders') {
    goToOrders();
    return;
  }
  if (target === 'repairs') {
    goToRepairs();
    return;
  }
  goToAccount();
}

async function handleSignOut() {
  accountOpen.value = false;
  mobileMenuOpen.value = false;
  await appStore.signOut();
  router.push('/');
}
</script>
