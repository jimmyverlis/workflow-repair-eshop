<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <button @click="router.back()" class="btn btn-secondary mb-6">
        <ArrowLeft class="w-4 h-4 mr-1" /> Πίσω
      </button>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Product Image(s) -->
        <div>
          <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
            <img
              v-if="activeImage"
              :src="activeImage"
              :alt="productName"
              class="w-full h-full object-cover rounded-lg"
            />
            <Wrench v-else-if="isService" class="w-32 h-32 text-gray-400" />
            <Package v-else class="w-32 h-32 text-gray-400" />
          </div>
          <!-- Thumbnail gallery -->
          <div v-if="product.images?.length > 1" class="flex gap-2 overflow-x-auto pb-2">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              @click="activeImageIndex = i"
              class="w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors"
              :class="activeImageIndex === i ? 'border-primary-500' : 'border-gray-200 hover:border-gray-400'"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <div class="text-xs text-gray-500 uppercase mb-1">{{ typeName }}</div>
          <h1 class="text-3xl font-bold mb-4">{{ productName }}</h1>

          <!-- Compatible devices -->
          <div v-if="product.compatibleDevices?.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="dev in product.compatibleDevices"
              :key="dev"
              class="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
            >
              <Smartphone class="w-3 h-3" />
              {{ dev }}
            </span>
          </div>

          <!-- Price -->
          <div class="text-4xl font-bold text-primary-600 mb-4">
            {{ displayPrice.toFixed(2) }}€
          </div>
          <p v-if="product.eshopPrice && product.sellPrice && product.eshopPrice < product.sellPrice" class="text-sm text-gray-400 line-through mb-2">
            {{ product.sellPrice.toFixed(2) }}€
          </p>

          <!-- Stock / Service badge -->
          <div class="mb-6">
            <span v-if="isService" class="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
              Υπηρεσία
            </span>
            <span v-else-if="stock > 0" class="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              ✓ Σε Απόθεμα
            </span>
            <span v-else class="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">
              Μη Διαθέσιμο
            </span>
          </div>

          <!-- Description -->
          <div v-if="description" class="mb-6">
            <h3 class="font-bold mb-2">Περιγραφή</h3>
            <p class="text-gray-600 whitespace-pre-line">{{ description }}</p>
          </div>

          <!-- Extra details -->
          <div class="space-y-2 mb-6 text-sm text-gray-600">
            <p v-if="product.manufacturer"><span class="font-medium text-gray-800">Κατασκευαστής:</span> {{ product.manufacturer }}</p>
            <p v-if="product.brand && !isService"><span class="font-medium text-gray-800">Μάρκα:</span> {{ product.brand }}</p>
            <p v-if="product.condition && product.condition !== 'new'"><span class="font-medium text-gray-800">Κατάσταση:</span> {{ conditionLabel }}</p>
            <p v-if="product.warranty"><span class="font-medium text-gray-800">Εγγύηση:</span> {{ product.warranty }}</p>
            <p v-if="product.partNumber"><span class="font-medium text-gray-800">Κωδικός:</span> {{ product.partNumber }}</p>
          </div>

          <!-- Action -->
          <button
            v-if="isService"
            @click="bookService"
            class="btn w-full text-lg py-4 bg-blue-600 text-white hover:bg-blue-700"
          >
            Κλείσιμο Υπηρεσίας
          </button>
          <button
            v-else-if="stock > 0"
            @click="addToCart"
            class="btn btn-primary w-full text-lg py-4"
          >
            Προσθήκη στο Καλάθι
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">Το προϊόν δεν βρέθηκε</p>
        <RouterLink to="/products" class="btn btn-primary mt-4 inline-block">Πίσω στα Προϊόντα</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import api from '@/services/api';
import { Package, Wrench, ArrowLeft, Smartphone } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const cartStore = useCartStore();

const product = ref(null);
const loading = ref(true);
const activeImageIndex = ref(0);

const activeImage = computed(() => product.value?.images?.[activeImageIndex.value] || null);
const productName = computed(() => product.value?.name || '');
const isService = computed(() => product.value?.type === 'service');
const displayPrice = computed(() => product.value?.price || 0);
const description = computed(() => product.value?.description || '');
const stock = computed(() => isService.value ? Infinity : (product.value?.quantity || 0));

const typeName = computed(() => {
  const type = product.value?.type;
  if (type === 'service') return 'Υπηρεσία';
  if (type === 'part') return 'Ανταλλακτικό';
  if (type === 'device') return 'Συσκευή';
  return 'Προϊόν';
});

const conditionLabel = computed(() => {
  const map = { new: 'Καινούργιο', used: 'Μεταχειρισμένο', refurbished: 'Ανακατασκευασμένο' };
  return map[product.value?.condition] || product.value?.condition || '';
});

onMounted(async () => {
  try {
    const { data } = await api.get(`/eshop/${appStore.storeId}/products/${route.params.id}`);
    product.value = data.data;
  } catch (error) {
    console.error('Error loading product:', error);
  } finally {
    loading.value = false;
  }
});

function addToCart() {
  cartStore.addItem({
    ...product.value,
    eshopPrice: product.value.price,
    sellPrice: product.value.price,
    _collection: 'inventory',
  }, 1);
}

function bookService() {
  router.push(`/repair-booking?service=${product.value.id}`);
}
</script>
