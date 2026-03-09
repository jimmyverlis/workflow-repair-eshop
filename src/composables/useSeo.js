import { useAppStore } from '@/stores/app'

export function useSeo() {
  const appStore = useAppStore()

  function setMeta(name, content, isProperty = false) {
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content || '')
  }

  function setCanonical(url) {
    let el = document.querySelector('link[rel="canonical"]')
    if (!el) {
      el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
      document.head.appendChild(el)
    }
    el.setAttribute('href', url)
  }

  function setJsonLd(data, id = 'main') {
    let el = document.querySelector(`script[data-seo="${id}"]`)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.setAttribute('data-seo', id)
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
  }

  function removeJsonLd(id = 'main') {
    document.querySelector(`script[data-seo="${id}"]`)?.remove()
  }

  function apply({ title, description, image, type = 'website', canonical, noindex } = {}) {
    const storeName = appStore.storeName
    const pageTitle = title
      ? `${title} | ${storeName}`
      : (appStore.storeConfig?.meta_title || storeName)
    const pageDesc = description || appStore.storeConfig?.meta_description || ''
    const pageImage = image || appStore.seoDefaultImage || ''
    const pageUrl = canonical || window.location.href
    const allowIndex = noindex ? false : appStore.robotsIndex

    document.title = pageTitle
    setMeta('description', pageDesc)
    setMeta('robots', allowIndex ? 'index, follow' : 'noindex, nofollow')
    setMeta('og:title', pageTitle, true)
    setMeta('og:description', pageDesc, true)
    setMeta('og:image', pageImage, true)
    setMeta('og:url', pageUrl, true)
    setMeta('og:type', type, true)
    setMeta('og:site_name', storeName, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', pageTitle)
    setMeta('twitter:description', pageDesc)
    setMeta('twitter:image', pageImage)
    setCanonical(pageUrl)
  }

  return { apply, setJsonLd, removeJsonLd }
}
