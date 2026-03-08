<template>
  <div class="product-catalog">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Προϊόντα</h1>
        <p class="text-gray-600">Βρείτε ό,τι χρειάζεστε για τη συσκευή σας</p>
      </div>

      <!-- Device Compatibility Filter -->
      <div v-if="allDevices.length" class="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-primary-100">
        <div class="flex items-center gap-2 mb-4">
          <Smartphone class="w-5 h-5 text-primary-600" />
          <h2 class="text-lg font-bold text-primary-700">Βρείτε ανταλλακτικά για τη συσκευή σας</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Μάρκα</label>
            <select v-model="selectedBrand" class="input" @change="selectedModel = ''">
              <option value="">Όλες οι μάρκες</option>
              <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Μοντέλο</label>
            <select v-model="selectedModel" class="input" :disabled="!selectedBrand">
              <option value="">Όλα τα μοντέλα</option>
              <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              v-if="selectedBrand || selectedModel"
              @click="selectedBrand = ''; selectedModel = ''"
              class="btn btn-secondary w-full"
            >
              <X class="w-4 h-4 mr-1" /> Καθαρισμός
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Αναζήτηση προϊόντων..."
              class="input"
            />
          </div>

          <!-- Type Filter -->
          <div>
            <select v-model="selectedType" class="input">
              <option value="">Όλες οι κατηγορίες</option>
              <option value="part">Ανταλλακτικά</option>
              <option value="device">Συσκευές</option>
              <option value="service">Υπηρεσίες</option>
              <option value="general_product">Αξεσουάρ</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <select v-model="sortBy" class="input">
              <option value="name">Όνομα</option>
              <option value="price_asc">Τιμή (Χαμηλή-Υψηλή)</option>
              <option value="price_desc">Τιμή (Υψηλή-Χαμηλή)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Φόρτωση προϊόντων...</p>
      </div>

      <!-- Products Grid -->
      <div v-else-if="filteredProducts.length > 0">
        <!-- Results count -->
        <p class="text-sm text-gray-500 mb-4">{{ filteredProducts.length }} προϊόντα</p>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="product in filteredProducts"
            :key="product._uid"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="goToProduct(product)"
          >
            <!-- Product Image -->
            <div class="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img
                v-if="product.images && product.images[0]"
                :src="product.images[0]"
                :alt="product.name || product.brand + ' ' + product.model"
                class="w-full h-full object-cover"
              />
              <Wrench v-else-if="product._productType === 'service'" class="w-16 h-16 text-gray-400" />
              <Package v-else class="w-16 h-16 text-gray-400" />
            </div>

            <!-- Product Info -->
            <div>
              <div class="text-xs text-gray-500 uppercase mb-1">
                {{ getTypeName(product._productType) }}
              </div>
              <h3 class="font-bold text-lg mb-1 line-clamp-2">
                {{ product.name || (product.brand + ' ' + product.model) }}
              </h3>

              <!-- Compatible devices badges -->
              <div v-if="product.compatibleDevices?.length" class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="dev in product.compatibleDevices.slice(0, 3)"
                  :key="dev"
                  class="inline-block text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100"
                >
                  {{ dev }}
                </span>
                <span v-if="product.compatibleDevices.length > 3" class="text-[10px] text-gray-400">
                  +{{ product.compatibleDevices.length - 3 }}
                </span>
              </div>

              <!-- Price -->
              <div class="flex items-center justify-between">
                <div class="text-2xl font-bold text-primary-600">
                  {{ getPrice(product).toFixed(2) }}€
                </div>

                <!-- Stock Badge -->
                <div v-if="product._productType === 'service'" class="text-xs text-blue-600 font-medium">
                  Υπηρεσία
                </div>
                <div v-else-if="getStock(product) > 0" class="text-xs text-green-600 font-medium">
                  Σε απόθεμα
                </div>
                <div v-else class="text-xs text-red-600 font-medium">
                  Μη διαθέσιμο
                </div>
              </div>

              <!-- Action Button -->
              <button
                v-if="product._productType === 'service'"
                @click.stop="bookService(product)"
                class="btn w-full mt-4 bg-blue-600 text-white hover:bg-blue-700"
              >
                Κλείσιμο Υπηρεσίας
              </button>
              <button
                v-else-if="getStock(product) > 0"
                @click.stop="addToCart(product)"
                class="btn btn-primary w-full mt-4"
              >
                Προσθήκη στο Καλάθι
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-12">
        <Package class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-700 mb-2">Δεν βρέθηκαν προϊόντα</h3>
        <p class="text-gray-600">Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import api from '@/services/api';
