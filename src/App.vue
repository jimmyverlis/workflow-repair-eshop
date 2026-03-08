<template>
  <div id="app" class="min-h-screen flex flex-col" :style="cssVars">

    <!-- Chain mode: no store picked yet → show store locator full-screen -->
    <template v-if="appStore.isChainMode && !appStore.storeSelected">
      <StoreLocator />
    </template>

    <!-- Normal store e-shop -->
    <template v-else>
      <Header />
      <main class="flex-1">
        <RouterView />
      </main>
      <Footer />
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { useAppStore } from './stores/app';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import StoreLocator from './views/StoreLocator.vue';

const appStore = useAppStore();

// Apply resolved branding as CSS custom property
const cssVars = computed(() => ({
  '--color-primary': appStore.branding.primaryColor || '#3b82f6'
}));
</script>
