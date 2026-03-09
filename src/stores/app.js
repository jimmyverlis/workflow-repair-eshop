import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { resolveStore, selectStoreInSession, clearStoreSelection } from '@/utils/storeResolver'
import {
  createDefaultPromoBanners,
  createPromoBannerPlaceholder,
  createStoreLogoPlaceholder,
} from '@/utils/brandPlaceholders'

const defaultFooterColumns = () => ([
  {
    title: 'Shop',
    links: [
      { label: 'All products', url: '/products', openInNewTab: false },
      { label: 'Repairs', url: '/repair-booking', openInNewTab: false },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping', url: '/shipping', openInNewTab: false },
      { label: 'Returns', url: '/returns', openInNewTab: false },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', url: '/about', openInNewTab: false },
      { label: 'Privacy', url: '/privacy', openInNewTab: false },
    ],
  },
])

const defaultStoreHours = () => ([
  { label: 'Mon - Fri', hours: '09:00 - 18:00' },
  { label: 'Saturday', hours: '10:00 - 14:00' },
])

const defaultTrustBadges = () => ([
  { title: 'Secure checkout', subtitle: 'Protected payments and trusted processing.', icon: 'shield' },
  { title: 'Fast delivery', subtitle: 'Quick dispatch for in-stock orders.', icon: 'truck' },
  { title: 'Repair expertise', subtitle: 'Devices, parts and service from one team.', icon: 'sparkles' },
])

const defaultHomeSections = () => ['hero', 'promo_banners', 'featured_categories', 'top_products', 'discounts', 'trust_badges']

const defaultFeaturedCategories = () => ([
  { label: 'Devices', url: '/products?type=device', description: 'New and used devices ready to buy.' },
  { label: 'Parts', url: '/products?type=part', description: 'Batteries, screens and repair components.' },
  { label: 'Accessories', url: '/products?type=general_product', description: 'Chargers, cases and everyday essentials.' },
])

const defaultHeroButtons = () => ([
  { label: 'Explore products', url: '/products', style: 'primary', openInNewTab: false },
  { label: 'Book a repair', url: '/repair-booking', style: 'secondary', openInNewTab: false },
])

