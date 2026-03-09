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
      <CookieConsent />
    </template>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAppStore } from './stores/app'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import StoreLocator from './views/StoreLocator.vue'
import CookieConsent from './components/CookieConsent.vue'
import { useAnalytics } from './composables/useAnalytics'
import { useSeo } from './composables/useSeo'

const appStore = useAppStore()
const analytics = useAnalytics()
const seo = useSeo()
const router = useRouter()

// Override theme tokens at runtime so storefront branding updates without a rebuild.
const cssVars = computed(() => {
  const color = appStore.branding.primaryColor || '#3b82f6'

  return {
    '--color-primary': color,
    '--color-primary-400': color,
    '--color-primary-500': color,
    '--color-primary-600': color,
    '--color-primary-700': color,
    '--color-primary-800': color,
  }
})

onMounted(() => {
  // Inject analytics if consent already given (or consent not required)
  analytics.init()

  // Track page views on every route change
  router.afterEach(() => {
    analytics.trackPageView()
  })

  // Set base org structured data
  if (appStore.storeConfig) {
    seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: appStore.storeName,
      url: window.location.origin,
      logo: appStore.branding.logo || undefined,
      contactPoint: appStore.storeDetails.phone ? {
        '@type': 'ContactPoint',
        telephone: appStore.storeDetails.phone,
        contactType: 'customer service',
      } : undefined,
    }, 'org')
  }
})
</script>
