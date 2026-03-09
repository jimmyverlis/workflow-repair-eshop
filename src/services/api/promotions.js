import api from '@/services/api'

export const promotionsAPI = {
  async validateDiscountCode(storeId, payload) {
    const { data } = await api.post(`/eshop/${storeId}/discount-codes/validate`, payload)
    return data.data
  },
}
