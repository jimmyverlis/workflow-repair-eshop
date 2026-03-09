<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-12">
      <div class="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div class="text-center">
          <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <UserRound class="h-7 w-7" />
          </div>
          <h1 class="mt-5 text-3xl font-black text-slate-900">{{ isRegister ? 'Create account' : 'Sign in' }}</h1>
          <p class="mt-2 text-sm text-slate-500">{{ appStore.storeName }}</p>
        </div>

        <div v-if="errorMsg" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMsg }}
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <template v-if="isRegister">
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">First name</label>
                <input v-model.trim="form.firstName" type="text" class="input" placeholder="Alex" required />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Last name</label>
                <input v-model.trim="form.lastName" type="text" class="input" placeholder="Johnson" required />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Phone</label>
              <input v-model.trim="form.phone" type="tel" class="input" placeholder="6900000000" />
            </div>
          </template>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              v-model.trim="form.email"
              type="email"
              class="input"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              v-model="form.password"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              type="password"
              class="input"
              placeholder="Minimum 8 characters"
              minlength="8"
              required
            />
          </div>

          <template v-if="isRegister">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                v-model="form.passwordConfirm"
                type="password"
                class="input"
                placeholder="Repeat password"
                minlength="8"
                required
              />
            </div>

            <div v-if="appStore.referralsEnabled">
              <label class="mb-1 block text-sm font-medium text-slate-700">Referral code</label>
              <input
                v-model.trim="form.referralCode"
                type="text"
                class="input uppercase"
                placeholder="Optional referral code"
              />
              <p class="mt-1 text-xs text-slate-500">Invite flow is enabled for this storefront. Add a code if someone referred you.</p>
            </div>

            <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input v-model="form.marketingOptIn" type="checkbox" class="mt-1 rounded border-slate-300 text-primary-600" />
              <span class="text-sm text-slate-600">Send me new product drops, repair offers, and store updates by email.</span>
            </label>
          </template>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create account' : 'Sign in') }}
          </button>
        </form>

        <div v-if="!isRegister" class="mt-4 text-center text-sm">
          <RouterLink to="/forgot-password" class="font-medium text-slate-500 hover:text-primary-600 hover:underline">
            Forgot your password?
          </RouterLink>
        </div>

        <div v-if="appStore.allowRegistration" class="mt-6 text-center text-sm text-slate-600">
          <span>{{ isRegister ? 'Already have an account?' : 'Need an account?' }}</span>
          <button type="button" class="ml-1 font-semibold text-primary-600 hover:underline" @click="toggleMode">
            {{ isRegister ? 'Sign in' : 'Register' }}
          </button>
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
          <template v-if="appStore.requireAuthForCheckout || !appStore.allowGuestCheckout">
            An account is required before checkout.
          </template>
          <template v-else>
            Guest checkout is allowed, but an account keeps orders, wishlist, loyalty points, and saved carts in sync.
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { UserRound } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const loading = ref(false);
const errorMsg = ref('');
const isRegister = ref(route.query.mode === 'register' && appStore.allowRegistration);
const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirm: '',
  referralCode: '',
  marketingOptIn: false,
});

watch(
  () => route.query.mode,
  value => {
    isRegister.value = value === 'register' && appStore.allowRegistration;
  },
);

function getApiError(err) {
  const message = err.response?.data?.message;
  const errors = err.response?.data?.errors;
  if (errors) {
    return Object.values(errors).flat().join(' ');
  }
  return message || 'Authentication failed. Try again.';
}

function toggleMode() {
  if (!appStore.allowRegistration) return;
  isRegister.value = !isRegister.value;
  errorMsg.value = '';
  router.replace({
    path: '/login',
    query: {
      ...route.query,
      ...(isRegister.value ? { mode: 'register' } : { mode: undefined }),
    },
  });
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
        form.value.referralCode,
      );

      if (form.value.marketingOptIn) {
        await appStore.updateProfile({ marketing_opt_in: true });
      }
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
});
</script>
