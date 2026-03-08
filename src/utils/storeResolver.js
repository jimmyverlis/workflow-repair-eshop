/**
 * storeResolver.js
 *
 * Resolves which store to serve by calling the Laravel API.
 *
 * Production:  hostname is either a verified custom domain (shop.clientdomain.com)
 *              or a platform subdomain (mystore.workflow.repair).
 *              Both are handled via the X-Domain header by api.js.
 *
 * Dev:         use ?store=<slug|id> query param or VITE_FALLBACK_STORE_ID env.
 *
 * Returns one of:
 *  { type: 'store', storeId, config }
 *  { type: 'error', message }
 */

import api from '@/services/api'

const isLocal = () => {
  const h = window.location.hostname
  return h === 'localhost' || h.startsWith('127.') || h.startsWith('192.') || h === '0.0.0.0'
}

/**
 * Main resolver — call once at app startup.
 */
export async function resolveStore() {
  const hostname = window.location.hostname
  const searchParams = new URLSearchParams(window.location.search)

  try {
    const params = {}

    if (isLocal()) {
      // Dev: allow ?store=<slug|id> or env var fallback
      const devStore = searchParams.get('store')
        || sessionStorage.getItem('eshop_selected_store')
        || import.meta.env.VITE_FALLBACK_STORE_ID
      if (devStore) params.store = devStore
    }
    // Production: X-Domain header (set by api.js) carries the hostname.
    // Backend resolves by custom domain or subdomain slug automatically.

    const { data } = await api.get('/eshop/resolve', { params })
    const config = data.data

    return { type: 'store', storeId: config.store_id, config }
  } catch (err) {
    const message = err.response?.data?.message || `No e-shop configured for: ${hostname}`
    return { type: 'error', message }
  }
}

/**
 * Persists a store selection across refreshes (StoreLocator compatibility).
 */
export function selectStoreInSession(storeId) {
  sessionStorage.setItem('eshop_selected_store', storeId)
}

export function clearStoreSelection() {
  sessionStorage.removeItem('eshop_selected_store')
}
