<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Κλείστε Επισκευή</h1>
    <p class="text-gray-500 mb-8">Επιλέξτε υπηρεσίες, διαλέξτε ραντεβού και ολοκληρώστε την κράτηση με πληρωμή.</p>

    <!-- Success state -->
    <div v-if="submitted" class="max-w-lg mx-auto">
      <div class="card text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check class="w-8 h-8 text-green-600" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Η κράτηση καταχωρήθηκε!</h2>
        <p v-if="result.paymentPending" class="text-gray-600 mb-2">Η πληρωμή σας εκκρεμεί. Αν ανακατευθυνθήκατε πίσω εδώ, ελέγξτε την κατάσταση παραγγελίας.</p>
        <p v-else class="text-gray-600 mb-4">Η κράτησή σας ολοκληρώθηκε επιτυχώς.</p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
          <div>
            <div class="text-sm text-gray-500 mb-1">Αριθμός Παραγγελίας</div>
            <div class="font-mono font-bold text-lg text-primary-600">{{ result.orderNumber }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Κωδικός Επισκευής</div>
            <div class="font-mono font-bold text-xl text-primary-600">{{ result.deviceCode }}</div>
            <div class="text-xs text-gray-400 mt-1">Αποθηκεύστε αυτόν τον κωδικό για παρακολούθηση</div>
          </div>
        </div>

        <div class="flex gap-3 justify-center flex-wrap">
          <RouterLink :to="`/track-repair/${result.deviceId}`" class="btn btn-primary">
            Παρακολούθηση Επισκευής
          </RouterLink>
          <RouterLink to="/" class="btn btn-secondary">Αρχική Σελίδα</RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <!-- Step indicators -->
      <div class="flex items-center mb-8 overflow-x-auto pb-2">
        <div v-for="(label, i) in stepLabels" :key="i" class="flex items-center flex-shrink-0">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
            :class="step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'"
          >
            <Check v-if="step > i + 1" class="w-4 h-4" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="ml-2 text-sm font-medium whitespace-nowrap" :class="step === i + 1 ? 'text-primary-600' : 'text-gray-500'">{{ label }}</span>
          <div v-if="i < stepLabels.length - 1" class="w-6 md:w-12 h-0.5 mx-2 flex-shrink-0" :class="step > i + 1 ? 'bg-green-500' : 'bg-gray-200'"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
        {{ errorMsg }}
      </div>

      <!-- STEP 1: Device -->
      <div v-if="step === 1" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <Smartphone class="w-5 h-5 text-primary-600" /> Στοιχεία Συσκευής
        </h2>
        <form @submit.prevent="goToStep2" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Κατηγορία Συσκευής *</label>
            <select v-model="device.category" class="input" required>
              <option value="">Επιλέξτε κατηγορία</option>
              <option value="smartphone">Κινητό Τηλέφωνο</option>
              <option value="tablet">Tablet</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop PC</option>
              <option value="smartwatch">Smartwatch</option>
              <option value="other">Άλλο</option>
            </select>
          </div>

          <!-- Device model autocomplete -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Μοντέλο Συσκευής</label>
            <input
              v-model="deviceModelSearch"
              type="text"
              class="input"
              placeholder="Αναζήτηση μοντέλου (π.χ. iPhone 15, Galaxy S24)..."
              @input="onModelSearchInput"
              @blur="onModelSearchBlur"
              autocomplete="off"
            />
            <ul
              v-if="modelSuggestions.length && showModelDropdown"
              class="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-auto"
            >
              <li
                v-for="m in modelSuggestions"
                :key="m.id"
                class="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                @mousedown.prevent="selectDeviceModel(m)"
              >
                <span class="font-medium">{{ m.brand }}</span> {{ m.name }}
                <span v-if="m.category" class="text-gray-400 text-xs ml-1">({{ m.category }})</span>
              </li>
              <li
                class="px-4 py-2 text-xs text-gray-400 border-t cursor-pointer hover:bg-gray-50"
                @mousedown.prevent="clearDeviceModel"
              >
                Δεν βρίσκεται — εισάγω χειροκίνητα
              </li>
            </ul>
          </div>

          <!-- Manual brand/model if no model selected -->
          <div v-if="!device.deviceModelId" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Μάρκα</label>
              <input v-model="device.brand" type="text" class="input" placeholder="π.χ. Apple, Samsung" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Μοντέλο</label>
              <input v-model="device.modelCode" type="text" class="input" placeholder="π.χ. iPhone 15, S24" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">IMEI / Serial (προαιρετικό)</label>
              <input v-model="device.imei" type="text" class="input" placeholder="15 ψηφία IMEI" maxlength="20" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Αποθηκευτικός χώρος</label>
              <input v-model="device.storage" type="text" class="input" placeholder="π.χ. 128GB" />
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 2: Services -->
      <div v-if="step === 2" class="card">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
          <Wrench class="w-5 h-5 text-primary-600" /> Επιλογή Υπηρεσιών
        </h2>
        <p class="text-sm text-gray-500 mb-6">Επιλέξτε τις υπηρεσίες που χρειάζεστε. Αν δεν είστε σίγουροι, επιλέξτε "Διάγνωση".</p>

        <div v-if="loadingServices" class="text-center py-8 text-gray-400">
          <span class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></span>
          Φόρτωση υπηρεσιών...
        </div>

        <div v-else-if="!services.length" class="text-center py-8 text-gray-400">
          Δεν βρέθηκαν διαθέσιμες υπηρεσίες.
        </div>

        <div v-else class="space-y-3 mb-6">
          <label
            v-for="svc in services"
            :key="svc.id"
            class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors"
            :class="selectedServiceIds.includes(svc.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              type="checkbox"
              :value="svc.id"
              v-model="selectedServiceIds"
              class="w-4 h-4 accent-primary-600"
            />
            <div class="flex-1">
              <div class="font-medium">{{ svc.name }}</div>
              <div v-if="svc.description" class="text-xs text-gray-500 mt-0.5">{{ svc.description }}</div>
            </div>
            <div class="font-bold text-primary-600">€{{ svc.price.toFixed(2) }}</div>
          </label>
        </div>

        <div v-if="selectedServiceIds.length" class="bg-gray-50 rounded-lg p-4 mb-4 flex justify-between items-center">
          <span class="text-sm text-gray-600">Σύνολο επιλεγμένων υπηρεσιών</span>
          <span class="font-bold text-lg text-primary-600">€{{ selectedServicesTotal.toFixed(2) }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Περιγραφή προβλήματος (προαιρετικό)</label>
          <textarea
            v-model="issue"
            class="input min-h-[80px] resize-y"
            placeholder="π.χ. Η οθόνη δεν ανάβει μετά από πτώση..."
          ></textarea>
        </div>

        <div class="flex justify-between pt-4">
          <button type="button" @click="step = 1" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <button type="button" @click="goToStep3" class="btn btn-primary" :disabled="!selectedServiceIds.length">
            Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
          </button>
        </div>
      </div>

      <!-- STEP 3: Appointment -->
      <div v-if="step === 3" class="card">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
          <CalendarDays class="w-5 h-5 text-primary-600" /> Ραντεβού (προαιρετικό)
        </h2>
        <p class="text-sm text-gray-500 mb-6">Επιλέξτε ημερομηνία και ώρα ή παραλείψτε για να επικοινωνήσουμε μαζί σας.</p>

        <!-- Date picker -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ημερομηνία</label>
          <input
            v-model="appointmentDate"
            type="date"
            class="input"
            :min="minDate"
            :max="maxDate"
            @change="loadSlots"
          />
        </div>

        <!-- Slots -->
        <div v-if="appointmentDate">
          <div v-if="loadingSlots" class="text-center py-4 text-gray-400 text-sm">Φόρτωση διαθέσιμων ωρών...</div>
          <div v-else-if="!slots.length" class="text-sm text-gray-400 py-2">Δεν υπάρχουν διαθέσιμες ώρες για αυτή την ημέρα.</div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ώρα Ραντεβού</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="slot in slots"
                :key="slot.start"
                type="button"
                class="py-2 text-sm rounded-lg border-2 transition-colors"
                :class="appointmentTime === slot.start ? 'border-primary-500 bg-primary-50 font-medium text-primary-700' : 'border-gray-200 hover:border-gray-300'"
                @click="appointmentTime = slot.start"
              >
                {{ slot.start }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between pt-6">
          <button type="button" @click="step = 2" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <div class="flex gap-3">
            <button type="button" @click="clearAppointment(); step = 4" class="btn btn-secondary">
              Παράλειψη
            </button>
            <button type="button" @click="goToStep4FromAppointment" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 4: Delivery & Contact -->
      <div v-if="step === 4" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <User class="w-5 h-5 text-primary-600" /> Στοιχεία & Παράδοση
        </h2>
        <form @submit.prevent="goToStep5" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο *</label>
            <input v-model="customer.name" type="text" class="input" required placeholder="Γιώργης Παπαδόπουλος" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="customer.email" type="email" class="input" required placeholder="email@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο *</label>
            <input v-model="customer.phone" type="tel" class="input" required placeholder="6912345678" />
          </div>

          <div class="border-t pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">Τρόπος Παράδοσης</label>
            <div class="space-y-3">
              <label
                class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
                :class="deliveryMethod === 'store_pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" v-model="deliveryMethod" value="store_pickup" class="mt-1" />
                <div>
                  <div class="font-bold flex items-center gap-2"><Store class="w-4 h-4" /> Άμεση Προσέλευση</div>
                  <div class="text-sm text-gray-500 mt-1">Φέρτε τη συσκευή στο κατάστημα. Δωρεάν.</div>
                </div>
              </label>
              <label
                class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
                :class="deliveryMethod === 'courier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" v-model="deliveryMethod" value="courier" class="mt-1" />
                <div>
                  <div class="font-bold flex items-center gap-2"><Package class="w-4 h-4" /> Αποστολή με Courier</div>
                  <div class="text-sm text-gray-500 mt-1">Στείλτε μας τη συσκευή. Θα σας στείλουμε οδηγίες.</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Courier address -->
          <div v-if="deliveryMethod === 'courier'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Οδός & Αριθμός *</label>
              <input v-model="shippingAddress.street" type="text" class="input" required placeholder="Λεωφόρος Αθηνών 100" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Πόλη *</label>
                <input v-model="shippingAddress.city" type="text" class="input" required placeholder="Αθήνα" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ΤΚ *</label>
                <input v-model="shippingAddress.postalCode" type="text" class="input" required placeholder="10431" maxlength="5" />
              </div>
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <button type="button" @click="step = 3" class="btn btn-secondary">
              <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
            </button>
            <button type="submit" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 5: Review & Payment -->
      <div v-if="step === 5" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <CreditCard class="w-5 h-5 text-primary-600" /> Επισκόπηση & Πληρωμή
        </h2>

        <!-- Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-sm space-y-2 border">
          <div class="font-semibold text-gray-700 mb-3">Σύνοψη Κράτησης</div>
          <div class="flex justify-between">
            <span class="text-gray-500">Συσκευή:</span>
            <span class="font-medium">{{ deviceLabel }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Παράδοση:</span>
            <span>{{ deliveryMethod === 'store_pickup' ? 'Άμεση προσέλευση' : 'Courier' }}</span>
          </div>
          <div v-if="appointmentDate && appointmentTime" class="flex justify-between">
            <span class="text-gray-500">Ραντεβού:</span>
            <span>{{ appointmentDate }} {{ appointmentTime }}</span>
          </div>
          <div class="border-t pt-2 mt-2 space-y-1">
            <div v-for="svc in selectedServices" :key="svc.id" class="flex justify-between">
              <span class="text-gray-600">{{ svc.name }}</span>
              <span>€{{ svc.price.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-primary-600 pt-1 border-t">
              <span>Σύνολο</span>
              <span>€{{ selectedServicesTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment method -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Τρόπος Πληρωμής</label>
          <div class="space-y-3">
            <label
              v-for="pm in availablePaymentMethods"
              :key="pm.value"
              class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
              :class="paymentMethod === pm.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input type="radio" v-model="paymentMethod" :value="pm.value" class="mt-1" />
              <div>
                <div class="font-medium">{{ pm.label }}</div>
                <div class="text-sm text-gray-500">{{ pm.description }}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="flex justify-between">
          <button type="button" @click="step = 4" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <button type="button" @click="submitBooking" :disabled="submitting" class="btn btn-primary px-8">
            <span v-if="submitting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ paymentMethod === 'viva_wallet' ? 'Πληρωμή →' : 'Καταχώριση Κράτησης' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { repairsAPI } from '@/services/api/repairs'
import { paymentsAPI } from '@/services/api/payments'
import { appointmentsAPI } from '@/services/api/appointments'
import {
  Check, ArrowRight, ArrowLeft, Smartphone, Wrench,
  Store, Package, User, CreditCard, CalendarDays
} from 'lucide-vue-next'

const router = useRouter()
const appStore = useAppStore()

const step = ref(1)
const submitting = ref(false)
const errorMsg = ref('')
const submitted = ref(false)
const result = ref({ deviceId: '', deviceCode: '', orderNumber: '', paymentPending: false })

// Step 1 — Device
const device = ref({ category: '', brand: '', modelCode: '', deviceModelId: null, imei: '', storage: '' })
const deviceModelSearch = ref('')
const deviceModels = ref([])
const showModelDropdown = ref(false)
const modelSuggestions = computed(() => {
  if (!deviceModelSearch.value || deviceModelSearch.value.length < 2) return []
  const q = deviceModelSearch.value.toLowerCase()
  return deviceModels.value.filter(m =>
    m.name?.toLowerCase().includes(q) || m.brand?.toLowerCase().includes(q)
  ).slice(0, 8)
})

// Step 2 — Services
const services = ref([])
const loadingServices = ref(false)
const selectedServiceIds = ref([])
const issue = ref('')
const selectedServices = computed(() =>
  services.value.filter(s => selectedServiceIds.value.includes(s.id))
)
const selectedServicesTotal = computed(() =>
  selectedServices.value.reduce((sum, s) => sum + s.price, 0)
)

// Step 3 — Appointment
const appointmentDate = ref('')
const appointmentTime = ref('')
const slots = ref([])
const loadingSlots = ref(false)
const minDate = new Date().toISOString().split('T')[0]
const maxDate = (() => {
  const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]
})()

// Step 4 — Delivery & Contact
const deliveryMethod = ref('store_pickup')
const shippingAddress = ref({ street: '', city: '', postalCode: '' })
const customer = ref({ name: '', email: '', phone: '' })

// Step 5 — Payment
const paymentMethod = ref('viva_wallet')

const stepLabels = ['Συσκευή', 'Υπηρεσίες', 'Ραντεβού', 'Στοιχεία', 'Πληρωμή']

const deviceLabel = computed(() => {
  if (device.value.deviceModelId) return deviceModelSearch.value
  return [device.value.brand, device.value.modelCode].filter(Boolean).join(' ') || 'Συσκευή'
})

const availablePaymentMethods = computed(() => {
  const methods = appStore.repairPaymentMethods
  const all = [
    { value: 'viva_wallet', label: 'Κάρτα (Online)', description: 'Ασφαλής πληρωμή μέσω Viva Wallet' },
    { value: 'pay_at_store', label: 'Πληρωμή στο κατάστημα', description: 'Πληρώνετε όταν παραδώσετε τη συσκευή' },
    { value: 'pay_at_courier', label: 'Αντικαταβολή', description: 'Πληρωμή κατά την παράδοση' },
  ]
  return all.filter(m => methods.includes(m.value))
})

function onModelSearchInput() {
  device.value.deviceModelId = null
  showModelDropdown.value = true
}

function onModelSearchBlur() {
  setTimeout(() => { showModelDropdown.value = false }, 150)
}

function selectDeviceModel(m) {
  device.value.deviceModelId = m.id
  device.value.brand = m.brand
  device.value.modelCode = m.name
  deviceModelSearch.value = `${m.brand} ${m.name}`
  showModelDropdown.value = false
}

function clearDeviceModel() {
  device.value.deviceModelId = null
  showModelDropdown.value = false
}

async function goToStep2() {
  errorMsg.value = ''
  if (!loadingServices.value && !services.value.length) {
    loadingServices.value = true
    try {
      services.value = await repairsAPI.getRepairServices(appStore.storeId)
    } finally {
      loadingServices.value = false
    }
  }
  step.value = 2
}

function goToStep3() {
  errorMsg.value = ''
  if (!selectedServiceIds.value.length) {
    errorMsg.value = 'Παρακαλώ επιλέξτε τουλάχιστον μία υπηρεσία.'
    return
  }
  step.value = 3
}

async function loadSlots() {
  if (!appointmentDate.value) return
  loadingSlots.value = true
  slots.value = []
  appointmentTime.value = ''
  try {
    const res = await appointmentsAPI.getAvailableSlots(appStore.storeId, appointmentDate.value, 30)
    slots.value = res?.data?.available_slots || []
  } catch {
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

function clearAppointment() {
  appointmentDate.value = ''
  appointmentTime.value = ''
  slots.value = []
}

function goToStep4FromAppointment() {
  if (appointmentDate.value && !appointmentTime.value) {
    errorMsg.value = 'Παρακαλώ επιλέξτε ώρα ραντεβού ή πατήστε "Παράλειψη".'
    return
  }
  errorMsg.value = ''
  step.value = 4
}

function goToStep5() {
  errorMsg.value = ''
  if (deliveryMethod.value === 'courier') {
    const a = shippingAddress.value
    if (!a.street || !a.city || !a.postalCode) {
      errorMsg.value = 'Παρακαλώ συμπληρώστε όλα τα πεδία διεύθυνσης.'
      return
    }
  }
  // Set default payment method from allowed methods
  if (availablePaymentMethods.value.length && !availablePaymentMethods.value.find(m => m.value === paymentMethod.value)) {
    paymentMethod.value = availablePaymentMethods.value[0].value
  }
  step.value = 5
}

async function submitBooking() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const bookingData = {
      store_id: appStore.storeId,
      customer_id: appStore.currentUser?.id || null,
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
      },
      device: {
        category: device.value.category || null,
        brand: device.value.brand || null,
        model_code: device.value.modelCode || null,
        device_model_id: device.value.deviceModelId || null,
        imei: device.value.imei || null,
        storage: device.value.storage || null,
      },
      service_ids: selectedServiceIds.value,
      issue: issue.value || null,
      delivery_method: deliveryMethod.value,
      shipping_address: deliveryMethod.value === 'courier' ? shippingAddress.value : null,
      payment_method: paymentMethod.value,
      appointment: appointmentDate.value && appointmentTime.value
        ? { date: appointmentDate.value, start_time: appointmentTime.value }
        : null,
    }

    const res = await repairsAPI.createRepairBooking(bookingData)
    const { orderId, orderNumber, deviceId, deviceCode } = res

    if (!res.payment_required || paymentMethod.value !== 'viva_wallet') {
      result.value = { deviceId, deviceCode, orderNumber, paymentPending: false }
      submitted.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Redirect to Viva Wallet
    const paymentResult = await paymentsAPI.createVivaPayment({
      orderId,
      orderNumber,
      amount: Math.round(selectedServicesTotal.value * 100),
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
      },
      successUrl: `${window.location.origin}/order/${orderId}?status=success`,
      failUrl: `${window.location.origin}/order/${orderId}?status=fail`,
    })

    if (!paymentResult.paymentUrl) {
      throw new Error('Αποτυχία δημιουργίας συνεδρίας πληρωμής.')
    }

    window.location.href = paymentResult.paymentUrl
  } catch (err) {
    console.error('Repair booking error:', err)
    errorMsg.value = err.response?.data?.message || err.message || 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (appStore.requireAuthForRepairBooking && !appStore.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/repair-booking' } })
    return
  }

  const u = appStore.currentUser
  if (u) {
    customer.value.name = `${u.first_name || ''} ${u.last_name || ''}`.trim()
    customer.value.email = u.email || ''
    customer.value.phone = u.phone || ''
  }

  // Preload device models
  try {
    deviceModels.value = await repairsAPI.getDeviceModels(appStore.storeId)
  } catch { /* non-critical */ }
})
</script>
