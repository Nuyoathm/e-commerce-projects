<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '80px' : '260px'" class="sidebar-aside animate-slide-in">
      <div class="sidebar-wrapper glass-sidebar">
        <div class="logo-container">
          <div class="logo-icon-box">
            <el-icon :size="24" color="#fff"><TrendCharts /></el-icon>
          </div>
          <h2 v-if="!isCollapse" class="logo-text">Stellar Admin</h2>
        </div>
        
        <el-scrollbar class="menu-scrollbar">
          <el-menu
            :default-active="activeMenu"
            :collapse="isCollapse"
            router
            class="premium-menu"
          >
            <el-menu-item index="/dashboard">
              <el-icon><HouseIcon /></el-icon>
              <template #title>仪表盘</template>
            </el-menu-item>
            
            <div class="menu-group-title" v-if="!isCollapse">内容管理</div>
            
            <el-menu-item index="/category">
              <el-icon><MenuIcon /></el-icon>
              <template #title>分类管理</template>
            </el-menu-item>
            <el-menu-item index="/product">
              <el-icon><GoodsIcon /></el-icon>
              <template #title>商品管理</template>
            </el-menu-item>
            
            <div class="menu-group-title" v-if="!isCollapse">库存系统</div>
            
            <el-menu-item index="/sku">
              <el-icon><BoxIcon /></el-icon>
              <template #title>SKU管理</template>
            </el-menu-item>
            <el-menu-item index="/stock">
              <el-icon><FilesIcon /></el-icon>
              <template #title>库存对账</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
        
        <div class="sidebar-footer" v-if="!isCollapse">
          <div class="footer-card">
            <p>需协助？</p>
            <el-button size="small" type="primary" link @click="openDocs">查看文档</el-button>
          </div>
        </div>
      </div>
    </el-aside>
    
    <el-container class="main-body">
      <el-header class="glass-header">
        <div class="header-left">
          <div class="fold-btn" @click="isCollapse = !isCollapse">
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <el-breadcrumb separator-icon="ArrowRight" class="custom-breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <div class="header-actions">
            <el-tooltip content="通知" placement="bottom">
              <div class="action-item"><el-icon :size="20"><Bell /></el-icon></div>
            </el-tooltip>
            <el-tooltip content="搜索" placement="bottom">
              <div class="action-item"><el-icon :size="20"><Search /></el-icon></div>
            </el-tooltip>
          </div>
          
          <div class="divider"></div>
          
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-block">
              <el-avatar :size="32" class="user-avatar">
                {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
              </el-avatar>
              <div class="user-meta" v-if="!isMobile">
                <span class="username">{{ authStore.user?.username || '管理员' }}</span>
                <span class="role">超级管理员</span>
              </div>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown">
                <el-dropdown-item>
                  <el-icon><User /></el-icon>个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" class="logout-btn">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import {
  House as HouseIcon,
  Menu as MenuIcon,
  Goods as GoodsIcon,
  Box as BoxIcon,
  Files as FilesIcon,
  TrendCharts,
  Expand,
  Fold,
  ArrowRight,
  Bell,
  Search,
  User,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isCollapse = ref(false);
const isMobile = ref(false);

const activeMenu = computed(() => route.path);
const currentTitle = computed(() => route.meta.title || '首页');

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout();
    router.push('/login');
  }
};

const checkSize = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) isCollapse.value = true;
};

const openDocs = () => {
  window.open('/help.html', '_blank');
};

onMounted(() => {
  checkSize();
  window.addEventListener('resize', checkSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkSize);
});
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  background-color: #f8fafc;
}

.sidebar-aside {
  padding: 16px 0 16px 16px;
  background: transparent;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.glass-sidebar {
  height: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.logo-container {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  
  .logo-icon-box {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.5px;
  }
}

.menu-scrollbar {
  flex: 1;
  padding: 0 12px;
}

.premium-menu {
  border: none !important;
  
  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    margin: 4px 0;
    border-radius: 12px;
    color: #64748b;
    
    &:hover {
      background-color: #f1f5f9;
      color: #1e293b;
    }
    
    &.is-active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      color: #6366f1;
      font-weight: 600;
      
      .el-icon {
        color: #6366f1;
      }
    }
    
    .el-icon {
      font-size: 18px;
      margin-right: 12px;
    }
  }
}

.menu-group-title {
  padding: 20px 24px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-footer {
  padding: 20px;
  
  .footer-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    border: 1px solid #f1f5f9;
    
    p {
      margin: 0 0 8px;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
  }
}

.main-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.glass-header {
  height: 70px !important;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  
  .fold-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
    
    &:hover {
      background-color: #f1f5f9;
      color: #1e293b;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .header-actions {
    display: flex;
    gap: 4px;
    
    .action-item {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f1f5f9;
        color: #1e293b;
      }
    }
  }
  
  .divider {
    width: 1px;
    height: 24px;
    background-color: #e2e8f0;
  }
}

.user-block {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
  }
  
  .user-avatar {
    background: var(--primary-gradient);
    font-weight: 700;
  }
  
  .user-meta {
    display: flex;
    flex-direction: column;
    
    .username {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.2;
    }
    
    .role {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

.content-wrapper {
  padding: 0;
  overflow-x: hidden;
}

/* Animations & Transitions */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in {
  animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
