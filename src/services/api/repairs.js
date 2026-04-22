import api from '@/services/api'

export const repairsAPI = {
  // Legacy: simple repair intake form (no payment)
  async createRepair(repairData) {
    const { data } = await api.post('/eshop/repairs', repairData)
    return data
  },

  // New: repair booking with service selection and payment
  async createRepairBooking(bookingData) {
    const { data } = await api.post('/eshop/repair-bookings', bookingData)
    return data
  },

  // Fetch repair services (inventory items of type service) for the store
  // Pass category to filter to relevant services only (null = all)
  async getRepairServices(storeId, category = null) {
    const params = category ? { category } : {}
    const { data } = await api.get(`/eshop/${storeId}/repair-services`, { params })
    return data.data || []
  },

  // Fetch known device models for autocomplete
  async getDeviceModels(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/device-models`)
    return data.data || []
  },

  // Look up a device model by IMEI (uses TAC prefix, first 8 digits)
  async lookupDeviceByImei(storeId, imei) {
    const { data } = await api.get(`/eshop/${storeId}/device-models/lookup-by-imei`, { params: { imei } })
    return data
  },

  // Track repair status by device ID / device code
  async getRepairStatus(deviceId, deviceCode = null) {
    const { data } = await api.get(`/eshop/repairs/${deviceId}/status`, {
      params: deviceCode ? { code: deviceCode } : {},
    })
    return data.data
  },

  // Get repair offer details (for customer payment page, token-based)
  async getRepairOffer(token) {
    const { data } = await api.get(`/eshop/repair-offers/${token}`)
    return data.data
  },

  // Customer initiates payment for a repair offer
  async payRepairOffer(token) {
    const { data } = await api.post(`/eshop/repair-offers/${token}/pay`)
    return data
  },
}
