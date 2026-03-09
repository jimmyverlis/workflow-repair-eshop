<template>
  <article class="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
    <div class="cursor-pointer" @click="$emit('select', product)">
      <div class="relative mb-4 overflow-hidden rounded-2xl bg-slate-100 aspect-square">
        <img
          v-if="product.images?.[0]"
          :src="product.images[0]"
          :alt="productName"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div v-else class="flex h-full items-center justify-center text-slate-400">
          <Wrench v-if="product._productType === 'service'" class="h-16 w-16" />
          <Smartphone v-else-if="product._productType === 'device'" class="h-16 w-16" />
          <Package v-else class="h-16 w-16" />
        </div>

        <div v-if="badges.length" class="absolute left-3 top-3 flex max-w-[85%] flex-wrap gap-2">
          <span
            v-for="badge in badges"
            :key="`${badge.label}-${badge.tone}`"
            class="rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm"
            :class="badgeToneClasses[badge.tone] || badgeToneClasses.slate"
          >
            {{ badge.label }}
          </span>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {{ typeLabel }}
          </div>
          <h3 :class="compact ? 'mt-2 text-base font-bold text-slate-900' : 'mt-2 text-lg font-bold text-slate-900'">
            {{ productName }}
          </h3>
        </div>

        <p v-if="summary" class="line-clamp-2 text-sm text-slate-500">
          {{ summary }}
        </p>

        <div v-if="showCompatibility && product.compatibleDevices?.length" class="flex flex-wrap gap-2">
          <span
            v-for="compatibleDevice in product.compatibleDevices.slice(0, compact ? 2 : 3)"
            :key="compatibleDevice"
            class="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
          >
            {{ compatibleDevice }}
          </span>
          <span
            v-if="product.compatibleDevices.length > (compact ? 2 : 3)"
            class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500"
          >
            +{{ product.compatibleDevices.length - (compact ? 2 : 3) }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-auto pt-4">
      <div class="flex items-end justify-between gap-3">
        <div>
          <div class="text-2xl font-black text-primary-600">
            EUR {{ displayPrice.toFixed(2) }}
          </div>
          <div v-if="compareAtPrice" class="text-sm text-slate-400 line-through">
            EUR {{ compareAtPrice.toFixed(2) }}
          </div>
        </div>
        <div class="text-right text-xs font-semibold">
          <span v-if="product._productType === 'service'" class="text-sky-600">Service</span>
          <span v-else-if="stock > 0" class="text-emerald-600">In stock</span>
          <span v-else class="text-rose-600">Out of stock</span>
        </div>
      </div>

      <button
        v-if="product._productType === 'service'"
        type="button"
        class="mt-4 w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        @click.stop="$emit('book-service', product)"
      >
        Book service
      </button>
      <button
        v-else-if="stock > 0"
        type="button"
        class="mt-4 w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        @click.stop="$emit('add-to-cart', product)"
      >
        Add to cart
      </button>
      <button
        v-else
        type="button"
        class="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
        @click.stop="$emit('select', product)"
      >
        View details
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { Package, Smartphone, Wrench } from 'lucide-vue-next';
import {
  buildProductBadges,
  getCompareAtPrice,
  getDisplayPrice,
  getProductName,
  getProductSummary,
  getStock,
  getTypeLabel,
} from '@/utils/catalog';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  topSeller: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  showCompatibility: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['select', 'add-to-cart', 'book-service']);

const badgeToneClasses = {
  indigo: 'bg-indigo-600 text-white',
  rose: 'bg-rose-500 text-white',
  amber: 'border border-amber-200 bg-amber-50 text-amber-800',
  emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
  sky: 'border border-sky-200 bg-sky-50 text-sky-800',
  violet: 'border border-violet-200 bg-violet-50 text-violet-800',
  slate: 'border border-slate-200 bg-slate-50 text-slate-700',
};

const badges = computed(() => buildProductBadges(props.product, { topSeller: props.topSeller }));
const productName = computed(() => getProductName(props.product));
const displayPrice = computed(() => getDisplayPrice(props.product));
const compareAtPrice = computed(() => getCompareAtPrice(props.product));
const stock = computed(() => getStock(props.product));
const typeLabel = computed(() => getTypeLabel(props.product._productType ?? props.product.type));
const summary = computed(() => getProductSummary(props.product));
</script>
