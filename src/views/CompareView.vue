<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <RouterLink to="/" class="font-medium text-slate-600 hover:text-primary-600">Home</RouterLink>
        <ChevronRight class="h-4 w-4" />
        <span class="font-medium text-slate-900">Compare products</span>
      </nav>

      <section class="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Comparison</div>
            <h1 class="mt-2 text-3xl font-black text-slate-900 md:text-5xl">Compare products side by side</h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Review price, availability, type, category, compatibility and notes before deciding what to add to cart.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Selected</div>
              <div class="mt-2 text-2xl font-black text-slate-900">{{ compareStore.count }}</div>
            </div>
            <button
              v-if="compareStore.count"
              type="button"
              class="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
              @click="compareStore.clear()"
            >
              Clear compare
            </button>
          </div>
        </div>
      </section>

      <section v-if="compareStore.items.length" class="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <tbody class="divide-y divide-slate-200">
              <tr>
                <th class="w-48 bg-slate-50 px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Product</th>
                <td v-for="product in compareStore.items" :key="`head-${product._uid}`" class="min-w-[260px] px-6 py-5 align-top">
                  <div class="flex flex-col gap-4">
                    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 aspect-square">
                      <img v-if="product.images?.[0]" :src="product.images[0]" :alt="getProductName(product)" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full items-center justify-center text-slate-400">
                        <Package class="h-14 w-14" />
                      </div>
                    </div>
                    <div>
                      <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ getTypeLabel(product._productType) }}</div>
                      <div class="mt-2 text-xl font-black text-slate-900">{{ getProductName(product) }}</div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" class="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700" @click="viewProduct(product)">
                        View
                      </button>
                      <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600" @click="compareStore.removeProduct(product)">
                        Remove
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-for="row in rows" :key="row.key">
                <th class="bg-slate-50 px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ row.label }}</th>
                <td v-for="product in compareStore.items" :key="`${row.key}-${product._uid}`" class="px-6 py-5 align-top text-sm text-slate-700">
                  <template v-if="row.key === 'compatibleDevices'">
                    <div v-if="product.compatibleDevices?.length" class="flex flex-wrap gap-2">
                      <span
                        v-for="device in product.compatibleDevices.slice(0, 6)"
                        :key="device"
                        class="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                      >
                        {{ device }}
                      </span>
                    </div>
                    <span v-else class="text-slate-400">-</span>
                  </template>
                  <template v-else>
                    {{ row.value(product) || '-' }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <Scale class="mx-auto h-14 w-14 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">No products selected for comparison</h2>
        <p class="mt-3 text-sm text-slate-500">
          Add products from the catalog or product detail pages. You can compare up to four products at once.
        </p>
        <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
          Browse products
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ChevronRight, Package, Scale } from 'lucide-vue-next';
import { useCompareStore } from '@/stores/compare';
import { getAvailabilityLabel, getCompareAtPrice, getConditionLabel, getDisplayPrice, getProductName, getTypeLabel } from '@/utils/catalog';

const router = useRouter();
const compareStore = useCompareStore();

const rows = computed(() => [
  {
    key: 'price',
    label: 'Price',
    value: product => {
      const price = `EUR ${getDisplayPrice(product).toFixed(2)}`;
      const compareAt = getCompareAtPrice(product);
      return compareAt ? `${price} (was EUR ${compareAt.toFixed(2)})` : price;
    },
  },
  {
    key: 'availability',
    label: 'Availability',
    value: product => product._productType === 'service'
      ? 'Bookable service'
      : getAvailabilityLabel(product),
  },
  {
    key: 'brand',
    label: 'Brand',
    value: product => product.brand || product.manufacturer || '',
  },
  {
    key: 'category',
    label: 'Category',
    value: product => product.category || getTypeLabel(product._productType),
  },
  {
    key: 'condition',
    label: 'Condition',
    value: product => getConditionLabel(product.condition) || '',
  },
  {
    key: 'compatibleDevices',
    label: 'Compatibility',
    value: () => '',
  },
  {
    key: 'summary',
    label: 'Summary',
    value: product => product.description || product.notes || product.partNumber || '',
  },
]);

function viewProduct(product) {
  router.push({
    path: `/product/${product.id}`,
    query: { source: product._source },
  });
}
</script>
