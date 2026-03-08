import api from '@/services/api'

export const ordersAPI = {
  // Create order
  async createOrder(orderData) {
    const { data } = await api.post('/eshop/orders', orderData)
    return data
  },

  // Get authenticated customer's orders for a store
  async getCustomerOrders(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/orders`)
    return data.data
  },

  // Get single order by ID (public tracking)
  async getOrder(orderId) {
    const { data } = await api.get(`/eshop/orders/${orderId}`)
    return data.data
  },
}
