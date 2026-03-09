<template>
  <Transition name="cookie">
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-2xl"
    >
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p class="flex-1 text-sm text-gray-300 leading-relaxed">{{ text }}</p>
        <div class="flex gap-3 shrink-0">
          <button
            @click="accept"
            class="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            :style="{ background: 'var(--color-primary, #3b82f6)' }"
          >
            Accept
          </button>
          <button
            @click="decline"
            class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-semibold transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAnalytics } from '@/composables/useAnalytics'

const appStore = useAppStore()
const analytics = useAnalytics()
const visible = ref(false)

const text = computed(() =>
  appStore.cookieConsentText ||
  'We use cookies to improve your experience and analyze site traffic. By accepting, you agree to our use of cookies.'
)

// Watch because storeConfig loads asynchronously — cookieConsentEnabled is false on mount
watch(
  () => appStore.cookieConsentEnabled,
  (enabled) => {
    if (!enabled) return
    if (!localStorage.getItem('cookie_consent')) visible.value = true
  },
  { immediate: true }
)

function accept() {
  localStorage.setItem('cookie_consent', 'accepted')
  visible.value = false
  analytics.init()
}

function decline() {
  localStorage.setItem('cookie_consent', 'declined')
  visible.value = false
}
</script>

<style scoped>
.cookie-enter-active,
.cookie-leave-active {
  transition: transform 0.3s ease;
}
.cookie-enter-from,
.cookie-leave-to {
  transform: translateY(100%);
}
</style>
