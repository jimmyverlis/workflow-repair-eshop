<template>
  <div class="container mx-auto px-4 py-8 max-w-lg">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-gray-400">
      <span class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></span>
      <p>Φόρτωση προσφοράς...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="card text-center">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle class="w-8 h-8 text-red-500" />
      </div>
      <h2 class="text-xl font-bold mb-2">Η προσφορά δεν βρέθηκε</h2>
      <p class="text-gray-500 mb-4">Αυτός ο σύνδεσμος είναι άκυρος ή έχει λήξει.</p>
      <RouterLink to="/" class="btn btn-secondary">Αρχική Σελίδα</RouterLink>
    </div>

    <!-- Paid already -->
    <div v-else-if="offer && offer.status === 'paid'" class="card text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle class="w-8 h-8 text-green-600" />
      </div>
      <h2 class="text-xl font-bold mb-2">Η πληρωμή ολοκληρώθηκε</h2>
      <p class="text-gray-500">Η προσφορά έχει ήδη εξοφληθεί. Σας ευχαριστούμε!</p>
    </div>

    <!-- Declined -->
    <div v-else-if="offer && offer.status === 'declined'" class="card text-center">
      <p class="text-gray-500">Αυτή η προσφορά έχει ακυρωθεί.</p>
    </div>

    <!-- Offer details -->
    <div v-else-if="offer" class="space-y-4">
      <div class="card">
        <h1 class="text-2xl font-bold mb-1">Προσφορά Επισκευής</h1>
        <p class="text-sm text-gray-500 mb-4">από {{ offer.store_name }}</p>

        <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <span class="text-gray-500">Επισκευή:</span>
          <span class="font-medium ml-2">{{ offer.device?.code }}</span>
          <span v-if="offer.device?.brand" class="text-gray-400 ml-2">{{ offer.device.brand }} {{ offer.device.model }}</span>
        </div>

        <h2 class="font-semibold text-lg mb-2">{{ offer.title }}</h2>
        <p v-if="offer.description" class="text-gray-600 text-sm mb-4">{{ offer.description }}</p>

        <div class="space-y-2 mb-4">
          <div
            v-for="item in offer.items"
            :key="item.name"
            class="flex justify-between items-center py-2 border-b last:border-0"
          >
            <div>
              <span class="font-medium">{{ item.name }}</span>
              <span v-if="item.quantity > 1" class="text-gray-400 text-sm ml-1">× {{ item.quantity }}</span>
            </div>
            <span class="font-medium">€{{ item.subtotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center bg-primary-50 rounded-lg p-3">
          <span class="font-semibold text-primary-700">Σύνολο πληρωμής</span>
          <span class="text-2xl font-bold text-primary-600">€{{ offer.amount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
        {{ errorMsg }}
      </div>

      <!-- Pay button -->
      <div class="card">
        <p class="text-sm text-gray-500 mb-4">
          Κάνοντας κλικ στο παρακάτω κουμπί, θα ανακατευθυνθείτε στη σελίδα πληρωμής Viva Wallet.
        </p>
        <button
          @click="payOffer"
          :disabled="paying"
          class="btn btn-primary w-full py-3 text-base"
        >
          <span v-if="paying" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          {{ paying ? 'Μεταφορά στην πληρωμή...' : `Πληρωμή €${offer.amount.toFixed(2)}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { repairsAPI } from '@/services/api/repairs'
import { paymentsAPI } from '@/services/api/payments'
import { useAppStore } from '@/stores/app'
import { Check as CheckCircle, XCircle } from 'lucide-vue-next'

const route = useRoute()
const appStore = useAppStore()

const loading = ref(true)
const loadError = ref(false)
const paying = ref(false)
const errorMsg = ref('')
const offer = ref(null)

onMounted(async () => {
  try {
    offer.value = await repairsAPI.getRepairOffer(route.params.token)
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})

function loadVivaScript(baseUrl) {
  return new Promise((resolve, reject) => {
    if (window.VivaPayments?.checkout) { resolve(); return }
    const existing = document.querySelector(`script[src*="vivacheckout"]`)
    if (existing) { existing.addEventListener('load', resolve); existing.addEventListener('error', reject); return }
    const script = document.createElement('script')
    script.src = `${baseUrl}/web/checkout/v2/vivacheckout.js`
    script.onload = resolve
    script.onerror = () => reject(new Error('Αδυναμία φόρτωσης Viva Checkout SDK.'))
    document.head.appendChild(script)
  })
}

async function payOffer() {
  paying.value = true
  errorMsg.value = ''
  try {
    const res = await repairsAPI.payRepairOffer(route.params.token)

    // Create Viva payment for the sub-order
    const paymentResult = await paymentsAPI.createVivaPayment({
      orderId: res.orderId,
      orderNumber: res.orderNumber,
      amount: Math.round(res.amount * 100),
      customer: {
        name: offer.value?.device?.brand ?? '',
        email: offer.value?.customer_email ?? '',
        phone: '',
      },
      successUrl: `${window.location.origin}/order/${res.orderId}?status=success`,
      failUrl: `${window.location.href}?status=fail`,
    })

    const orderCode = paymentResult.order_code ?? paymentResult.orderCode
    if (!orderCode) {
      throw new Error('Αποτυχία δημιουργίας συνεδρίας πληρωμής.')
    }

    await loadVivaScript(appStore.vivaCheckoutBaseUrl)

    window.VivaPayments.checkout.setup({
      successCallback() {
        window.location.href = `${window.location.origin}/order/${res.orderId}?status=success`
      },
      failCallback() {
        errorMsg.value = 'Η πληρωμή δεν ολοκληρώθηκε. Παρακαλώ δοκιμάστε ξανά.'
        paying.value = false
      },
      cancelCallback() {
        errorMsg.value = 'Η πληρωμή ακυρώθηκε.'
        paying.value = false
      },
    })
    window.VivaPayments.checkout.redirectToCheckout({ orderCode })
  } catch (err) {
    console.error('Offer payment error:', err)
    errorMsg.value = err.response?.data?.message || err.message || 'Αποτυχία. Δοκιμάστε ξανά.'
    paying.value = false
  }
}
</script>
