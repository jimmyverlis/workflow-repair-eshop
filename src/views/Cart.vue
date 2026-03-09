<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Checkout prep</div>
          <h1 class="mt-2 text-4xl font-black text-slate-900">Shopping cart</h1>
          <p class="mt-2 text-sm text-slate-500">Review quantities, apply a promo code, and continue to checkout.</p>
        </div>
        <RouterLink to="/products" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-200 hover:text-primary-700">
          Continue shopping
        </RouterLink>
      </div>

      <div v-if="cartStore.isEmpty" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <ShoppingCart class="mx-auto h-16 w-16 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">Your cart is empty</h2>
        <p class="mt-3 text-sm text-slate-500">Add products, accessories or services from the storefront catalog to continue.</p>
        <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
          Browse products
        </RouterLink>
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-4">
          <article
            v-for="item in cartStore.items"
            :key="item._key"
            class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div class="flex gap-4">
              <div class="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100 flex-shrink-0">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="h-full w-full object-cover" />
                <div v-else class="flex h-full items-center justify-center text-slate-400">
                  <Package class="h-10 w-10" />
                </div>
              </div>

              <div class="flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h2 class="text-lg font-bold text-slate-900">{{ item.name }}</h2>
                    <p class="mt-1 text-sm text-slate-500">EUR {{ item.unitPrice.toFixed(2) }} each</p>
                    <p v-if="item.sku" class="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{{ item.sku }}</p>
                  </div>
                  <button type="button" class="text-sm font-semibold text-rose-600 hover:text-rose-700" @click="cartStore.removeItem(item._key)">
                    Remove
                  </button>
                </div>

                <div class="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <div class="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <button type="button" class="h-8 w-8 rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm" @click="cartStore.updateQuantity(item._key, item.quantity - 1)">-</button>
                    <span class="min-w-[24px] text-center text-sm font-semibold text-slate-900">{{ item.quantity }}</span>
                    <button type="button" class="h-8 w-8 rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm" @click="cartStore.updateQuantity(item._key, item.quantity + 1)">+</button>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Line total</div>
                    <div class="mt-1 text-xl font-black text-slate-900">EUR {{ (item.unitPrice * item.quantity).toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside>
          <div class="sticky top-24 space-y-4">
            <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Promotions</div>
                  <h2 class="mt-2 text-xl font-black text-slate-900">Apply a promo code</h2>
                </div>
              </div>

              <div class="mt-4 flex gap-2">
                <input v-model.trim="promoCode" type="text" placeholder="Enter code" class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium uppercase text-slate-900 outline-none focus:border-primary-300" />
                <button type="button" class="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50" :disabled="promoLoading || !promoCode" @click="applyDiscountCode()">
                  {{ promoLoading ? 'Applying...' : 'Apply' }}
                </button>
              </div>

              <p v-if="promoMessage" class="mt-3 text-sm" :class="promoSuccess ? 'text-emerald-600' : 'text-rose-600'">
                {{ promoMessage }}
              </p>

              <div v-if="cartStore.promotion?.promotion" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div class="font-semibold">{{ cartStore.promotion.promotion.code }}</div>
                <div v-if="cartStore.promotion.promotion.description" class="mt-1">{{ cartStore.promotion.promotion.description }}</div>
                <button type="button" class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 hover:text-rose-700" @click="removeDiscountCode">
                  Remove code
                </button>
              </div>
            </section>

            <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Order summary</div>
              <h2 class="mt-2 text-xl font-black text-slate-900">Cart totals</h2>

              <div class="mt-5 space-y-3 text-sm text-slate-600">
                <div class="flex items-center justify-between gap-3">
                  <span>Subtotal</span>
                  <span class="font-semibold text-slate-900">EUR {{ totals.subtotal.toFixed(2) }}</span>
                </div>
                <div v-if="totals.total_discount > 0" class="flex items-center justify-between gap-3 text-emerald-700">
                  <span>Discount</span>
                  <span class="font-semibold">-EUR {{ totals.total_discount.toFixed(2) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span>VAT included</span>
                  <span class="font-semibold text-slate-900">EUR {{ totals.vat_amount.toFixed(2) }}</span>
                </div>
                <div class="border-t border-slate-200 pt-3 flex items-center justify-between gap-3 text-lg font-black text-slate-900">
                  <span>Total</span>
                  <span>EUR {{ totals.total_amount.toFixed(2) }}</span>
                </div>
              </div>

              <RouterLink to="/checkout" class="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                Continue to checkout
              </RouterLink>
            </section>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Package, ShoppingCart } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { promotionsAPI } from '@/services/api/promotions';

const appStore = useAppStore();
const cartStore = useCartStore();

const promoCode = ref('');
const promoLoading = ref(false);
const promoMessage = ref('');
const promoSuccess = ref(false);

const vatRate = computed(() => Number(appStore.storeConfig?.vat_rate ?? 24));
const cartSignature = computed(() => JSON.stringify(cartStore.items.map(item => ({ key: item._key, quantity: item.quantity, price: item.unitPrice }))));

const totals = computed(() => {
  if (cartStore.promotion?.totals) {
    return normalizeTotals(cartStore.promotion.totals);
  }

  return buildBaseTotals(cartStore.subtotal, 0, vatRate.value);
});

watch(cartSignature, async () => {
  if (cartStore.promotion?.promotion?.code) {
    promoCode.value = cartStore.promotion.promotion.code;
    await applyDiscountCode(true);
  }
});

onMounted(async () => {
  if (cartStore.promotion?.promotion?.code) {
    promoCode.value = cartStore.promotion.promotion.code;
    await applyDiscountCode(true);
  }
});

function buildBaseTotals(subtotal, shippingCost, rate) {
  const totalAmount = Number(subtotal) + Number(shippingCost);
  return {
    subtotal: Number(subtotal),
    discount_amount: 0,
    shipping_discount: 0,
    shipping_cost: Number(shippingCost),
    total_discount: 0,
    vat_amount: roundCurrency(totalAmount * (rate / (100 + rate))),
    total_amount: roundCurrency(totalAmount),
  };
}

function normalizeTotals(raw = {}) {
  return {
    subtotal: Number(raw.subtotal ?? 0),
    discount_amount: Number(raw.discount_amount ?? 0),
    shipping_discount: Number(raw.shipping_discount ?? 0),
    shipping_cost: Number(raw.shipping_cost ?? 0),
    total_discount: Number(raw.total_discount ?? 0),
    vat_amount: Number(raw.vat_amount ?? 0),
    total_amount: Number(raw.total_amount ?? 0),
  };
}

function buildPromotionPayload() {
  return {
    code: promoCode.value,
    delivery_method: 'store_pickup',
    items: cartStore.items.map(item => ({
      item_id: item.inventoryId,
      collection: item.collection || 'inventory',
      quantity: item.quantity,
    })),
  };
}

async function applyDiscountCode(silent = false) {
  if (!appStore.storeId || !promoCode.value) return;

  promoLoading.value = true;
  if (!silent) {
    promoMessage.value = '';
  }

  try {
    const preview = await promotionsAPI.validateDiscountCode(appStore.storeId, buildPromotionPayload());

    if (!preview.valid) {
      cartStore.clearPromotion();
      promoSuccess.value = false;
      promoMessage.value = preview.message || 'Promo code could not be applied.';
      return;
    }

    cartStore.setPromotion(preview);
    promoCode.value = preview.promotion?.code || promoCode.value.toUpperCase();
    promoSuccess.value = true;
    promoMessage.value = silent ? '' : (preview.message || 'Promo code applied.');
  } catch (error) {
    cartStore.clearPromotion();
    promoSuccess.value = false;
    promoMessage.value = error.response?.data?.message || 'Failed to validate promo code.';
  } finally {
    promoLoading.value = false;
  }
}

function removeDiscountCode() {
  promoCode.value = '';
  promoMessage.value = '';
  cartStore.clearPromotion();
}

function roundCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
</script>
