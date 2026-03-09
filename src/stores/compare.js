import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { buildProductKey, normalizeProduct } from '@/utils/catalog';

const COMPARE_STORAGE_KEY = 'eshop_compare_products';
const COMPARE_LIMIT = 4;

export const useCompareStore = defineStore('compare', () => {
  const items = ref([]);

  function persist() {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items.value));
  }

  function loadStoredItems() {
    try {
      const stored = JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) || '[]');
      items.value = Array.isArray(stored)
        ? stored
            .filter(item => item?.id)
            .map(item => normalizeProduct(item))
            .slice(0, COMPARE_LIMIT)
        : [];
    } catch {
      items.value = [];
    }
  }

  function hasProduct(product) {
    const key = buildProductKey(product);
    return items.value.some(item => buildProductKey(item) === key);
  }

  function addProduct(product) {
    if (!product?.id || hasProduct(product) || items.value.length >= COMPARE_LIMIT) {
      return;
    }

    items.value.push(normalizeProduct(product));
    persist();
  }

  function removeProduct(productOrKey) {
    const key = typeof productOrKey === 'string' ? productOrKey : buildProductKey(productOrKey);
    items.value = items.value.filter(item => buildProductKey(item) !== key);
    persist();
  }

  function toggleProduct(product) {
    if (hasProduct(product)) {
      removeProduct(product);
      return false;
    }

    addProduct(product);
    return true;
  }

  function clear() {
    items.value = [];
    persist();
  }

  const count = computed(() => items.value.length);
  const isFull = computed(() => items.value.length >= COMPARE_LIMIT);

  loadStoredItems();

  return {
    items,
    count,
    isFull,
    hasProduct,
    addProduct,
    removeProduct,
    toggleProduct,
    clear,
    loadStoredItems,
  };
});
