import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export interface Spec {
  name: string;
  values: string[];
}

export interface Sku {
  _id?: string;
  skuCode?: string;
  specCombo: Record<string, string>;
  price: number;
  stock: number;
  warningStock: number;
}

export interface Product {
  _id?: string;
  title: string;
  categoryId: string;
  images: string[];
  descRichText?: string;
  specs: Spec[];
  status: number;
  skus?: Sku[];
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const fetchProducts = async (params: { page: number; limit: number; categoryId?: string }) => {
    loading.value = true;
    try {
      const res = (await request.get('/products', { params })) as any;
      products.value = res.items;
      total.value = res.total;
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (data: any) => {
    try {
      await request.post('/products', data);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '创建失败' };
    }
  };

  const updateProduct = async (id: string, data: any) => {
    try {
      await request.put(`/products/${id}`, data);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '更新失败' };
    }
  };

  const getDetail = async (id: string) => {
    try {
      return (await request.get(`/products/${id}/detail`)) as Product;
    } catch (error) {
      console.error('Failed to get product detail', error);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await request.delete(`/products/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || '删除失败' };
    }
  };

  const importProducts = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/products/import', formData);
  };

  const exportProducts = async () => {
    return request.get('/products/export', { responseType: 'blob' });
  };

  return {
    products,
    total,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    getDetail,
    deleteProduct,
    importProducts,
    exportProducts,
  };
});
