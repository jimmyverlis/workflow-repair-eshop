import api from '@/services/api'

export const paymentsAPI = {
  // Create a Viva Wallet payment order
  async createVivaPayment(paymentData) {
    const { data } = await api.post('/payments/viva/create', paymentData)
    return data
  },

  // Verify a completed payment by transaction ID
  async verifyPayment(transactionId) {
    const { data } = await api.post('/payments/viva/verify', { transaction_id: transactionId })
    return data
  },
}
