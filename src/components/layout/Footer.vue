<template>
  <footer class="bg-gray-900 text-white mt-auto">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Store Info -->
        <div>
          <h3 class="text-lg font-bold mb-4">{{ appStore.storeName }}</h3>
          <p class="text-gray-400 text-sm">
            {{ appStore.storeDetails?.address }}<br>
            {{ appStore.storeDetails?.city }} {{ appStore.storeDetails?.postalCode }}
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-bold mb-4">Σύνδεσμοι</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/products" class="text-gray-400 hover:text-white transition-colors">
                Προϊόντα
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/repair-booking" class="text-gray-400 hover:text-white transition-colors">
                Επισκευές
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/account" class="text-gray-400 hover:text-white transition-colors">
                Ο Λογαριασμός μου
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-lg font-bold mb-4">Επικοινωνία</h3>
          <ul class="space-y-2 text-sm text-gray-400">
            <li v-if="appStore.storeDetails?.phone">
              <a :href="`tel:${appStore.storeDetails.phone}`" class="hover:text-white transition-colors">
                📞 {{ appStore.storeDetails.phone }}
              </a>
            </li>
            <li v-if="appStore.storeDetails?.email">
              <a :href="`mailto:${appStore.storeDetails.email}`" class="hover:text-white transition-colors">
                ✉️ {{ appStore.storeDetails.email }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Info -->
        <div>
          <h3 class="text-lg font-bold mb-4">Πληροφορίες</h3>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>Ασφαλείς Πληρωμές</li>
            <li>Δωρεάν Αποστολή >50€</li>
            <li>Εγγύηση Προϊόντων</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} {{ appStore.storeName }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
</script>
