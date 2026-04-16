<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <RouterLink to="/" class="font-medium text-slate-600 hover:text-primary-600">Αρχική</RouterLink>
        <ChevronRight class="h-4 w-4" />
        <span class="font-medium text-slate-900">{{ warehouseTitle }}</span>
      </nav>

      <section class="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-8">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl space-y-4">
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Warehouse
            </div>
            <div>
              <h1 class="text-3xl font-black text-slate-900 md:text-5xl">{{ warehouseTitle }}</h1>
              <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {{ warehouseDescription }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Αποτελέσματα</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ filteredProducts.length }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Κατηγορίες</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ availableCategories.length }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Κατάσταση</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ availableConditions.length }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Βαθμοί</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ availableGrades.length }}</div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="warehouseDisabled" class="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <Package class="mx-auto h-14 w-14 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">Η σελίδα warehouse δεν είναι ενεργή</h2>
        <p class="mt-3 text-sm text-slate-500">Ενεργοποιήστε τη λειτουργία από το ERP για να εμφανίζονται μεταχειρισμένες και ανακατασκευασμένες συσκευές.</p>
      </div>

      <div v-else class="mt-8 grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside class="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              <SlidersHorizontal class="h-4 w-4" />
              Φίλτρα
            </div>

            <div class="mt-5 space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Αναζήτηση</label>
                <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
                  <Search class="h-4 w-4 text-slate-400" />
                  <input v-model.trim="searchQuery" type="text" placeholder="Αναζήτηση συσκευών, μαρκών ή μοντέλων" class="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none" />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Κατηγορία</label>
                <select v-model="selectedCategory" class="input">
                  <option value="">Όλες οι κατηγορίες</option>
                  <option v-for="category in availableCategories" :key="category" :value="category">{{ category }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Μάρκα</label>
                <select v-model="selectedBrand" class="input">
                  <option value="">Όλες οι μάρκες</option>
                  <option v-for="brand in availableBrands" :key="brand" :value="brand">{{ brand }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Κατάσταση</label>
                <select v-model="selectedCondition" class="input">
                  <option value="">Όλες οι καταστάσεις</option>
                  <option v-for="condition in availableConditions" :key="condition" :value="condition">{{ condition }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Βαθμός</label>
                <select v-model="selectedGrade" class="input">
                  <option value="">Όλοι οι βαθμοί</option>
                  <option v-for="grade in availableGrades" :key="grade" :value="grade">{{ grade }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Ελάχ. τιμή</label>
                  <input v-model="minPrice" type="number" min="0" step="0.01" class="input" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Μέγ. τιμή</label>
                  <input v-model="maxPrice" type="number" min="0" step="0.01" class="input" />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Ταξινόμηση</label>
                <select v-model="sortBy" class="input">
                  <option value="newest">Νεότερα</option>
                  <option value="name_asc">Όνομα</option>
                  <option value="price_asc">Τιμή: χαμηλή προς υψηλή</option>
                  <option value="price_desc">Τιμή: υψηλή προς χαμηλή</option>
                </select>
              </div>
            </div>

            <button type="button" class="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700" @click="clearAllFilters">
              Επαναφορά φίλτρων
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

          <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
            <p class="mt-4 text-sm text-slate-500">Φόρτωση warehouse...</p>
          </div>

          <div v-else-if="filteredProducts.length" class="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product._uid"
              :product="product"
              @select="goToProduct"
              @add-to-cart="addToCart"
            />
          </div>

          <div v-else class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Package class="mx-auto h-14 w-14 text-slate-300" />
            <h2 class="mt-4 text-2xl font-black text-slate-900">Δεν βρέθηκαν συσκευές</h2>
            <p class="mt-3 text-sm text-slate-500">Προσαρμόστε τα φίλτρα ή επιστρέψτε στον πλήρη κατάλογο.</p>
            <button type="button" class="mt-6 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700" @click="clearAllFilters">
              Εμφάνιση όλων
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ChevronRight, Package, Search, SlidersHorizontal, X } from 'lucide-vue-next';
import api from '@/services/api';
import ProductCard from '@/components/catalog/ProductCard.vue';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { useSeo } from '@/composables/useSeo';
import { getDisplayPrice, normalizeProduct } from '@/utils/catalog';

const router = useRouter();
const appStore = useAppStore();
const cartStore = useCartStore();
const seo = useSeo();

const loading = ref(true);
const warehouseDisabled = ref(false);
const products = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedBrand = ref('');
const selectedCondition = ref('');
const selectedGrade = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const sortBy = ref('newest');

const warehouseTitle = computed(() => appStore.warehouseConfig?.navLabel || 'Warehouse');
const warehouseDescription = computed(() => appStore.warehouseConfig?.description || 'Used and refurbished devices from the same catalog.');

const availableCategories = computed(() => [...new Set(products.value.map(product => String(product.category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)));
const availableBrands = computed(() => [...new Set(products.value.map(product => String(product.brand || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)));
const availableConditions = computed(() => [...new Set(products.value.map(product => String(product.condition || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)));
const availableGrades = computed(() => [...new Set(products.value.map(product => String(product.grade || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)));

const filteredProducts = computed(() => {
  let filtered = [...products.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => [
      product.name,
      product.brand,
      product.model,
      product.category,
      product.condition,
      product.grade,
    ].filter(Boolean).join(' ').toLowerCase().includes(query));
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(product => String(product.category || '') === selectedCategory.value);
  }

  if (selectedBrand.value) {
    filtered = filtered.filter(product => String(product.brand || '') === selectedBrand.value);
  }

  if (selectedCondition.value) {
    filtered = filtered.filter(product => String(product.condition || '') === selectedCondition.value);
  }

  if (selectedGrade.value) {
    filtered = filtered.filter(product => String(product.grade || '') === selectedGrade.value);
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
    return filtered.sort((left, right) => getDisplayPrice(left) - getDisplayPrice(right));
  }

  if (sortBy.value === 'price_desc') {
    return filtered.sort((left, right) => getDisplayPrice(right) - getDisplayPrice(left));
  }

  if (sortBy.value === 'name_asc') {
    return filtered.sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')));
  }

  return filtered.sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0));
});

const activeFilterChips = computed(() => {
  const chips = [];

  if (searchQuery.value) chips.push({ key: 'q', label: `Αναζήτηση: ${searchQuery.value}`, clear: () => { searchQuery.value = ''; } });
  if (selectedCategory.value) chips.push({ key: 'category', label: `Κατηγορία: ${selectedCategory.value}`, clear: () => { selectedCategory.value = ''; } });
  if (selectedBrand.value) chips.push({ key: 'brand', label: `Μάρκα: ${selectedBrand.value}`, clear: () => { selectedBrand.value = ''; } });
  if (selectedCondition.value) chips.push({ key: 'condition', label: `Κατάσταση: ${selectedCondition.value}`, clear: () => { selectedCondition.value = ''; } });
  if (selectedGrade.value) chips.push({ key: 'grade', label: `Βαθμός: ${selectedGrade.value}`, clear: () => { selectedGrade.value = ''; } });
  if (minPrice.value !== '') chips.push({ key: 'min_price', label: `Ελάχ. EUR ${minPrice.value}`, clear: () => { minPrice.value = ''; } });
  if (maxPrice.value !== '') chips.push({ key: 'max_price', label: `Μέγ. EUR ${maxPrice.value}`, clear: () => { maxPrice.value = ''; } });

  return chips;
});

watch(
  () => appStore.storeId,
  async storeId => {
    if (!storeId) return;
    await loadWarehouse();
  },
  { immediate: true },
);

onMounted(() => {
  seo.apply({
    title: warehouseTitle.value,
    description: warehouseDescription.value,
  });
});

async function loadWarehouse() {
  loading.value = true;
  warehouseDisabled.value = false;

  try {
    const { data } = await api.get(`/eshop/${appStore.storeId}/warehouse`, {
      params: { per_page: 100 },
    });

    products.value = (data?.data || []).map(item => normalizeProduct(item));
  } catch (error) {
    if (error?.response?.status === 404) {
      warehouseDisabled.value = true;
      products.value = [];
    } else {
      console.error('Error loading warehouse:', error);
      products.value = [];
    }
  } finally {
    loading.value = false;
  }
}

function goToProduct(product) {
  router.push({
    path: `/product/${product.id}`,
    query: { source: product.source || 'inventory' },
  });
}

function addToCart(product) {
  cartStore.addItem(product, 1);
}

function clearAllFilters() {
  searchQuery.value = '';
  selectedCategory.value = '';
  selectedBrand.value = '';
  selectedCondition.value = '';
  selectedGrade.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  sortBy.value = 'newest';
}
</script>
