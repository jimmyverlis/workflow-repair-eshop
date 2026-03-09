<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saved for later</div>
          <h1 class="mt-2 text-4xl font-black text-slate-900">Wishlist</h1>
          <p class="mt-2 text-sm text-slate-500">Keep products, parts, and devices in one place across browsing sessions.</p>
        </div>
        <RouterLink to="/products" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-200 hover:text-primary-700">
          Continue shopping
        </RouterLink>
      </div>

      <div v-if="wishlistStore.loading && wishlistStore.count === 0" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
        <p class="mt-4 text-sm text-slate-500">Loading wishlist...</p>
      </div>

      <div v-else-if="wishlistStore.count === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <Heart class="mx-auto h-16 w-16 text-slate-300" />
        <h2 class="mt-4 text-2xl font-black text-slate-900">Your wishlist is empty</h2>
        <p class="mt-3 text-sm text-slate-500">Save products from the catalog to revisit them later or move them straight into the cart.</p>
        <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
          Browse products
        </RouterLink>
      </div>

      <div v-else class="space-y-6">
        <div class="rounded-[2rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ wishlistStore.count }} saved item<span v-if="wishlistStore.count !== 1">s</span></div>
              <div class="text-sm text-slate-500">
                <template v-if="appStore.isAuthenticated">Your wishlist is synced to your account.</template>
                <template v-else>Sign in to sync this wishlist across devices.</template>
              </div>
            </div>
            <RouterLink
              v-if="!appStore.isAuthenticated"
              :to="{ path: '/login', query: { redirect: '/wishlist' } }"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700"
            >
              Sign in to sync
            </RouterLink>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="item in wishlistStore.items" :key="item._uid" class="space-y-3">
            <ProductCard
              :product="item"
              @select="goToProduct"
              @add-to-cart="addToCart"
              @book-service="bookService"
            />

            <div class="flex gap-3">
              <button
                v-if="item._productType !== 'service' && item.quantity > 0"
                type="button"
                class="flex-1 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                @click="addToCart(item)"
              >
                Add to cart
              </button>
              <button
                type="button"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                @click="wishlistStore.removeProduct(item)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Heart } from 'lucide-vue-next';
import ProductCard from '@/components/catalog/ProductCard.vue';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';

const router = useRouter();
const appStore = useAppStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

onMounted(() => {
  wishlistStore.loadWishlist(true);
});

function goToProduct(product) {
  router.push({
    path: `/product/${product.id}`,
    query: { source: product._source || product.source || 'inventory' },
  });
}

function addToCart(product) {
  cartStore.addItem({
    ...product,
    eshopPrice: product.eshopPrice ?? product.price,
    sellPrice: product.sellPrice ?? product.price,
    _collection: product._source,
  }, 1);
}

function bookService(product) {
  router.push(`/repair-booking?service=${product.id}`);
}
</script>