import { Package, Smartphone, Wrench, X } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const cartStore = useCartStore();

const products = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedType = ref(route.query.type || '');
const sortBy = ref('name');
const selectedBrand = ref('');
const selectedModel = ref('');

onMounted(async () => {
  try {
    loading.value = true;
    const { data } = await api.get(`/eshop/${appStore.storeId}/products`, {
      params: { per_page: 100 }
    });
    products.value = (data.data || []).map(p => ({
      ...p,
      _source: 'inventory',
      _productType: p.type || 'general_product',
      _uid: `inv_${p.id}`,
      compatibleDevices: p.compatible_devices || [],
      eshopPrice: p.price,
      sellPrice: p.price,
    }));
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    loading.value = false;
  }
});

// Extract unique brand/model pairs from compatibleDevices
const allDevices = computed(() => {
  const devices = new Set();
  products.value.forEach(p => {
    (p.compatibleDevices || []).forEach(d => devices.add(d));
  });
  return [...devices].sort();
});

const brands = computed(() => {
  const brandSet = new Set();
  allDevices.value.forEach(d => {
    const parts = d.split(' ');
    if (parts.length >= 1) brandSet.add(parts[0]);
  });
  return [...brandSet].sort();
});

const models = computed(() => {
  if (!selectedBrand.value) return [];
  const modelSet = new Set();
  allDevices.value.forEach(d => {
    if (d.startsWith(selectedBrand.value + ' ')) {
      modelSet.add(d.substring(selectedBrand.value.length + 1));
    }
  });
  return [...modelSet].sort();
});

// Filtered products
const filteredProducts = computed(() => {
  let filtered = products.value;

  // Filter by device compatibility
  if (selectedBrand.value) {
    const prefix = selectedModel.value
      ? `${selectedBrand.value} ${selectedModel.value}`
      : selectedBrand.value;
    filtered = filtered.filter(p =>
      (p.compatibleDevices || []).some(d =>
        selectedModel.value ? d === prefix : d.startsWith(prefix + ' ') || d === prefix
      )
    );
  }

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter(p => p._productType === selectedType.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p => {
      const name = (p.name || `${p.brand} ${p.model}`).toLowerCase();
      const desc = (p.eshopDescription || p.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

  // Sort
  if (sortBy.value === 'price_asc') {
    filtered = [...filtered].sort((a, b) => getPrice(a) - getPrice(b));
  } else if (sortBy.value === 'price_desc') {
    filtered = [...filtered].sort((a, b) => getPrice(b) - getPrice(a));
  } else {
    filtered = [...filtered].sort((a, b) => {
      const nameA = a.name || `${a.brand} ${a.model}`;
      const nameB = b.name || `${b.brand} ${b.model}`;
      return nameA.localeCompare(nameB);
    });
  }

  return filtered;
});

function getPrice(product) {
  return product.eshopPrice || product.sellPrice || product.price || 0;
}

function getStock(product) {
  if (product._productType === 'service') return Infinity;
  if (product._source === 'parts') {
    // Parts use supplierDetails for stock
    return (product.supplierDetails || []).reduce((sum, s) => sum + (s.stock || 0), 0) || product.quantity || 0;
  }
  return product.quantity || 0;
}

function getTypeName(type) {
  const types = {
    part: 'Ανταλλακτικό',
    device: 'Συσκευή',
    service: 'Υπηρεσία',
    general_product: 'Αξεσουάρ'
  };
  return types[type] || type;
}

function goToProduct(product) {
  router.push({
    path: `/product/${product.id}`,
    query: { source: product._source }
  });
}

function addToCart(product) {
  cartStore.addItem({
    ...product,
    _collection: product._source
  }, 1);
}

function bookService(product) {
  router.push(`/repair-booking?service=${product.id}`);
}
</script>
