import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]);

  function toNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  // Getters
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + toNumber(item.quantity), 0)
  );

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + (toNumber(item.unitPrice) * toNumber(item.quantity)), 0)
  );

  const isEmpty = computed(() => items.value.length === 0);

  const hasServices = computed(() => items.value.some(item => item.isService));
  const isServiceOnly = computed(() => items.value.length > 0 && items.value.every(item => item.isService));

  // Actions
  function addItem(product, quantity = 1) {
    const itemId = product.id;
    const collection = product._collection || product._source || 'inventory';
    const isService = collection === 'services' || product.type === 'service' || product._productType === 'service';

    // Use a composite key for uniqueness (collection + id)
    const uniqueKey = `${collection}:${itemId}`;
    const existingItem = items.value.find(item => item._key === uniqueKey);

    if (existingItem) {
      if (!isService) {
        existingItem.quantity += quantity;
      }
    } else {
      items.value.push({
        _key: uniqueKey,
        inventoryId: itemId,
        collection,
        type: product._productType || product.type || 'general_product',
        isService,
        name: product.name || `${product.brand || ''} ${product.model || ''}`.trim(),
        unitPrice: toNumber(product.eshopPrice ?? product.sellPrice ?? product.price ?? 0),
        quantity: isService ? 1 : quantity,
        image: product.images?.[0] || null,
        sku: product.barcode || product.partNumber || '',
        stock: isService ? Infinity : toNumber(product.quantity)
      });
    }

    saveCart();
  }

  function removeItem(key) {
    const index = items.value.findIndex(item => item._key === key || item.inventoryId === key);
    if (index > -1) {
      items.value.splice(index, 1);
      saveCart();
    }
  }

  function updateQuantity(key, quantity) {
    const item = items.value.find(item => item._key === key || item.inventoryId === key);
    if (item) {
      if (quantity <= 0) {
        removeItem(key);
      } else {
        item.quantity = quantity;
        saveCart();
      }
    }
  }

  function clearCart() {
    items.value = [];
    localStorage.removeItem('cart');
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(items.value));
  }

  function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        items.value = JSON.parse(savedCart).map(item => ({
          ...item,
          unitPrice: toNumber(item.unitPrice),
          quantity: toNumber(item.quantity, 1),
          stock: item.isService ? Infinity : toNumber(item.stock)
        }));
      } catch (e) {
        console.error('Error loading cart:', e);
        items.value = [];
      }
    }
  }

  return {
    // State
    items,

    // Getters
    itemCount,
    subtotal,
    isEmpty,
    hasServices,
    isServiceOnly,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveCart,
    loadCart
  };
});