const defaultPageContent = () => ({
  about: { title: 'About Us', body: '' },
  contact: { title: 'Contact Us', body: '' },
  shipping: { title: 'Shipping Information', body: '' },
  returns: { title: 'Returns Policy', body: '' },
  privacy: { title: 'Privacy Policy', body: '' },
  terms: { title: 'Terms of Service', body: '' },
})

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
    logo: storeConfig.value?.logo || createStoreLogoPlaceholder(storeName.value, storeConfig.value?.primary_color || '#3b82f6'),
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
  const allowGuestCheckout = computed(() => storeConfig.value?.allow_guest_checkout !== false)
  const invoiceFieldsEnabled = computed(() => !!storeConfig.value?.invoice_fields_enabled)
  const pickupContent = computed(() => storeConfig.value?.pickup_content || '')
  const courierContent = computed(() => storeConfig.value?.courier_content || '')
  const navigationItems = computed(() => (
    Array.isArray(storeConfig.value?.nav_items)
      ? storeConfig.value.nav_items.map(item => ({
          label: item.label || '',
          url: item.url || '',
          highlight: !!item.highlight,
          openInNewTab: !!(item.open_in_new_tab ?? item.openInNewTab),
          open_in_new_tab: !!(item.open_in_new_tab ?? item.openInNewTab),
        }))
      : []
  ))
  const promoBanners = computed(() => {
    const primaryColor = storeConfig.value?.primary_color || '#3b82f6'
    const configured = Array.isArray(storeConfig.value?.promo_banners) ? storeConfig.value.promo_banners : []
    const normalized = configured
      .map((banner, index) => {
        const backgroundColor = banner.background_color ?? banner.backgroundColor ?? primaryColor
        const textColor = banner.text_color ?? banner.textColor ?? '#ffffff'
        const title = banner.title || `Promo banner ${index + 1}`
        const subtitle = banner.subtitle || ''

        return {
          title,
          subtitle,
          buttonLabel: banner.button_label ?? banner.buttonLabel ?? '',
          buttonUrl: banner.button_url ?? banner.buttonUrl ?? '',
          badge: banner.badge ?? '',
          backgroundColor,
          textColor,
          imageUrl: banner.image_url ?? banner.imageUrl ?? createPromoBannerPlaceholder({
            storeName: storeName.value,
            title,
            subtitle,
            primaryColor: backgroundColor,
            textColor,
          }),
          discountCode: banner.discount_code ?? banner.discountCode ?? '',
        }
      })
      .filter(banner => banner.title)

    return normalized.length
      ? normalized
      : createDefaultPromoBanners({ storeName: storeName.value, primaryColor })
  })
  const footerDescription = computed(() => (
    storeConfig.value?.footer_description || 'Premium devices, trusted repairs and fast support.'
  ))
  const footerColumns = computed(() => {
    const columns = Array.isArray(storeConfig.value?.footer_columns) ? storeConfig.value.footer_columns : []
    const normalized = columns
      .map(column => ({
        title: column.title || '',
        links: Array.isArray(column.links)
          ? column.links
              .map(link => ({
                label: link.label || '',
                url: link.url || '',
                openInNewTab: !!(link.open_in_new_tab ?? link.openInNewTab),
              }))
              .filter(link => link.label && link.url)
          : [],
      }))
      .filter(column => column.title && column.links.length)

    return normalized.length ? normalized : defaultFooterColumns()
  })
  const socialLinks = computed(() => {
    const links = Array.isArray(storeConfig.value?.social_links) ? storeConfig.value.social_links : []
    return links
      .map(link => ({
        label: link.label || '',
        url: link.url || '',
      }))
      .filter(link => link.label && link.url)
  })
  const storeHours = computed(() => {
    const hours = Array.isArray(storeConfig.value?.store_hours) ? storeConfig.value.store_hours : []
    const normalized = hours
      .map(entry => ({
        label: entry.label || '',
        hours: entry.hours || '',
      }))
      .filter(entry => entry.label && entry.hours)

    return normalized.length ? normalized : defaultStoreHours()
  })
  const trustBadges = computed(() => {
    const badges = Array.isArray(storeConfig.value?.trust_badges) ? storeConfig.value.trust_badges : []
    const normalized = badges
      .map(badge => ({
        title: badge.title || '',
        subtitle: badge.subtitle || '',
        icon: badge.icon || 'shield',
      }))
      .filter(badge => badge.title)

    return normalized.length ? normalized : defaultTrustBadges()
  })
  const homeSections = computed(() => {
    const sections = Array.isArray(storeConfig.value?.home_sections) ? storeConfig.value.home_sections : []
    return sections.length ? sections : defaultHomeSections()
  })
  const featuredCategories = computed(() => {
    const categories = Array.isArray(storeConfig.value?.featured_categories) ? storeConfig.value.featured_categories : []
    const normalized = categories
      .map(category => ({
        label: category.label || '',
        url: category.url || '',
        description: category.description || '',
        imageUrl: category.image_url ?? category.imageUrl ?? '',
      }))
      .filter(category => category.label && category.url)

    return normalized.length ? normalized : defaultFeaturedCategories()
  })
  const heroCtaButtons = computed(() => {
    const buttons = Array.isArray(storeConfig.value?.cta_buttons) ? storeConfig.value.cta_buttons : []
    const normalized = buttons
      .map(button => ({
        label: button.label || '',
        url: button.url || '',
        style: button.style || 'primary',
        openInNewTab: !!(button.open_in_new_tab ?? button.openInNewTab),
      }))
      .filter(button => button.label && button.url)

    return normalized.length ? normalized.slice(0, 2) : defaultHeroButtons()
  })
  const pageContent = computed(() => {
    const configured = storeConfig.value?.page_content || {}
    const defaults = defaultPageContent()

    return Object.keys(defaults).reduce((accumulator, key) => {
      accumulator[key] = {
        title: configured?.[key]?.title || defaults[key].title,
        body: configured?.[key]?.body || '',
      }

      return accumulator
    }, {})
  })

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

  async function updateProfile(payload) {
    const { data } = await api.put(`/eshop/${storeId.value}/auth/me`, payload)
    currentUser.value = data.data
    return data.data
  }

  async function forgotPassword(email) {
    await api.post(`/eshop/${storeId.value}/auth/forgot-password`, { email })
  }

  async function resetPassword(token, email, password, passwordConfirmation) {
    await api.post(`/eshop/${storeId.value}/auth/reset-password`, {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
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
    allowGuestCheckout,
    invoiceFieldsEnabled,
    pickupContent,
    courierContent,
    navigationItems,
    promoBanners,
    footerDescription,
    footerColumns,
    socialLinks,
    storeHours,
    trustBadges,
    homeSections,
    featuredCategories,
    heroCtaButtons,
    pageContent,
    isAuthenticated,
    userEmail,
    userName,

    // Actions
    initialize,
    login,
    register,
    signOut,
    fetchUser,
    updateProfile,
    forgotPassword,
    resetPassword,
    selectStore,
    backToChain,
    clearError,
  }
})
