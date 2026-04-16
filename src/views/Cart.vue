<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Προετοιμασία παραγγελίας</div>
          <h1 class="mt-2 text-4xl font-black text-slate-900">Καλάθι αγορών</h1>
          <p class="mt-2 text-sm text-slate-500">Ελέγξτε ποσότητες, εφαρμόστε κωδικό προσφοράς και συνεχίστε στην ολοκλήρωση αγοράς.</p>
        </div>
        <RouterLink to="/products" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-200 hover:text-primary-700">
          Συνέχεια αγορών
        </RouterLink>
      </div>

      <div v-if="cartStore.isEmpty" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <ShoppingCart class="mx-auto h-16 w-16 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">Το καλάθι σας είναι κενό</h2>
        <p class="mt-3 text-sm text-slate-500">Προσθέστε προϊόντα, αξεσουάρ ή υπηρεσίες από τον κατάλογο για να συνεχίσετε.</p>
        <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
          Περιήγηση προϊόντων
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
                    <p class="mt-1 text-sm text-slate-500">EUR {{ item.unitPrice.toFixed(2) }} το τεμάχιο</p>
                    <p v-if="item.sku" class="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{{ item.sku }}</p>
                  </div>
                  <button type="button" class="text-sm font-semibold text-rose-600 hover:text-rose-700" @click="cartStore.removeItem(item._key)">
                    Αφαίρεση
                  </button>
                </div>

                <div class="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <div class="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <button type="button" class="h-8 w-8 rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm" @click="cartStore.updateQuantity(item._key, item.quantity - 1)">-</button>
                    <span class="min-w-[24px] text-center text-sm font-semibold text-slate-900">{{ item.quantity }}</span>
                    <button
                      type="button"
                      class="h-8 w-8 rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                      :disabled="!item.isService && item.quantity >= cartStore.getMaxQuantity(item)"
                      @click="cartStore.updateQuantity(item._key, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Σύνολο γραμμής</div>
                    <div class="mt-1 text-xl font-black text-slate-900">EUR {{ (item.unitPrice * item.quantity).toFixed(2) }}</div>
                  </div>
                </div>

                <div
                  v-if="stockMessage(item)"
                  class="mt-3 rounded-2xl border px-4 py-3 text-sm font-medium"
                  :class="cartStore.getMaxQuantity(item) <= 0 ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800'"
                >
                  {{ stockMessage(item) }}
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside>
          <div class="sticky top-24 space-y-4">
            <section v-if="appStore.savedCartsEnabled" class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Αποθήκευση</div>
                  <h2 class="mt-2 text-xl font-black text-slate-900">Αποθηκευμένα καλάθια</h2>
                </div>
                <button
                  v-if="appStore.isAuthenticated"
                  type="button"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700"
                  @click="loadSavedCarts"
                >
                  Ανανέωση
                </button>
              </div>

              <template v-if="appStore.isAuthenticated">
                <div class="mt-4 flex gap-2">
                  <input
                    v-model.trim="savedCartName"
                    type="text"
                    placeholder="Ονομάστε αυτό το καλάθι"
                    class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-300"
                  />
                  <button
                    type="button"
                    class="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                    :disabled="savedCartLoading || !savedCartName"
                    @click="saveCurrentCart"
                  >
                    {{ savedCartLoading ? 'Αποθήκευση...' : 'Αποθήκευση' }}
                  </button>
                </div>

                <p v-if="savedCartMessage" class="mt-3 text-sm" :class="savedCartSuccess ? 'text-emerald-600' : 'text-rose-600'">
                  {{ savedCartMessage }}
                </p>

                <div v-if="savedCarts.length" class="mt-4 space-y-3">
                  <article
                    v-for="saved in savedCarts"
                    :key="saved.id"
                    class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="font-semibold text-slate-900">{{ saved.name }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ saved.item_count }} είδη · EUR {{ Number(saved.subtotal || 0).toFixed(2) }}</div>
                      </div>
                      <button
                        type="button"
                        class="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 hover:text-rose-700"
                        @click="deleteSavedCart(saved.id)"
                      >
                        Διαγραφή
                      </button>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                        @click="loadSavedCartIntoCart(saved)"
                      >
                        Φόρτωση καλαθιού
                      </button>
                      <RouterLink
                        :to="{ path: '/account', query: { tab: 'saved-carts' } }"
                        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700"
                      >
                        Διαχείριση στον λογαριασμό
                      </RouterLink>
                    </div>
                  </article>
                </div>
              </template>

              <template v-else>
                <p class="mt-4 text-sm text-slate-500">Συνδεθείτε για να αποθηκεύσετε αυτό το καλάθι και να το επαναφέρετε αργότερα από οποιαδήποτε συσκευή.</p>
                <RouterLink
                  :to="{ path: '/login', query: { redirect: '/cart' } }"
                  class="mt-4 inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700"
                >
                  Σύνδεση για αποθήκευση καλαθιών
                </RouterLink>
              </template>
            </section>

            <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Προσφορές</div>
                  <h2 class="mt-2 text-xl font-black text-slate-900">Εφαρμογή κωδικού προσφοράς</h2>
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

              <!-- Promo suggestions -->
              <div v-if="suggestions.length && !cartStore.promotion?.promotion" class="mt-4">
                <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 mb-2">
                  <Tag class="h-3 w-3" /> Διαθέσιμες προσφορές
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="suggestion in suggestions"
                    :key="suggestion.code"
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition"
                    @click="applySuggestion(suggestion.code)"
                  >
                    <span class="font-mono">{{ suggestion.code }}</span>
                    <span class="text-primary-500">·</span>
                    <span>{{ promotionSummary(suggestion) }}</span>
                  </button>
                </div>
              </div>

              <div v-if="cartStore.promotion?.promotion" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div class="font-semibold">{{ cartStore.promotion.promotion.code }}</div>
                <div v-if="cartStore.promotion.promotion.description" class="mt-1">{{ cartStore.promotion.promotion.description }}</div>
                <button type="button" class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 hover:text-rose-700" @click="removeDiscountCode">
                  Αφαίρεση κωδικού
                </button>
              </div>
            </section>

            <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Σύνοψη παραγγελίας</div>
              <h2 class="mt-2 text-xl font-black text-slate-900">Σύνολα καλαθιού</h2>

              <div class="mt-5 space-y-3 text-sm text-slate-600">
                <div class="flex items-center justify-between gap-3">
                  <span>Υποσύνολο</span>
                  <span class="font-semibold text-slate-900">EUR {{ totals.subtotal.toFixed(2) }}</span>
                </div>
                <div v-if="cartStore.estimatedWeight > 0" class="flex items-center justify-between gap-3">
                  <span>Εκτ. βάρος</span>
                  <span class="font-semibold text-slate-900">{{ cartStore.estimatedWeight.toFixed(3) }} kg</span>
                </div>
                <div v-if="totals.total_discount > 0" class="flex items-center justify-between gap-3 text-emerald-700">
                  <span>Έκπτωση</span>
                  <span class="font-semibold">-EUR {{ totals.total_discount.toFixed(2) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span>Συμπεριλαμβάνεται ΦΠΑ</span>
                  <span class="font-semibold text-slate-900">EUR {{ totals.vat_amount.toFixed(2) }}</span>
                </div>
                <div class="border-t border-slate-200 pt-3 flex items-center justify-between gap-3 text-lg font-black text-slate-900">
                  <span>Σύνολο</span>
                  <span>EUR {{ totals.total_amount.toFixed(2) }}</span>
                </div>
              </div>

              <div
                v-if="cartStore.hasStockIssues"
                class="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                Ένα ή περισσότερα αντικείμενα δεν είναι πλέον διαθέσιμα στην ζητούμενη ποσότητα. Ενημερώστε το καλάθι πριν την ολοκλήρωση.
              </div>

              <RouterLink
                to="/checkout"
                class="mt-5 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition"
                :class="cartStore.hasStockIssues
                  ? 'pointer-events-none bg-slate-200 text-slate-500'
                  : 'bg-primary-600 text-white hover:bg-primary-700'"
              >
                Συνέχεια στην ολοκλήρωση
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
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { Package, ShoppingCart, Tag } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { promotionsAPI } from '@/services/api/promotions';
import { retentionAPI } from '@/services/api/retention';

const router = useRouter();
const appStore = useAppStore();
const cartStore = useCartStore();

const promoCode = ref('');
const promoLoading = ref(false);
const promoMessage = ref('');
const promoSuccess = ref(false);
const suggestions = ref([]);
const savedCartName = ref('');
const savedCartLoading = ref(false);
const savedCartMessage = ref('');
const savedCartSuccess = ref(false);
const savedCarts = ref([]);

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
  if (appStore.storeId) {
    await cartStore.refreshItems(appStore.storeId);
  }

  if (cartStore.promotion?.promotion?.code) {
    promoCode.value = cartStore.promotion.promotion.code;
    await applyDiscountCode(true);
  }
  if (appStore.storeId) {
    try {
      suggestions.value = await promotionsAPI.getSuggestions(appStore.storeId);
    } catch {
      suggestions.value = [];
    }
  }
  if (appStore.isAuthenticated && appStore.savedCartsEnabled) {
    await loadSavedCarts();
  }
});

