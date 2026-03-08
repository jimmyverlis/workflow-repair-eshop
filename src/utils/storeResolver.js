/**
 * storeResolver.js
 *
 * Resolves which store to serve by calling the Laravel API.
 * Replaces the Firebase Firestore-based implementation.
 *
 * Returns one of:
 *  { type: 'store', storeId, config }
 *  { type: 'error', message }
 */

import api from '@/services/api'

const isDev = () => {
  const h = window.location.hostname
  return h === 'localhost' || h.startsWith('127.') || h.startsWith('192.') || h === '0.0.0.0'
}

/**
 * Main resolver — call once at app startup.
 */
export async function resolveStore() {
  const hostname = window.location.hostname
  const searchParams = new URLSearchParams(window.location.search)

  // In dev, allow ?store=<id> or VITE_FALLBACK_STORE_ID to bypass hostname resolution
  const devStoreId = isDev()
    ? searchParams.get('store') ||
      sessionStorage.getItem('eshop_selected_store') ||
      import.meta.env.VITE_FALLBACK_STORE_ID
    : null

  try {
    const params = {}
    if (devStoreId) params.store = devStoreId

    const { data } = await api.get('/eshop/resolve', { params })
    const config = data.data

    return { type: 'store', storeId: config.store_id, config }
  } catch (err) {
    const message = err.response?.data?.message || `No e-shop configured for: ${hostname}`
    return { type: 'error', message }
  }
}

/**
 * Call this when a user picks a store (kept for compatibility with StoreLocator).
 * Persists the choice in sessionStorage so refreshes keep the same store.
 */
export function selectStoreInSession(storeId) {
  sessionStorage.setItem('eshop_selected_store', storeId)
}

/**
 * Clear the store selection.
 */
export function clearStoreSelection() {
  sessionStorage.removeItem('eshop_selected_store')
}
