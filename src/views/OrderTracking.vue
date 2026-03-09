<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Παρακολούθηση Παραγγελίας</h1>
    <p class="text-gray-500 mb-8">Δείτε την κατάσταση της παραγγελίας σας.</p>

    <div class="max-w-2xl mx-auto">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Φόρτωση παραγγελίας...</p>
      </div>

      <!-- Payment result banners -->
      <template v-if="!loading && order">
        <!-- Success + confirmed -->
        <div v-if="paymentStatus === 'success' && order.paymentStatus === 'paid'" class="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-4 flex items-start gap-3">
          <CheckCircle class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <div class="font-semibold text-green-800">Η πληρωμή ολοκληρώθηκε επιτυχώς!</div>
            <div class="text-sm text-green-700 mt-1">Η παραγγελία σας καταχωρήθηκε και θα επεξεργαστεί σύντομα.</div>
          </div>
        </div>

        <!-- Success returned from Viva but payment webhook not yet processed -->
        <div v-else-if="paymentStatus === 'success' && order.paymentStatus !== 'paid'" class="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-4 flex items-start gap-3">
          <Clock class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <div class="font-semibold text-yellow-800">Επεξεργασία πληρωμής...</div>
            <div class="text-sm text-yellow-700 mt-1">Η πληρωμή σας επεξεργάζεται. Ανανεώστε τη σελίδα σε λίγα δευτερόλεπτα.</div>
          </div>
        </div>

        <!-- Payment failed -->
        <div v-else-if="paymentStatus === 'fail'" class="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4 flex items-start gap-3">
          <XCircle class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div class="font-semibold text-red-800">Η πληρωμή δεν ολοκληρώθηκε</div>
            <div class="text-sm text-red-700 mt-1">Δεν χρεωθήκατε. Η παραγγελία σας έχει αποθηκευτεί. Επικοινωνήστε μαζί μας αν χρειάζεστε βοήθεια.</div>
            <RouterLink to="/cart" class="inline-block mt-3 text-sm font-medium text-red-700 underline hover:text-red-900">Επιστροφή στο καλάθι</RouterLink>
          </div>
        </div>

        <!-- Cancelled -->
        <div v-else-if="paymentStatus === 'cancel'" class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-4 flex items-start gap-3">
          <XCircle class="w-6 h-6 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <div class="font-semibold text-gray-700">Η πληρωμή ακυρώθηκε</div>
            <div class="text-sm text-gray-600 mt-1">Δεν χρεωθήκατε. Η παραγγελία σας παραμένει αποθηκευμένη.</div>
            <RouterLink to="/cart" class="inline-block mt-3 text-sm font-medium text-gray-700 underline hover:text-gray-900">Επιστροφή στο καλάθι</RouterLink>
          </div>
        </div>
      </template>

      <!-- Error -->
      <div v-if="errorMsg && !loading" class="card text-center py-12">
        <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-700 mb-2">{{ errorMsg }}</h3>
        <RouterLink to="/" class="btn btn-primary mt-4">Αρχική Σελίδα</RouterLink>
      </div>

      <!-- Order details -->
      <div v-if="order && !loading">

        <!-- Header -->
        <div class="card mb-4">
          <div class="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div class="text-sm text-gray-500 mb-1">Αριθμός Παραγγελίας</div>
              <div class="font-mono font-bold text-xl text-primary-600">{{ order.orderNumber }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ formatDate(order.createdAt) }}</div>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <span class="px-3 py-1 rounded-full text-sm font-bold" :class="orderStatusClass(order.status)">
                {{ orderStatusLabel(order.status) }}
              </span>
              <span class="px-3 py-1 rounded-full text-sm font-medium" :class="paymentStatusClass(order.paymentStatus)">
                {{ paymentStatusLabel(order.paymentStatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="card mb-4">
          <h3 class="font-bold mb-4">Προϊόντα</h3>
          <div class="space-y-3 divide-y">
            <div v-for="item in order.items" :key="item.itemId" class="flex gap-3 pt-3 first:pt-0">
              <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <Package class="w-5 h-5 text-gray-400" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-sm">{{ item.name }}</div>
                <div class="text-xs text-gray-500">x{{ item.quantity }} × {{ item.unitPrice?.toFixed(2) }}€</div>
              </div>
              <div class="font-bold text-sm">{{ item.subtotal?.toFixed(2) }}€</div>
            </div>
          </div>
        </div>

        <!-- Totals + Delivery -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="card">
            <h3 class="font-bold mb-3">Σύνολα</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Υποσύνολο</span><span>{{ order.subtotal?.toFixed(2) }}€</span>
              </div>
              <div v-if="order.discountAmount > 0" class="flex justify-between text-green-600">
                <span>Έκπτωση</span><span>-{{ order.discountAmount?.toFixed(2) }}€</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>ΦΠΑ</span><span>{{ order.vatAmount?.toFixed(2) }}€</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Αποστολή</span>
                <span>{{ order.shippingCost > 0 ? order.shippingCost.toFixed(2) + '€' : 'Δωρεάν' }}</span>
              </div>
              <div class="flex justify-between font-bold text-base border-t pt-2 mt-1">
                <span>Σύνολο</span><span>{{ order.totalAmount?.toFixed(2) }}€</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="font-bold mb-3">Παράδοση</h3>
            <div class="text-sm space-y-1">
              <div class="text-gray-600">
                {{ order.deliveryMethod === 'store_pickup' ? '🏪 Παραλαβή από κατάστημα' : '🚚 Courier' }}
              </div>
              <div v-if="order.shippingAddress" class="text-gray-700">
                {{ order.shippingAddress.street }}, {{ order.shippingAddress.city }} {{ order.shippingAddress.postalCode }}
              </div>
              <div v-if="order.shipping?.carrier" class="text-gray-600">
                <span class="font-medium">Courier:</span> {{ order.shipping.carrier }}
              </div>
              <div v-if="order.shipping?.trackingNumber" class="font-mono text-primary-600 font-medium">
                Tracking: {{ order.shipping.trackingNumber }}
              </div>
            </div>
          </div>
        </div>

        <!-- Customer info -->
        <div class="card mb-4">
          <h3 class="font-bold mb-3">Στοιχεία Παραγγελίας</h3>
          <div class="text-sm space-y-1 text-gray-700">
            <div>{{ order.customer?.name }}</div>
            <div>{{ order.customer?.email }}</div>
            <div v-if="order.customer?.phone">{{ order.customer.phone }}</div>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <RouterLink to="/products" class="btn btn-primary">Συνέχεια Αγορών</RouterLink>
          <RouterLink to="/" class="btn btn-secondary">Αρχική Σελίδα</RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { ordersAPI } from '@/services/api/orders';
import { Package, CheckCircle, XCircle, Clock } from 'lucide-vue-next';
import { useAnalytics } from '@/composables/useAnalytics';

const route = useRoute();
const analytics = useAnalytics();

const order = ref(null);
const loading = ref(true);
const errorMsg = ref('');
const paymentStatus = ref(route.query.status || '');

function formatDate(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts._seconds ? ts._seconds * 1000 : ts);
  return date.toLocaleDateString('el-GR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function orderStatusLabel(status) {
  const labels = {
    'pending_payment': 'Αναμονή Πληρωμής',
    'paid': 'Πληρώθηκε',
    'processing': 'Σε Επεξεργασία',
    'shipped': 'Απεστάλη',
    'delivered': 'Παραδόθηκε',
    'cancelled': 'Ακυρώθηκε'
  };
  return labels[status] || status;
}

function orderStatusClass(status) {
  const classes = {
    'pending_payment': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-blue-100 text-blue-800',
    'processing': 'bg-purple-100 text-purple-800',
    'shipped': 'bg-indigo-100 text-indigo-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function paymentStatusLabel(status) {
  const labels = { 'pending': 'Αναμονή Πληρωμής', 'paid': 'Πληρώθηκε', 'failed': 'Αποτυχία Πληρωμής' };
  return labels[status] || status;
}

function paymentStatusClass(status) {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

onMounted(async () => {
  const orderId = route.params.orderId;
  if (!orderId) {
    errorMsg.value = 'Δεν βρέθηκε παραγγελία.';
    loading.value = false;
    return;
  }
  try {
    const data = await ordersAPI.getOrder(orderId);
    if (!data) {
      errorMsg.value = 'Η παραγγελία δεν βρέθηκε.';
    } else {
      order.value = data;
      // Fire purchase event once on success redirect (guard with sessionStorage to avoid re-fires on refresh)
      const trackKey = `tracked_order_${data.orderId || orderId}`
      if (paymentStatus.value === 'success' && data.paymentStatus === 'paid' && !sessionStorage.getItem(trackKey)) {
        sessionStorage.setItem(trackKey, '1')
        analytics.trackPurchase({
          orderId: data.orderId || orderId,
          total: data.totalAmount || 0,
          items: (data.items || []).map(item => ({
            item_id: item.itemId,
            item_name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      }
    }
  } catch (err) {
    errorMsg.value = 'Δεν ήταν δυνατή η φόρτωση της παραγγελίας.';
  } finally {
    loading.value = false;
  }
});
</script>
