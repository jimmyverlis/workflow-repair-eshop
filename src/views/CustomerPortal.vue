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
  User, LogOut, ShoppingBag, Wrench, Calendar
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

const tabs = computed(() => [
  { key: 'orders', label: 'Παραγγελίες', icon: ShoppingBag, count: orders.value.length || undefined },
  { key: 'repairs', label: 'Επισκευές', icon: Wrench, count: repairs.value.length || undefined },
  { key: 'appointments', label: 'Ραντεβού', icon: Calendar, count: appointments.value.length || undefined }
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
  // Repair history via the eshop repairs status endpoint is tracked by device code —
  // a full list endpoint can be added later; show empty for now.
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

async function handleSignOut() {
  await appStore.signOut();
  router.push('/');
}

onMounted(() => {
  loadOrders();
  loadRepairs();
  loadAppointments();
});

watch(() => route.query.tab, value => {
  if (value) {
    activeTab.value = value;
  }
});
</script>
