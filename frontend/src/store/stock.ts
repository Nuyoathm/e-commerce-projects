import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export interface StockRecord {
  _id: string;
  skuId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  operatorId: string;
  remark?: string;
  createdAt: string;
}

export const useStockStore = defineStore('stock', () => {
  const records = ref<StockRecord[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const fetchRecords = async (params: { page: number; limit: number }) => {
    loading.value = true;
    try {
      const res = (await request.get('/stock/records', { params })) as any;
      records.value = res.items;
      total.value = res.total;
    } catch (error) {
      console.error('Failed to fetch stock records', error);
    } finally {
      loading.value = false;
    }
  };

  const inStock = async (data: { skuId: string; qty: number; remark?: string }) => {
    try {
      await request.post('/stock/in', data);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '入库失败' };
    }
  };

  const outStock = async (data: { skuId: string; qty: number; remark?: string }) => {
    try {
      await request.post('/stock/out', data);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '出库失败' };
    }
  };

  return {
    records,
    total,
    loading,
    fetchRecords,
    inStock,
    outStock,
  };
});
