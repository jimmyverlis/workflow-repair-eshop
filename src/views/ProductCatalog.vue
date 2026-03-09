<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <RouterLink to="/" class="font-medium text-slate-600 hover:text-primary-600">Home</RouterLink>
        <ChevronRight class="h-4 w-4" />
        <span class="font-medium text-slate-900">{{ catalogTitle }}</span>
      </nav>

      <section class="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-8">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl space-y-4">
            <div class="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Catalog
            </div>
            <div>
              <h1 class="text-3xl font-black text-slate-900 md:text-5xl">{{ catalogTitle }}</h1>
              <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {{ catalogDescription }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Results</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ filteredProducts.length }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">On sale</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ discountedProductsCount }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 col-span-2 sm:col-span-1">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ availableCategories.length }}</div>
            </div>
          </div>
        </div>

        <div v-if="featuredCategoryLinks.length" class="mt-8 flex flex-wrap gap-3">
          <button
            v-for="category in featuredCategoryLinks"
            :key="`${category.label}-${category.url}`"
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition"
            :class="isFeaturedCategoryActive(category)
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:text-primary-700'"
            @click="navigateToFeaturedCategory(category.url)"
          >
            {{ category.label }}
          </button>
        </div>

        <div v-if="featuredBrands.length" class="mt-4 flex flex-wrap gap-3">
          <button
            v-for="brand in featuredBrands"
            :key="`brand-chip-${brand.name}`"
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition"
            :class="isBrandActive(brand.name)
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:text-primary-700'"
            @click="goToBrandLanding(brand.name)"
          >
            {{ brand.name }}
          </button>
        </div>
      </section>

      <section v-if="allDevices.length" class="mt-8 rounded-[2rem] border border-primary-100 bg-gradient-to-r from-primary-50 via-white to-blue-50 px-6 py-6 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
              <Smartphone class="h-4 w-4" />
              Compatibility finder
            </div>
            <h2 class="mt-2 text-2xl font-black text-slate-900">Find parts for a specific device</h2>
            <p class="mt-2 max-w-2xl text-sm text-slate-600">
              Narrow the catalog by compatible device brand and model without losing the rest of the storefront filters.
            </p>
          </div>
          <button
            v-if="compatibilityBrand || compatibilityModel"
            type="button"
            class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700"
            @click="clearCompatibilityFilter"
          >
            <X class="h-4 w-4" />
            Clear compatibility filter
          </button>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Device brand</label>
            <select v-model="compatibilityBrand" class="input">
              <option value="">All brands</option>
              <option v-for="brand in compatibleBrands" :key="brand" :value="brand">{{ brand }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Device model</label>
            <select v-model="compatibilityModel" class="input" :disabled="!compatibilityBrand">
              <option value="">All models</option>
              <option v-for="model in compatibleModels" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>
          <div class="rounded-2xl border border-primary-100 bg-white px-4 py-4 text-sm text-slate-600">
            <div class="font-semibold text-slate-900">Compatibility matches</div>
            <div class="mt-2 text-2xl font-black text-primary-700">{{ compatibilityMatchesCount }}</div>
            <div class="mt-1">Products compatible with the selected device filters.</div>
          </div>
        </div>
      </section>

      <div class="mt-8 grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside class="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              <SlidersHorizontal class="h-4 w-4" />
              Filters
            </div>

            <div class="mt-5 space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Search</label>
                <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
                  <Search class="h-4 w-4 text-slate-400" />
                  <input v-model.trim="searchQuery" type="text" placeholder="Search products, brands or notes" class="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none" />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Type</label>
                <select v-model="selectedType" class="input">
                  <option value="">All types</option>
                  <option value="part">Parts</option>
                  <option value="device">Devices</option>
                  <option value="service">Services</option>
                  <option value="general_product">Accessories</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select v-model="selectedCategory" class="input">
                  <option value="">All categories</option>
                  <option v-for="category in availableCategories" :key="category" :value="category">{{ category }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Brand / manufacturer</label>
                <select v-model="selectedBrand" class="input">
                  <option value="">All brands</option>
                  <option v-for="brand in availableBrands" :key="brand" :value="brand">{{ brand }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Min price</label>
                  <input v-model="minPrice" type="number" min="0" step="0.01" placeholder="0" class="input" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Max price</label>
                  <input v-model="maxPrice" type="number" min="0" step="0.01" placeholder="999" class="input" />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Availability</label>
                <select v-model="selectedAvailability" class="input">
                  <option value="all">All stock states</option>
                  <option value="in_stock">In stock only</option>
                  <option value="out_of_stock">Out of stock only</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Condition</label>
                <select v-model="selectedCondition" class="input">
                  <option value="">All conditions</option>
                  <option v-for="condition in availableConditions" :key="condition" :value="condition">{{ condition }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Sort by</label>
                <select v-model="sortBy" class="input">
                  <option value="featured">Featured</option>
                  <option value="name">Name</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>

              <label class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span class="font-medium">Show discounts only</span>
                <input v-model="discountsOnly" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              </label>
            </div>

            <button
              type="button"
              class="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700"
              @click="clearAllFilters"
            >
              Reset all filters
            </button>
          </section>
        </aside>

        <section class="space-y-6">
          <div v-if="activeFilterChips.length" class="flex flex-wrap gap-3">
            <button
              v-for="chip in activeFilterChips"
              :key="chip.key"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-primary-200 hover:text-primary-700"
              @click="chip.clear()"
            >
              {{ chip.label }}
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <div class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Catalog view</div>
              <div class="mt-1 text-lg font-bold text-slate-900">{{ filteredProducts.length }} products found</div>
            </div>
            <p class="max-w-xl text-sm text-slate-500">
              Browse devices, parts, accessories and services with category filters, price ranges and storefront merchandising badges.
            </p>
          </div>

          <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
            <p class="mt-4 text-sm text-slate-500">Loading storefront catalog...</p>
          </div>

          <div v-else-if="filteredProducts.length" class="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product._uid"
              :product="product"
              :top-seller="isTopSeller(product)"
              :ribbon="getProductRibbon(product)"
              @select="goToProduct"
              @add-to-cart="addToCart"
              @book-service="bookService"
            />
          </div>

          <div v-else class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Filter class="mx-auto h-14 w-14 text-slate-300" />
            <h2 class="mt-4 text-2xl font-black text-slate-900">No products match these filters</h2>
            <p class="mt-3 text-sm text-slate-500">
              Adjust the active filters, remove the compatibility constraint, or return to the full catalog.
            </p>
            <button
              type="button"
              class="mt-6 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
              @click="clearAllFilters"
            >
              Show all products
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ChevronRight, Filter, Search, SlidersHorizontal, Smartphone, X } from 'lucide-vue-next';
import api from '@/services/api';
import ProductCard from '@/components/catalog/ProductCard.vue';
import { useSeo } from '@/composables/useSeo';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { promotionsAPI } from '@/services/api/promotions';
import {
  buildProductKey,
  getDiscountPercentage,
  getDisplayPrice,
  getProductName,
  getPurchasableStock,
  getTypeLabel,
  normalizeProduct,
  safeParseCatalogUrl,
} from '@/utils/catalog';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const seo = useSeo();
const cartStore = useCartStore();

const products = ref([]);
const topSellerKeys = ref([]);
const catalogPromos = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedType = ref('');
const selectedCategory = ref('');
const selectedBrand = ref('');
const selectedAvailability = ref('all');
const selectedCondition = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const discountsOnly = ref(false);
const sortBy = ref('featured');
const compatibilityBrand = ref('');
const compatibilityModel = ref('');
const syncingFromRoute = ref(false);
const lastLoadedStoreId = ref(null);
const currentRouteName = computed(() => String(route.name || 'ProductCatalog'));
const isBrandLanding = computed(() => currentRouteName.value === 'BrandCatalog');
const isCompatibilityLanding = computed(() => currentRouteName.value === 'CompatibilityCatalog');

const topSellerKeySet = computed(() => new Set(topSellerKeys.value));

watch(
  () => appStore.storeId,
  async storeId => {
    if (!storeId || storeId === lastLoadedStoreId.value) return;
    lastLoadedStoreId.value = storeId;
    await loadCatalog();
  },
  { immediate: true },
);

onMounted(() => {
  seo.apply({ title: 'Products' })
});

watch(
  () => [route.name, route.params.brand, route.params.model, route.query],
  () => {
    syncingFromRoute.value = true;
    searchQuery.value = queryValue(route.query.q);
    selectedType.value = queryValue(route.query.type);
    selectedCategory.value = queryValue(route.query.category);
    selectedBrand.value = isBrandLanding.value ? paramValue(route.params.brand) : queryValue(route.query.brand);
    selectedAvailability.value = queryValue(route.query.availability) || 'all';
    selectedCondition.value = queryValue(route.query.condition);
    minPrice.value = queryValue(route.query.min_price);
    maxPrice.value = queryValue(route.query.max_price);
    discountsOnly.value = queryValue(route.query.sale) === '1';
    sortBy.value = queryValue(route.query.sort) || 'featured';
    compatibilityBrand.value = isCompatibilityLanding.value ? paramValue(route.params.brand) : queryValue(route.query.device_brand);
    compatibilityModel.value = isCompatibilityLanding.value ? paramValue(route.params.model) : queryValue(route.query.device_model);
    syncingFromRoute.value = false;
  },
  { immediate: true, deep: true },
);

watch(
  [searchQuery, selectedType, selectedCategory, selectedBrand, selectedAvailability, selectedCondition, minPrice, maxPrice, discountsOnly, sortBy, compatibilityBrand, compatibilityModel],
  () => {
    if (syncingFromRoute.value) return;

    const query = buildRouteQuery();
    const currentQuery = JSON.stringify(normalizeQuery(route.query));
    const nextQuery = JSON.stringify(normalizeQuery(query));

    if (currentQuery === nextQuery && routeLocationMatchesFilters()) return;
    router.replace(buildRouteLocation(query));
  },
);

const featuredCategoryLinks = computed(() => {
  return (appStore.featuredCategories || []).map(category => ({
    ...category,
    parsedUrl: safeParseCatalogUrl(category.url),
  }));
});

const featuredBrands = computed(() => appStore.featuredBrands || []);

const activeFeaturedCategory = computed(() => {
  return featuredCategoryLinks.value.find(category => {
    const parsed = category.parsedUrl;
    if (!parsed || parsed.pathname !== '/products') return false;

    return (parsed.type || '') === (selectedType.value || '')
      && (parsed.category || '') === (selectedCategory.value || '')
      && (parsed.q || '') === (searchQuery.value || '');
  }) || null;
});

const catalogTitle = computed(() => {
  if (isCompatibilityLanding.value && compatibilityBrand.value) {
    return compatibilityModel.value
      ? `${compatibilityBrand.value} ${compatibilityModel.value} compatibility`
      : `${compatibilityBrand.value} compatibility`;
  }

  if (isBrandLanding.value && selectedBrand.value) {
    return `${selectedBrand.value} catalog`;
  }

  if (activeFeaturedCategory.value?.label) {
    return activeFeaturedCategory.value.label;
  }

  if (selectedCategory.value && selectedType.value) {
    return `${selectedCategory.value} ${getPluralTypeLabel(selectedType.value)}`;
  }

  if (selectedCategory.value) {
    return selectedCategory.value;
  }

  if (selectedType.value) {
    return getPluralTypeLabel(selectedType.value);
  }

  return 'Storefront catalog';
});

const catalogDescription = computed(() => {
  if (isCompatibilityLanding.value && compatibilityBrand.value) {
    return compatibilityModel.value
      ? `Products and parts compatible with ${compatibilityBrand.value} ${compatibilityModel.value}, with the full storefront filters still available.`
      : `Products and parts compatible with ${compatibilityBrand.value} devices.`;
  }

  if (isBrandLanding.value && selectedBrand.value) {
    return `Browse ${selectedBrand.value} products, parts and accessories available in this storefront.`;
  }

  if (activeFeaturedCategory.value?.description) {
    return activeFeaturedCategory.value.description;
  }

  if (selectedCategory.value) {
    return `Browsing the ${selectedCategory.value} catalog with live storefront filters and merchandising badges.`;
  }

  if (selectedType.value) {
    return `Browse all ${getPluralTypeLabel(selectedType.value).toLowerCase()} available in this storefront.`;
  }

  return 'Browse the full storefront catalog with richer filtering for price, condition, category, compatibility and promotions.';
});

const discountedProductsCount = computed(() => filteredProducts.value.filter(product => getDiscountPercentage(product) > 0).length);

const availableCategories = computed(() => {
  const categories = new Set();
  products.value.forEach(product => {
    const category = String(product.category ?? '').trim();
    if (category) categories.add(category);
  });
  return [...categories].sort((left, right) => left.localeCompare(right));
});

const availableBrands = computed(() => {
  const brands = new Set();
  products.value.forEach(product => {
    const brand = String(product.brand || product.manufacturer || '').trim();
    if (brand) brands.add(brand);
  });
  return [...brands].sort((left, right) => left.localeCompare(right));
});

const availableConditions = computed(() => {
  const conditions = new Set();
  products.value.forEach(product => {
    const condition = String(product.condition ?? '').trim();
    if (condition) conditions.add(condition);
  });
  return [...conditions].sort((left, right) => left.localeCompare(right));
});

const allDevices = computed(() => {
  const compatibleDevices = new Set();
  products.value.forEach(product => {
    (product.compatibleDevices || []).forEach(device => compatibleDevices.add(device));
  });
  return [...compatibleDevices].sort((left, right) => left.localeCompare(right));
});

const compatibleBrands = computed(() => {
  const brands = new Set();
  allDevices.value.forEach(device => {
    const [brand] = String(device).split(' ');
    if (brand) brands.add(brand);
  });
  return [...brands].sort((left, right) => left.localeCompare(right));
});

const compatibleModels = computed(() => {
  if (!compatibilityBrand.value) return [];

  const models = new Set();
  allDevices.value.forEach(device => {
    const normalizedDevice = String(device || '');
    const lowerDevice = normalizedDevice.toLowerCase();
    const lowerBrand = String(compatibilityBrand.value).toLowerCase();
    if (lowerDevice.startsWith(`${lowerBrand} `)) {
      models.add(normalizedDevice.slice(compatibilityBrand.value.length + 1));
    }
  });

  return [...models].sort((left, right) => left.localeCompare(right));
});

const compatibilityMatchesCount = computed(() => {
  if (!compatibilityBrand.value && !compatibilityModel.value) {
    return filteredProducts.value.length;
  }

  return filteredProducts.value.length;
});

const filteredProducts = computed(() => {
  let filtered = [...products.value];

  if (compatibilityBrand.value) {
    const prefix = compatibilityModel.value
      ? `${compatibilityBrand.value} ${compatibilityModel.value}`
      : compatibilityBrand.value;

    filtered = filtered.filter(product =>
      (product.compatibleDevices || []).some(device => {
        const normalizedDevice = String(device || '').toLowerCase();
        const normalizedPrefix = String(prefix || '').toLowerCase();
        return compatibilityModel.value
          ? normalizedDevice === normalizedPrefix
          : normalizedDevice === normalizedPrefix || normalizedDevice.startsWith(`${normalizedPrefix} `);
      }),
    );
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => {
      const haystack = [
        getProductName(product),
        product.description,
        product.category,
        product.brand,
        product.model,
        product.manufacturer,
        product.partNumber,
        ...(product.compatibleDevices || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  if (selectedType.value) {
    filtered = filtered.filter(product => product._productType === selectedType.value);
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(product => String(product.category ?? '') === selectedCategory.value);
  }

  if (selectedBrand.value) {
    const normalizedBrand = String(selectedBrand.value).toLowerCase();
    filtered = filtered.filter(product => String(product.brand || product.manufacturer || '').toLowerCase() === normalizedBrand);
  }

  if (selectedAvailability.value === 'in_stock') {
    filtered = filtered.filter(product => getPurchasableStock(product) > 0 || product._productType === 'service');
  }

  if (selectedAvailability.value === 'out_of_stock') {
    filtered = filtered.filter(product => product._productType !== 'service' && getPurchasableStock(product) <= 0);
  }

  if (selectedCondition.value) {
    filtered = filtered.filter(product => String(product.condition ?? '') === selectedCondition.value);
  }

  if (discountsOnly.value) {
    filtered = filtered.filter(product => getDiscountPercentage(product) > 0);
  }

  if (minPrice.value !== '') {
    const minimum = Number(minPrice.value);
    if (Number.isFinite(minimum)) {
      filtered = filtered.filter(product => getDisplayPrice(product) >= minimum);
    }
  }

  if (maxPrice.value !== '') {
    const maximum = Number(maxPrice.value);
    if (Number.isFinite(maximum)) {
      filtered = filtered.filter(product => getDisplayPrice(product) <= maximum);
    }
  }

  if (sortBy.value === 'price_asc') {
    filtered.sort((left, right) => getDisplayPrice(left) - getDisplayPrice(right));
    return filtered;
  }

  if (sortBy.value === 'price_desc') {
    filtered.sort((left, right) => getDisplayPrice(right) - getDisplayPrice(left));
    return filtered;
  }

  if (sortBy.value === 'name') {
    filtered.sort((left, right) => getProductName(left).localeCompare(getProductName(right)));
    return filtered;
  }

  filtered.sort((left, right) => {
    const leftScore = featuredSortScore(left);
    const rightScore = featuredSortScore(right);

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return getProductName(left).localeCompare(getProductName(right));
  });

  return filtered;
});

const activeFilterChips = computed(() => {
  const chips = [];

  if (searchQuery.value) {
    chips.push({ key: 'q', label: `Search: ${searchQuery.value}`, clear: () => { searchQuery.value = ''; } });
  }
  if (selectedType.value) {
    chips.push({ key: 'type', label: `Type: ${getPluralTypeLabel(selectedType.value)}`, clear: () => { selectedType.value = ''; } });
  }
  if (selectedCategory.value) {
    chips.push({ key: 'category', label: `Category: ${selectedCategory.value}`, clear: () => { selectedCategory.value = ''; } });
  }
  if (selectedBrand.value) {
    chips.push({ key: 'brand', label: `Brand: ${selectedBrand.value}`, clear: () => { selectedBrand.value = ''; } });
  }
  if (selectedCondition.value) {
    chips.push({ key: 'condition', label: `Condition: ${selectedCondition.value}`, clear: () => { selectedCondition.value = ''; } });
  }
  if (selectedAvailability.value !== 'all') {
    chips.push({ key: 'availability', label: `Availability: ${selectedAvailability.value.replace('_', ' ')}`, clear: () => { selectedAvailability.value = 'all'; } });
  }
  if (discountsOnly.value) {
    chips.push({ key: 'sale', label: 'Discounts only', clear: () => { discountsOnly.value = false; } });
  }
  if (minPrice.value !== '') {
    chips.push({ key: 'min_price', label: `Min EUR ${minPrice.value}`, clear: () => { minPrice.value = ''; } });
  }
  if (maxPrice.value !== '') {
    chips.push({ key: 'max_price', label: `Max EUR ${maxPrice.value}`, clear: () => { maxPrice.value = ''; } });
  }
  if (compatibilityBrand.value) {
    chips.push({ key: 'device_brand', label: `Device brand: ${compatibilityBrand.value}`, clear: () => { clearCompatibilityFilter(); } });
  }
  if (compatibilityModel.value) {
    chips.push({ key: 'device_model', label: `Device model: ${compatibilityModel.value}`, clear: () => { compatibilityModel.value = ''; } });
  }

  return chips;
});

async function loadCatalog() {
  loading.value = true;

  try {
    const [productsResponse, highlightsResponse, promosResponse] = await Promise.all([
      api.get(`/eshop/${appStore.storeId}/products`, { params: { per_page: 100 } }),
      api.get(`/eshop/${appStore.storeId}/highlights`, { params: { limit: 12 } }).catch(() => ({ data: { data: {} } })),
      promotionsAPI.getSuggestions(appStore.storeId).catch(() => []),
    ]);

    products.value = (productsResponse.data.data || []).map(item => normalizeProduct(item));
    topSellerKeys.value = (highlightsResponse.data?.data?.top_products || [])
      .map(item => buildProductKey(normalizeProduct(item)));
    catalogPromos.value = promosResponse;
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = [];
    topSellerKeys.value = [];
    catalogPromos.value = [];
  } finally {
    loading.value = false;
  }
}

function getProductRibbon(product) {
  for (const promo of catalogPromos.value) {
    if (!promo.campaign_ribbon) continue;
    const type = product._productType ?? product.type ?? '';
    const category = product.category ?? '';
    if (promo.applies_to === 'order') return promo.campaign_ribbon;
    if (promo.applies_to === 'type') {
      const normalize = t => (t === 'general' ? 'general_product' : t ?? '').toLowerCase();
      if (normalize(type) === normalize(promo.applies_to_value)) return promo.campaign_ribbon;
    }
    if (promo.applies_to === 'category') {
      if (category.toLowerCase() === (promo.applies_to_value ?? '').toLowerCase()) return promo.campaign_ribbon;
    }
  }
  return '';
}

function queryValue(value) {
  return Array.isArray(value) ? (value[0] || '') : (value || '');
}

function paramValue(value) {
  return decodeURIComponent(queryValue(value));
}

function normalizeQuery(query = {}) {
  return Object.keys(query)
    .sort()
    .reduce((accumulator, key) => {
      accumulator[key] = String(query[key]);
      return accumulator;
    }, {});
}

function buildRouteQuery() {
  const query = {};

  if (searchQuery.value) query.q = searchQuery.value;
  if (selectedType.value) query.type = selectedType.value;
  if (selectedCategory.value) query.category = selectedCategory.value;
  if (selectedBrand.value && !isBrandLanding.value) query.brand = selectedBrand.value;
  if (selectedAvailability.value && selectedAvailability.value !== 'all') query.availability = selectedAvailability.value;
  if (selectedCondition.value) query.condition = selectedCondition.value;
  if (minPrice.value !== '') query.min_price = minPrice.value;
  if (maxPrice.value !== '') query.max_price = maxPrice.value;
  if (discountsOnly.value) query.sale = '1';
  if (sortBy.value && sortBy.value !== 'featured') query.sort = sortBy.value;
  if (compatibilityBrand.value && !isCompatibilityLanding.value) query.device_brand = compatibilityBrand.value;
  if (compatibilityModel.value && !isCompatibilityLanding.value) query.device_model = compatibilityModel.value;

  return query;
}

function routeLocationMatchesFilters() {
  if (isBrandLanding.value) {
    return paramValue(route.params.brand) === selectedBrand.value;
  }

  if (isCompatibilityLanding.value) {
    return paramValue(route.params.brand) === compatibilityBrand.value
      && paramValue(route.params.model) === compatibilityModel.value;
  }

  return currentRouteName.value === 'ProductCatalog';
}

function buildRouteLocation(query) {
  if (isBrandLanding.value && selectedBrand.value) {
    return {
      name: 'BrandCatalog',
      params: { brand: selectedBrand.value },
      query,
    };
  }

  if (isCompatibilityLanding.value && compatibilityBrand.value) {
    return {
      name: 'CompatibilityCatalog',
      params: {
        brand: compatibilityBrand.value,
        ...(compatibilityModel.value ? { model: compatibilityModel.value } : {}),
      },
      query,
    };
  }

  return {
    path: '/products',
    query,
  };
}

function getPluralTypeLabel(type) {
  if (type === 'part') return 'Parts';
  if (type === 'device') return 'Devices';
  if (type === 'service') return 'Services';
  if (type === 'general_product') return 'Accessories';
  return getTypeLabel(type);
}

function featuredSortScore(product) {
  let score = 0;

  if (topSellerKeySet.value.has(buildProductKey(product))) score += 50;
  if (getDiscountPercentage(product) > 0) score += 20;
  if (getPurchasableStock(product) > 0 || product._productType === 'service') score += 10;
  if (product._productType === 'device') score += 4;

  return score;
}

function isTopSeller(product) {
  return topSellerKeySet.value.has(buildProductKey(product));
}

function clearCompatibilityFilter() {
  compatibilityBrand.value = '';
  compatibilityModel.value = '';

  if (isCompatibilityLanding.value) {
    router.replace({ path: '/products', query: buildRouteQuery() });
  }
}

function clearAllFilters() {
  searchQuery.value = '';
  selectedType.value = '';
  selectedCategory.value = '';
  selectedBrand.value = '';
  selectedAvailability.value = 'all';
  selectedCondition.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  discountsOnly.value = false;
  sortBy.value = 'featured';
  clearCompatibilityFilter();
}

function isFeaturedCategoryActive(category) {
  const parsed = category.parsedUrl;
  if (!parsed || parsed.pathname !== '/products') return false;

  return (parsed.type || '') === (selectedType.value || '')
    && (parsed.category || '') === (selectedCategory.value || '')
    && (parsed.q || '') === (searchQuery.value || '');
}

function isBrandActive(brandName) {
  return String(selectedBrand.value).toLowerCase() === String(brandName).toLowerCase();
}

function goToBrandLanding(brandName) {
  router.push({
    name: 'BrandCatalog',
    params: { brand: brandName },
    query: buildRouteQuery(),
  });
}

function navigateToFeaturedCategory(url) {
  if (!url) return;

  if (/^https?:\/\//i.test(url)) {
    window.location.href = url;
    return;
  }

  router.push(url);
}

function goToProduct(product) {
  router.push({
    path: `/product/${product.id}`,
    query: { source: product._source },
  });
}

function addToCart(product) {
  cartStore.addItem({
    ...product,
    eshopPrice: product.eshopPrice ?? product.price,
    sellPrice: product.sellPrice ?? product.price,
    _collection: product._source,
  }, 1);
}

function bookService(product) {
  router.push(`/repair-booking?service=${product.id}`);
}
</script>
