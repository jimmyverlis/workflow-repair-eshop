import api from '@/services/api'

export const retentionAPI = {
  async getWishlist(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/wishlist`)
    return data.data || []
  },

  async addWishlistItem(storeId, itemId, collection = 'inventory') {
    const { data } = await api.post(`/eshop/${storeId}/wishlist`, {
      item_id: itemId,
      collection,
    })
    return data.data
  },

  async removeWishlistItem(storeId, collection, itemId) {
    await api.delete(`/eshop/${storeId}/wishlist/${collection}/${itemId}`)
  },

  async getSavedCarts(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/saved-carts`)
    return data.data || []
  },

  async saveCart(storeId, payload) {
    const { data } = await api.post(`/eshop/${storeId}/saved-carts`, payload)
    return data.data
  },

  async loadSavedCart(storeId, savedCartId) {
    const { data } = await api.post(`/eshop/${storeId}/saved-carts/${savedCartId}/load`)
    return data.data
  },

  async deleteSavedCart(storeId, savedCartId) {
    await api.delete(`/eshop/${storeId}/saved-carts/${savedCartId}`)
  },

  async subscribeToNewsletter(storeId, payload) {
    const { data } = await api.post(`/eshop/${storeId}/newsletter/subscribe`, payload)
    return data.data
  },

  async getReturnRequests(storeId) {
    const { data } = await api.get(`/eshop/${storeId}/return-requests`)
    return data.data || []
  },

  async createReturnRequest(storeId, payload) {
    const { data } = await api.post(`/eshop/${storeId}/return-requests`, payload)
    return data.data
  },
}
