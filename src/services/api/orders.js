import api from '@/services/api'

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

const normalizeAddress = (address = null) => {
  if (!address || typeof address !== 'object') {
    return null
  }

  return {
    ...address,
    postalCode: address.postalCode ?? address.postal_code ?? '',
  }
}

const normalizeOrderItem = (item = {}) => {
  const quantity = Math.max(1, toNumber(item.quantity, 1))
  const unitPrice = toNumber(
    item.unitPrice ?? item.unit_price ?? item.price,
    quantity > 0 ? toNumber(item.subtotal ?? item.total, 0) / quantity : 0,
  )
  const subtotal = toNumber(item.subtotal ?? item.total, unitPrice * quantity)

  return {
    ...item,
    itemId: item.itemId ?? item.inventoryId ?? item.item_id ?? item.inventory_id ?? null,
    inventoryId: item.inventoryId ?? item.itemId ?? item.inventory_id ?? item.item_id ?? null,
    collection: item.collection ?? 'inventory',
    quantity,
    unitPrice,
    subtotal,
    total: toNumber(item.total, subtotal),
    price: unitPrice,
  }
}

const normalizeOrder = (order = {}) => {
  const shippingAddress = normalizeAddress(
    order.shippingAddress ?? order.shipping_address ?? order.shipping?.address ?? null,
  )
  const billingAddress = normalizeAddress(order.billingAddress ?? order.billing_address ?? null)
  const shipping = order.shipping && typeof order.shipping === 'object'
    ? {
        ...order.shipping,
        address: shippingAddress ?? normalizeAddress(order.shipping.address ?? null),
        trackingNumber: order.shipping.trackingNumber ?? order.shipping.tracking_number ?? null,
      }
    : (shippingAddress ? { address: shippingAddress, trackingNumber: null } : null)

  return {
    ...order,
    id: order.id ?? order.orderId ?? null,
    orderId: order.orderId ?? order.id ?? null,
    orderNumber: order.orderNumber ?? order.order_number ?? '',
    createdAt: order.createdAt ?? order.created_at ?? null,
    updatedAt: order.updatedAt ?? order.updated_at ?? null,
    deliveryMethod: order.deliveryMethod ?? order.delivery_method ?? 'store_pickup',
    paymentMethod: order.paymentMethod ?? order.payment_method ?? null,
    paymentStatus: order.paymentStatus ?? order.payment_status ?? 'pending',
    discountCode: order.discountCode ?? order.discount_code ?? null,
    shippingCost: toNumber(order.shippingCost ?? order.shipping_cost),
    subtotal: toNumber(order.subtotal),
    vatAmount: toNumber(order.vatAmount ?? order.vat_amount),
    discountAmount: toNumber(order.discountAmount ?? order.discount_amount),
    totalAmount: toNumber(order.totalAmount ?? order.total_amount),
    billingAddress,
    shippingAddress,
    shipping,
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
  }
}

export const ordersAPI = {
  // Create order
  async createOrder(orderData) {
    const { data } = await api.post('/eshop/orders', orderData)
    return data
  },

  // Get authenticated customer's orders for a store
  async getCustomerOrders(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/orders`)
    return Array.isArray(data.data) ? data.data.map(normalizeOrder) : []
  },

  // Get single order by ID (public tracking)
  async getOrder(orderId) {
    const { data } = await api.get(`/eshop/orders/${orderId}`)
    return data.data ? normalizeOrder(data.data) : null
  },
}
