import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  sort: number;
  status: number;
  children?: Category[];
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  const fetchCategoryTree = async () => {
    loading.value = true;
    try {
      const response = await request.get('/categories/tree');
      categories.value = response as any;
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (data: Partial<Category>) => {
    try {
      await request.post('/categories', data);
      await fetchCategoryTree();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.msg || '创建失败',
      };
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await request.put(`/categories/${id}`, data);
      await fetchCategoryTree();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.msg || '更新失败',
      };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await request.delete(`/categories/${id}`);
      await fetchCategoryTree();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.msg || '删除失败',
      };
    }
  };

  const updateSort = async (items: { id: string; parentId: string | null; sort: number }[]) => {
    try {
      await request.post('/categories/sort', { items });
      await fetchCategoryTree();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.msg || '排序更新失败',
      };
    }
  };

  return {
    categories,
    loading,
    fetchCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory,
    updateSort,
  };
});