function stockMessage(item) {
  if (item.isService) {
    return '';
  }

  const maxQuantity = cartStore.getMaxQuantity(item);
  if (maxQuantity <= 0) {
    return 'Αυτό το προϊόν είναι αυτήν τη στιγμή εξαντλημένο. Αφαιρέστε το από το καλάθι ή περιμένετε να επαναφερθεί το απόθεμα.';
  }

  if (item.quantity >= maxQuantity) {
    return `Μέγιστη διαθέσιμη ποσότητα αυτή τη στιγμή: ${maxQuantity}.`;
  }

  if (maxQuantity <= Math.max(1, Number(appStore.lowStockThreshold ?? 5))) {
    return `Μόνο ${maxQuantity} διαθέσιμα αυτή τη στιγμή.`;
  }

  return '';
}

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

function roundCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function promotionSummary(promo) {
  if (promo.type === 'free_shipping') return 'Δωρεάν αποστολή';
  const val = Number(promo.value || 0);
  if (promo.type === 'fixed_amount') return `${val.toFixed(2)}€ έκπτωση`;
  return `${val}% έκπτωση`;
}

function applySuggestion(code) {
  promoCode.value = code;
  applyDiscountCode();
}

async function loadSavedCarts() {
  if (!appStore.isAuthenticated || !appStore.storeId || !appStore.savedCartsEnabled) {
    savedCarts.value = [];
    return;
  }

  try {
    savedCarts.value = await retentionAPI.getSavedCarts(appStore.storeId);
  } catch {
    savedCarts.value = [];
  }
}

