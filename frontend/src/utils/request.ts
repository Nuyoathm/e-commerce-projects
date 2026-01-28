import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    // 如果响应是二进制流 (Blob)，直接返回
    if (response.request.responseType === 'blob' || response.data instanceof Blob) {
      return response.data;
    }
    // 后端统一响应格式: { code, msg, data }
    const res = response.data;

    // 如果响应格式正确，返回 data 部分
    if (res.code === 200) {
      return res.data;
    } else {
      // 业务错误
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
  },
  (error) => {
    // HTTP 错误
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      // 如果不是登录接口，才执行登出和跳转
      if (!error.config?.url?.includes('/auth/login')) {
        authStore.logout();
        window.location.href = '/login';
      }
    }
    // 后端统一错误格式: { code, msg, data }
    const errorMsg = error.response?.data?.msg || error.message || '请求失败';
    // 登录接口的错误消息由登录页面处理，这里不显示
    if (!error.config?.url?.includes('/auth/login')) {
      ElMessage.error(errorMsg);
    }
    return Promise.reject(error);
  },
);

export default request;
