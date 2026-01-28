import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export interface OverviewStats {
  productCount: number;
  categoryCount: number;
  skuCount: number;
  lowStockCount: number;
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<OverviewStats>({
    productCount: 0,
    categoryCount: 0,
    skuCount: 0,
    lowStockCount: 0,
  });
  const loading = ref(false);

  const fetchOverview = async () => {
    loading.value = true;
    try {
      const res = (await request.get('/stats/overview')) as any;
      stats.value = res;
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    loading,
    fetchOverview,
  };
});
