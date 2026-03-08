<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Καλάθι Αγορών</h1>

    <div v-if="cartStore.isEmpty" class="text-center py-12">
      <ShoppingCart class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-gray-700 mb-2">Το καλάθι σας είναι άδειο</h3>
      <RouterLink to="/products" class="btn btn-primary mt-4">
        Συνέχεια Αγορών
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.inventoryId"
          class="card flex gap-4"
        >
          <div class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover rounded-lg"
            />
            <Package v-else class="w-12 h-12 text-gray-400" />
          </div>

          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">{{ item.name }}</h3>
            <p class="text-gray-600 text-sm mb-2">{{ item.unitPrice.toFixed(2) }}€</p>

            <div class="flex items-center gap-2">
              <button
                @click="cartStore.updateQuantity(item.inventoryId, item.quantity - 1)"
                class="btn btn-secondary px-3 py-1"
              >
                -
              </button>
              <span class="font-medium">{{ item.quantity }}</span>
              <button
                @click="cartStore.updateQuantity(item.inventoryId, item.quantity + 1)"
                class="btn btn-secondary px-3 py-1"
              >
                +
              </button>
            </div>
          </div>

          <div class="text-right">
            <div class="font-bold text-lg mb-2">
              {{ (item.unitPrice * item.quantity).toFixed(2) }}€
            </div>
            <button
              @click="cartStore.removeItem(item.inventoryId)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Αφαίρεση
            </button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div>
        <div class="card sticky top-24">
          <h3 class="font-bold text-xl mb-4">Σύνοψη Παραγγελίας</h3>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span>Υποσύνολο</span>
              <span>{{ cartStore.subtotal.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between">
              <span>ΦΠΑ (24%)</span>
              <span>{{ (cartStore.subtotal * 0.24).toFixed(2) }}€</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Σύνολο</span>
              <span>{{ (cartStore.subtotal * 1.24).toFixed(2) }}€</span>
            </div>
          </div>

          <RouterLink to="/checkout" class="btn btn-primary w-full">
            Ολοκλήρωση Παραγγελίας
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { ShoppingCart, Package } from 'lucide-vue-next';

const cartStore = useCartStore();
</script>
