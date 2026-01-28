import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/css/main.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';


import App from './App.vue';
import router from './router';
import { useAuthStore } from './store/auth';

const app = createApp(App);
const pinia = createPinia();

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});

// 初始化时检查认证状态
const authStore = useAuthStore();
authStore.checkAuth();

app.mount('#app');
