import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

import { useAppStore } from './stores/app'
import { useCartStore } from './stores/cart'
import { useWishlistStore } from './stores/wishlist'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const appStore = useAppStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

async function initApp() {
  try {
    // Load cart from localStorage
    cartStore.loadCart()

    // Resolve store from hostname / subdomain / env fallback
    await appStore.initialize()

    if (appStore.storeId) {
      await wishlistStore.loadWishlist(true)
    }

    if (appStore.storeId) {
      console.log(`E-Shop ready: ${appStore.storeName} (${appStore.storeId})`)
    }

    app.mount('#app')

  } catch (err) {
    console.error('Init failed:', err)
    app.mount('#app')
  }
}

initApp()
