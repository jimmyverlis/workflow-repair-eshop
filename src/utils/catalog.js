export const RECENTLY_VIEWED_STORAGE_KEY = 'eshop_recently_viewed_products';
const RECENTLY_VIEWED_LIMIT = 8;

export function toNumber(value, fallback = 0) {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function isSensitiveField(value) {
  return /\b(?:imei|serial(?:\s+number)?|s\/n|sn)\b/i.test(String(value ?? ''));
}

export function normalizeStringList(value) {
  return Array.isArray(value)
    ? value
      .map(item => String(item ?? '').trim())
      .filter(item => item && !isSensitiveField(item))
    : [];
}

export function normalizeStructuredEntries(value) {
  if (Array.isArray(value)) {
    return value.flatMap(entry => {
      if (!entry) return [];

      if (typeof entry === 'string') {
        const normalized = entry.trim();
        return normalized && !isSensitiveField(normalized)
          ? [{ key: 'details', value: normalized }]
          : [];
      }

      if (typeof entry === 'object') {
        if ('key' in entry || 'value' in entry) {
          const key = String(entry.key ?? 'details').trim() || 'details';
          const entryValue = String(entry.value ?? '').trim();

          if (!entryValue || isSensitiveField(key) || isSensitiveField(entryValue)) {
            return [];
          }

          return [{ key, value: entryValue }];
        }

        return Object.entries(entry)
          .filter(([key, entryValue]) => {
            if (entryValue === null || entryValue === undefined) return false;

            const normalized = String(entryValue).trim();
            return normalized !== '' && !isSensitiveField(key) && !isSensitiveField(normalized);
          })
          .map(([key, entryValue]) => ({ key, value: String(entryValue).trim() }));
      }

      const normalized = String(entry).trim();
      return normalized && !isSensitiveField(normalized)
        ? [{ key: 'details', value: normalized }]
        : [];
    });
  }

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key, entryValue]) => {
        if (entryValue === null || entryValue === undefined) return false;

        const normalized = String(entryValue).trim();
        return normalized !== '' && !isSensitiveField(key) && !isSensitiveField(normalized);
      })
      .map(([key, entryValue]) => ({ key, value: String(entryValue).trim() }));
  }

  return [];
}

