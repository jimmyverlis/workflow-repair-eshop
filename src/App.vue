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

function clampOpacity(value, fallback = 1) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(1, Math.max(0, numeric))
}

function normalizeHexColor(value, fallback) {
  const color = typeof value === 'string' ? value.trim() : ''
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    }

    return color
  }

  return fallback
}

function hexToRgbParts(value, fallback) {
  const hex = normalizeHexColor(value, fallback).slice(1)

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

// Override theme tokens at runtime so storefront branding updates without a rebuild.
const cssVars = computed(() => {
  const primary = normalizeHexColor(appStore.branding.primaryColor, '#3b82f6')
  const secondary = normalizeHexColor(appStore.branding.secondaryColor, '#10b981')
  const accent = normalizeHexColor(appStore.branding.accentColor, '#f59e0b')
  const headerBase = normalizeHexColor(appStore.branding.headerBg || primary, primary)
  const footerBg = normalizeHexColor(appStore.branding.footerBg, '#020617')
  const textColor = normalizeHexColor(appStore.branding.textColor, '#0f172a')
  const backgroundColor = normalizeHexColor(appStore.branding.backgroundColor, '#f9fafb')
  const headerOpacity = clampOpacity(appStore.branding.headerBgOpacity, 0.72)
  const { r, g, b } = hexToRgbParts(headerBase, primary)

  return {
    '--color-primary': primary,
    '--color-primary-400': primary,
    '--color-primary-500': primary,
    '--color-primary-600': primary,
    '--color-primary-700': primary,
    '--color-primary-800': primary,
    '--color-secondary': secondary,
    '--color-accent': accent,
    '--color-header-bg': `rgba(${r}, ${g}, ${b}, ${headerOpacity})`,
    '--color-footer-bg': footerBg,
    '--color-text': textColor,
    '--app-background': backgroundColor,
    '--app-text': textColor,
    '--app-header-bg': `rgba(${r}, ${g}, ${b}, ${headerOpacity})`,
    '--app-header-border': `rgba(${r}, ${g}, ${b}, ${Math.min(1, headerOpacity + 0.16)})`,
    '--app-footer-bg': footerBg,
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
