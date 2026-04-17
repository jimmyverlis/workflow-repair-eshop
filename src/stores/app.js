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

const defaultHomeSections = () => ['hero', 'promo_banners', 'featured_categories', 'featured_brands', 'top_products', 'discounts', 'feature_blocks', 'testimonials', 'faq', 'newsletter', 'trust_badges']

const defaultFeaturedCategories = () => ([
  { label: 'Devices', url: '/products?type=device', description: 'New and used devices ready to buy.' },
  { label: 'Parts', url: '/products?type=part', description: 'Batteries, screens and repair components.' },
  { label: 'Accessories', url: '/products?type=general_product', description: 'Chargers, cases and everyday essentials.' },
])

const defaultHeroButtons = () => ([
  { label: 'Explore products', url: '/products', style: 'primary', openInNewTab: false },
  { label: 'Book a repair', url: '/repair-booking', style: 'secondary', openInNewTab: false },
])

const defaultFeatureBlocks = () => ([
  { title: 'Same-day dispatch', subtitle: 'Fast shipping for stocked devices, parts and accessories.', icon: 'truck', link_label: 'Browse stock', link_url: '/products' },
  { title: 'Expert repair support', subtitle: 'Book repairs and speak directly with the store team.', icon: 'sparkles', link_label: 'Book repair', link_url: '/repair-booking' },
  { title: 'Store pickup available', subtitle: 'Reserve items online and collect them in store.', icon: 'clock', link_label: 'Contact us', link_url: '/contact' },
])

const defaultFeaturedBrands = () => ([
  { name: 'Apple', description: 'Devices, parts and accessories for the Apple ecosystem.' },
  { name: 'Samsung', description: 'Popular devices, repairs and replacement parts.' },
  { name: 'Xiaomi', description: 'Accessories, repair-ready stock and daily deals.' },
])

const defaultFaqItems = () => ([
  { question: 'Do you offer store pickup?', answer: 'Yes. Choose pickup during checkout or contact the store directly.' },
  { question: 'Can I book a repair online?', answer: 'Yes. Use the repair booking page to request diagnostics or service.' },
  { question: 'How do I know if an item is in stock?', answer: 'Product pages show live availability and low-stock messages when quantities are limited.' },
])

const defaultTestimonials = () => ([
  { name: 'Returning customer', role: 'Repair and accessories', quote: 'Fast turnaround, clear communication and reliable after-sales support.', rating: 5 },
  { name: 'Business client', role: 'Device fleet support', quote: 'The store handled recurring repairs and urgent parts sourcing without delays.', rating: 5 },
])

const defaultPageContent = () => ({
  about: { title: 'About Us', body: '' },
  contact: { title: 'Contact Us', body: '' },
  shipping: { title: 'Shipping Information', body: '' },
  returns: { title: 'Returns Policy', body: '' },
  privacy: { title: 'Privacy Policy', body: '' },
  terms: { title: 'Terms of Service', body: '' },
})

const normalizeLogoScale = (value) => {
  const scale = Number(value)

  if (!Number.isFinite(scale)) {
    return 100
  }

  return Math.min(300, Math.max(50, Math.round(scale)))
}

const buildLogoHeight = (scale, baseHeight, minHeight, maxHeight) => {
  const scaledHeight = Math.round(baseHeight * (scale / 100))
  return `${Math.min(maxHeight, Math.max(minHeight, scaledHeight))}px`
}

