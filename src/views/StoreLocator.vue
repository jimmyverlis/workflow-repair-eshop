<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Chain header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <div class="text-2xl font-bold text-primary-600">
            {{ appStore.chainConfig?.name || 'Repair Shop' }}
          </div>
          <div v-if="appStore.chainConfig?.tagline" class="text-sm text-gray-500">
            {{ appStore.chainConfig.tagline }}
          </div>
        </div>
        <div class="text-sm text-gray-400">Επιλογή Καταστήματος</div>
      </div>
    </header>

    <!-- Hero -->
    <div class="bg-primary-600 text-white py-12">
      <div class="container mx-auto px-4 text-center">
        <MapPin class="w-12 h-12 mx-auto mb-4 opacity-90" />
        <h1 class="text-3xl font-bold mb-2">Βρείτε το κατάστημά σας</h1>
        <p class="text-primary-100 max-w-md mx-auto">
          Επιλέξτε ένα κατάστημα για να συνεχίσετε με τις αγορές ή να κλείσετε επισκευή.
        </p>
      </div>
    </div>

    <!-- Search bar -->
    <div class="container mx-auto px-4 -mt-5">
      <div class="bg-white rounded-xl shadow-md p-4 flex gap-3 max-w-lg mx-auto">
        <Search class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <input
          v-model="search"
          type="text"
          placeholder="Αναζήτηση πόλης ή καταστήματος..."
          class="flex-1 outline-none text-sm"
        />
      </div>
    </div>

    <!-- Store grid -->
    <div class="container mx-auto px-4 py-8 flex-1">

      <!-- Loading -->
      <div v-if="appStore.isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <p class="mt-3 text-gray-500">Φόρτωση καταστημάτων...</p>
      </div>

      <!-- No results -->
      <div v-else-if="filteredStores.length === 0" class="text-center py-12 text-gray-500">
        <Store class="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Δεν βρέθηκαν καταστήματα{{ search ? ` για "${search}"` : '' }}.</p>
      </div>

      <!-- Store cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <button
          v-for="store in filteredStores"
          :key="store.id"
          @click="pickStore(store.id)"
          :disabled="selectingId === store.id"
          class="card text-left hover:shadow-lg hover:border-primary-200 border-2 border-transparent transition-all group"
        >
          <!-- Store colour band -->
          <div class="h-2 rounded-t-lg -mt-4 -mx-4 mb-4" style="background: var(--color-primary, #3b82f6)"></div>

          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <h3 class="font-bold text-lg group-hover:text-primary-600 transition-colors">
                {{ store.name }}
              </h3>
              <div v-if="store.address || store.city" class="text-sm text-gray-500 mt-1 flex items-start gap-1">
                <MapPin class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{{ [store.address, store.city].filter(Boolean).join(', ') }}</span>
              </div>
              <div v-if="store.phone" class="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Phone class="w-3.5 h-3.5 flex-shrink-0" />
                <span>{{ store.phone }}</span>
              </div>
              <div v-if="store.email" class="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Mail class="w-3.5 h-3.5 flex-shrink-0" />
                <span>{{ store.email }}</span>
              </div>
            </div>

            <div
              class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors"
            >
              <span v-if="selectingId === store.id" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></span>
              <ArrowRight v-else class="w-5 h-5 text-primary-600" />
            </div>
          </div>

          <!-- Status badge -->
          <div class="mt-4 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              :class="store.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="store.active !== false ? 'bg-green-500' : 'bg-gray-400'"></span>
              {{ store.active !== false ? 'Ανοιχτό' : 'Κλειστό' }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t py-6 text-center text-sm text-gray-400">
      &copy; {{ new Date().getFullYear() }} {{ appStore.chainConfig?.name || 'Repair Shop' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { storeConfig } from '@/config/store';
import { MapPin, Search, Store, Phone, Mail, ArrowRight } from 'lucide-vue-next';

const appStore = useAppStore();

const search = ref('');
const selectingId = ref(null);

const filteredStores = computed(() => {
  const q = search.value.trim().toLowerCase();
  const stores = appStore.chainStores.filter(s => s.active !== false);
  if (!q) return stores;
  return stores.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.city?.toLowerCase().includes(q) ||
    s.address?.toLowerCase().includes(q)
  );
});

async function pickStore(id) {
  selectingId.value = id;
  try {
    await appStore.selectStore(id);
    // Update storeConfig so service files use the right store
    storeConfig.storeId = id;
  } finally {
    selectingId.value = null;
  }
}
</script>
