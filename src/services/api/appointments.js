import api from '@/services/api'

export const appointmentsAPI = {
  // Get available time slots for a store and date
  async getAvailableSlots(storeId, date, duration = 30) {
    const { data } = await api.get('/eshop/appointments/available-slots', {
      params: { store_id: storeId, date, duration },
    })
    return data
  },

  // Book an appointment from the eshop
  async createAppointment(appointmentData) {
    const { data } = await api.post('/eshop/appointments', appointmentData)
    return data
  },

  // Get customer appointments (by email)
  async getCustomerAppointments(clientEmail, storeId) {
    const { data } = await api.get(`/eshop/customers/${encodeURIComponent(clientEmail)}/appointments`, {
      params: { store_id: storeId },
    })
    return data.data
  },
}
