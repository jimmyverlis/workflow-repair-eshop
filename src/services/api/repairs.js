import api from '@/services/api'

export const repairsAPI = {
  // Submit a repair request from the eshop
  async createRepair(repairData) {
    const { data } = await api.post('/eshop/repairs', repairData)
    return data
  },

  // Track repair status by device ID / device code
  async getRepairStatus(deviceId, deviceCode = null) {
    const { data } = await api.get(`/eshop/repairs/${deviceId}/status`, {
      params: deviceCode ? { code: deviceCode } : {},
    })
    return data.data
  },
}
