<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <div class="card">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-4xl mb-2">🔧</div>
          <h1 class="text-2xl font-bold">{{ isRegister ? 'Δημιουργία Λογαριασμού' : 'Σύνδεση στον λογαριασμό σας' }}</h1>
          <p class="text-gray-500 text-sm mt-1">{{ appStore.storeName }}</p>
        </div>

        <!-- Error message -->
        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {{ errorMsg }}
        </div>

        <!-- Email/Password Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <template v-if="isRegister">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Όνομα</label>
                <input v-model="form.firstName" type="text" placeholder="Γιώργης" class="input" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Επώνυμο</label>
                <input v-model="form.lastName" type="text" placeholder="Παπαδόπουλος" class="input" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο</label>
              <input v-model="form.phone" type="tel" placeholder="+30 6912345678" class="input" />
            </div>
          </template>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
              class="input"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Κωδικός</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="input"
              required
              autocomplete="current-password"
              minlength="8"
            />
          </div>

          <div v-if="isRegister">
            <label class="block text-sm font-medium text-gray-700 mb-1">Επιβεβαίωση Κωδικού</label>
            <input
              v-model="form.passwordConfirm"
              type="password"
              placeholder="••••••••"
              class="input"
              required
              minlength="8"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ isRegister ? 'Δημιουργία Λογαριασμού' : 'Σύνδεση' }}
          </button>
        </form>

        <!-- Toggle register/login -->
        <div v-if="appStore.allowRegistration" class="text-center mt-6 text-sm text-gray-600">
          <span v-if="isRegister">Έχετε ήδη λογαριασμό; </span>
          <span v-else>Δεν έχετε λογαριασμό; </span>
          <button
            @click="toggleMode"
            class="text-primary-600 hover:underline font-medium"
          >
            {{ isRegister ? 'Σύνδεση' : 'Εγγραφή' }}
          </button>
        </div>

        <!-- Guest checkout hint -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
          {{ appStore.requireAuthForCheckout ? 'Απαιτείται λογαριασμός για checkout.' : 'Μπορείτε να αγοράσετε και χωρίς λογαριασμό κατά το checkout.' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const isRegister = ref(route.query.mode === 'register' && appStore.allowRegistration);
const loading = ref(false);
const errorMsg = ref('');

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirm: '',
});

function getApiError(err) {
  const msg = err.response?.data?.message;
  const errors = err.response?.data?.errors;
  if (errors) {
    return Object.values(errors).flat().join(' ');
  }
  return msg || 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.';
}

function toggleMode() {
  if (!appStore.allowRegistration) return;
  isRegister.value = !isRegister.value;
  errorMsg.value = '';
}

async function handleSubmit() {
  loading.value = true;
  errorMsg.value = '';
  try {
    if (isRegister.value) {
      await appStore.register(
        form.value.firstName,
        form.value.lastName,
        form.value.email,
        form.value.password,
        form.value.passwordConfirm,
        form.value.phone,
      );
    } else {
      await appStore.login(form.value.email, form.value.password);
    }
    router.push(route.query.redirect || '/account');
  } catch (err) {
    errorMsg.value = getApiError(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (appStore.isAuthenticated) {
    router.replace(route.query.redirect || '/account');
  }
})
</script>
