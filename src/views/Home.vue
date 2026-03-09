<template>
  <div class="home bg-white">
    <template v-for="section in homeSections" :key="section">
      <section
        v-if="section === 'hero'"
        class="bg-gradient-to-br from-primary-700 via-primary-600 to-slate-900 text-white"
      >
        <div class="container mx-auto px-4 py-16 lg:py-20">
          <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles class="h-4 w-4" />
                Online store and repair booking
              </div>
              <h1 class="mt-5 text-4xl font-black leading-tight md:text-5xl">
                {{ heroTitle }}
              </h1>
              <p class="mt-4 max-w-2xl text-lg text-white/80">
                {{ heroSubtitle }}
              </p>

              <div class="mt-8 flex flex-wrap gap-3">
                <button
                  v-for="(button, index) in heroButtons"
                  :key="`hero-button-${index}`"
                  type="button"
                  class="rounded-xl px-6 py-3 text-base font-semibold transition"
                  :class="button.style === 'secondary'
                    ? 'border border-white/30 bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white text-slate-900 hover:bg-white/90'"
                  @click="navigateToUrl(button.url, button.openInNewTab)"
                >
                  {{ button.label }}
                </button>
              </div>

              <div v-if="appStore.searchVisible" class="mt-8 max-w-xl">
                <form @submit.prevent="submitSearch" class="flex flex-col gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur sm:flex-row">
                  <input
                    v-model.trim="heroSearch"
                    type="text"
                    placeholder="Search parts, devices, services..."
                    class="flex-1 rounded-xl border border-white/15 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                  <button type="submit" class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">
                    Search
                  </button>
                </form>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div class="text-sm text-white/70">Top products</div>
                <div class="mt-2 text-3xl font-black">{{ topProducts.length }}</div>
                <div class="mt-1 text-sm text-white/70">Best-selling picks</div>
              </div>
              <div class="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div class="text-sm text-white/70">Deals live</div>
                <div class="mt-2 text-3xl font-black">{{ discountedProducts.length }}</div>
                <div class="mt-1 text-sm text-white/70">Discounted products</div>
              </div>
              <div class="col-span-2 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div class="text-sm text-white/70">Quick links</div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="item in quickLinks"
                    :key="`${item.label}-${item.url}`"
                    type="button"
                    class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
                    @click="navigateToUrl(item.url, item.openInNewTab || item.open_in_new_tab)"
                  >
                    {{ item.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'promo_banners'" class="bg-slate-50 py-8">
        <div class="container mx-auto px-4">
          <div class="overflow-hidden rounded-[2rem]">
            <div
              class="grid grid-cols-1 gap-6 p-8 transition-all lg:grid-cols-[1.2fr_0.8fr]"
              :style="activeBannerStyle"
            >
              <div>
                <div v-if="activeBanner.badge" class="inline-flex rounded-full bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {{ activeBanner.badge }}
                </div>
                <h2 class="mt-4 text-3xl font-black md:text-4xl">{{ activeBanner.title }}</h2>
                <p v-if="activeBanner.subtitle" class="mt-3 max-w-2xl text-base opacity-90 md:text-lg">
                  {{ activeBanner.subtitle }}
                </p>
                <div class="mt-6 flex flex-wrap gap-3">
                  <button
                    v-if="activeBanner.buttonLabel && activeBanner.buttonUrl"
                    type="button"
                    class="rounded-xl bg-black/80 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
                    @click="navigateToUrl(activeBanner.buttonUrl)"
                  >
                    {{ activeBanner.buttonLabel }}
                  </button>
                </div>
              </div>

              <div class="min-h-[220px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/20">
                <img
                  :src="activeBanner.imageUrl"
                  :alt="activeBanner.title || 'Promo banner'"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div v-if="promoBanners.length > 1" class="mt-4 flex items-center justify-center gap-2">
            <button
              v-for="(banner, index) in promoBanners"
              :key="`${banner.title}-${index}`"
              type="button"
              class="h-2.5 rounded-full transition-all"
              :class="index === activeBannerIndex ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300'"
              @click="activeBannerIndex = index"
            ></button>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'featured_categories'" class="py-14">
        <div class="container mx-auto px-4">
          <div class="mb-6">
            <h2 class="text-3xl font-black">Featured categories</h2>
            <p class="mt-1 text-gray-500">Guide customers to the categories that matter most right now.</p>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="category in featuredCategories"
              :key="`${category.label}-${category.url}`"
              type="button"
              class="group rounded-[2rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              @click="navigateToUrl(category.url)"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Package class="h-7 w-7" />
              </div>
              <h3 class="mt-5 text-2xl font-black text-slate-900 group-hover:text-primary-700">{{ category.label }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                {{ category.description || 'Curated products from this storefront section.' }}
              </p>
              <div class="mt-6 text-sm font-semibold text-primary-600">Explore category</div>
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'top_products'" class="py-14">
        <div class="container mx-auto px-4">
          <div class="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-3xl font-black">Top products</h2>
              <p class="mt-1 text-gray-500">Best-selling products from the store.</p>
            </div>
            <RouterLink to="/products" class="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View all
            </RouterLink>
          </div>

          <div v-if="loadingHighlights" class="py-10 text-center">
            <div class="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
          </div>
          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="product in topProducts"
              :key="`top-${product.source}-${product.id}`"
              class="cursor-pointer rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
              @click="goToProduct(product)"
            >
              <div class="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                <img v-if="product.images?.[0]" :src="product.images[0]" :alt="product.name" class="h-full w-full object-cover" />
                <Package v-else class="h-12 w-12 text-gray-400" />
              </div>
              <div class="text-xs uppercase tracking-wide text-gray-400">{{ productTypeLabel(product.type) }}</div>
              <h3 class="mt-1 line-clamp-2 text-lg font-bold">{{ product.name }}</h3>
              <p class="mt-2 line-clamp-2 text-sm text-gray-500">{{ product.description || 'Available now in the store.' }}</p>
              <div class="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div class="text-2xl font-black text-primary-600">{{ productPrice(product).toFixed(2) }}EUR</div>
                  <div v-if="product.compare_at_price" class="text-xs text-gray-400 line-through">{{ Number(product.compare_at_price).toFixed(2) }}EUR</div>
                </div>
                <button type="button" class="rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  View
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'discounts'" class="bg-slate-50 py-14">
        <div class="container mx-auto px-4">
          <div class="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-3xl font-black">Deals and discounts</h2>
              <p class="mt-1 text-gray-500">Products currently on offer.</p>
            </div>
            <RouterLink to="/products?q=deal" class="text-sm font-semibold text-primary-600 hover:text-primary-700">
              Explore offers
            </RouterLink>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="product in discountedProducts"
              :key="`deal-${product.source}-${product.id}`"
              class="cursor-pointer rounded-3xl border border-rose-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
              @click="goToProduct(product)"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="inline-flex rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
                    Save {{ product.discount_percentage }}%
                  </div>
                  <h3 class="mt-4 text-xl font-bold">{{ product.name }}</h3>
                </div>
                <Tag class="h-5 w-5 text-rose-500" />
              </div>
              <p class="mt-3 line-clamp-2 text-sm text-gray-500">{{ product.description || 'Special pricing available now.' }}</p>
              <div class="mt-5 flex items-end justify-between gap-3">
                <div>
                  <div class="text-3xl font-black text-rose-600">{{ productPrice(product).toFixed(2) }}EUR</div>
                  <div class="text-sm text-gray-400 line-through">{{ Number(product.compare_at_price).toFixed(2) }}EUR</div>
                </div>
                <button type="button" class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                  Shop deal
                </button>
              </div>
            </article>
          </div>

          <div v-if="activePromotions.length" class="mt-10 rounded-[2rem] border border-primary-100 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 class="text-2xl font-black text-slate-900">Live promo codes</h3>
                <p class="text-sm text-slate-500">Use these checkout codes while they are active.</p>
              </div>
              <RouterLink to="/checkout" class="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Go to checkout
              </RouterLink>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article
                v-for="promotion in activePromotions"
                :key="promotion.code"
                class="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Promo code</div>
                    <div class="mt-2 text-2xl font-black text-slate-900">{{ promotion.code }}</div>
                  </div>
                  <Tag class="h-5 w-5 text-primary-600" />
                </div>

                <p v-if="promotion.description" class="mt-3 text-sm leading-6 text-slate-500">
                  {{ promotion.description }}
                </p>

                <div class="mt-4 text-sm font-semibold text-slate-700">
                  {{ promotionSummary(promotion) }}
                </div>

                <div v-if="promotion.minimum_subtotal" class="mt-2 text-xs text-slate-500">
                  Minimum order: {{ Number(promotion.minimum_subtotal).toFixed(2) }}EUR
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section === 'trust_badges'" class="py-16">
        <div class="container mx-auto px-4">
          <div class="mb-6">
            <h2 class="text-3xl font-black">Why customers choose this store</h2>
            <p class="mt-1 text-gray-500">Surface the trust signals that matter before the customer reaches checkout.</p>
          </div>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div
              v-for="badge in trustBadges"
              :key="badge.title"
              class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <component :is="badgeIcon(badge.icon)" class="h-7 w-7" />
              </div>
              <h3 class="mt-5 text-xl font-bold">{{ badge.title }}</h3>
              <p class="mt-2 text-gray-500">{{ badge.subtitle }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { Clock3, Package, Shield, Sparkles, Tag, Truck } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import api from '@/services/api';

const router = useRouter();
const appStore = useAppStore();

const heroSearch = ref('');
const loadingHighlights = ref(false);
const topProducts = ref([]);
const discountedProducts = ref([]);
const activePromotions = ref([]);
const activeBannerIndex = ref(0);
let bannerTimer = null;

const heroTitle = computed(() => appStore.homeContent.title || `Welcome to ${appStore.storeName}`);
const heroSubtitle = computed(() => appStore.homeContent.subtitle || 'Parts, devices, services and repair support in one storefront.');
const promoBanners = computed(() => appStore.promoBanners);
const quickLinks = computed(() => {
  if (appStore.navigationItems.length) {
    return appStore.navigationItems.slice(0, 6);
  }

  return [
    { label: 'Products', url: '/products' },
    { label: 'Parts', url: '/products?type=part' },
    { label: 'Devices', url: '/products?type=device' },
    { label: 'Repairs', url: '/repair-booking' },
  ];
});
const heroButtons = computed(() => appStore.heroCtaButtons);
const featuredCategories = computed(() => appStore.featuredCategories);
const trustBadges = computed(() => appStore.trustBadges);
const homeSections = computed(() => appStore.homeSections);
const activeBanner = computed(() => promoBanners.value[activeBannerIndex.value] || {});
const activeBannerStyle = computed(() => ({
  background: activeBanner.value.backgroundColor || '#111827',
  color: activeBanner.value.textColor || '#ffffff',
}));

function badgeIcon(iconName) {
  if (iconName === 'truck') return Truck;
  if (iconName === 'clock') return Clock3;
  if (iconName === 'sparkles') return Sparkles;
  return Shield;
}

function submitSearch() {
  router.push({
    path: '/products',
    query: heroSearch.value ? { q: heroSearch.value } : {},
  });
}

function navigateToUrl(url, openInNewTab = false) {
  if (!url) return;

  if (/^https?:\/\//i.test(url)) {
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.location.href = url;
    return;
  }

  router.push(url);
}

function goToProduct(product) {
  router.push({
    path: `/product/${product.id}`,
    query: { source: product.source || 'inventory' },
  });
}

function productPrice(product) {
  return Number(product.price ?? product.eshop_price ?? product.sell_price ?? 0);
}

function productTypeLabel(type) {
  if (type === 'part') return 'Part';
  if (type === 'device') return 'Device';
  if (type === 'service') return 'Service';
  if (type === 'general' || type === 'general_product') return 'Accessory';
  return 'Product';
}

function promotionSummary(promotion) {
  if (promotion.type === 'free_shipping') {
    return 'Free shipping';
  }

  const value = Number(promotion.value || 0);
  if (promotion.type === 'fixed_amount') {
    return `${value.toFixed(2)}EUR off`;
  }

  return `${value}% off`;
}

async function loadHighlights() {
  loadingHighlights.value = true;
  try {
    const { data } = await api.get(`/eshop/${appStore.storeId}/highlights`, {
      params: { limit: 8 },
    });

    topProducts.value = data.data?.top_products || [];
    discountedProducts.value = data.data?.discounted_products || [];
    activePromotions.value = data.data?.active_promotions || [];
  } catch (error) {
    console.error('Error loading home highlights:', error);
    topProducts.value = [];
    discountedProducts.value = [];
    activePromotions.value = [];
  } finally {
    loadingHighlights.value = false;
  }
}

function startBannerRotation() {
  if (promoBanners.value.length < 2) return;

  bannerTimer = window.setInterval(() => {
    activeBannerIndex.value = (activeBannerIndex.value + 1) % promoBanners.value.length;
  }, 5000);
}

onMounted(() => {
  loadHighlights();
  startBannerRotation();
});

onBeforeUnmount(() => {
  if (bannerTimer) {
    window.clearInterval(bannerTimer);
  }
});
</script>
