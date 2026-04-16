import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { getDisplayPrice, getPurchasableStock, getProductName, normalizeProduct } from '@/utils/catalog';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]);
  const promotion = ref(null);

  function toNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function normalizeQuantity(value, fallback = 1) {
    return Math.max(1, Math.floor(toNumber(value, fallback)));
  }

  function getMaxQuantity(item = {}) {
    if (item.isService) {
      return 1;
    }

    return Math.max(0, Math.floor(toNumber(item.stock ?? item.quantity)));
  }

  function clampQuantity(item = {}, quantity = 1) {
    if (item.isService) {
      return 1;
    }

    const maxQuantity = getMaxQuantity(item);
    if (maxQuantity <= 0) {
      return 1;
    }

    return Math.min(maxQuantity, normalizeQuantity(quantity));
  }

  function normalizeCartItem(item = {}) {
    const collection = item.collection || item._collection || item._source || 'inventory';
    const inventoryId = item.inventoryId || item.itemId || item.id;
    const isService = Boolean(item.isService || collection === 'services' || item.type === 'service' || item._productType === 'service');
    const stock = isService ? Infinity : Math.max(0, Math.floor(toNumber(item.stock ?? item.quantity)));
    const weight = toNumber(item.weight ?? 0);
    const weightUnit = item.weightUnit || item.weight_unit || 'kg';
    const normalized = {
      _key: item._key || `${collection}:${inventoryId}`,
      inventoryId,
      collection,
      type: item.type || item._productType || 'general_product',
      isService,
      name: item.name || '',
      unitPrice: toNumber(item.unitPrice ?? item.eshopPrice ?? item.sellPrice ?? item.price),
      quantity: 1,
      image: item.image || item.images?.[0] || null,
      sku: item.sku || item.barcode || item.partNumber || '',
      stock,
      weight,
      weightUnit,
    };

    normalized.quantity = isService ? 1 : clampQuantity(normalized, item.quantity);

    return normalized;
  }

  // Getters
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + toNumber(item.quantity), 0)
  );

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + (toNumber(item.unitPrice) * toNumber(item.quantity)), 0)
  );

  const isEmpty = computed(() => items.value.length === 0);
  const discountAmount = computed(() => toNumber(promotion.value?.totals?.discount_amount));
  const shippingDiscount = computed(() => toNumber(promotion.value?.totals?.shipping_discount));
  const totalDiscount = computed(() => toNumber(promotion.value?.totals?.total_discount));

  const hasServices = computed(() => items.value.some(item => item.isService));
  const isServiceOnly = computed(() => items.value.length > 0 && items.value.every(item => item.isService));
  const estimatedWeight = computed(() =>
    items.value.reduce((sum, item) => {
      if (item.isService) return sum;
      const baseWeight = toNumber(item.weight);
      const inKg = String(item.weightUnit || 'kg').toLowerCase() === 'g'
        ? baseWeight / 1000
        : baseWeight;
      return sum + (inKg * toNumber(item.quantity));
    }, 0)
  );
  const hasStockIssues = computed(() =>
    items.value.some(item => !item.isService && (getMaxQuantity(item) <= 0 || toNumber(item.quantity, 1) > getMaxQuantity(item)))
  );

  // Actions
  function addItem(product, quantity = 1) {
    const itemId = product.id;
    const collection = product._collection || product._source || 'inventory';
    const isService = collection === 'services' || product.type === 'service' || product._productType === 'service';
    const requestedQuantity = normalizeQuantity(quantity);
    const availableQuantity = isService ? Infinity : getPurchasableStock(product);

    if (!isService && availableQuantity <= 0) {
      return false;
    }

    // Use a composite key for uniqueness (collection + id)
    const uniqueKey = `${collection}:${itemId}`;
    const existingItem = items.value.find(item => item._key === uniqueKey);

    if (existingItem) {
      if (!isService) {
        existingItem.stock = availableQuantity;
        existingItem.quantity = clampQuantity(existingItem, existingItem.quantity + requestedQuantity);
      }
    } else {
      items.value.push(normalizeCartItem({
        _key: uniqueKey,
        inventoryId: itemId,
        collection,
        type: product._productType || product.type || 'general_product',
        isService,
        name: product.name || `${product.brand || ''} ${product.model || ''}`.trim(),
        unitPrice: product.eshopPrice ?? product.sellPrice ?? product.price ?? 0,
        quantity: isService ? 1 : requestedQuantity,
        image: product.images?.[0] || null,
        sku: product.barcode || product.partNumber || '',
        stock: isService ? Infinity : availableQuantity,
        weight: product.weight ?? null,
        weightUnit: product.weightUnit ?? product.weight_unit ?? 'kg',
      }));
    }

    saveCart();
    return true;
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
        item.quantity = clampQuantity(item, quantity);
        saveCart();
      }
    }
  }

  function clearCart() {
    items.value = [];
    promotion.value = null;
    localStorage.removeItem('cart');
  }

  function setPromotion(preview) {
    promotion.value = preview || null;
    saveCart();
  }

  function clearPromotion() {
    promotion.value = null;
    saveCart();
  }

  function replaceCart(nextItems = [], { keepPromotion = false } = {}) {
    items.value = Array.isArray(nextItems)
      ? nextItems
          .map(item => normalizeCartItem(item))
          .filter(item => item.inventoryId)
      : [];

    if (!keepPromotion) {
      promotion.value = null;
    }

    saveCart();
  }

  async function refreshItems(storeId) {
    if (!storeId || items.value.length === 0) {
      return items.value;
    }

    const refreshed = await Promise.all(items.value.map(async item => {
      if (item.isService) {
        return normalizeCartItem(item);
      }

      try {
        const { data } = await api.get(`/eshop/${storeId}/products/${item.inventoryId}`, {
          params: {
            source: item.collection === 'parts' ? 'parts' : 'inventory',
          },
        });

        const product = normalizeProduct(data?.data || {});
        const availableQuantity = getPurchasableStock(product);

        return normalizeCartItem({
          ...item,
          type: product._productType,
          collection: product._source,
          name: getProductName(product),
          unitPrice: getDisplayPrice(product),
          image: product.images?.[0] || null,
          sku: product.barcode || product.partNumber || '',
          stock: availableQuantity,
          weight: product.weight ?? null,
          weightUnit: product.weightUnit ?? product.weight_unit ?? 'kg',
          quantity: availableQuantity > 0 ? Math.min(item.quantity, availableQuantity) : 1,
        });
      } catch {
        return normalizeCartItem({
          ...item,
          stock: 0,
          quantity: 1,
        });
      }
    }));

    items.value = refreshed;
    saveCart();

    return refreshed;
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify({
      items: items.value,
      promotion: promotion.value,
    }));
  }

  function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const savedItems = Array.isArray(parsed) ? parsed : (parsed.items || []);

        items.value = savedItems.map(item => normalizeCartItem(item));
        promotion.value = Array.isArray(parsed) ? null : (parsed.promotion || null);
      } catch (e) {
        console.error('Error loading cart:', e);
        items.value = [];
        promotion.value = null;
      }
    }
  }

  return {
    // State
    items,
    promotion,

    // Getters
    itemCount,
    subtotal,
    isEmpty,
    discountAmount,
    shippingDiscount,
    totalDiscount,
    hasServices,
    isServiceOnly,
    estimatedWeight,
    hasStockIssues,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setPromotion,
    clearPromotion,
    replaceCart,
    refreshItems,
    saveCart,
    loadCart,
    getMaxQuantity,
  };
});
