<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Παρακολούθηση Επισκευής</h1>
    <p class="text-gray-500 mb-8">Εισάγετε τον κωδικό επισκευής για να δείτε την κατάσταση.</p>

    <div class="max-w-2xl mx-auto">
      <!-- Lookup form -->
      <div v-if="!repair" class="card">
        <form @submit.prevent="loadRepair" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID Επισκευής</label>
            <input
              v-model="deviceId"
              type="text"
              class="input font-mono"
              placeholder="π.χ. abc123xyz"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Κωδικός Επισκευής</label>
            <input
              v-model="deviceCode"
              type="text"
              class="input font-mono uppercase"
              placeholder="π.χ. REP-20260301-0001"
              required
              @input="deviceCode = deviceCode.toUpperCase()"
            />
            <p class="text-xs text-gray-400 mt-1">Βρείτε τον κωδικό στο email επιβεβαίωσης που λάβατε.</p>
          </div>

          <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {{ errorMsg }}
          </div>

          <button type="submit" :disabled="loading" class="btn btn-primary w-full">
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Εύρεση Επισκευής
          </button>
        </form>
      </div>

      <!-- Repair details -->
      <div v-if="repair">
        <!-- Header card -->
        <div class="card mb-4">
          <div class="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div class="text-sm text-gray-500 mb-1">Κωδικός Επισκευής</div>
              <div class="font-mono font-bold text-xl text-primary-600">{{ repair.deviceCode }}</div>
            </div>
            <div>
              <span
                class="px-4 py-2 rounded-full text-sm font-bold"
                :class="statusClass(repair.status)"
              >
                {{ statusLabel(repair.status) }}
              </span>
            </div>
          </div>

          <!-- Device info -->
          <div class="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <div class="text-gray-500">Συσκευή</div>
              <div class="font-medium">{{ repair.brand }} {{ repair.model }}</div>
            </div>
            <div v-if="repair.category">
              <div class="text-gray-500">Κατηγορία</div>
              <div class="font-medium">{{ repair.category }}</div>
            </div>
            <div v-if="repair.createdAt">
              <div class="text-gray-500">Ημ/νία Αίτησης</div>
              <div class="font-medium">{{ formatDate(repair.createdAt) }}</div>
            </div>
            <div v-if="repair.estimatedCompletionDate">
              <div class="text-gray-500">Εκτιμώμενη Ολοκλήρωση</div>
              <div class="font-medium">{{ formatDate(repair.estimatedCompletionDate) }}</div>
            </div>
          </div>
        </div>

        <!-- Status timeline -->
        <div class="card mb-4">
          <h3 class="font-bold mb-4">Πορεία Επισκευής</h3>
          <div class="space-y-0">
            <div
              v-for="(stage, i) in statusStages"
              :key="stage.key"
              class="flex gap-4"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                  :class="stageStatus(stage.key, repair.status) === 'done' ? 'bg-green-500 text-white' :
                           stageStatus(stage.key, repair.status) === 'current' ? 'bg-primary-600 text-white' :
                           'bg-gray-200 text-gray-400'"
                >
                  <Check v-if="stageStatus(stage.key, repair.status) === 'done'" class="w-4 h-4" />
                  <div v-else-if="stageStatus(stage.key, repair.status) === 'current'" class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div v-if="i < statusStages.length - 1" class="w-0.5 h-8 bg-gray-200 flex-shrink-0"></div>
              </div>
              <div class="pb-6">
                <div
                  class="font-medium text-sm"
                  :class="stageStatus(stage.key, repair.status) === 'pending' ? 'text-gray-400' : 'text-gray-800'"
                >
                  {{ stage.label }}
                </div>
                <div class="text-xs text-gray-400">{{ stage.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="repair.technicianNotes" class="card mb-4">
          <h3 class="font-bold mb-2">Σημειώσεις Τεχνικού</h3>
          <p class="text-gray-700 text-sm">{{ repair.technicianNotes }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 flex-wrap">
          <button @click="repair = null" class="btn btn-secondary">
            Νέα Αναζήτηση
          </button>
          <RouterLink to="/repair-booking" class="btn btn-outline">
            Νέα Επισκευή
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { repairsAPI } from '@/services/api/repairs';
import { Check } from 'lucide-vue-next';

const route = useRoute();

const deviceId = ref(route.params.deviceId || '');
const deviceCode = ref('');
const loading = ref(false);
const errorMsg = ref('');
const repair = ref(null);

const statusStages = [
  { key: 'Pending', label: 'Παραλήφθηκε', description: 'Η αίτηση καταχωρήθηκε' },
  { key: 'Diagnosing', label: 'Διάγνωση', description: 'Ο τεχνικός εξετάζει τη συσκευή' },
  { key: 'Waiting Parts', label: 'Αναμονή Ανταλλακτικών', description: 'Παραγγελία ή διαθεσιμότητα ανταλλακτικών' },
  { key: 'In Repair', label: 'Σε Επισκευή', description: 'Η επισκευή βρίσκεται σε εξέλιξη' },
  { key: 'Quality Check', label: 'Έλεγχος Ποιότητας', description: 'Τελικός έλεγχος μετά την επισκευή' },
  { key: 'Completed', label: 'Ολοκληρώθηκε', description: 'Έτοιμο για παραλαβή ή αποστολή' }
];

const stageOrder = statusStages.map(s => s.key);

function stageStatus(stageKey, currentStatus) {
  const stageIdx = stageOrder.indexOf(stageKey);
  const currentIdx = stageOrder.indexOf(currentStatus);
  if (currentIdx === -1) return stageIdx === 0 ? 'current' : 'pending';
  if (stageIdx < currentIdx) return 'done';
  if (stageIdx === currentIdx) return 'current';
  return 'pending';
}

function statusLabel(status) {
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

function statusClass(status) {
  const classes = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Diagnosing': 'bg-blue-100 text-blue-800',
    'Waiting Parts': 'bg-orange-100 text-orange-800',
    'In Repair': 'bg-purple-100 text-purple-800',
    'Quality Check': 'bg-indigo-100 text-indigo-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function formatDate(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function loadRepair() {
  if (!deviceId.value || !deviceCode.value) return;
  loading.value = true;
  errorMsg.value = '';
  repair.value = null;
  try {
    const data = await repairsAPI.getRepairStatus(deviceId.value.trim(), deviceCode.value.trim());
    if (!data) {
      errorMsg.value = 'Δεν βρέθηκε επισκευή με αυτά τα στοιχεία. Ελέγξτε τον κωδικό και δοκιμάστε ξανά.';
    } else {
      repair.value = data;
    }
  } catch (err) {
    errorMsg.value = 'Δεν βρέθηκε επισκευή με αυτά τα στοιχεία.';
  } finally {
    loading.value = false;
  }
}

// Auto-load if deviceId is in URL and we have both params
onMounted(() => {
  if (route.params.deviceId) {
    deviceId.value = route.params.deviceId;
  }
});
</script>
