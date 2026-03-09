<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mx-auto max-w-7xl">
        <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <RouterLink to="/" class="font-medium text-slate-600 hover:text-primary-600">Home</RouterLink>
          <ChevronRight class="h-4 w-4" />
          <RouterLink :to="{ path: '/products', query: detailCatalogQuery }" class="font-medium text-slate-600 hover:text-primary-600">Products</RouterLink>
          <template v-if="typeCrumbLabel">
            <ChevronRight class="h-4 w-4" />
            <RouterLink :to="{ path: '/products', query: typeCatalogQuery }" class="font-medium text-slate-600 hover:text-primary-600">{{ typeCrumbLabel }}</RouterLink>
          </template>
          <template v-if="product?.category">
            <ChevronRight class="h-4 w-4" />
            <RouterLink :to="{ path: '/products', query: detailCatalogQuery }" class="font-medium text-slate-600 hover:text-primary-600">{{ product.category }}</RouterLink>
          </template>
          <ChevronRight class="h-4 w-4" />
          <span class="font-medium text-slate-900">{{ productName }}</span>
        </nav>

        <button type="button" class="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-200 hover:text-primary-700" @click="router.back()">
          <ArrowLeft class="h-4 w-4" />
          Back
        </button>

        <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p class="mt-4 text-sm text-slate-500">Loading product details...</p>
        </div>

        <template v-else-if="product">
          <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div class="grid gap-8 p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-8">
              <div>
                <div class="relative aspect-square overflow-hidden rounded-[1.75rem] bg-slate-100">
                  <img
                    v-if="activeImage"
                    :src="activeImage"
                    :alt="productName"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full items-center justify-center text-slate-400">
                    <Wrench v-if="isService" class="h-24 w-24" />
                    <Package v-else-if="!isDevice" class="h-24 w-24" />
                    <Smartphone v-else class="h-24 w-24" />
                  </div>

                  <div v-if="merchandisingBadges.length" class="absolute left-4 top-4 flex max-w-[85%] flex-wrap gap-2">
                    <span
                      v-for="badge in merchandisingBadges"
                      :key="`${badge.label}-${badge.tone}`"
                      class="rounded-full px-3 py-1 text-xs font-bold shadow-sm"
                      :class="badgeToneClasses[badge.tone] || badgeToneClasses.slate"
                    >
                      {{ badge.label }}
                    </span>
                  </div>
                </div>

                <div v-if="product.images?.length > 1" class="mt-4 flex gap-3 overflow-x-auto pb-2">
                  <button
                    v-for="(image, index) in product.images"
                    :key="`${image}-${index}`"
                    type="button"
                    class="h-20 w-20 overflow-hidden rounded-2xl border-2 transition"
                    :class="activeImageIndex === index ? 'border-primary-500' : 'border-slate-200 hover:border-primary-200'"
                    @click="activeImageIndex = index"
                  >
                    <img :src="image" :alt="`${productName} ${index + 1}`" class="h-full w-full object-cover" />
                  </button>
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{{ typeLabel }}</div>
                  <h1 class="mt-3 text-4xl font-black text-slate-900">{{ productName }}</h1>
                  <p v-if="description" class="mt-4 max-w-2xl text-base leading-7 text-slate-600">{{ description }}</p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span v-if="product.brand && !isService" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">{{ product.brand }}</span>
                  <span v-if="product.model && isDevice" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">{{ product.model }}</span>
                  <span v-if="product.deviceType" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">{{ product.deviceType }}</span>
                  <span v-if="product.warranty" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">Warranty: {{ product.warranty }}</span>
                  <span v-if="product.partNumber" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">Part no: {{ product.partNumber }}</span>
                </div>

                <div class="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <div class="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Storefront price</div>
                      <div class="mt-2 text-4xl font-black text-primary-600">EUR {{ displayPrice.toFixed(2) }}</div>
                      <div v-if="compareAtPrice" class="mt-2 text-sm text-slate-400 line-through">EUR {{ compareAtPrice.toFixed(2) }}</div>
                    </div>
                    <div class="text-right text-sm font-semibold">
                      <span v-if="isService" class="rounded-full bg-sky-100 px-4 py-2 text-sky-700">Bookable service</span>
                      <span v-else-if="stockState === 'in_stock'" class="rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">In stock now</span>
                      <span v-else-if="stockState === 'low_stock'" class="rounded-full bg-amber-100 px-4 py-2 text-amber-700">Low stock</span>
                      <span v-else class="rounded-full bg-rose-100 px-4 py-2 text-rose-700">Out of stock</span>
                    </div>
                  </div>

                  <div class="mt-5 grid gap-3 sm:grid-cols-2">
                    <div class="rounded-2xl border border-white bg-white px-4 py-3">
                      <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category</div>
                      <div class="mt-2 text-lg font-bold text-slate-900">{{ product.category || typeLabel }}</div>
                    </div>
                    <div class="rounded-2xl border border-white bg-white px-4 py-3">
                      <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Availability</div>
                      <div class="mt-2 text-lg font-bold text-slate-900">{{ availabilityLabel }}</div>
                    </div>
                  </div>

                  <div v-if="stockState === 'low_stock' && !isService" class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    {{ availabilityLabel }}. Order soon before this item sells out.
                  </div>
                </div>

                <div class="flex flex-wrap gap-3">
                  <button
                    v-if="isService"
                    type="button"
                    class="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                    @click="bookService"
                  >
                    Book service
                  </button>
                  <button
                    v-else-if="stock > 0"
                    type="button"
                    class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                    @click="addToCart"
                  >
                    Add to cart
                  </button>
                  <button
                    v-if="!isService"
                    type="button"
                    class="rounded-2xl border px-5 py-3 text-sm font-semibold transition"
                    :class="isCompared
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:text-primary-700'"
                    @click="toggleCompare"
                  >
                    {{ isCompared ? 'Added to compare' : 'Compare' }}
                  </button>
                  <button
                    v-if="!isService && appStore.wishlistEnabled"
                    type="button"
                    class="rounded-2xl border px-5 py-3 text-sm font-semibold transition"
                    :class="isWishlisted
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600'"
                    @click="toggleWishlist"
                  >
                    {{ isWishlisted ? 'Saved to wishlist' : 'Save to wishlist' }}
                  </button>
                  <button
                    v-if="!isService && stockState === 'out_of_stock'"
                    type="button"
                    class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:border-amber-300"
                    @click="notifyFormOpen = !notifyFormOpen"
                  >
                    {{ notifyFormOpen ? 'Hide notify form' : 'Notify me when available' }}
                  </button>
                  <RouterLink :to="{ path: '/products', query: detailCatalogQuery }" class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700">
                    Browse similar products
                  </RouterLink>
                </div>

                <div v-if="notifyFormOpen && !isService && stockState === 'out_of_stock'" class="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Back in stock</div>
                  <h2 class="mt-2 text-xl font-black text-slate-900">Get notified when this item returns</h2>
                  <p class="mt-2 text-sm text-slate-500">
                    Leave your contact details and the store can follow up when this product is available again.
                  </p>

                  <div class="mt-4 grid gap-3 md:grid-cols-2">
                    <input v-model="notifyForm.customer_name" type="text" placeholder="Your name" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-300" />
                    <input v-model="notifyForm.email" type="email" placeholder="Email address" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-300" />
                    <input v-model="notifyForm.phone" type="text" placeholder="Phone (optional)" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-300 md:col-span-2" />
                    <textarea v-model="notifyForm.notes" rows="3" placeholder="Optional note" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-300 md:col-span-2"></textarea>
                  </div>

                  <div v-if="notifyError" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {{ notifyError }}
                  </div>
                  <div v-if="notifyStatus" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {{ notifyStatus }}
                  </div>

                  <div class="mt-4">
                    <button
                      type="button"
                      class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="notifySubmitting"
                      @click="submitBackInStockRequest"
                    >
                      {{ notifySubmitting ? 'Saving request...' : 'Notify me' }}
                    </button>
                  </div>
                </div>

                <div v-if="retentionHighlights.length" class="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Customer benefits</div>
                  <div class="mt-4 grid gap-3 md:grid-cols-2">
                    <div
                      v-for="highlight in retentionHighlights"
                      :key="highlight.title"
                      class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div class="text-sm font-bold text-slate-900">{{ highlight.title }}</div>
                      <div class="mt-1 text-sm text-slate-500">{{ highlight.body }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div class="space-y-8">
              <div v-if="product.compatibleDevices?.length" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-black text-slate-900">Compatible devices</h2>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="compatibleDevice in product.compatibleDevices"
                    :key="compatibleDevice"
                    class="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {{ compatibleDevice }}
                  </span>
                </div>
              </div>

              <div v-if="specificationEntries.length" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-black text-slate-900">Specifications</h2>
                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                  <div
                    v-for="specification in specificationEntries"
                    :key="`${specification.key}-${specification.value}`"
                    class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ humanizeKey(specification.key) }}</div>
                    <div class="mt-2 text-sm font-semibold text-slate-900 break-words">{{ specification.value }}</div>
                  </div>
                </div>
              </div>

              <div v-if="accessoryList.length" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-black text-slate-900">Included accessories</h2>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="accessory in accessoryList"
                    :key="accessory"
                    class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {{ accessory }}
                  </span>
                </div>
              </div>

              <div v-if="defectList.length" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-black text-slate-900">Condition notes</h2>
                <ul class="mt-4 space-y-3 text-sm text-slate-600">
                  <li v-for="defect in defectList" :key="defect" class="flex items-start gap-3">
                    <span class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"></span>
                    <span>{{ defect }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="additionalNotes" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-black text-slate-900">Additional notes</h2>
                <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{{ additionalNotes }}</p>
              </div>
            </div>

            <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quick facts</div>
                <div class="mt-5 space-y-4 text-sm text-slate-600">
                  <div v-if="product.manufacturer" class="flex items-center justify-between gap-4">
                    <span>Manufacturer</span>
                    <span class="font-semibold text-slate-900">{{ product.manufacturer }}</span>
                  </div>
                  <div v-if="product.condition" class="flex items-center justify-between gap-4">
                    <span>Condition</span>
                    <span class="font-semibold text-slate-900">{{ conditionLabel }}</span>
                  </div>
                  <div v-if="product.grade" class="flex items-center justify-between gap-4">
                    <span>Grade</span>
                    <span class="font-semibold text-slate-900">{{ product.grade }}</span>
                  </div>
                  <div v-if="product.deviceType" class="flex items-center justify-between gap-4">
                    <span>Device type</span>
                    <span class="font-semibold text-slate-900">{{ product.deviceType }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span>Product type</span>
                    <span class="font-semibold text-slate-900">{{ typeLabel }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section v-if="relatedProducts.length" class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-end justify-between gap-4">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">More to explore</div>
                <h2 class="mt-2 text-2xl font-black text-slate-900">Related products</h2>
              </div>
              <RouterLink :to="{ path: '/products', query: detailCatalogQuery }" class="text-sm font-semibold text-primary-600 hover:text-primary-700">View all</RouterLink>
            </div>
            <div class="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ProductCard
                v-for="relatedProduct in relatedProducts"
                :key="relatedProduct._uid"
                :product="relatedProduct"
                :top-seller="isTopSeller(relatedProduct)"
                compact
                @select="goToProduct"
                @add-to-cart="addSpecificToCart"
                @book-service="bookSpecificService"
              />
            </div>
          </section>

          <section v-if="recentlyViewedProducts.length" class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Your history</div>
              <h2 class="mt-2 text-2xl font-black text-slate-900">Recently viewed</h2>
            </div>
            <div class="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ProductCard
                v-for="recentProduct in recentlyViewedProducts"
                :key="recentProduct._uid"
                :product="recentProduct"
                :top-seller="isTopSeller(recentProduct)"
                compact
                @select="goToProduct"
                @add-to-cart="addSpecificToCart"
                @book-service="bookSpecificService"
              />
            </div>
          </section>
        </template>

        <div v-else class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <p class="text-lg font-semibold text-slate-700">The requested product could not be found.</p>
          <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">Return to catalog</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowLeft, ChevronRight, Package, Smartphone, Wrench } from 'lucide-vue-next';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import ProductCard from '@/components/catalog/ProductCard.vue';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { useCompareStore } from '@/stores/compare';
import { useWishlistStore } from '@/stores/wishlist';
import { useSeo } from '@/composables/useSeo';
import { useAnalytics } from '@/composables/useAnalytics';
import { backInStockAPI } from '@/services/api/backInStock';
import {
  buildProductBadges,
  buildProductKey,
  getAvailabilityLabel,
  getCompareAtPrice,
  getConditionLabel,
  getDisplayPrice,
  getProductName,
  getRecentlyViewedEntries,
  getStockState,
  getStock,
  getTypeLabel,
  normalizeProduct,
  saveRecentlyViewedProduct,
} from '@/utils/catalog';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const cartStore = useCartStore();
const compareStore = useCompareStore();
const wishlistStore = useWishlistStore();
const seo = useSeo();
const analytics = useAnalytics();

const product = ref(null);
const loading = ref(true);
const activeImageIndex = ref(0);
const relatedProducts = ref([]);
const recentlyViewedProducts = ref([]);
const topSellerKeys = ref([]);
const notifyFormOpen = ref(false);
const notifySubmitting = ref(false);
const notifyStatus = ref('');
const notifyError = ref('');
const notifyForm = ref({
  email: '',
  customer_name: '',
  phone: '',
  notes: '',
});

const badgeToneClasses = {
  indigo: 'bg-indigo-600 text-white',
  rose: 'bg-rose-500 text-white',
  amber: 'border border-amber-200 bg-amber-50 text-amber-800',
  emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
  sky: 'border border-sky-200 bg-sky-50 text-sky-800',
  violet: 'border border-violet-200 bg-violet-50 text-violet-800',
  slate: 'border border-slate-200 bg-slate-50 text-slate-700',
};

const topSellerKeySet = computed(() => new Set(topSellerKeys.value));
const activeImage = computed(() => product.value?.images?.[activeImageIndex.value] || null);
const productName = computed(() => getProductName(product.value || {}));
const isService = computed(() => product.value?._productType === 'service');
const isDevice = computed(() => product.value?._productType === 'device');
const displayPrice = computed(() => getDisplayPrice(product.value || {}));
const compareAtPrice = computed(() => getCompareAtPrice(product.value || {}));
const description = computed(() => product.value?.description || '');
const stock = computed(() => getStock(product.value || {}));
const stockState = computed(() => getStockState(product.value || {}, appStore.lowStockThreshold));
const merchandisingBadges = computed(() => buildProductBadges(product.value || {}, {
  topSeller: isTopSeller(product.value),
  lowStockThreshold: appStore.lowStockThreshold,
}));
const typeLabel = computed(() => getTypeLabel(product.value?._productType));
const conditionLabel = computed(() => getConditionLabel(product.value?.condition));
const specificationEntries = computed(() => product.value?.specifications ?? []);
const defectList = computed(() => product.value?.defects ?? []);
const accessoryList = computed(() => product.value?.includedAccessories ?? []);
const additionalNotes = computed(() => {
  const notes = product.value?.notes?.trim?.() ?? '';
  return notes && notes !== description.value ? notes : '';
});
const typeCatalogQuery = computed(() => {
  const type = product.value?._productType;
  if (!type) return {};
  return { type };
});
const detailCatalogQuery = computed(() => {
  const query = {};
  if (product.value?._productType) query.type = product.value._productType;
  if (product.value?.category) query.category = product.value.category;
  return query;
});
const typeCrumbLabel = computed(() => {
  if (!product.value?._productType) return '';
  if (product.value._productType === 'general_product') return 'Accessories';
  if (product.value._productType === 'device') return 'Devices';
  if (product.value._productType === 'part') return 'Parts';
  if (product.value._productType === 'service') return 'Services';
  return typeLabel.value;
});
const availabilityLabel = computed(() => {
  return getAvailabilityLabel(product.value || {}, appStore.lowStockThreshold);
});
const isCompared = computed(() => compareStore.hasProduct(product.value || {}));
const isWishlisted = computed(() => wishlistStore.hasProduct(product.value || {}));
const estimatedPoints = computed(() => {
  if (!appStore.loyaltyEnabled || isService.value) return 0;
  return Math.max(0, Math.round(displayPrice.value * appStore.loyaltyPointsPerCurrency));
});
const retentionHighlights = computed(() => {
  const highlights = [];

  if (!isService.value && appStore.loyaltyEnabled && estimatedPoints.value > 0) {
    highlights.push({
      title: `Earn about ${estimatedPoints.value} loyalty points`,
      body: 'Points are awarded after successful payment and appear inside the customer account.',
    });
  }

  if (!isService.value && appStore.referralsEnabled && appStore.referralRewardPoints > 0) {
    highlights.push({
      title: `Referral rewards available`,
      body: `Customers can invite friends and unlock ${appStore.referralRewardPoints} bonus points after a first paid order.`,
    });
  }

  if (!isService.value && appStore.returnRequestsEnabled) {
    const windowCopy = appStore.returnWindowDays > 0
      ? `Return requests can be submitted within ${appStore.returnWindowDays} days.`
      : 'Return requests are enabled for eligible orders.';

    highlights.push({
      title: 'Store-managed returns',
      body: appStore.returnInstructions || windowCopy,
    });
  }

  return highlights;
});

watch(
  () => appStore.currentUser,
  user => {
    notifyForm.value = {
      ...notifyForm.value,
      email: user?.email || notifyForm.value.email || '',
      customer_name: [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || notifyForm.value.customer_name || '',
      phone: user?.phone || notifyForm.value.phone || '',
    };
  },
  { immediate: true },
);

watch(
  () => [appStore.storeId, route.params.id, route.query.source],
  async ([storeId, productId]) => {
    if (!storeId || !productId) return;
    await loadProduct();
  },
  { immediate: true },
);

async function loadProduct() {
  loading.value = true;
  activeImageIndex.value = 0;
  notifyFormOpen.value = false;
  notifyStatus.value = '';
  notifyError.value = '';

  try {
    const [productResponse, productsResponse, highlightsResponse] = await Promise.all([
      api.get(`/eshop/${appStore.storeId}/products/${route.params.id}`, { params: { source: route.query.source } }),
      api.get(`/eshop/${appStore.storeId}/products`, { params: { per_page: 100 } }),
      api.get(`/eshop/${appStore.storeId}/highlights`, { params: { limit: 12 } }).catch(() => ({ data: { data: {} } })),
    ]);

    const normalizedProduct = normalizeProduct(productResponse.data.data || {});
    const catalogProducts = (productsResponse.data.data || []).map(item => normalizeProduct(item));

    product.value = normalizedProduct;
    saveRecentlyViewedProduct(normalizedProduct);

    // SEO
    const pName = normalizedProduct.name || '';
    const pDesc = normalizedProduct.meta_description || normalizedProduct.eshop_description || normalizedProduct.description || ''
    const pImage = normalizedProduct.images?.[0] || ''
    seo.apply({
      title: normalizedProduct.meta_title || pName,
      description: pDesc,
      image: pImage,
      type: 'og:product',
    })
    seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: pName,
      description: pDesc,
      image: pImage ? [pImage] : undefined,
      sku: normalizedProduct.id,
      brand: normalizedProduct.brand ? { '@type': 'Brand', name: normalizedProduct.brand } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: appStore.storeConfig?.currency || 'EUR',
        price: normalizedProduct.eshop_price || normalizedProduct.price || 0,
        availability: (normalizedProduct.quantity > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: window.location.href,
      },
    }, 'product')

    // Analytics: view_item event
    analytics.trackViewItem(normalizedProduct);
    topSellerKeys.value = (highlightsResponse.data?.data?.top_products || [])
      .map(item => buildProductKey(normalizeProduct(item)));

    relatedProducts.value = buildRelatedProducts(normalizedProduct, catalogProducts);
    recentlyViewedProducts.value = buildRecentlyViewedProducts(normalizedProduct, catalogProducts);
  } catch (error) {
    console.error('Error loading product:', error);
    product.value = null;
    relatedProducts.value = [];
    recentlyViewedProducts.value = [];
  } finally {
    loading.value = false;
  }
}

function buildRelatedProducts(currentProduct, catalogProducts) {
  return catalogProducts
    .filter(candidate => buildProductKey(candidate) !== buildProductKey(currentProduct))
    .map(candidate => ({ product: candidate, score: relatedScore(currentProduct, candidate) }))
    .filter(entry => entry.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      if (isTopSeller(right.product) !== isTopSeller(left.product)) {
        return Number(isTopSeller(right.product)) - Number(isTopSeller(left.product));
      }

      return getProductName(left.product).localeCompare(getProductName(right.product));
    })
    .map(entry => entry.product)
    .slice(0, 4);
}

function buildRecentlyViewedProducts(currentProduct, catalogProducts) {
  const byKey = new Map(catalogProducts.map(item => [buildProductKey(item), item]));

  return getRecentlyViewedEntries()
    .map(entry => byKey.get(`${entry.source}:${entry.id}`))
    .filter(candidate => candidate && buildProductKey(candidate) !== buildProductKey(currentProduct))
    .slice(0, 4);
}

function relatedScore(currentProduct, candidate) {
  let score = 0;

  if (candidate._productType === currentProduct._productType) score += 4;
  if (candidate._source === currentProduct._source) score += 2;
  if (candidate.category && candidate.category === currentProduct.category) score += 4;
  if (candidate.brand && currentProduct.brand && candidate.brand === currentProduct.brand) score += 3;
  if (candidate.deviceType && currentProduct.deviceType && candidate.deviceType === currentProduct.deviceType) score += 2;
  if (candidate.manufacturer && currentProduct.manufacturer && candidate.manufacturer === currentProduct.manufacturer) score += 1;

  const sharedCompatibleDevices = (candidate.compatibleDevices || []).filter(device => (currentProduct.compatibleDevices || []).includes(device)).length;
  score += sharedCompatibleDevices;

  return score;
}

function isTopSeller(candidate) {
  if (!candidate) return false;
  return topSellerKeySet.value.has(buildProductKey(candidate));
}

function humanizeKey(key) {
  const normalized = String(key ?? '').replace(/[_-]+/g, ' ').trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Details';
}

function addToCart() {
  if (!product.value) return;

  cartStore.addItem({
    ...product.value,
    eshopPrice: product.value.eshopPrice ?? product.value.price,
    sellPrice: product.value.sellPrice ?? product.value.price,
    _collection: product.value._source,
  }, 1);

  analytics.trackAddToCart(product.value, 1);
}

function toggleCompare() {
  compareStore.toggleProduct(product.value || {});
}

async function toggleWishlist() {
  await wishlistStore.toggleProduct(product.value || {});
}

function addSpecificToCart(candidate) {
  cartStore.addItem({
    ...candidate,
    eshopPrice: candidate.eshopPrice ?? candidate.price,
    sellPrice: candidate.sellPrice ?? candidate.price,
    _collection: candidate._source,
  }, 1);
}

function bookService() {
  if (!product.value) return;
  router.push(`/repair-booking?service=${product.value.id}`);
}

function bookSpecificService(candidate) {
  router.push(`/repair-booking?service=${candidate.id}`);
}

function goToProduct(candidate) {
  router.push({
    path: `/product/${candidate.id}`,
    query: { source: candidate._source },
  });
}

async function submitBackInStockRequest() {
  if (!product.value) return;

  notifySubmitting.value = true;
  notifyError.value = '';
  notifyStatus.value = '';

  try {
    const response = await backInStockAPI.create(appStore.storeId, {
      source: product.value._source,
      item_id: product.value.id,
      email: notifyForm.value.email,
      customer_name: notifyForm.value.customer_name,
      phone: notifyForm.value.phone,
      notes: notifyForm.value.notes,
    });

    notifyStatus.value = response?.message || 'Your request was saved.';
  } catch (error) {
    notifyError.value = error?.response?.data?.message || 'Could not save the request.';
  } finally {
    notifySubmitting.value = false;
  }
}
</script>
