import api from '@/services/api'
import { storeConfig } from '@/config/store'

export const paymentsAPI = {
  // Create a Viva Wallet payment order
  async createVivaPayment(paymentData) {
    const { data } = await api.post('/payments/viva/create', {
      ...paymentData,
      environment: paymentData.environment || storeConfig.environment,
    })
    return data
  },

  // Verify a completed payment by transaction ID
  async verifyPayment(transactionId) {
    const { data } = await api.post('/payments/viva/verify', {
      transaction_id: transactionId,
      environment: storeConfig.environment,
    })
    return data
  },
}
