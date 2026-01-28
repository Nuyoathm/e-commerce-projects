<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>电商后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HouseIcon /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><MenuIcon /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><GoodsIcon /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/sku">
          <el-icon><BoxIcon /></el-icon>
          <span>SKU管理</span>
        </el-menu-item>
        <el-menu-item index="/stock">
          <el-icon><FilesIcon /></el-icon>
          <span>库存管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserIcon /></el-icon>
              {{ authStore.user?.username || '用户' }}
              <el-icon class="el-icon--right"><ArrowDownIcon /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import {
  House as HouseIcon,
  Menu as MenuIcon,
  Goods as GoodsIcon,
  Box as BoxIcon,
  Files as FilesIcon,
  User as UserIcon,
  ArrowDown as ArrowDownIcon,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeMenu = computed(() => route.path);
const currentTitle = computed(() => route.meta.title || '首页');

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3a4b;

    h2 {
      color: #fff;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .sidebar-menu {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-left {
    flex: 1;
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #606266;

      .el-icon {
        margin-right: 5px;
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
