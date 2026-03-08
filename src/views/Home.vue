<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-6">
          Καλώς ήρθατε στο {{ appStore.storeName }}
        </h1>
        <p class="text-xl mb-8 text-primary-100">
          Ανταλλακτικά, Επισκευές & Συσκευές με Εγγύηση
        </p>
        <div class="flex justify-center gap-4 flex-wrap">
          <RouterLink to="/products" class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
            Δείτε τα Προϊόντα μας
          </RouterLink>
          <RouterLink to="/repair-booking" class="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
            Κλείστε Επισκευή
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold mb-2">Γρήγορη Αποστολή</h3>
            <p class="text-gray-600">Δωρεάν μεταφορικά για παραγγελίες άνω των 50€</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold mb-2">Εγγύηση Ποιότητας</h3>
            <p class="text-gray-600">Όλα τα προϊόντα με πιστοποίηση και εγγύηση</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold mb-2">Επαγγελματικές Επισκευές</h3>
            <p class="text-gray-600">Έμπειροι τεχνικοί για κάθε είδους επισκευή</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Κατηγορίες Προϊόντων</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card hover:shadow-lg transition-shadow cursor-pointer" @click="router.push('/products?type=part')">
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu class="w-10 h-10 text-primary-600" />
              </div>
              <h3 class="text-lg font-bold mb-2">Ανταλλακτικά</h3>
              <p class="text-gray-600 text-sm">Γνήσια ανταλλακτικά για όλες τις συσκευές</p>
            </div>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer" @click="router.push('/products?type=device')">
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone class="w-10 h-10 text-primary-600" />
              </div>
              <h3 class="text-lg font-bold mb-2">Συσκευές</h3>
              <p class="text-gray-600 text-sm">Νέες και μεταχειρισμένες συσκευές</p>
            </div>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer" @click="router.push('/products?type=service')">
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench class="w-10 h-10 text-primary-600" />
              </div>
              <h3 class="text-lg font-bold mb-2">Υπηρεσίες</h3>
              <p class="text-gray-600 text-sm">Επισκευές και συντήρηση</p>
            </div>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer" @click="router.push('/products?type=general_product')">
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package class="w-10 h-10 text-primary-600" />
              </div>
              <h3 class="text-lg font-bold mb-2">Αξεσουάρ</h3>
              <p class="text-gray-600 text-sm">Θήκες, προστατευτικά και άλλα</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary-600 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Χρειάζεστε Επισκευή;</h2>
        <p class="text-xl mb-8 text-primary-100">
          Κλείστε online ραντεβού και φέρτε τη συσκευή σας στο κατάστημα
        </p>
        <RouterLink
          to="/repair-booking"
          class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg inline-block"
        >
          Κλείστε Ραντεβού Τώρα
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter, RouterLink } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { Package, Shield, Wrench, Cpu, Smartphone } from 'lucide-vue-next';

const router = useRouter();
const appStore = useAppStore();
</script>
