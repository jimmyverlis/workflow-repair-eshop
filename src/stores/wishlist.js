import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { retentionAPI } from '@/services/api/retention'
import { buildProductKey, normalizeProduct } from '@/utils/catalog'

function localKey(storeId) {
  return `eshop:wishlist:${storeId || 'default'}`
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([])
  const loadedStoreId = ref(null)
  const loading = ref(false)
  const error = ref('')

  const count = computed(() => items.value.length)

  function persistLocal(storeId) {
    localStorage.setItem(localKey(storeId), JSON.stringify(items.value))
  }

  function loadLocal(storeId) {
    try {
      const stored = JSON.parse(localStorage.getItem(localKey(storeId)) || '[]')
      items.value = Array.isArray(stored) ? stored.map(item => normalizeProduct(item)) : []
    } catch {
      items.value = []
    }
  }

  async function loadWishlist(force = false) {
    const appStore = useAppStore()
    const storeId = appStore.storeId
    if (!storeId || (!force && loadedStoreId.value === storeId)) return

    loadLocal(storeId)
    loadedStoreId.value = storeId

    if (!appStore.isAuthenticated || appStore.wishlistEnabled === false) {
      return
    }

    loading.value = true
    error.value = ''

    try {
      const localItems = [...items.value]
      if (localItems.length) {
        for (const item of localItems) {
          await retentionAPI.addWishlistItem(storeId, item.id, item._collection || item._source || 'inventory')
        }
      }

      const remoteItems = await retentionAPI.getWishlist(storeId)
      items.value = remoteItems
        .map(entry => normalizeProduct(entry.product || {}))
        .filter(item => item.id)
      persistLocal(storeId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load wishlist.'
    } finally {
      loading.value = false
    }
  }

  function hasProduct(product) {
    return items.value.some(item => buildProductKey(item) === buildProductKey(normalizeProduct(product)))
  }

  async function addProduct(product) {
    const appStore = useAppStore()
    const storeId = appStore.storeId
    if (!storeId) return

    const normalized = normalizeProduct(product)
    if (!normalized.id || hasProduct(normalized)) return

    items.value.unshift(normalized)
    persistLocal(storeId)

    if (appStore.isAuthenticated && appStore.wishlistEnabled !== false) {
      await retentionAPI.addWishlistItem(storeId, normalized.id, normalized._collection || normalized._source || 'inventory')
    }
  }

  async function removeProduct(product) {
    const appStore = useAppStore()
    const storeId = appStore.storeId
    if (!storeId) return

    const normalized = normalizeProduct(product)
    items.value = items.value.filter(item => buildProductKey(item) !== buildProductKey(normalized))
    persistLocal(storeId)

    if (appStore.isAuthenticated && appStore.wishlistEnabled !== false && normalized.id) {
      await retentionAPI.removeWishlistItem(storeId, normalized._collection || normalized._source || 'inventory', normalized.id)
    }
  }

  async function toggleProduct(product) {
    if (hasProduct(product)) {
      await removeProduct(product)
      return false
    }

    await addProduct(product)
    return true
  }

  function clear() {
    const appStore = useAppStore()
    items.value = []
    if (appStore.storeId) {
      localStorage.removeItem(localKey(appStore.storeId))
    }
  }

  return {
    items,
    loading,
    error,
    count,
    loadWishlist,
    hasProduct,
    addProduct,
    removeProduct,
    toggleProduct,
    clear,
  }
})
