<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ασφαλής αγορά</div>
          <h1 class="mt-2 text-4xl font-black text-slate-900">Ολοκλήρωση αγοράς</h1>
          <p class="mt-2 text-sm text-slate-500">Επιβεβαιώστε στοιχεία πελάτη, τρόπο παράδοσης και επιλέξτε τρόπο πληρωμής.</p>
        </div>
      </div>

      <div v-if="cartStore.isEmpty" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <ShoppingCart class="mx-auto h-16 w-16 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">Το καλάθι σας είναι κενό</h2>
        <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
          Περιήγηση προϊόντων
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
            <h2 class="text-2xl font-black text-slate-900">Στοιχεία πελάτη</h2>
            <p class="mt-2 text-sm text-slate-500">Χρησιμοποιήστε τα στοιχεία επικοινωνίας που θα επισυναφθούν στην παραγγελία.</p>

            <form class="mt-6 space-y-4" @submit.prevent="goToStep(2)">
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Πλήρες όνομα</label>
                  <input v-model.trim="customer.name" type="text" required class="input" placeholder="Όνομα πελάτη" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Τηλέφωνο</label>
                  <input v-model.trim="customer.phone" type="tel" required class="input" placeholder="6900000000" />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input v-model.trim="customer.email" type="email" required class="input" placeholder="πελάτης@example.com" />
              </div>

              <!-- Invoice / Company fields -->
              <div v-if="appStore.invoiceFieldsEnabled" class="pt-2 border-t border-slate-100">
                <label class="flex items-center gap-2 cursor-pointer mb-3">
                  <input v-model="invoice.wantsInvoice" type="checkbox" class="rounded border-gray-300 text-primary-600" />
                  <span class="text-sm font-medium text-slate-700">Θέλω τιμολόγιο (εταιρεία / ΑΦΜ)</span>
                </label>
                <div v-if="invoice.wantsInvoice" class="space-y-3">
                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">Επωνυμία Εταιρείας</label>
                    <input v-model.trim="invoice.company_name" type="text" class="input" placeholder="Η εταιρεία μου Α.Ε." />
                  </div>
                  <div class="grid gap-3 md:grid-cols-2">
                    <div>
                      <label class="mb-1 block text-sm font-medium text-slate-700">ΑΦΜ</label>
                      <input v-model.trim="invoice.vat_number" type="text" class="input" placeholder="123456789" />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-medium text-slate-700">ΔΟΥ</label>
                      <input v-model.trim="invoice.tax_office" type="text" class="input" placeholder="ΔΟΥ Αθηνών" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                  Συνέχεια
                </button>
              </div>
            </form>
          </section>

          <section v-if="step === 2" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-black text-slate-900">Τρόπος παράδοσης</h2>
            <p class="mt-2 text-sm text-slate-500">Επιλέξτε παραλαβή ή αποστολή courier πριν την τελική πληρωμή.</p>

            <div v-if="cartStore.isServiceOnly" class="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              Αυτό το καλάθι περιέχει μόνο υπηρεσίες, οπότε η παραγγελία θα διεκπεραιωθεί ως παραλαβή από το κατάστημα.
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <label class="cursor-pointer rounded-[1.5rem] border-2 p-4 transition"
                :class="delivery.method === 'store_pickup' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-200'">
                <input v-model="delivery.method" type="radio" value="store_pickup" class="sr-only" />
                <div class="font-bold text-slate-900">Παραλαβή από κατάστημα</div>
                <div class="mt-1 text-sm text-slate-500">Παραλαβή από {{ appStore.storeName }}. Χωρίς χρέωση αποστολής.</div>
              </label>
              <label v-if="!cartStore.isServiceOnly && canUseCourier" class="cursor-pointer rounded-[1.5rem] border-2 p-4 transition"
                :class="delivery.method === 'courier' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-200'">
                <input v-model="delivery.method" type="radio" value="courier" class="sr-only" />
                <div class="font-bold text-slate-900">Αποστολή με courier</div>
                <div class="mt-1 text-sm text-slate-500">Αποστολή σύμφωνα με τις ρυθμίσεις ERP με αυτόματη εφαρμογή ορίων δωρεάν αποστολής.</div>
              </label>
            </div>

            <div v-if="delivery.method === 'courier'" class="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-slate-700">Διεύθυνση</label>
                  <input v-model.trim="delivery.address.street" type="text" class="input" placeholder="Κύρια οδός 1" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Πόλη</label>
                  <input v-model.trim="delivery.address.city" type="text" class="input" placeholder="Αθήνα" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">Ταχυδρομικός κώδικας</label>
                  <input v-model.trim="delivery.address.postalCode" type="text" class="input" placeholder="11111" />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Σημειώσεις παράδοσης</label>
                <input v-model.trim="delivery.address.notes" type="text" class="input" placeholder="Διαμέρισμα, κουδούνι, ορόσημο" />
              </div>
            </div>

            <div v-else class="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <div class="font-semibold text-slate-900">{{ appStore.storeName }}</div>
              <div class="mt-1">{{ appStore.storeDetails?.address || 'Η διεύθυνση του καταστήματος είναι διαθέσιμη από τις ρυθμίσεις.' }}</div>
              <div v-if="appStore.pickupContent" class="mt-2 text-slate-500">{{ appStore.pickupContent }}</div>
            </div>

            <div v-if="delivery.method === 'courier' && appStore.courierContent" class="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {{ appStore.courierContent }}
            </div>

            <div class="mt-6 flex justify-between">
              <button type="button" class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700" @click="step = 1">
                Πίσω
              </button>
              <button type="button" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700" @click="goToStep(3)">
                Συνέχεια
              </button>
            </div>
          </section>

          <section v-if="step === 3" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-black text-slate-900">Επισκόπηση και πληρωμή</h2>
            <p class="mt-2 text-sm text-slate-500">Εφαρμόστε κωδικό προσφοράς εάν έχετε, στη συνέχεια επιβεβαιώστε τον τρόπο πληρωμής.</p>

            <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div class="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Πελάτης</div>
                  <div class="mt-2 font-semibold text-slate-900">{{ customer.name }}</div>
                  <div class="mt-1">{{ customer.email }}</div>
                  <div class="mt-1">{{ customer.phone }}</div>
                </div>
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Παράδοση</div>
                  <div class="mt-2 font-semibold text-slate-900">{{ delivery.method === 'courier' ? 'Αποστολή με courier' : 'Παραλαβή από κατάστημα' }}</div>
                  <div v-if="delivery.method === 'courier'" class="mt-1">
                    {{ [delivery.address.street, delivery.address.city, delivery.address.postalCode].filter(Boolean).join(', ') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Τρόπος πληρωμής</div>
              <h3 class="mt-2 text-lg font-bold text-slate-900">Επιλέξτε πώς θα πληρώσει ο πελάτης</h3>
              <div class="mt-4 grid gap-3">
                <label
                  v-for="option in availablePaymentMethods"
                  :key="option.value"
                  class="cursor-pointer rounded-[1.25rem] border-2 p-4 transition"
                  :class="selectedPaymentMethod === option.value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50 hover:border-primary-200'"
                >
                  <input v-model="selectedPaymentMethod" type="radio" :value="option.value" class="sr-only" />
                  <div class="font-semibold text-slate-900">{{ option.label }}</div>
                  <div class="mt-1 text-sm text-slate-500">{{ option.description }}</div>
                </label>
              </div>
            </div>

            <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Προσφορά</div>
                  <h3 class="mt-2 text-lg font-bold text-slate-900">Εφαρμογή κωδικού προσφοράς</h3>
                </div>
              </div>

              <div class="mt-4 flex gap-2">
                <input v-model.trim="promoCode" type="text" placeholder="Εισάγετε κωδικό" class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium uppercase text-slate-900 outline-none focus:border-primary-300" />
                <button type="button" class="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50" :disabled="promoLoading || !promoCode" @click="applyDiscountCode()">
                  {{ promoLoading ? 'Εφαρμογή...' : 'Εφαρμογή' }}
                </button>
              </div>

              <p v-if="promoMessage" class="mt-3 text-sm" :class="promoSuccess ? 'text-emerald-600' : 'text-rose-600'">
                {{ promoMessage }}
              </p>

              <div v-if="cartStore.promotion?.promotion" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div class="font-semibold">{{ cartStore.promotion.promotion.code }}</div>
                <div v-if="cartStore.promotion.promotion.description" class="mt-1">{{ cartStore.promotion.promotion.description }}</div>
                <button type="button" class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 hover:text-rose-700" @click="removeDiscountCode">
                  Αφαίρεση κωδικού
                </button>
              </div>
            </div>

            <div class="mt-6 flex justify-between">
              <button type="button" class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700" @click="step = 2">
                Πίσω
              </button>
              <button type="button" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50" :disabled="submitting || cartStore.hasStockIssues" @click="placeOrder">
                {{ submitButtonLabel }}
              </button>
            </div>
          </section>
        </div>

        <aside>
          <div class="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Σύνοψη</div>
            <h2 class="mt-2 text-xl font-black text-slate-900">Επισκόπηση παραγγελίας</h2>

            <div class="mt-5 space-y-3 divide-y divide-slate-100">
              <div v-for="item in cartStore.items" :key="item._key" class="flex items-start justify-between gap-3 pb-3">
                <div>
                  <div class="font-semibold text-slate-900">{{ item.name }}</div>
                  <div class="mt-1 text-sm text-slate-500">{{ item.quantity }} x EUR {{ item.unitPrice.toFixed(2) }}</div>
                  <div v-if="!item.isService && cartStore.getMaxQuantity(item) <= 0" class="mt-1 text-xs font-semibold text-rose-600">
                    Αυτήν τη στιγμή εξαντλημένο
                  </div>
                </div>
                <div class="text-sm font-semibold text-slate-900">EUR {{ (item.unitPrice * item.quantity).toFixed(2) }}</div>
              </div>
            </div>

            <div class="mt-5 space-y-3 text-sm text-slate-600">
              <div v-if="cartStore.hasStockIssues" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                Ελέγξτε το καλάθι πριν την ολοκλήρωση. Τουλάχιστον ένα προϊόν δεν είναι πλέον διαθέσιμο στην ζητούμενη ποσότητα.
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Υποσύνολο</span>
                <span class="font-semibold text-slate-900">EUR {{ orderTotals.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Αποστολή</span>
                <span class="font-semibold text-slate-900">EUR {{ orderTotals.shipping_cost.toFixed(2) }}</span>
              </div>
              <div v-if="delivery.method === 'courier' && cartStore.estimatedWeight > 0" class="flex items-center justify-between gap-3">
                <span>Εκτ. βάρος</span>
                <span class="font-semibold text-slate-900">{{ cartStore.estimatedWeight.toFixed(3) }} kg</span>
              </div>
              <div v-if="orderTotals.total_discount > 0" class="flex items-center justify-between gap-3 text-emerald-700">
                <span>Έκπτωση</span>
                <span class="font-semibold">-EUR {{ orderTotals.total_discount.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Συμπεριλαμβάνεται ΦΠΑ</span>
                <span class="font-semibold text-slate-900">EUR {{ orderTotals.vat_amount.toFixed(2) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3 flex items-center justify-between gap-3 text-lg font-black text-slate-900">
                <span>Σύνολο</span>
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
import { useAnalytics } from '@/composables/useAnalytics';

const router = useRouter();
const cartStore = useCartStore();
const appStore = useAppStore();
const analytics = useAnalytics();

const stepLabels = ['Πελάτης', 'Παράδοση', 'Πληρωμή'];
const step = ref(1);
const submitting = ref(false);
const errorMsg = ref('');
const promoLoading = ref(false);
const promoMessage = ref('');
const promoSuccess = ref(false);
const promoCode = ref('');
const selectedPaymentMethod = ref('viva_wallet');

const customer = ref({
  name: '',
  email: '',
  phone: '',
});

const invoice = ref({
  wantsInvoice: false,
  company_name: '',
  vat_number: '',
  tax_office: '',
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
const availablePaymentMethods = computed(() => {
  const methods = [
    {
      value: 'viva_wallet',
      label: 'Πληρωμή online',
      description: 'Ασφαλής ηλεκτρονική πληρωμή μέσω Viva Wallet πριν επιβεβαιωθεί η παραγγελία.',
    },
  ];

  if (delivery.value.method === 'store_pickup' && appStore.payAtStoreEnabled) {
    methods.push({
      value: 'pay_at_store',
      label: 'Πληρωμή στο κατάστημα',
      description: 'Ο πελάτης πληρώνει στο κατάστημα κατά την παραλαβή της παραγγελίας.',
    });
  }

  if (delivery.value.method === 'courier' && appStore.payAtCourierEnabled) {
    methods.push({
      value: 'pay_at_courier',
      label: 'Αντικαταβολή',
      description: 'Ο πελάτης πληρώνει κατά την παράδοση όταν φτάσει ο courier.',
    });
  }

  return methods;
});
const freeShippingThreshold = computed(() => {
  const threshold = appStore.storeConfig?.free_shipping_threshold;
  return threshold == null ? null : Number(threshold);
});
const shippingWeightRates = computed(() => {
  return Array.isArray(appStore.storeConfig?.shipping_weight_rates)
    ? appStore.storeConfig.shipping_weight_rates
    : [];
});
const baseShippingCost = computed(() => {
  if (delivery.value.method !== 'courier') return 0;
  if (freeShippingThreshold.value != null && cartStore.subtotal >= freeShippingThreshold.value) return 0;
  if (shippingWeightRates.value.length && cartStore.estimatedWeight > 0) {
    const sortedRates = [...shippingWeightRates.value]
      .filter(rate => rate && rate.max_weight != null && rate.cost != null)
      .sort((left, right) => Number(left.max_weight) - Number(right.max_weight));

    const match = sortedRates.find(rate => cartStore.estimatedWeight <= Number(rate.max_weight));
    if (match) {
      return Number(match.cost);
    }

    const lastRate = sortedRates[sortedRates.length - 1];
    if (lastRate) {
      return Number(lastRate.cost);
    }
  }
  return configuredShippingCost.value;
});
const cartSignature = computed(() => JSON.stringify(cartStore.items.map(item => ({ key: item._key, quantity: item.quantity, price: item.unitPrice }))));
const submitButtonLabel = computed(() => {
  if (submitting.value) {
    return selectedPaymentMethod.value === 'viva_wallet' ? 'Ανακατεύθυνση...' : 'Καταχώριση παραγγελίας...';
  }

  return selectedPaymentMethod.value === 'viva_wallet'
    ? `Πληρωμή EUR ${orderTotals.value.total_amount.toFixed(2)}`
    : 'Καταχώριση παραγγελίας';
});
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

watch(availablePaymentMethods, (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    selectedPaymentMethod.value = 'viva_wallet';
    return;
  }

  if (!options.some(option => option.value === selectedPaymentMethod.value)) {
    selectedPaymentMethod.value = options[0].value;
  }
}, { immediate: true });

onMounted(async () => {
  if (appStore.requireAuthForCheckout && !appStore.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }

  // Also block if guest checkout explicitly disabled and user is not authenticated
  if (!appStore.allowGuestCheckout && !appStore.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }

  customer.value.name = appStore.userName || '';
  customer.value.email = appStore.userEmail || '';
  customer.value.phone = appStore.currentUser?.phone || '';

  if (appStore.storeId) {
    await cartStore.refreshItems(appStore.storeId);
  }

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
      promoMessage.value = preview.message || 'Δεν ήταν δυνατή η εφαρμογή του κωδικού προσφοράς.';
      return;
    }

    cartStore.setPromotion(preview);
    promoCode.value = preview.promotion?.code || promoCode.value.toUpperCase();
    promoSuccess.value = true;
    promoMessage.value = silent ? '' : (preview.message || 'Ο κωδικός προσφοράς εφαρμόστηκε.');
  } catch (error) {
    cartStore.clearPromotion();
    promoSuccess.value = false;
    promoMessage.value = error.response?.data?.message || 'Αποτυχία επαλήθευσης του κωδικού προσφοράς.';
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
      errorMsg.value = 'Συμπληρώστε όλα τα στοιχεία πελάτη πριν συνεχίσετε.';
      return;
    }
  }

  if (target === 3 && delivery.value.method === 'courier') {
    const address = delivery.value.address;
    if (!address.street || !address.city || !address.postalCode) {
      errorMsg.value = 'Συμπληρώστε τη διεύθυνση courier πριν συνεχίσετε.';
      return;
    }
  }

  step.value = target;
  if (target === 3) {
    analytics.trackEvent('begin_checkout', { value: cartStore.totals?.total || 0 })
  }
}

async function placeOrder() {
  if (submitting.value) return;  // anti-double-submit
  submitting.value = true;
  errorMsg.value = '';

  try {
    if (appStore.storeId) {
      await cartStore.refreshItems(appStore.storeId);
    }

    if (cartStore.promotion?.promotion?.code) {
      promoCode.value = cartStore.promotion.promotion.code;
      await applyDiscountCode(true);
    }

    if (cartStore.hasStockIssues) {
      throw new Error('Ορισμένα προϊόντα του καλαθιού δεν είναι πλέον διαθέσιμα στη ζητούμενη ποσότητα.');
    }

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
      paymentMethod: selectedPaymentMethod.value,
      shippingCost: orderTotals.value.shipping_cost,
      discountCode: cartStore.promotion?.promotion?.code || null,
      invoiceData: appStore.invoiceFieldsEnabled && invoice.value.wantsInvoice ? {
        company_name: invoice.value.company_name,
        vat_number: invoice.value.vat_number,
        tax_office: invoice.value.tax_office,
      } : null,
    };

    const orderResult = await ordersAPI.createOrder(orderData);
    const { orderId, orderNumber } = orderResult;

    if (!orderResult.payment_required || selectedPaymentMethod.value !== 'viva_wallet') {
      cartStore.clearCart();
      await router.push(`/order/${orderId}`);
      return;
    }

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
      throw new Error('Αποτυχία δημιουργίας συνεδρίας πληρωμής.');
    }

    cartStore.clearCart();
    window.location.href = paymentResult.paymentUrl;
  } catch (error) {
    console.error('Order error:', error);
    errorMsg.value = error.response?.data?.message || error.message || 'Αποτυχία καταχώρισης παραγγελίας.';
  } finally {
    submitting.value = false;
  }
}

function roundCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
</script>
