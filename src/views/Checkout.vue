<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Secure checkout</div>
          <h1 class="mt-2 text-4xl font-black text-slate-900">Checkout</h1>
          <p class="mt-2 text-sm text-slate-500">Confirm customer details, delivery method, and payment before redirecting to Viva Wallet.</p>
        </div>
      </div>

      <div v-if="cartStore.isEmpty" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <ShoppingCart class="mx-auto h-16 w-16 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">Your cart is empty</h2>
        <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
          Browse products
        </RouterLink>
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div class="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
            <div v-for="(label, index) in stepLabels" :key="label" class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                :class="step > index + 1 ? 'bg-emerald-500 text-white' : step === index + 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'">
                <Check v-if="step > index + 1" class="h-4 w-4" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="text-sm font-semibold" :class="step === index + 1 ? 'text-primary-700' : 'text-slate-500'">{{ label }}</span>
              <div v-if="index < stepLabels.length - 1" class="h-px w-10 bg-slate-200"></div>
            </div>
          </div>

          <div v-if="errorMsg" class="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMsg }}
          </div>

          <section v-if="step === 1" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-black text-slate-900">Customer information</h2>
            <p class="mt-2 text-sm text-slate-500">Use the contact details that will be attached to the order and payment session.</p>

            <form class="mt-6 space-y-4" @submit.prevent="goToStep(2)">
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                  <input v-model.trim="customer.name" type="text" required class="input" placeholder="Customer name" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <input v-model.trim="customer.phone" type="tel" required class="input" placeholder="6900000000" />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input v-model.trim="customer.email" type="email" required class="input" placeholder="customer@example.com" />
              </div>
              <div class="flex justify-end pt-2">
                <button type="submit" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                  Continue
                </button>
              </div>
            </form>
          </section>

          <section v-if="step === 2" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-black text-slate-900">Delivery method</h2>
            <p class="mt-2 text-sm text-slate-500">Choose collection or courier delivery before final payment.</p>

            <div v-if="cartStore.isServiceOnly" class="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              This cart contains services only, so the order will be handled as store pickup.
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <label class="cursor-pointer rounded-[1.5rem] border-2 p-4 transition"
                :class="delivery.method === 'store_pickup' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-200'">
                <input v-model="delivery.method" type="radio" value="store_pickup" class="sr-only" />
                <div class="font-bold text-slate-900">Store pickup</div>
                <div class="mt-1 text-sm text-slate-500">Collect from {{ appStore.storeName }}. No shipping fee.</div>
              </label>
              <label v-if="!cartStore.isServiceOnly && canUseCourier" class="cursor-pointer rounded-[1.5rem] border-2 p-4 transition"
                :class="delivery.method === 'courier' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-200'">
                <input v-model="delivery.method" type="radio" value="courier" class="sr-only" />
                <div class="font-bold text-slate-900">Courier delivery</div>
                <div class="mt-1 text-sm text-slate-500">Configured shipping from ERP settings with free-shipping thresholds applied automatically.</div>
              </label>
            </div>

            <div v-if="delivery.method === 'courier'" class="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-slate-700">Street address</label>
                  <input v-model.trim="delivery.address.street" type="text" class="input" placeholder="Main street 1" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">City</label>
                  <input v-model.trim="delivery.address.city" type="text" class="input" placeholder="Athens" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Postal code</label>
                  <input v-model.trim="delivery.address.postalCode" type="text" class="input" placeholder="11111" />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Delivery notes</label>
                <input v-model.trim="delivery.address.notes" type="text" class="input" placeholder="Apartment, buzzer, landmark" />
              </div>
            </div>

            <div v-else class="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <div class="font-semibold text-slate-900">{{ appStore.storeName }}</div>
              <div class="mt-1">{{ appStore.storeDetails?.address || 'Store address available from storefront settings.' }}</div>
            </div>

            <div class="mt-6 flex justify-between">
              <button type="button" class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700" @click="step = 1">
                Back
              </button>
              <button type="button" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700" @click="goToStep(3)">
                Continue
              </button>
            </div>
          </section>

          <section v-if="step === 3" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-black text-slate-900">Review and pay</h2>
            <p class="mt-2 text-sm text-slate-500">Apply a promo code if you have one, then proceed to Viva Wallet.</p>

            <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div class="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Customer</div>
                  <div class="mt-2 font-semibold text-slate-900">{{ customer.name }}</div>
                  <div class="mt-1">{{ customer.email }}</div>
                  <div class="mt-1">{{ customer.phone }}</div>
                </div>
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Delivery</div>
                  <div class="mt-2 font-semibold text-slate-900">{{ delivery.method === 'courier' ? 'Courier delivery' : 'Store pickup' }}</div>
                  <div v-if="delivery.method === 'courier'" class="mt-1">
                    {{ [delivery.address.street, delivery.address.city, delivery.address.postalCode].filter(Boolean).join(', ') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Promotion</div>
                  <h3 class="mt-2 text-lg font-bold text-slate-900">Apply promo code</h3>
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
            </div>

            <div class="mt-6 flex justify-between">
              <button type="button" class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700" @click="step = 2">
                Back
              </button>
              <button type="button" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50" :disabled="submitting" @click="placeOrder">
                {{ submitting ? 'Redirecting...' : `Pay EUR ${orderTotals.total_amount.toFixed(2)}` }}
              </button>
            </div>
          </section>
        </div>

        <aside>
          <div class="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Summary</div>
            <h2 class="mt-2 text-xl font-black text-slate-900">Order overview</h2>

            <div class="mt-5 space-y-3 divide-y divide-slate-100">
              <div v-for="item in cartStore.items" :key="item._key" class="flex items-start justify-between gap-3 pb-3">
                <div>
                  <div class="font-semibold text-slate-900">{{ item.name }}</div>
                  <div class="mt-1 text-sm text-slate-500">{{ item.quantity }} x EUR {{ item.unitPrice.toFixed(2) }}</div>
                </div>
                <div class="text-sm font-semibold text-slate-900">EUR {{ (item.unitPrice * item.quantity).toFixed(2) }}</div>
              </div>
            </div>

            <div class="mt-5 space-y-3 text-sm text-slate-600">
              <div class="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span class="font-semibold text-slate-900">EUR {{ orderTotals.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Shipping</span>
                <span class="font-semibold text-slate-900">EUR {{ orderTotals.shipping_cost.toFixed(2) }}</span>
              </div>
              <div v-if="orderTotals.total_discount > 0" class="flex items-center justify-between gap-3 text-emerald-700">
                <span>Discount</span>
                <span class="font-semibold">-EUR {{ orderTotals.total_discount.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>VAT included</span>
                <span class="font-semibold text-slate-900">EUR {{ orderTotals.vat_amount.toFixed(2) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3 flex items-center justify-between gap-3 text-lg font-black text-slate-900">
                <span>Total</span>
                <span>EUR {{ orderTotals.total_amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Check, ShoppingCart } from 'lucide-vue-next';
import { useCartStore } from '@/stores/cart';
import { useAppStore } from '@/stores/app';
import { ordersAPI } from '@/services/api/orders';
import { paymentsAPI } from '@/services/api/payments';
import { promotionsAPI } from '@/services/api/promotions';

const router = useRouter();
const cartStore = useCartStore();
const appStore = useAppStore();

const stepLabels = ['Customer', 'Delivery', 'Payment'];
const step = ref(1);
const submitting = ref(false);
const errorMsg = ref('');
const promoLoading = ref(false);
const promoMessage = ref('');
const promoSuccess = ref(false);
const promoCode = ref('');

const customer = ref({
  name: '',
  email: '',
  phone: '',
});

const delivery = ref({
  method: 'store_pickup',
  address: {
    street: '',
    city: '',
    postalCode: '',
    notes: '',
  },
});

const vatRate = computed(() => Number(appStore.storeConfig?.vat_rate ?? 24));
const canUseCourier = computed(() => appStore.storeConfig?.shipping_enabled !== false);
const configuredShippingCost = computed(() => Number(appStore.storeConfig?.shipping_cost ?? 5));
const freeShippingThreshold = computed(() => {
  const threshold = appStore.storeConfig?.free_shipping_threshold;
  return threshold == null ? null : Number(threshold);
});
const baseShippingCost = computed(() => {
  if (delivery.value.method !== 'courier') return 0;
  if (freeShippingThreshold.value != null && cartStore.subtotal >= freeShippingThreshold.value) return 0;
  return configuredShippingCost.value;
});
const cartSignature = computed(() => JSON.stringify(cartStore.items.map(item => ({ key: item._key, quantity: item.quantity, price: item.unitPrice }))));
const orderTotals = computed(() => {
  if (cartStore.promotion?.totals) {
    return normalizeTotals(cartStore.promotion.totals);
  }

  return buildBaseTotals(cartStore.subtotal, baseShippingCost.value, vatRate.value);
});

watch([() => delivery.value.method, cartSignature], async () => {
  if (cartStore.promotion?.promotion?.code) {
    promoCode.value = cartStore.promotion.promotion.code;
    await applyDiscountCode(true);
  }
});

onMounted(async () => {
  if (appStore.requireAuthForCheckout && !appStore.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }

  customer.value.name = appStore.userName || '';
  customer.value.email = appStore.userEmail || '';
  customer.value.phone = appStore.currentUser?.phone || '';

  if (cartStore.isServiceOnly) {
    delivery.value.method = 'store_pickup';
  }

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
    delivery_method: delivery.value.method,
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

function goToStep(target) {
  errorMsg.value = '';

  if (target === 2) {
    if (!customer.value.name || !customer.value.email || !customer.value.phone) {
      errorMsg.value = 'Complete all customer fields before continuing.';
      return;
    }
  }

  if (target === 3 && delivery.value.method === 'courier') {
    const address = delivery.value.address;
    if (!address.street || !address.city || !address.postalCode) {
      errorMsg.value = 'Complete the courier address before continuing.';
      return;
    }
  }

  step.value = target;
}

async function placeOrder() {
  submitting.value = true;
  errorMsg.value = '';

  try {
    const orderData = {
      storeId: appStore.storeId,
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
        isGuest: !appStore.isAuthenticated,
      },
      customerId: appStore.currentUser?.id || null,
      items: cartStore.items.map(item => ({
        type: item.type,
        itemId: item.inventoryId,
        collection: item.collection || 'inventory',
        isService: item.isService || false,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      })),
      deliveryMethod: delivery.value.method,
      shipping: delivery.value.method === 'courier' ? {
        address: {
          street: delivery.value.address.street,
          city: delivery.value.address.city,
          postalCode: delivery.value.address.postalCode,
          notes: delivery.value.address.notes,
        },
      } : null,
      paymentMethod: 'viva_wallet',
      shippingCost: orderTotals.value.shipping_cost,
      discountCode: cartStore.promotion?.promotion?.code || null,
    };

    const orderResult = await ordersAPI.createOrder(orderData);
    const { orderId, orderNumber } = orderResult;

    const paymentResult = await paymentsAPI.createVivaPayment({
      orderId,
      orderNumber,
      amount: Math.round(orderTotals.value.total_amount * 100),
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
      },
      successUrl: `${window.location.origin}/order/${orderId}?status=success`,
      failUrl: `${window.location.origin}/order/${orderId}?status=fail`,
    });

    if (!paymentResult.paymentUrl) {
      throw new Error('Failed to create payment session.');
    }

    cartStore.clearCart();
    window.location.href = paymentResult.paymentUrl;
  } catch (error) {
    console.error('Order error:', error);
    errorMsg.value = error.response?.data?.message || error.message || 'Failed to place order.';
  } finally {
    submitting.value = false;
  }
}

function roundCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
</script>
