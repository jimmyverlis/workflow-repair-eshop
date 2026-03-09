import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { resolveStore, selectStoreInSession, clearStoreSelection } from '@/utils/storeResolver'

export const useAppStore = defineStore('app', () => {
  // ── Resolution state ──────────────────────────────────────────────────────
  const resolvedType = ref(null)  // 'store' | 'error'
  const resolveError = ref(null)

  // ── Store state ───────────────────────────────────────────────────────────
  const storeId = ref(null)
  const storeConfig = ref(null)   // resolved from /eshop/resolve

  // ── Auth ──────────────────────────────────────────────────────────────────
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Computed ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!currentUser.value)
  const userEmail = computed(() => currentUser.value?.email || '')
  const userName = computed(() => {
    if (!currentUser.value) return ''
    const { first_name, last_name, email } = currentUser.value
    return (first_name && last_name) ? `${first_name} ${last_name}` : (first_name || email || '')
  })

  const storeName = computed(() =>
    storeConfig.value?.store_name || storeConfig.value?.meta_title || 'E-Shop'
  )

  const branding = computed(() => ({
    primaryColor: storeConfig.value?.primary_color || '#3b82f6',
    logo: storeConfig.value?.logo || null,
  }))

  const storeDetails = computed(() => ({
    address: storeConfig.value?.store_address || '',
    phone: storeConfig.value?.store_phone || '',
    email: storeConfig.value?.store_email || '',
  }))

  const homeContent = computed(() => ({
    title: storeConfig.value?.home_title || '',
    subtitle: storeConfig.value?.home_subtitle || '',
  }))

  const searchVisible = computed(() => storeConfig.value?.show_search !== false)
  const allowRegistration = computed(() => storeConfig.value?.allow_registration !== false)
  const requireAuthForCheckout = computed(() => !!storeConfig.value?.require_auth_for_checkout)
  const requireAuthForRepairBooking = computed(() => !!storeConfig.value?.require_auth_for_repair_booking)
  const navigationItems = computed(() => Array.isArray(storeConfig.value?.nav_items) ? storeConfig.value.nav_items : [])
  const promoBanners = computed(() => Array.isArray(storeConfig.value?.promo_banners) ? storeConfig.value.promo_banners : [])

  const storeSelected = computed(() => !!storeId.value)
  const isChainMode = computed(() => false)

  // ── Initialize ────────────────────────────────────────────────────────────
  async function initialize() {
    isLoading.value = true
    resolveError.value = null
    error.value = null

    try {
      const resolution = await resolveStore()

      if (resolution.type === 'error') {
        resolvedType.value = 'error'
        resolveError.value = resolution.message
        throw new Error(resolution.message)
      }

      resolvedType.value = 'store'
      storeId.value = resolution.storeId
      storeConfig.value = resolution.config

      // Restore logged-in customer session if token exists
      const token = localStorage.getItem('eshop_customer_token')
      if (token) {
        await fetchUser()
      }

    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ── Customer Auth ─────────────────────────────────────────────────────────

  async function register(firstName, lastName, email, password, passwordConfirmation, phone = null) {
    const { data } = await api.post(`/eshop/${storeId.value}/auth/register`, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
    })
    localStorage.setItem('eshop_customer_token', data.token)
    currentUser.value = data.data
    return data.data
  }

  async function login(email, password) {
    const { data } = await api.post(`/eshop/${storeId.value}/auth/login`, { email, password })
    localStorage.setItem('eshop_customer_token', data.token)
    currentUser.value = data.data
    return data.data
  }

  async function signOut() {
    try {
      await api.post(`/eshop/${storeId.value}/auth/logout`)
    } catch {
      // Token may already be expired
    }
    localStorage.removeItem('eshop_customer_token')
    currentUser.value = null
  }

  async function fetchUser() {
    try {
      const { data } = await api.get(`/eshop/${storeId.value}/auth/me`)
      currentUser.value = data.data
    } catch {
      localStorage.removeItem('eshop_customer_token')
      currentUser.value = null
    }
  }

  // Kept for compatibility
  async function selectStore(id) {
    selectStoreInSession(id)
  }

  function backToChain() {
    clearStoreSelection()
  }

  function clearError() {
    error.value = null
  }

  return {
    // Resolution
    resolvedType,
    resolveError,
    isChainMode,
    storeSelected,

    // Store
    storeId,
    storeConfig,

    // Auth
    currentUser,
    isLoading,
    error,

    // Computed
    storeName,
    branding,
    storeDetails,
    homeContent,
    searchVisible,
    allowRegistration,
    requireAuthForCheckout,
    requireAuthForRepairBooking,
    navigationItems,
    promoBanners,
    isAuthenticated,
    userEmail,
    userName,

    // Actions
    initialize,
    login,
    register,
    signOut,
    fetchUser,
    selectStore,
    backToChain,
    clearError,
  }
})