export function normalizeProduct(raw = {}) {
  const source = raw.source ?? raw._source ?? 'inventory';
  const eshopPrice = raw.eshopPrice ?? raw.eshop_price;
  const sellPrice = raw.sellPrice ?? raw.sell_price ?? raw.price;
  const price = raw.price ?? eshopPrice ?? sellPrice ?? 0;
  const compareAtPrice = raw.compareAtPrice ?? raw.compare_at_price;
  const type = raw.type === 'general' ? 'general_product' : (raw.type ?? raw._productType ?? 'general_product');
  const name = raw.name || [raw.brand, raw.model].filter(Boolean).join(' ');

  return {
    ...raw,
    name,
    source,
    _source: source,
    type,
    _productType: type,
    _uid: raw._uid ?? `${source}_${raw.id}`,
    compatibleDevices: raw.compatible_devices ?? raw.compatibleDevices ?? [],
    deviceType: raw.deviceType ?? raw.device_type ?? '',
    grade: raw.grade ?? '',
    specifications: normalizeStructuredEntries(raw.specifications),
    defects: normalizeStringList(raw.defects),
    includedAccessories: normalizeStringList(raw.included_accessories ?? raw.includedAccessories),
    notes: typeof raw.notes === 'string' ? raw.notes.trim() : '',
    quantity: toNumber(raw.quantity),
    price: toNumber(price),
    eshopPrice: eshopPrice == null ? null : toNumber(eshopPrice),
    sellPrice: sellPrice == null ? null : toNumber(sellPrice),
    compareAtPrice: compareAtPrice == null ? null : toNumber(compareAtPrice),
    discountPercentage: Math.max(0, Math.round(toNumber(raw.discountPercentage ?? raw.discount_percentage ?? 0))),
    manufacturer: raw.manufacturer ?? raw.brand ?? '',
    description: raw.description ?? raw.eshop_description ?? '',
    condition: raw.condition ?? '',
    partNumber: raw.partNumber ?? raw.part_number ?? '',
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

export function buildProductKey(product = {}) {
  return `${product._source ?? product.source ?? 'inventory'}:${product.id}`;
}

export function getProductName(product = {}) {
  return product.name || [product.brand, product.model].filter(Boolean).join(' ') || 'Product';
}

export function getDisplayPrice(product = {}) {
  return toNumber(product.eshopPrice ?? product.sellPrice ?? product.price ?? 0);
}

export function getCompareAtPrice(product = {}) {
  const compareAtPrice = product.compareAtPrice ?? product.compare_at_price;
  const normalized = compareAtPrice == null ? null : toNumber(compareAtPrice);
  return normalized && normalized > getDisplayPrice(product) ? normalized : null;
}

export function getDiscountPercentage(product = {}) {
  if (product.discountPercentage) {
    return Math.max(0, Math.round(toNumber(product.discountPercentage)));
  }

  const displayPrice = getDisplayPrice(product);
  const compareAtPrice = getCompareAtPrice(product);

  if (!compareAtPrice || compareAtPrice <= displayPrice || compareAtPrice <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100));
}

export function getStock(product = {}) {
  if ((product._productType ?? product.type) === 'service') {
    return Infinity;
  }

  return toNumber(product.quantity);
}

export function getPurchasableStock(product = {}) {
  const stock = getStock(product);

  if (stock === Infinity) {
    return Infinity;
  }

  return Math.max(0, Math.floor(stock));
}

export function getStockState(product = {}, lowStockThreshold = 5) {
  const type = product._productType ?? product.type;
  if (type === 'service') {
    return 'service';
  }

  const stock = getPurchasableStock(product);
  if (stock <= 0) {
    return 'out_of_stock';
  }

  const threshold = Math.max(1, toNumber(lowStockThreshold, 5));
  if (stock <= threshold) {
    return 'low_stock';
  }

  return 'in_stock';
}

export function getAvailabilityLabel(product = {}, lowStockThreshold = 5) {
  const stockState = getStockState(product, lowStockThreshold);
  const stock = getPurchasableStock(product);

  if (stockState === 'service') return 'Bookable';
  if (stockState === 'out_of_stock') return 'Out of stock';
  if (stockState === 'low_stock') return `Low stock (${stock} left)`;
  return 'In stock';
}

export function getTypeLabel(type = '') {
  const normalized = String(type ?? '').toLowerCase();

  if (normalized === 'part') return 'Part';
  if (normalized === 'device') return 'Device';
  if (normalized === 'service') return 'Service';
  if (normalized === 'general' || normalized === 'general_product') return 'Accessory';
  return 'Product';
}

export function getConditionLabel(condition = '') {
  const normalized = String(condition ?? '').toLowerCase();

  if (normalized === 'new') return 'New';
  if (normalized === 'used') return 'Used';
  if (normalized === 'refurbished') return 'Refurbished';
  return condition || '';
}

export function deviceStockLabel(category = '') {
  const normalized = String(category ?? '').toLowerCase();

  if (normalized === 'used') return 'Used';
  if (normalized === 'new') return 'New';
  return category || '';
}

export function buildProductBadges(product = {}, options = {}) {
  const badges = [];
  const type = product._productType ?? product.type;
  const discountPercentage = getDiscountPercentage(product);
  const stockState = getStockState(product, options.lowStockThreshold ?? 5);

  if (options.topSeller) {
    badges.push({ label: 'Top seller', tone: 'indigo' });
  }

  if (discountPercentage > 0) {
    badges.push({ label: `-${discountPercentage}%`, tone: 'rose' });
  }

  if (type === 'device' && product.category) {
    badges.push({ label: deviceStockLabel(product.category), tone: 'amber' });
  }

  if (type === 'service') {
    badges.push({ label: 'Bookable', tone: 'sky' });
  }

  if (type === 'part' && product.category) {
    badges.push({ label: product.category, tone: 'slate' });
  }

  if ((type === 'general_product' || type === 'general') && product.category) {
    badges.push({ label: product.category, tone: 'violet' });
  }

  if (product.condition && String(product.condition).toLowerCase() !== String(product.category ?? '').toLowerCase()) {
    badges.push({ label: getConditionLabel(product.condition), tone: 'emerald' });
  }

  if (product.grade) {
    badges.push({ label: `Grade ${product.grade}`, tone: 'emerald' });
  }

  if (stockState === 'low_stock') {
    badges.push({ label: 'Low stock', tone: 'amber' });
  }

  return badges.slice(0, 4);
}

export function getProductSummary(product = {}) {
  if ((product._productType ?? product.type) === 'device') {
    const firstSpec = Array.isArray(product.specifications) ? product.specifications[0] : null;
    if (firstSpec?.value) return firstSpec.value;
    if (typeof firstSpec === 'string') return firstSpec;
    if (product.notes) return product.notes;
    return getConditionLabel(product.condition) || '';
  }

  return product.description || product.partNumber || product.manufacturer || '';
}

export function safeParseCatalogUrl(url = '') {
  try {
    const parsed = new URL(url, 'https://shop.workflow.repair');
    return {
      pathname: parsed.pathname,
      type: parsed.searchParams.get('type') || '',
      category: parsed.searchParams.get('category') || '',
      q: parsed.searchParams.get('q') || '',
    };
  } catch {
    return null;
  }
}

export function saveRecentlyViewedProduct(product) {
  if (!product?.id) return;

  const nextEntry = {
    id: product.id,
    source: product._source ?? product.source ?? 'inventory',
    viewedAt: new Date().toISOString(),
  };

  const existing = getRecentlyViewedEntries();
  const filtered = existing.filter(entry => !(entry.id === nextEntry.id && entry.source === nextEntry.source));
  const nextList = [nextEntry, ...filtered].slice(0, RECENTLY_VIEWED_LIMIT);
  localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(nextList));
}

export function getRecentlyViewedEntries() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter(entry => entry?.id && entry?.source)
      : [];
  } catch {
    return [];
  }
}
