<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <div class="card">
        <div class="text-center mb-8">
          <div class="text-4xl mb-2">🔑</div>
          <h1 class="text-2xl font-bold">Ξεχάσατε τον Κωδικό;</h1>
          <p class="text-gray-500 text-sm mt-1">Εισάγετε το email σας και θα σας στείλουμε σύνδεσμο επαναφοράς.</p>
        </div>

        <div v-if="successMsg" class="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {{ successMsg }}
        </div>

        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {{ errorMsg }}
        </div>

        <form v-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="email@example.com"
              class="input"
              required
              autocomplete="email"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Αποστολή Συνδέσμου Επαναφοράς
          </button>
        </form>

        <div class="text-center mt-6 text-sm text-gray-600">
          <RouterLink to="/login" class="text-primary-600 hover:underline font-medium">
            Επιστροφή στη Σύνδεση
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const email = ref('');
const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

async function handleSubmit() {
  loading.value = true;
  errorMsg.value = '';
  try {
    await appStore.forgotPassword(email.value);
    successMsg.value = 'Εάν υπάρχει λογαριασμός με αυτό το email, θα λάβετε σύνδεσμο επαναφοράς κωδικού.';
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.';
  } finally {
    loading.value = false;
  }
}
</script>