async function saveCurrentCart() {
  if (!appStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: '/cart' } });
    return;
  }

  savedCartLoading.value = true;
  savedCartMessage.value = '';

  try {
    await retentionAPI.saveCart(appStore.storeId, {
      name: savedCartName.value,
      items: cartStore.items,
    });

    savedCartSuccess.value = true;
    savedCartMessage.value = 'Το καλάθι αποθηκεύτηκε στον λογαριασμό σας.';
    savedCartName.value = '';
    await loadSavedCarts();
  } catch (error) {
    savedCartSuccess.value = false;
    savedCartMessage.value = error.response?.data?.message || 'Δεν ήταν δυνατή η αποθήκευση του καλαθιού.';
  } finally {
    savedCartLoading.value = false;
  }
}

async function loadSavedCartIntoCart(savedCart) {
  try {
    const payload = await retentionAPI.loadSavedCart(appStore.storeId, savedCart.id);
    cartStore.replaceCart(payload.items || []);
    promoMessage.value = '';
    promoCode.value = '';
    savedCartSuccess.value = true;
    savedCartMessage.value = `Το "${payload.name}" φορτώθηκε στο καλάθι.`;
    router.push('/cart');
  } catch (error) {
    savedCartSuccess.value = false;
    savedCartMessage.value = error.response?.data?.message || 'Δεν ήταν δυνατή η φόρτωση του αποθηκευμένου καλαθιού.';
  }
}

async function deleteSavedCart(savedCartId) {
  try {
    await retentionAPI.deleteSavedCart(appStore.storeId, savedCartId);
    savedCartSuccess.value = true;
    savedCartMessage.value = 'Το αποθηκευμένο καλάθι διαγράφηκε.';
    await loadSavedCarts();
  } catch (error) {
    savedCartSuccess.value = false;
    savedCartMessage.value = error.response?.data?.message || 'Δεν ήταν δυνατή η διαγραφή του αποθηκευμένου καλαθιού.';
  }
}
</script>
