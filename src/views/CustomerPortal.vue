<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">

      <!-- Profile header -->
      <div class="card mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
              <User class="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <div class="font-bold text-xl">{{ appStore.userName || 'Πελάτης' }}</div>
              <div class="text-gray-500 text-sm">{{ appStore.userEmail }}</div>
            </div>
          </div>
          <button @click="handleSignOut" class="btn btn-secondary flex items-center gap-2">
            <LogOut class="w-4 h-4" /> Αποσύνδεση
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === tab.key
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span
            v-if="tab.count !== undefined"
            class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5"
          >{{ tab.count }}</span>
        </button>
      </div>

      <!-- ORDERS TAB -->
      <div v-if="activeTab === 'orders'">
        <div v-if="loadingOrders" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
        <div v-else-if="orders.length === 0" class="card text-center py-12">
          <ShoppingBag class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 class="text-lg font-bold text-gray-600 mb-1">Δεν έχετε παραγγελίες</h3>
          <RouterLink to="/products" class="btn btn-primary mt-3">Αγοράστε τώρα</RouterLink>
        </div>
        <div v-else class="space-y-3">
          <RouterLink
            v-for="order in orders"
            :key="order.id"
            :to="`/order/${order.id}`"
            class="card flex items-center justify-between gap-4 hover:shadow-lg transition-shadow"
          >
            <div>
              <div class="font-mono font-bold text-primary-600">{{ order.orderNumber }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</div>
              <div class="text-sm text-gray-700 mt-1">{{ order.items?.length }} προϊόν(τα)</div>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="block px-3 py-1 rounded-full text-xs font-bold mb-1" :class="orderStatusClass(order.status)">
                {{ orderStatusLabel(order.status) }}
              </span>
              <div class="font-bold">{{ order.totalAmount?.toFixed(2) }}€</div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- REPAIRS TAB -->
      <div v-if="activeTab === 'repairs'">
        <div v-if="loadingRepairs" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
        <div v-else-if="repairs.length === 0" class="card text-center py-12">
          <Wrench class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 class="text-lg font-bold text-gray-600 mb-1">Δεν έχετε αιτήσεις επισκευής</h3>
          <RouterLink to="/repair-booking" class="btn btn-primary mt-3">Κλείστε Επισκευή</RouterLink>
        </div>
        <div v-else class="space-y-3">
          <RouterLink
            v-for="repair in repairs"
            :key="repair.id"
            :to="`/track-repair/${repair.id}`"
            class="card flex items-center justify-between gap-4 hover:shadow-lg transition-shadow"
          >
            <div>
              <div class="font-mono font-bold text-primary-600">{{ repair.deviceCode }}</div>
              <div class="font-medium">{{ repair.brand }} {{ repair.model }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(repair.createdAt) }}</div>
            </div>
            <div class="flex-shrink-0">
              <span class="px-3 py-1 rounded-full text-xs font-bold" :class="repairStatusClass(repair.status)">
                {{ repairStatusLabel(repair.status) }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- APPOINTMENTS TAB -->
      <div v-if="activeTab === 'appointments'">
        <div v-if="loadingAppointments" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
        <div v-else-if="appointments.length === 0" class="card text-center py-12">
          <Calendar class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 class="text-lg font-bold text-gray-600 mb-1">Δεν έχετε ραντεβού</h3>
          <RouterLink to="/repair-booking" class="btn btn-primary mt-3">Κλείστε Ραντεβού</RouterLink>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="appt in appointments"
            :key="appt.id"
            class="card flex items-center justify-between gap-4"
          >
            <div>
              <div class="font-bold">{{ formatDateTime(appt.date, appt.time) }}</div>
              <div class="text-sm text-gray-600">{{ appt.reason || 'Επισκευή' }}</div>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold"
              :class="appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            >
              {{ appt.status === 'confirmed' ? 'Επιβεβαιωμένο' : 'Σε Αναμονή' }}
            </span>
          </div>
        </div>
      </div>

      <!-- PROFILE TAB -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <!-- Edit Profile -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Στοιχεία Προφίλ</h3>
          <div v-if="profileMsg" class="rounded-lg px-4 py-3 mb-4 text-sm" :class="profileMsgSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'">
            {{ profileMsg }}
          </div>
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Όνομα</label>
                <input v-model="profileForm.first_name" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Επώνυμο</label>
                <input v-model="profileForm.last_name" type="text" class="input" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο</label>
              <input v-model="profileForm.phone" type="tel" class="input" placeholder="+30 6912345678" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση</label>
              <input v-model="profileForm.address" type="text" class="input" placeholder="Οδός 1" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Πόλη</label>
                <input v-model="profileForm.city" type="text" class="input" placeholder="Αθήνα" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Τ.Κ.</label>
                <input v-model="profileForm.postal_code" type="text" class="input" placeholder="11111" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Χώρα</label>
                <input v-model="profileForm.country" type="text" class="input" placeholder="Ελλάδα" />
              </div>
            </div>
            <div class="flex justify-end">
              <button type="submit" :disabled="savingProfile" class="btn btn-primary">
                <span v-if="savingProfile" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Αποθήκευση
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Αλλαγή Κωδικού</h3>
          <div v-if="passwordMsg" class="rounded-lg px-4 py-3 mb-4 text-sm" :class="passwordMsgSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'">
            {{ passwordMsg }}
          </div>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Τρέχων Κωδικός</label>
              <input v-model="passwordForm.current_password" type="password" class="input" placeholder="••••••••" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Νέος Κωδικός</label>
              <input v-model="passwordForm.password" type="password" class="input" placeholder="••••••••" required minlength="8" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Επιβεβαίωση Νέου Κωδικού</label>
              <input v-model="passwordForm.password_confirmation" type="password" class="input" placeholder="••••••••" required minlength="8" />
            </div>
            <div class="flex justify-end">
              <button type="submit" :disabled="savingPassword" class="btn btn-primary">
                <span v-if="savingPassword" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Ενημέρωση Κωδικού
              </button>
            </div>
          </form>
        </div>

        <!-- Saved Addresses -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg">Αποθηκευμένες Διευθύνσεις</h3>
            <button @click="addAddress" class="btn btn-secondary text-sm flex items-center gap-2">
              <MapPin class="w-4 h-4" /> Προσθήκη
            </button>
          </div>
          <div v-if="savedAddresses.length === 0" class="text-gray-500 text-sm py-4 text-center">
            Δεν έχετε αποθηκευμένες διευθύνσεις.
          </div>
          <div v-else class="space-y-3">
            <div v-for="(addr, index) in savedAddresses" :key="index" class="rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-3">
              <div class="text-sm">
                <div class="font-medium">{{ addr.label || 'Διεύθυνση ' + (index + 1) }}</div>
                <div class="text-gray-600 mt-1">{{ addr.street }}, {{ addr.city }} {{ addr.postal_code }}</div>
                <div v-if="addr.country" class="text-gray-500">{{ addr.country }}</div>
              </div>
              <button @click="removeAddress(index)" class="text-red-500 hover:text-red-700 text-xs flex-shrink-0">
                Αφαίρεση
              </button>
            </div>
          </div>
          <!-- Add address form -->
          <div v-if="showAddAddressForm" class="mt-4 border-t pt-4 space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ετικέτα (π.χ. Σπίτι, Δουλειά)</label>
              <input v-model="newAddress.label" type="text" class="input" placeholder="Σπίτι" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση</label>
              <input v-model="newAddress.street" type="text" class="input" placeholder="Οδός 1" required />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Πόλη</label>
                <input v-model="newAddress.city" type="text" class="input" placeholder="Αθήνα" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Τ.Κ.</label>
                <input v-model="newAddress.postal_code" type="text" class="input" placeholder="11111" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Χώρα</label>
                <input v-model="newAddress.country" type="text" class="input" placeholder="Ελλάδα" />
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="showAddAddressForm = false" class="btn btn-secondary text-sm">Ακύρωση</button>
              <button @click="confirmAddAddress" class="btn btn-primary text-sm">Αποθήκευση Διεύθυνσης</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { ordersAPI } from '@/services/api/orders';
import { appointmentsAPI } from '@/services/api/appointments';
import {
  User, LogOut, ShoppingBag, Wrench, Calendar, Settings, MapPin
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const activeTab = ref(route.query.tab || 'orders');

const orders = ref([]);
const repairs = ref([]);
const appointments = ref([]);

const loadingOrders = ref(false);
const loadingRepairs = ref(false);
const loadingAppointments = ref(false);

// Profile form
const profileForm = ref({
  first_name: appStore.currentUser?.first_name || '',
  last_name: appStore.currentUser?.last_name || '',
  phone: appStore.currentUser?.phone || '',
  address: appStore.currentUser?.address || '',
  city: appStore.currentUser?.city || '',
  postal_code: appStore.currentUser?.postal_code || '',
  country: appStore.currentUser?.country || '',
});
const savingProfile = ref(false);
const profileMsg = ref('');
const profileMsgSuccess = ref(false);

// Password form
const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' });
const savingPassword = ref(false);
const passwordMsg = ref('');
const passwordMsgSuccess = ref(false);

// Saved addresses
const savedAddresses = ref(appStore.currentUser?.saved_addresses || []);
const showAddAddressForm = ref(false);
const newAddress = ref({ label: '', street: '', city: '', postal_code: '', country: 'Ελλάδα' });

const tabs = computed(() => [
  { key: 'orders', label: 'Παραγγελίες', icon: ShoppingBag, count: orders.value.length || undefined },
  { key: 'repairs', label: 'Επισκευές', icon: Wrench, count: repairs.value.length || undefined },
  { key: 'appointments', label: 'Ραντεβού', icon: Calendar, count: appointments.value.length || undefined },
  { key: 'profile', label: 'Προφίλ & Ρυθμίσεις', icon: Settings },
]);

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(date, time) {
  if (!date) return '';
  return `${date} ${time || ''}`.trim();
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

function repairStatusLabel(status) {
  const labels = {
    'Pending': 'Σε Αναμονή',
    'Diagnosing': 'Διάγνωση',
    'Waiting Parts': 'Αναμονή Ανταλλακτικών',
    'In Repair': 'Σε Επισκευή',
    'Quality Check': 'Έλεγχος',
    'Completed': 'Ολοκληρώθηκε',
    'Cancelled': 'Ακυρώθηκε'
  };
  return labels[status] || status;
}

function repairStatusClass(status) {
  const classes = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Repair': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

async function loadOrders() {
  loadingOrders.value = true;
  try {
    orders.value = await ordersAPI.getCustomerOrders(appStore.storeId);
  } catch (err) {
    console.error('Error loading orders:', err);
    orders.value = [];
  } finally {
    loadingOrders.value = false;
  }
}

async function loadRepairs() {
  repairs.value = [];
}

async function loadAppointments() {
  loadingAppointments.value = true;
  try {
    appointments.value = await appointmentsAPI.getCustomerAppointments(
      appStore.userEmail,
      appStore.storeId,
    );
  } catch (err) {
    console.error('Error loading appointments:', err);
    appointments.value = [];
  } finally {
    loadingAppointments.value = false;
  }
}

async function saveProfile() {
  savingProfile.value = true;
  profileMsg.value = '';
  try {
    await appStore.updateProfile({
      first_name: profileForm.value.first_name,
      last_name: profileForm.value.last_name,
      phone: profileForm.value.phone,
      address: profileForm.value.address,
      city: profileForm.value.city,
      postal_code: profileForm.value.postal_code,
      country: profileForm.value.country,
    });
    profileMsgSuccess.value = true;
    profileMsg.value = 'Τα στοιχεία σας αποθηκεύτηκαν.';
  } catch (err) {
    profileMsgSuccess.value = false;
    const errors = err.response?.data?.errors;
    profileMsg.value = errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Σφάλμα αποθήκευσης.');
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  passwordMsg.value = '';
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    passwordMsgSuccess.value = false;
    passwordMsg.value = 'Οι κωδικοί δεν ταιριάζουν.';
    return;
  }
  savingPassword.value = true;
  try {
    await appStore.updateProfile({
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation,
    });
    passwordMsgSuccess.value = true;
    passwordMsg.value = 'Ο κωδικός άλλαξε επιτυχώς.';
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
  } catch (err) {
    passwordMsgSuccess.value = false;
    const errors = err.response?.data?.errors;
    passwordMsg.value = errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Σφάλμα αλλαγής κωδικού.');
  } finally {
    savingPassword.value = false;
  }
}

function addAddress() {
  newAddress.value = { label: '', street: '', city: '', postal_code: '', country: 'Ελλάδα' };
  showAddAddressForm.value = true;
}

async function confirmAddAddress() {
  if (!newAddress.value.street) return;
  savedAddresses.value = [...savedAddresses.value, { ...newAddress.value }];
  showAddAddressForm.value = false;
  await appStore.updateProfile({ saved_addresses: savedAddresses.value });
}

async function removeAddress(index) {
  savedAddresses.value = savedAddresses.value.filter((_, i) => i !== index);
  await appStore.updateProfile({ saved_addresses: savedAddresses.value });
}

async function handleSignOut() {
  await appStore.signOut();
  router.push('/');
}

onMounted(() => {
  loadOrders();
  loadRepairs();
  loadAppointments();

  // Sync profile form from store
  const u = appStore.currentUser;
  if (u) {
    profileForm.value = {
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      phone: u.phone || '',
      address: u.address || '',
      city: u.city || '',
      postal_code: u.postal_code || '',
      country: u.country || '',
    };
    savedAddresses.value = u.saved_addresses || [];
  }
});

watch(() => route.query.tab, value => {
  if (value) {
    activeTab.value = value;
  }
});
</script>
