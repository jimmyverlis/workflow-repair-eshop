<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <div class="card">
        <div class="text-center mb-8">
          <div class="text-4xl mb-2">🔒</div>
          <h1 class="text-2xl font-bold">Επαναφορά Κωδικού</h1>
          <p class="text-gray-500 text-sm mt-1">Εισάγετε τον νέο σας κωδικό πρόσβασης.</p>
        </div>

        <div v-if="successMsg" class="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {{ successMsg }}
          <div class="mt-3">
            <RouterLink to="/login" class="text-green-700 font-medium underline">Σύνδεση</RouterLink>
          </div>
        </div>

        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {{ errorMsg }}
        </div>

        <div v-if="!token || !emailParam" class="text-center text-gray-500 py-6">
          <p>Μη έγκυρος σύνδεσμος επαναφοράς. Παρακαλώ ζητήστε νέο.</p>
          <RouterLink to="/forgot-password" class="btn btn-primary mt-4 inline-block">Επαναφορά Κωδικού</RouterLink>
        </div>

        <form v-else-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Νέος Κωδικός</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="input"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Επιβεβαίωση Κωδικού</label>
            <input
              v-model="form.passwordConfirm"
              type="password"
              placeholder="••••••••"
              class="input"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Ορισμός Νέου Κωδικού
          </button>
        </form>

        <div v-if="!successMsg" class="text-center mt-6 text-sm text-gray-600">
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
import { RouterLink, useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const route = useRoute();

const token = route.query.token || '';
const emailParam = route.query.email || '';

const form = ref({ password: '', passwordConfirm: '' });
const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

async function handleSubmit() {
  errorMsg.value = '';
  if (form.value.password !== form.value.passwordConfirm) {
    errorMsg.value = 'Οι κωδικοί δεν ταιριάζουν.';
    return;
  }
  loading.value = true;
  try {
    await appStore.resetPassword(token, emailParam, form.value.password, form.value.passwordConfirm);
    successMsg.value = 'Ο κωδικός σας άλλαξε επιτυχώς. Μπορείτε τώρα να συνδεθείτε.';
  } catch (err) {
    const errors = err.response?.data?.errors;
    if (errors) {
      errorMsg.value = Object.values(errors).flat().join(' ');
    } else {
      errorMsg.value = err.response?.data?.message || 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.';
    }
  } finally {
    loading.value = false;
  }
}
</script>
