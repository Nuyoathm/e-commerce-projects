import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);
  const isAuthenticated = ref<boolean>(!!token.value);

  const login = async (username: string, password: string) => {
    try {
      const response = await request.post('/auth/login', {
        username,
        password,
      });

      // request 拦截器已处理，直接返回 data 部分: { token, user }
      if (response && (response as any).token) {
        const { token: newToken, user: userData } = response as any;
        token.value = newToken;
        user.value = userData;
        isAuthenticated.value = true;
        localStorage.setItem('token', newToken);
        return { success: true };
      }
      return {
        success: false,
        message: '登录失败',
      };
    } catch (error: any) {
      // 从错误响应中获取消息
      const errorMsg = error.response?.data?.msg || error.message || '登录失败';
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
  };

  const checkAuth = async () => {
    if (!token.value) {
      return;
    }

    try {
      const response = await request.get('/auth/me');
      // request 拦截器已处理，直接返回 data 部分
      if (response) {
        user.value = response as any;
        isAuthenticated.value = true;
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
});
