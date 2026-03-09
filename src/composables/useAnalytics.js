import { useAppStore } from '@/stores/app'

let ga4Initialized = false
let pixelInitialized = false
let customScriptsInjected = false

export function useAnalytics() {
  const appStore = useAppStore()

  function hasConsent() {
    if (!appStore.cookieConsentEnabled) return true
    return localStorage.getItem('cookie_consent') === 'accepted'
  }

  function initGA4(measurementId) {
    if (ga4Initialized || !measurementId) return
    ga4Initialized = true

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', measurementId, { anonymize_ip: true })
  }

  function initMetaPixel(pixelId) {
    if (pixelInitialized || !pixelId) return
    pixelInitialized = true

    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }

  function injectCustomScripts(html) {
    if (customScriptsInjected || !html?.trim()) return
    customScriptsInjected = true

    const temp = document.createElement('template')
    temp.innerHTML = html
    temp.content.querySelectorAll('script').forEach(old => {
      const script = document.createElement('script')
      Array.from(old.attributes).forEach(attr => script.setAttribute(attr.name, attr.value))
      script.textContent = old.textContent
      document.head.appendChild(script)
    })
  }

  function init() {
    if (!hasConsent()) return
    if (appStore.ga4MeasurementId) initGA4(appStore.ga4MeasurementId)
    if (appStore.metaPixelId) initMetaPixel(appStore.metaPixelId)
    if (appStore.customHeadScripts) injectCustomScripts(appStore.customHeadScripts)
  }

  function trackEvent(name, params = {}) {
    if (!hasConsent()) return
    if (window.gtag) window.gtag('event', name, params)
    if (window.fbq) {
      const fbMap = {
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        purchase: 'Purchase',
        view_item: 'ViewContent',
        search: 'Search',
      }
      if (fbMap[name]) window.fbq('track', fbMap[name], params)
    }
  }

  function trackPageView() {
    if (!hasConsent()) return
    if (window.gtag) window.gtag('event', 'page_view', { page_location: window.location.href })
    if (window.fbq) window.fbq('track', 'PageView')
  }

  function trackViewItem(product) {
    trackEvent('view_item', {
      currency: appStore.storeConfig?.currency || 'EUR',
      value: Number(product.eshop_price || product.price || 0),
      items: [{ item_id: product.id, item_name: product.name, price: Number(product.eshop_price || 0) }],
    })
  }

  function trackAddToCart(product, quantity = 1) {
    trackEvent('add_to_cart', {
      currency: appStore.storeConfig?.currency || 'EUR',
      value: Number(product.eshop_price || 0) * quantity,
      items: [{ item_id: product.id, item_name: product.name, quantity, price: Number(product.eshop_price || 0) }],
    })
  }

  function trackPurchase({ orderId, total, items = [] }) {
    trackEvent('purchase', {
      transaction_id: orderId,
      currency: appStore.storeConfig?.currency || 'EUR',
      value: Number(total || 0),
      items,
    })
  }

  return { init, hasConsent, trackPageView, trackViewItem, trackAddToCart, trackPurchase, trackEvent }
}
