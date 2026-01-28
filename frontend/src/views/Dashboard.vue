<template>
  <div class="dashboard-wrapper animate-fade-in">
    <!-- Stat Overview Grid -->
    <el-row :gutter="24" class="stat-section">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(stat, index) in statsConfig" :key="index">
        <div class="elegant-card stat-card" :class="stat.type">
          <div class="card-body">
            <div class="icon-box">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="card-info">
              <span class="stat-label">{{ stat.label }}</span>
              <div class="stat-value-group">
                <h2 class="stat-value">{{ stat.value }}</h2>
                <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                  <el-icon><component :is="stat.trend > 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
                  {{ Math.abs(stat.trend) }}%
                </span>
              </div>
            </div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>
      </el-col>
    </el-row>

    <!-- Main Dashboard Body -->
    <el-row :gutter="24" class="content-section">
      <el-col :span="16" :xs="24">
        <el-card class="welcome-banner" shadow="never">
          <div class="banner-content">
            <div class="text-group">
              <h1 class="welcome-title">早安, {{ authStore.user?.username || '管理员' }}! ✨</h1>
              <p class="welcome-desc">欢迎回到 Stellar Admin。今天平台运行一切正常，有 3 条新的库存提醒需要您关注。</p>
              <div class="banner-actions">
                <el-button type="primary" size="large" @click="$router.push('/product')">发布新商品</el-button>
                <el-button size="large" class="secondary-btn" @click="$router.push('/stock')">查看库存报表</el-button>
              </div>
            </div>
            <div class="banner-illustration">
              <el-icon :size="120" color="rgba(99, 102, 241, 0.2)"><Management /></el-icon>
            </div>
          </div>
        </el-card>

        <el-card class="data-table-card mt-24" header="近期库存变更" shadow="never">
          <template #header>
            <div class="card-header-flex">
              <span class="header-title">库存动态分析</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <div class="empty-state">
            <el-empty :image-size="100" description="暂无近期大额波动数据" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8" :xs="24">
        <el-card class="quick-nav-card" shadow="never">
          <template #header>
            <span class="header-title">快速操作通道</span>
          </template>
          <div class="nav-grid">
            <div v-for="(nav, nIdx) in shortcuts" :key="nIdx" class="nav-item" @click="$router.push(nav.path)">
              <div class="nav-icon" :style="{ background: nav.color }">
                <el-icon><component :is="nav.icon" /></el-icon>
              </div>
              <span class="nav-label">{{ nav.label }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="news-card mt-24" shadow="never">
          <template #header>
            <span class="header-title">平台公告</span>
          </template>
          <div class="news-list">
            <div class="news-item">
              <div class="news-dot"></div>
              <div class="news-body">
                <p class="news-text">系统计划于本周五凌晨 2:00 进行核心数据库升级...</p>
                <span class="news-time">2小时前</span>
              </div>
            </div>
            <div class="news-item">
              <div class="news-dot success"></div>
              <div class="news-body">
                <p class="news-text">新增 SKU 智能筛选功能，现已全量开启体验。</p>
                <span class="news-time">昨天</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDashboardStore } from '@/store/dashboard';
import { useAuthStore } from '@/store/auth';
import { 
  Goods, Menu, Box, Warning, Management, 
  CaretTop, CaretBottom, ShoppingCart, List, 
  Histogram, Connection
} from '@element-plus/icons-vue';

const dashboardStore = useDashboardStore();
const authStore = useAuthStore();

const statsConfig = computed(() => [
  { label: '商品总数', value: dashboardStore.stats.productCount, icon: Goods, type: 'primary', trend: 12 },
  { label: '分类数量', value: dashboardStore.stats.categoryCount, icon: Menu, type: 'success', trend: 5 },
  { label: 'SKU 总数', value: dashboardStore.stats.skuCount, icon: Box, type: 'info', trend: -2 },
  { label: '库存预警', value: dashboardStore.stats.lowStockCount, icon: Warning, type: 'danger', trend: 8 },
]);

const shortcuts = [
  { label: '发布商品', icon: ShoppingCart, path: '/product', color: 'rgba(99, 102, 241, 0.1)' },
  { label: '分类维护', icon: List, path: '/category', color: 'rgba(34, 197, 94, 0.1)' },
  { label: '库存对账', icon: Histogram, path: '/stock', color: 'rgba(245, 158, 11, 0.1)' },
  { label: '属性设置', icon: Connection, path: '/sku', color: 'rgba(148, 163, 184, 0.1)' },
];

onMounted(() => {
  dashboardStore.fetchOverview();
});
</script>

<style scoped lang="scss">
.dashboard-wrapper {
  padding: 4px;
}

.stat-section {
  margin-bottom: 24px;
}

.elegant-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    
    .card-bg-decoration {
      transform: scale(1.2) rotate(15deg);
    }
  }
}

.stat-card {
  .card-body {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 2;
  }
  
  .icon-box {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 4px;
    display: block;
  }
  
  .stat-value-group {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  
  .stat-trend {
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 20px;
    
    &.up { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
    &.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
  }
  
  .card-bg-decoration {
    position: absolute;
    width: 100px;
    height: 100px;
    right: -20px;
    bottom: -20px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.03;
    transition: all 0.5s ease;
  }
  
  &.primary { .icon-box { background: rgba(99, 102, 241, 0.1); color: #6366f1; } .card-bg-decoration { color: #6366f1; } }
  &.success { .icon-box { background: rgba(34, 197, 94, 0.1); color: #22c55e; } .card-bg-decoration { color: #22c55e; } }
  &.info { .icon-box { background: rgba(148, 163, 184, 0.1); color: #64748b; } .card-bg-decoration { color: #64748b; } }
  &.danger { .icon-box { background: rgba(239, 68, 68, 0.1); color: #ef4444; } .card-bg-decoration { color: #ef4444; } }
}

.welcome-banner {
  background: linear-gradient(135deg, #fff 0%, #f1f5f9 100%) !important;
  border: none !important;
  overflow: visible;
  
  .banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
  }
  
  .welcome-title {
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 12px;
  }
  
  .welcome-desc {
    font-size: 16px;
    color: #64748b;
    max-width: 500px;
    margin-bottom: 32px;
    line-height: 1.6;
  }
  
  .banner-actions {
    display: flex;
    gap: 16px;
    
    .secondary-btn {
      background: #fff;
      border-color: #e2e8f0;
      color: #1e293b;
      
      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    }
  }
}

.mt-24 { margin-top: 24px; }

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    
    &:hover {
      background: #fff;
      border-color: #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    
    .nav-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #64748b;
    }
    
    .nav-label {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }
  }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .news-item {
    display: flex;
    gap: 16px;
    
    .news-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #6366f1;
      flex-shrink: 0;
      margin-top: 6px;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      
      &.success { background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1); }
    }
    
    .news-text {
      font-size: 14px;
      color: #1e293b;
      margin: 0 0 4px;
      line-height: 1.5;
    }
    
    .news-time {
      font-size: 12px;
      color: #94a3b8;
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
