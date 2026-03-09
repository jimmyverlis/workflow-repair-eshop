import api from '@/services/api';

export const backInStockAPI = {
  async create(storeId, payload) {
    const { data } = await api.post(`/eshop/${storeId}/back-in-stock-requests`, payload);
    return data.data;
  },
};
