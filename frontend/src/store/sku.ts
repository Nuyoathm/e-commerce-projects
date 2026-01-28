import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export interface Sku {
  _id: string;
  productId: string;
  skuCode?: string;
  specCombo: Record<string, string>;
  price: number;
  stock: number;
  warningStock: number;
  createdAt: string;
}

export const useSkuStore = defineStore('sku', () => {
  const skus = ref<Sku[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const fetchSkus = async (params: { page: number; limit: number; skuCode?: string }) => {
    loading.value = true;
    try {
      const res = (await request.get('/sku', { params })) as any;
      skus.value = res.items;
      total.value = res.total;
    } catch (error) {
      console.error('Failed to fetch SKUs', error);
    } finally {
      loading.value = false;
    }
  };

  const updateSku = async (id: string, data: any) => {
    try {
      await request.put(`/sku/${id}`, data);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '更新失败' };
    }
  };

  const deleteSku = async (id: string) => {
    try {
      await request.delete(`/sku/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '删除失败' };
    }
  };

  return {
    skus,
    total,
    loading,
    fetchSkus,
    updateSku,
    deleteSku,
  };
});