export const useAppStore = defineStore('app', () => {
  // ── Resolution state ──────────────────────────────────────────────────────
  const resolvedType = ref(null)  // 'store' | 'error'
  const resolveError = ref(null)

  // ── Store state ───────────────────────────────────────────────────────────
  const storeId = ref(null)
  const storeConfig = ref(null)   // resolved from /eshop/resolve
  const storeCategories = ref([])

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

  const branding = computed(() => {
    const primaryColor = storeConfig.value?.primary_color || '#3b82f6'
    const secondaryColor = storeConfig.value?.secondary_color || '#10b981'
    const accentColor = storeConfig.value?.accent_color || '#f59e0b'
    const headerBg = storeConfig.value?.header_bg || primaryColor
    const headerBgOpacity = storeConfig.value?.header_bg_opacity != null ? Number(storeConfig.value.header_bg_opacity) : 1
    const footerBg = storeConfig.value?.footer_bg || '#020617'
    const textColor = storeConfig.value?.text_color || '#0f172a'
    const backgroundColor = storeConfig.value?.background_color || ''
    const logoScale = normalizeLogoScale(storeConfig.value?.logo_scale ?? storeConfig.value?.logoScale)

    return {
      primaryColor,
      secondaryColor,
      accentColor,
      headerBg,
      headerBgOpacity,
      footerBg,
      textColor,
      backgroundColor,
      logo: storeConfig.value?.logo || createStoreLogoPlaceholder(storeName.value, primaryColor),
      logoScale,
      headerLogoHeight: buildLogoHeight(logoScale, 40, 20, 96),
      footerLogoHeight: buildLogoHeight(logoScale, 48, 24, 112),
    }
  })

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
  const payAtStoreEnabled = computed(() => !!storeConfig.value?.pay_at_store_enabled)
  const payAtCourierEnabled = computed(() => !!storeConfig.value?.pay_at_courier_enabled)
  const pickupContent = computed(() => storeConfig.value?.pickup_content || '')
  const courierContent = computed(() => storeConfig.value?.courier_content || '')
  const warehouseEnabled = computed(() => !!storeConfig.value?.warehouse_enabled)
  const warehouseConfig = computed(() => ({
    enabled: warehouseEnabled.value,
    navLabel: storeConfig.value?.warehouse_nav_label || 'Warehouse',
    description: storeConfig.value?.warehouse_description || 'Used and refurbished devices from the same catalog.',
    showCondition: storeConfig.value?.warehouse_show_condition !== false,
    showGrade: storeConfig.value?.warehouse_show_grade !== false,
  }))
  const navigationItems = computed(() => {
    const items = Array.isArray(storeConfig.value?.nav_items)
      ? storeConfig.value.nav_items.map(item => ({
          label: item.label || '',
          url: item.url || '',
          highlight: !!item.highlight,
          openInNewTab: !!(item.open_in_new_tab ?? item.openInNewTab),
          open_in_new_tab: !!(item.open_in_new_tab ?? item.openInNewTab),
        }))
      : []

    if (warehouseConfig.value.enabled && !items.some(item => item.url === '/warehouse')) {
      items.push({
        label: warehouseConfig.value.navLabel,
        url: '/warehouse',
        highlight: false,
        openInNewTab: false,
        open_in_new_tab: false,
      })
    }

    return items
  })
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
  const catalogCategories = computed(() => (
    Array.isArray(storeCategories.value)
      ? storeCategories.value
          .map(category => ({
            id: category.id,
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            imageUrl: category.image_url ?? category.imageUrl ?? '',
            isUsed: !!(category.is_used ?? category.isUsed),
            parentId: category.parent_id ?? category.parentId ?? null,
          }))
          .filter(category => category.name)
      : []
  ))
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

    if (normalized.length) {
      return normalized
    }

    if (catalogCategories.value.length) {
      return catalogCategories.value
        .slice(0, 6)
        .map(category => ({
          label: category.name,
          url: `/products?category=${encodeURIComponent(category.name)}`,
          description: category.description,
          imageUrl: category.imageUrl,
          isUsed: category.isUsed,
        }))
    }

    return defaultFeaturedCategories()
  })
  const heroSettings = computed(() => ({
    style: storeConfig.value?.hero_style || 'gradient',
    imageUrl: storeConfig.value?.hero_image_url || '',
    overlayOpacity: Number(storeConfig.value?.hero_overlay_opacity ?? 0.5),
    minHeight: storeConfig.value?.hero_min_height || '520px',
  }))
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
  const announcementBar = computed(() => {
    const configured = storeConfig.value?.announcement_bar || {}
    const now = Date.now()
    const startsAt = configured.starts_at ? new Date(configured.starts_at).getTime() : null
    const endsAt = configured.ends_at ? new Date(configured.ends_at).getTime() : null
    const withinWindow = (startsAt == null || now >= startsAt) && (endsAt == null || now <= endsAt)

    return {
      enabled: !!configured.enabled && withinWindow && !!configured.text,
      text: configured.text || '',
      linkLabel: configured.link_label || '',
      linkUrl: configured.link_url || '',
    }
  })
  const featureBlocks = computed(() => {
    const blocks = Array.isArray(storeConfig.value?.feature_blocks) ? storeConfig.value.feature_blocks : []
    const normalized = blocks
      .map(block => ({
        title: block.title || '',
        subtitle: block.subtitle || '',
        icon: block.icon || 'sparkles',
        linkLabel: block.link_label ?? block.linkLabel ?? '',
        linkUrl: block.link_url ?? block.linkUrl ?? '',
      }))
      .filter(block => block.title)

    return normalized.length ? normalized : defaultFeatureBlocks()
  })
  const featuredBrands = computed(() => {
    const brands = Array.isArray(storeConfig.value?.featured_brands) ? storeConfig.value.featured_brands : []
    const normalized = brands
      .map(brand => ({
        name: brand.name || '',
        description: brand.description || '',
        imageUrl: brand.image_url ?? brand.imageUrl ?? '',
      }))
      .filter(brand => brand.name)

    return normalized.length ? normalized : defaultFeaturedBrands()
  })
  const faqItems = computed(() => {
    const entries = Array.isArray(storeConfig.value?.faq_items) ? storeConfig.value.faq_items : []
    const normalized = entries
      .map(entry => ({
        question: entry.question || '',
        answer: entry.answer || '',
      }))
      .filter(entry => entry.question && entry.answer)

    return normalized.length ? normalized : defaultFaqItems()
  })
  const testimonials = computed(() => {
    const entries = Array.isArray(storeConfig.value?.testimonials) ? storeConfig.value.testimonials : []
    const normalized = entries
      .map(entry => ({
        name: entry.name || '',
        role: entry.role || '',
        quote: entry.quote || '',
        rating: Number(entry.rating || 5),
      }))
      .filter(entry => entry.name && entry.quote)

    return normalized.length ? normalized : defaultTestimonials()
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

  const ga4MeasurementId = computed(() => storeConfig.value?.ga4_measurement_id || '')
  const metaPixelId = computed(() => storeConfig.value?.meta_pixel_id || '')
  const customHeadScripts = computed(() => storeConfig.value?.custom_head_scripts || '')
  const cookieConsentEnabled = computed(() => !!storeConfig.value?.cookie_consent_enabled)
  const cookieConsentText = computed(() => storeConfig.value?.cookie_consent_text || '')
  const seoDefaultImage = computed(() => storeConfig.value?.seo_default_image || '')
  const robotsIndex = computed(() => storeConfig.value?.robots_index !== false)
  const lowStockThreshold = computed(() => Number(storeConfig.value?.low_stock_threshold ?? 5))
  const wishlistEnabled = computed(() => storeConfig.value?.wishlist_enabled !== false)
  const savedCartsEnabled = computed(() => storeConfig.value?.saved_carts_enabled !== false)
  const newsletterEnabled = computed(() => storeConfig.value?.newsletter_enabled !== false)
  const newsletterContent = computed(() => ({
    title: storeConfig.value?.newsletter_title || 'Get product drops and repair offers first',
    subtitle: storeConfig.value?.newsletter_subtitle || 'Sign up for launches, discounts and store updates.',
  }))
  const loyaltyEnabled = computed(() => !!storeConfig.value?.loyalty_enabled)
  const loyaltyPointsPerCurrency = computed(() => Number(storeConfig.value?.loyalty_points_per_currency ?? 1))
  const referralsEnabled = computed(() => !!storeConfig.value?.referrals_enabled)
  const referralRewardPoints = computed(() => Number(storeConfig.value?.referral_reward_points ?? 100))
  const returnRequestsEnabled = computed(() => storeConfig.value?.return_requests_enabled !== false)
  const returnWindowDays = computed(() => Number(storeConfig.value?.return_window_days ?? 14))
  const returnInstructions = computed(() => storeConfig.value?.return_instructions || '')
  const loyaltyPointsBalance = computed(() => Number(currentUser.value?.loyalty_points_balance ?? 0))
  const loyaltyPointsEarned = computed(() => Number(currentUser.value?.loyalty_points_earned ?? 0))
  const referralCode = computed(() => currentUser.value?.referral_code || '')

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
      await loadCategories()

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

  async function loadCategories() {
    if (!storeId.value) {
      storeCategories.value = []
      return []
    }

    try {
      const { data } = await api.get(`/eshop/${storeId.value}/categories`)
      storeCategories.value = Array.isArray(data?.data) ? data.data : []
    } catch {
      storeCategories.value = []
    }

    return storeCategories.value
  }

  // ── Customer Auth ─────────────────────────────────────────────────────────

  async function register(firstName, lastName, email, password, passwordConfirmation, phone = null, referralCodeValue = '') {
    const { data } = await api.post(`/eshop/${storeId.value}/auth/register`, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
      referral_code: referralCodeValue || null,
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
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('eshop_customer_token')
        currentUser.value = null
      }
      // On network failure / 5xx: keep existing session
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
    storeCategories,

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
    payAtStoreEnabled,
    payAtCourierEnabled,
    pickupContent,
    courierContent,
    warehouseEnabled,
    warehouseConfig,
    navigationItems,
    promoBanners,
    footerDescription,
    footerColumns,
    socialLinks,
    storeHours,
    trustBadges,
    homeSections,
    catalogCategories,
    featuredCategories,
    heroSettings,
    heroCtaButtons,
    announcementBar,
    featureBlocks,
    featuredBrands,
    faqItems,
    testimonials,
    pageContent,
    isAuthenticated,
    userEmail,
    userName,
    // SEO & Analytics
    ga4MeasurementId,
    metaPixelId,
    customHeadScripts,
    cookieConsentEnabled,
    cookieConsentText,
    seoDefaultImage,
    robotsIndex,
    lowStockThreshold,
    wishlistEnabled,
    savedCartsEnabled,
    newsletterEnabled,
    newsletterContent,
    loyaltyEnabled,
    loyaltyPointsPerCurrency,
    referralsEnabled,
    referralRewardPoints,
    returnRequestsEnabled,
    returnWindowDays,
    returnInstructions,
    loyaltyPointsBalance,
    loyaltyPointsEarned,
    referralCode,

    // Actions
    initialize,
    loadCategories,
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
