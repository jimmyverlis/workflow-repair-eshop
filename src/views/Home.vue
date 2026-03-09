<template>
  <div class="home">
    <section class="bg-gradient-to-br from-primary-700 via-primary-600 to-slate-900 text-white">
      <div class="container mx-auto px-4 py-16 lg:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <Sparkles class="h-4 w-4" />
              Online store and repair booking
            </div>
            <h1 class="mt-5 text-4xl md:text-5xl font-black leading-tight">
              {{ heroTitle }}
            </h1>
            <p class="mt-4 max-w-2xl text-lg text-white/80">
              {{ heroSubtitle }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <RouterLink to="/products" class="btn bg-white text-slate-900 hover:bg-white/90 px-6 py-3 text-base">
                Explore products
              </RouterLink>
              <RouterLink to="/repair-booking" class="btn border border-white/30 bg-white/10 text-white hover:bg-white/20 px-6 py-3 text-base">
                Book a repair
              </RouterLink>
            </div>

            <div v-if="appStore.searchVisible" class="mt-8 max-w-xl">
              <form @submit.prevent="submitSearch" class="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
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
            <div class="rounded-3xl bg-white/10 p-5 backdrop-blur border border-white/10">
              <div class="text-sm text-white/70">Top products</div>
              <div class="mt-2 text-3xl font-black">{{ topProducts.length }}</div>
              <div class="mt-1 text-sm text-white/70">Best-selling picks</div>
            </div>
            <div class="rounded-3xl bg-white/10 p-5 backdrop-blur border border-white/10">
              <div class="text-sm text-white/70">Deals live</div>
              <div class="mt-2 text-3xl font-black">{{ discountedProducts.length }}</div>
              <div class="mt-1 text-sm text-white/70">Discounted products</div>
            </div>
            <div class="rounded-3xl bg-white/10 p-5 backdrop-blur border border-white/10 col-span-2">
              <div class="text-sm text-white/70">Quick links</div>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="item in quickLinks"
                  :key="`${item.label}-${item.url}`"
                  type="button"
                  class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
                  @click="navigateToUrl(item.url, item.open_in_new_tab || item.openInNewTab)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="promoBanners.length" class="bg-slate-50 py-8">
      <div class="container mx-auto px-4">
        <div class="overflow-hidden rounded-[2rem]">
          <div
            class="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 p-8 transition-all"
            :style="activeBannerStyle"
          >
            <div>
              <div v-if="activeBanner.badge" class="inline-flex rounded-full bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {{ activeBanner.badge }}
              </div>
              <h2 class="mt-4 text-3xl md:text-4xl font-black">{{ activeBanner.title }}</h2>
              <p v-if="activeBanner.subtitle" class="mt-3 text-base md:text-lg opacity-90 max-w-2xl">
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

            <div
              class="min-h-[220px] rounded-[1.5rem] border border-black/10 bg-white/20 bg-cover bg-center"
              :style="activeBanner.imageUrl ? { backgroundImage: `url(${activeBanner.imageUrl})` } : {}"
            ></div>
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

    <section class="py-14">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-3xl font-black">Top products</h2>
            <p class="text-gray-500 mt-1">Best-selling products from the store.</p>
          </div>
          <RouterLink to="/products" class="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all
          </RouterLink>
        </div>

        <div v-if="loadingHighlights" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <article
            v-for="product in topProducts"
            :key="`top-${product.source}-${product.id}`"
            class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            @click="goToProduct(product)"
          >
            <div class="aspect-square rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center mb-4">
              <img v-if="product.images?.[0]" :src="product.images[0]" :alt="product.name" class="h-full w-full object-cover" />
              <Package v-else class="h-12 w-12 text-gray-400" />
            </div>
            <div class="text-xs uppercase tracking-wide text-gray-400">{{ productTypeLabel(product.type) }}</div>
            <h3 class="mt-1 text-lg font-bold line-clamp-2">{{ product.name }}</h3>
            <p class="mt-2 text-sm text-gray-500 line-clamp-2">{{ product.description || 'Available now in the store.' }}</p>
            <div class="mt-4 flex items-end justify-between gap-3">
              <div>
                <div class="text-2xl font-black text-primary-600">{{ productPrice(product).toFixed(2) }}€</div>
                <div v-if="product.compare_at_price" class="text-xs text-gray-400 line-through">{{ Number(product.compare_at_price).toFixed(2) }}€</div>
              </div>
              <button type="button" class="rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                View
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section v-if="discountedProducts.length" class="bg-slate-50 py-14">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-3xl font-black">Deals and discounts</h2>
            <p class="text-gray-500 mt-1">Products currently on offer.</p>
          </div>
          <RouterLink to="/products?q=deal" class="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Explore offers
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <article
            v-for="product in discountedProducts"
            :key="`deal-${product.source}-${product.id}`"
            class="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
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
            <p class="mt-3 text-sm text-gray-500 line-clamp-2">{{ product.description || 'Special pricing available now.' }}</p>
            <div class="mt-5 flex items-end justify-between gap-3">
              <div>
                <div class="text-3xl font-black text-rose-600">{{ productPrice(product).toFixed(2) }}€</div>
                <div class="text-sm text-gray-400 line-through">{{ Number(product.compare_at_price).toFixed(2) }}€</div>
              </div>
              <button type="button" class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                Shop deal
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Package class="h-7 w-7" />
            </div>
            <h3 class="mt-5 text-xl font-bold">Fast order fulfillment</h3>
            <p class="mt-2 text-gray-500">Get parts, accessories and devices quickly with store pickup or delivery.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Shield class="h-7 w-7" />
            </div>
            <h3 class="mt-5 text-xl font-bold">Quality and warranty</h3>
            <p class="mt-2 text-gray-500">Products and repairs are presented with pricing clarity, condition details and coverage information.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Wrench class="h-7 w-7" />
            </div>
            <h3 class="mt-5 text-xl font-bold">Repairs online</h3>
            <p class="mt-2 text-gray-500">Book repairs, track status and manage orders from one customer account.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';
import api from '@/services/api';
import { Package, Shield, Sparkles, Tag, Wrench } from 'lucide-vue-next';

const router = useRouter();
const appStore = useAppStore();

const heroSearch = ref('');
const loadingHighlights = ref(false);
const topProducts = ref([]);
const discountedProducts = ref([]);
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
const activeBanner = computed(() => promoBanners.value[activeBannerIndex.value] || {});
const activeBannerStyle = computed(() => ({
  background: activeBanner.value.backgroundColor || '#111827',
  color: activeBanner.value.textColor || '#ffffff',
}));

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

async function loadHighlights() {
  loadingHighlights.value = true;
  try {
    const { data } = await api.get(`/eshop/${appStore.storeId}/highlights`, {
      params: { limit: 8 },
    });

    topProducts.value = data.data?.top_products || [];
    discountedProducts.value = data.data?.discounted_products || [];
  } catch (error) {
    console.error('Error loading home highlights:', error);
    topProducts.value = [];
    discountedProducts.value = [];
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
