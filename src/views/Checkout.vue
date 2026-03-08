<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Ολοκλήρωση Παραγγελίας</h1>

    <!-- Empty cart guard -->
    <div v-if="cartStore.isEmpty" class="text-center py-12">
      <ShoppingCart class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-gray-700 mb-2">Το καλάθι σας είναι άδειο</h3>
      <RouterLink to="/products" class="btn btn-primary mt-4">Συνέχεια Αγορών</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Steps -->
      <div class="lg:col-span-2">

        <!-- Step indicators -->
        <div class="flex items-center mb-8">
          <div
            v-for="(label, i) in ['Στοιχεία', 'Παράδοση', 'Πληρωμή']"
            :key="i"
            class="flex items-center"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
              :class="step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'"
            >
              <Check v-if="step > i + 1" class="w-4 h-4" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="ml-2 text-sm font-medium" :class="step === i + 1 ? 'text-primary-600' : 'text-gray-500'">{{ label }}</span>
            <div v-if="i < 2" class="w-8 md:w-16 h-0.5 mx-2" :class="step > i + 1 ? 'bg-green-500' : 'bg-gray-200'"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {{ errorMsg }}
        </div>

        <!-- STEP 1: Customer Info -->
        <div v-if="step === 1" class="card">
          <h2 class="text-xl font-bold mb-6">Στοιχεία Παραγγελίας</h2>
          <form @submit.prevent="goToStep(2)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο *</label>
                <input v-model="customer.name" type="text" class="input" required placeholder="Γιώργης Παπαδόπουλος" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο *</label>
                <input v-model="customer.phone" type="tel" class="input" required placeholder="6912345678" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input v-model="customer.email" type="email" class="input" required placeholder="email@example.com" />
            </div>
            <div class="flex justify-end pt-2">
              <button type="submit" class="btn btn-primary">
                Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
              </button>
            </div>
          </form>
        </div>

        <!-- STEP 2: Delivery -->
        <div v-if="step === 2" class="card">
          <h2 class="text-xl font-bold mb-6">Τρόπος Παράδοσης</h2>

          <!-- Service-only notice -->
          <div v-if="cartStore.isServiceOnly" class="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800 mb-6">
            Η παραγγελία σας περιλαμβάνει μόνο υπηρεσίες. Η παράδοση γίνεται στο κατάστημα.
          </div>

          <!-- Delivery options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label
              class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors"
              :class="delivery.method === 'store_pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input type="radio" v-model="delivery.method" value="store_pickup" class="mt-1" />
              <div>
                <div class="font-bold flex items-center gap-2">
                  <Store class="w-4 h-4" /> Παραλαβή από Κατάστημα
                </div>
                <div class="text-sm text-gray-500 mt-1">Δωρεάν — Έτοιμο σε 1-2 ώρες</div>
              </div>
            </label>
            <label
              v-if="!cartStore.isServiceOnly"
              class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors"
              :class="delivery.method === 'courier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input type="radio" v-model="delivery.method" value="courier" class="mt-1" />
              <div>
                <div class="font-bold flex items-center gap-2">
                  <Truck class="w-4 h-4" /> Courier
                </div>
                <div class="text-sm text-gray-500 mt-1">€5.00 — 1-3 εργάσιμες ημέρες</div>
              </div>
            </label>
          </div>

          <!-- Courier address form -->
          <div v-if="delivery.method === 'courier'" class="space-y-4 border-t pt-4">
            <h3 class="font-medium text-gray-700">Διεύθυνση Αποστολής</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Οδός & Αριθμός *</label>
              <input v-model="delivery.address.street" type="text" class="input" required placeholder="Λεωφόρος Αθηνών 100" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Πόλη *</label>
                <input v-model="delivery.address.city" type="text" class="input" required placeholder="Αθήνα" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ΤΚ *</label>
                <input v-model="delivery.address.postalCode" type="text" class="input" required placeholder="10431" maxlength="5" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Σχόλια (προαιρετικό)</label>
              <input v-model="delivery.address.notes" type="text" class="input" placeholder="π.χ. 2ος όροφος, κουδούνι Παπαδόπουλος" />
            </div>
          </div>

          <!-- Store pickup info -->
          <div v-else class="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
            <div class="font-medium text-blue-800 mb-1">📍 {{ appStore.storeName }}</div>
            <div class="text-blue-700">{{ appStore.storeDetails?.address || 'Επικοινωνήστε μαζί μας για τη διεύθυνση' }}</div>
          </div>

          <div class="flex justify-between pt-6">
            <button @click="step = 1" class="btn btn-secondary">
              <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
            </button>
            <button @click="goToStep(3)" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </div>

        <!-- STEP 3: Payment -->
        <div v-if="step === 3" class="card">
          <h2 class="text-xl font-bold mb-6">Επιβεβαίωση & Πληρωμή</h2>

          <!-- Order summary inline -->
          <div class="space-y-2 mb-4 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Αποστολή σε:</span>
              <span class="font-medium">{{ customer.name }} — {{ customer.email }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Τρόπος παράδοσης:</span>
              <span class="font-medium">{{ delivery.method === 'store_pickup' ? 'Παραλαβή από κατάστημα' : 'Courier' }}</span>
            </div>
          </div>

          <div class="border-t pt-4 mb-6">
            <div class="flex justify-between text-gray-600 mb-1">
              <span>Υποσύνολο</span><span>{{ cartStore.subtotal.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between text-gray-600 mb-1">
              <span>ΦΠΑ (24%)</span><span>{{ (cartStore.subtotal * 0.24).toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between text-gray-600 mb-1">
              <span>Αποστολή</span>
              <span>{{ delivery.method === 'courier' ? '5.00€' : 'Δωρεάν' }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Σύνολο</span>
              <span>{{ totalAmount.toFixed(2) }}€</span>
            </div>
          </div>

          <!-- Viva Wallet logo + button -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4 text-center text-sm text-gray-600">
            <CreditCard class="w-6 h-6 mx-auto mb-2 text-gray-400" />
            Η πληρωμή γίνεται μέσω <strong>Viva Wallet</strong>.<br>
            Αποδεχόμαστε κάρτες, IRIS, Google Pay, Apple Pay.
          </div>

          <div class="flex justify-between pt-2">
            <button @click="step = 2" class="btn btn-secondary">
              <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
            </button>
            <button
              @click="placeOrder"
              :disabled="submitting"
              class="btn btn-primary px-8"
            >
              <span v-if="submitting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Πληρωμή {{ totalAmount.toFixed(2) }}€
            </button>
          </div>
        </div>

      </div>

      <!-- Right: Cart summary -->
      <div>
        <div class="card sticky top-24">
          <h3 class="font-bold text-lg mb-4">Τα προϊόντα σας</h3>
          <div class="space-y-3 divide-y">
            <div
              v-for="item in cartStore.items"
              :key="item._key || item.inventoryId"
              class="flex gap-3 py-2"
            >
              <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover rounded" />
                <Package v-else class="w-6 h-6 text-gray-400" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ item.name }}</div>
                <div class="text-xs text-gray-500">x{{ item.quantity }}</div>
              </div>
              <div class="text-sm font-bold">{{ (item.unitPrice * item.quantity).toFixed(2) }}€</div>
            </div>
          </div>
          <div class="border-t pt-3 mt-3">
            <div class="flex justify-between font-bold">
              <span>Σύνολο</span>
              <span>{{ totalAmount.toFixed(2) }}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAppStore } from '@/stores/app';
import { ordersAPI } from '@/services/api/orders';
import { paymentsAPI } from '@/services/api/payments';
import { storeConfig } from '@/config/store';
import { ShoppingCart, Package, ArrowRight, ArrowLeft, Check, Store, Truck, CreditCard } from 'lucide-vue-next';

const router = useRouter();
const cartStore = useCartStore();
const appStore = useAppStore();

const step = ref(1);
const submitting = ref(false);
const errorMsg = ref('');

const customer = ref({
  name: appStore.userName || '',
  email: appStore.userEmail || '',
  phone: ''
});

const delivery = ref({
  method: 'store_pickup',
  address: {
    street: '',
    city: '',
    postalCode: '',
    notes: ''
  }
});

const shippingCost = computed(() => delivery.value.method === 'courier' ? 5 : 0);
const totalAmount = computed(() => cartStore.subtotal * 1.24 + shippingCost.value);

function goToStep(target) {
  errorMsg.value = '';
  if (target === 3 && delivery.value.method === 'courier') {
    const a = delivery.value.address;
    if (!a.street || !a.city || !a.postalCode) {
      errorMsg.value = 'Παρακαλώ συμπληρώστε όλα τα πεδία διεύθυνσης.';
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
      storeId: storeConfig.storeId,
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
        isGuest: !appStore.isAuthenticated
      },
      customerId: appStore.currentUser?.uid || null,
      items: cartStore.items.map(item => ({
        type: item.type,
        itemId: item.inventoryId,
        collection: item.collection || 'inventory',
        isService: item.isService || false,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity
      })),
      deliveryMethod: delivery.value.method,
      shipping: delivery.value.method === 'courier' ? {
        address: delivery.value.address
      } : null,
      paymentMethod: 'viva_wallet',
      shippingCost: shippingCost.value
    };

    // Create order
    const orderResult = await ordersAPI.createOrder(orderData);
    const { orderId, orderNumber } = orderResult;

    // Create Viva payment
    const baseUrl = window.location.origin;
    const paymentResult = await paymentsAPI.createVivaPayment({
      orderId,
      orderNumber,
      amount: Math.round(totalAmount.value * 100), // cents
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone
      },
      successUrl: `${baseUrl}/order/${orderId}?status=success`,
      failUrl: `${baseUrl}/order/${orderId}?status=fail`
    });

    // Redirect to Viva
    if (paymentResult.paymentUrl) {
      cartStore.clearCart();
      window.location.href = paymentResult.paymentUrl;
    } else {
      throw new Error('Δεν ήταν δυνατή η δημιουργία σύνδεσης πληρωμής.');
    }

  } catch (err) {
    console.error('Order error:', err);
    errorMsg.value = err.message || 'Παρουσιάστηκε σφάλμα κατά την παραγγελία. Δοκιμάστε ξανά.';
  } finally {
    submitting.value = false;
  }
}
</script>
