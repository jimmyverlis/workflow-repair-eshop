<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Κλείστε Επισκευή</h1>
    <p class="text-gray-500 mb-8">Συμπληρώστε τα στοιχεία της συσκευής σας και θα σας επικοινωνήσουμε άμεσα.</p>

    <!-- Success state -->
    <div v-if="submitted" class="max-w-lg mx-auto">
      <div class="card text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check class="w-8 h-8 text-green-600" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Η αίτηση καταχωρήθηκε!</h2>
        <p class="text-gray-600 mb-4">Θα επικοινωνήσουμε σύντομα για επιβεβαίωση.</p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div class="text-sm text-gray-500 mb-1">Κωδικός Επισκευής</div>
          <div class="font-mono font-bold text-xl text-primary-600">{{ result.deviceCode }}</div>
          <div class="text-xs text-gray-400 mt-1">Αποθηκεύστε αυτόν τον κωδικό για παρακολούθηση</div>
        </div>

        <div class="flex gap-3 justify-center flex-wrap">
          <RouterLink
            :to="`/track-repair/${result.deviceId}`"
            class="btn btn-primary"
          >
            Παρακολούθηση Επισκευής
          </RouterLink>
          <RouterLink to="/" class="btn btn-secondary">
            Αρχική Σελίδα
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="max-w-2xl mx-auto">

      <!-- Step indicators -->
      <div class="flex items-center mb-8 overflow-x-auto pb-2">
        <div
          v-for="(label, i) in ['Συσκευή', 'Πρόβλημα', 'Παράδοση', 'Στοιχεία']"
          :key="i"
          class="flex items-center flex-shrink-0"
        >
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
            :class="step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'"
          >
            <Check v-if="step > i + 1" class="w-4 h-4" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="ml-2 text-sm font-medium whitespace-nowrap" :class="step === i + 1 ? 'text-primary-600' : 'text-gray-500'">{{ label }}</span>
          <div v-if="i < 3" class="w-6 md:w-12 h-0.5 mx-2 flex-shrink-0" :class="step > i + 1 ? 'bg-green-500' : 'bg-gray-200'"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
        {{ errorMsg }}
      </div>

      <!-- STEP 1: Device Info -->
      <div v-if="step === 1" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <Smartphone class="w-5 h-5 text-primary-600" /> Στοιχεία Συσκευής
        </h2>
        <form @submit.prevent="step = 2" class="space-y-4">
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

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Μάρκα *</label>
              <input v-model="device.brand" type="text" class="input" required placeholder="π.χ. Apple, Samsung" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Μοντέλο *</label>
              <input v-model="device.model" type="text" class="input" required placeholder="π.χ. iPhone 15, Galaxy S24" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">IMEI / Serial (προαιρετικό)</label>
              <input v-model="device.imei" type="text" class="input" placeholder="15 ψηφία IMEI" maxlength="20" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Κατάσταση</label>
              <select v-model="device.condition" class="input">
                <option value="good">Καλή — Μόνο το πρόβλημα</option>
                <option value="fair">Μέτρια — Ορατές φθορές</option>
                <option value="poor">Κακή — Σημαντικές φθορές</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 2: Issue -->
      <div v-if="step === 2" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <Wrench class="w-5 h-5 text-primary-600" /> Περιγραφή Προβλήματος
        </h2>
        <form @submit.prevent="step = 3" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Περιγράψτε το πρόβλημα *</label>
            <textarea
              v-model="issue.description"
              class="input min-h-[120px] resize-y"
              required
              placeholder="π.χ. Η οθόνη δεν ανάβει μετά από πτώση. Χθες έπεσε από ύψος 1μ. στο πάτωμα..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Προτεραιότητα</label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer"
                :class="issue.priority === 'normal' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <input type="radio" v-model="issue.priority" value="normal" />
                <div>
                  <div class="font-medium">Κανονική</div>
                  <div class="text-xs text-gray-500">2-5 εργάσιμες ημέρες</div>
                </div>
              </label>
              <label
                class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer"
                :class="issue.priority === 'urgent' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'"
              >
                <input type="radio" v-model="issue.priority" value="urgent" />
                <div>
                  <div class="font-medium">Επείγον</div>
                  <div class="text-xs text-gray-500">Same-day / 24h (επιπλέον χρέωση)</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Κωδικός Ασφαλείας (προαιρετικό)</label>
            <input
              v-model="issue.securityCode"
              type="text"
              class="input"
              placeholder="PIN, pattern ή κωδικός"
            />
            <p class="text-xs text-gray-400 mt-1">Απαιτείται για τον έλεγχο μετά την επισκευή. Μπορείτε να τον δώσετε αργότερα.</p>
          </div>

          <div class="flex justify-between pt-2">
            <button type="button" @click="step = 1" class="btn btn-secondary">
              <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
            </button>
            <button type="submit" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 3: Delivery -->
      <div v-if="step === 3" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <Truck class="w-5 h-5 text-primary-600" /> Τρόπος Παράδοσης
        </h2>

        <div class="grid grid-cols-1 gap-4 mb-6">
          <label
            class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
            :class="delivery.method === 'bring_to_store' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input type="radio" v-model="delivery.method" value="bring_to_store" class="mt-1" />
            <div>
              <div class="font-bold flex items-center gap-2"><Store class="w-4 h-4" /> Άμεση Προσέλευση</div>
              <div class="text-sm text-gray-500 mt-1">Φέρτε τη συσκευή στο κατάστημα. Δωρεάν.</div>
            </div>
          </label>
          <label
            class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
            :class="delivery.method === 'send_via_courier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input type="radio" v-model="delivery.method" value="send_via_courier" class="mt-1" />
            <div>
              <div class="font-bold flex items-center gap-2"><Package class="w-4 h-4" /> Αποστολή με Courier</div>
              <div class="text-sm text-gray-500 mt-1">Στείλτε μας τη συσκευή. Θα σας στείλουμε οδηγίες αποστολής.</div>
            </div>
          </label>
        </div>

        <!-- Courier address -->
        <div v-if="delivery.method === 'send_via_courier'" class="space-y-4 border-t pt-4">
          <h3 class="font-medium text-gray-700">Διεύθυνση Επιστροφής Συσκευής</h3>
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
        </div>

        <!-- Bring to store info -->
        <div v-else class="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
          <div class="font-medium text-blue-800 mb-1">📍 {{ appStore.storeName }}</div>
          <div class="text-blue-700">{{ appStore.storeDetails?.address || 'Επικοινωνήστε μαζί μας για τη διεύθυνση' }}</div>
          <div class="text-blue-600 mt-2">📞 {{ appStore.storeDetails?.phone || '' }}</div>
        </div>

        <div class="flex justify-between pt-6">
          <button @click="step = 2" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <button @click="goToStep4" class="btn btn-primary">
            Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
          </button>
        </div>
      </div>

      <!-- STEP 4: Customer Info + Submit -->
      <div v-if="step === 4" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <User class="w-5 h-5 text-primary-600" /> Στοιχεία Επικοινωνίας
        </h2>
        <form @submit.prevent="submitRepair" class="space-y-4">
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

          <!-- Summary -->
          <div class="bg-gray-50 rounded-lg p-4 text-sm space-y-1 border">
            <div class="font-medium text-gray-700 mb-2">Περίληψη Αίτησης</div>
            <div class="flex justify-between"><span class="text-gray-500">Συσκευή:</span><span class="font-medium">{{ device.brand }} {{ device.model }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Κατηγορία:</span><span>{{ deviceCategoryLabel }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Παράδοση:</span><span>{{ delivery.method === 'bring_to_store' ? 'Άμεση προσέλευση' : 'Αποστολή courier' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Προτεραιότητα:</span><span>{{ issue.priority === 'urgent' ? 'Επείγον' : 'Κανονική' }}</span></div>
          </div>

          <div class="flex justify-between pt-2">
            <button type="button" @click="step = 3" class="btn btn-secondary">
              <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
            </button>
            <button type="submit" :disabled="submitting" class="btn btn-primary px-8">
              <span v-if="submitting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Υποβολή Αίτησης
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { repairsAPI } from '@/services/api/repairs';
import { storeConfig } from '@/config/store';
import {
  Check, ArrowRight, ArrowLeft, Smartphone, Wrench,
  Truck, Store, Package, User
} from 'lucide-vue-next';

const router = useRouter();
const appStore = useAppStore();

const step = ref(1);
const submitting = ref(false);
const errorMsg = ref('');
const submitted = ref(false);
const result = ref({ deviceId: '', deviceCode: '' });

const device = ref({
  category: '',
  brand: '',
  model: '',
  imei: '',
  condition: 'good'
});

const issue = ref({
  description: '',
  priority: 'normal',
  securityCode: ''
});

const delivery = ref({
  method: 'bring_to_store',
  address: { street: '', city: '', postalCode: '' }
});

const customer = ref({
  name: appStore.userName || '',
  email: appStore.userEmail || '',
  phone: ''
});

const categoryLabels = {
  smartphone: 'Κινητό',
  tablet: 'Tablet',
  laptop: 'Laptop',
  desktop: 'Desktop PC',
  smartwatch: 'Smartwatch',
  other: 'Άλλο'
};

const deviceCategoryLabel = computed(() => categoryLabels[device.value.category] || device.value.category);

function goToStep4() {
  errorMsg.value = '';
  if (delivery.value.method === 'send_via_courier') {
    const a = delivery.value.address;
    if (!a.street || !a.city || !a.postalCode) {
      errorMsg.value = 'Παρακαλώ συμπληρώστε όλα τα πεδία διεύθυνσης.';
      return;
    }
  }
  step.value = 4;
}

async function submitRepair() {
  submitting.value = true;
  errorMsg.value = '';
  try {
    const repairData = {
      storeId: storeConfig.storeId,
      customerInfo: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone
      },
      device: {
        category: device.value.category,
        brand: device.value.brand,
        model: device.value.model,
        imei: device.value.imei || null,
        condition: device.value.condition
      },
      issue: {
        description: issue.value.description,
        priority: issue.value.priority,
        securityCode: issue.value.securityCode || null
      },
      deliveryMethod: delivery.value.method,
      shippingAddress: delivery.value.method === 'send_via_courier' ? delivery.value.address : null
    };

    const res = await repairsAPI.createRepair(repairData);
    result.value = { deviceId: res.deviceId, deviceCode: res.deviceCode };
    submitted.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Repair error:', err);
    errorMsg.value = err.message || 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.';
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (appStore.requireAuthForRepairBooking && !appStore.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/repair-booking' } });
  }

  if (appStore.currentUser?.phone && !customer.value.phone) {
    customer.value.phone = appStore.currentUser.phone;
  }
})
</script>
