<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <!-- Top bar -->
      <div class="flex items-center justify-between py-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-2">
          <div class="text-2xl font-bold text-primary-600">
            {{ appStore.storeName }}
          </div>
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <RouterLink
            to="/products"
            class="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            Προϊόντα
          </RouterLink>
          <RouterLink
            to="/repair-booking"
            class="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            Επισκευές
          </RouterLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <!-- Cart -->
          <RouterLink
            to="/cart"
            class="relative hover:text-primary-600 transition-colors"
          >
            <ShoppingCart class="w-6 h-6" />
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartStore.itemCount }}
            </span>
          </RouterLink>

          <!-- User Menu -->
          <button
            v-if="appStore.isAuthenticated"
            @click="router.push('/account')"
            class="hover:text-primary-600 transition-colors"
            title="My Account"
          >
            <User class="w-6 h-6" />
          </button>
          <button
            v-else
            @click="router.push('/login')"
            class="btn btn-primary text-sm"
          >
            Σύνδεση
          </button>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden hover:text-primary-600"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-gray-200 py-4"
      >
        <nav class="flex flex-col space-y-3">
          <RouterLink
            to="/products"
            class="text-gray-700 hover:text-primary-600 font-medium py-2"
            @click="mobileMenuOpen = false"
          >
            Προϊόντα
          </RouterLink>
          <RouterLink
            to="/repair-booking"
            class="text-gray-700 hover:text-primary-600 font-medium py-2"
            @click="mobileMenuOpen = false"
          >
            Επισκευές
          </RouterLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { ShoppingCart, User, Menu, X } from 'lucide-vue-next';

const router = useRouter();
const appStore = useAppStore();
const cartStore = useCartStore();
const mobileMenuOpen = ref(false);
</script>
