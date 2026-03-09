import api from '@/services/api'

export const promotionsAPI = {
  async validateDiscountCode(storeId, payload) {
    const { data } = await api.post(`/eshop/${storeId}/discount-codes/validate`, payload)
    return data.data
  },

  async getSuggestions(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/discount-codes/suggestions`)
    return data.data || []
  },
}
