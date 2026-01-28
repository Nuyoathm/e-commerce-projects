<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card product-card">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="data-wrapper">
              <div class="label">商品总数</div>
              <div class="value">{{ dashboardStore.stats.productCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card category-card">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon><Menu /></el-icon>
            </div>
            <div class="data-wrapper">
              <div class="label">分类数量</div>
              <div class="value">{{ dashboardStore.stats.categoryCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card sku-card">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon><Box /></el-icon>
            </div>
            <div class="data-wrapper">
              <div class="label">SKU 总数</div>
              <div class="value">{{ dashboardStore.stats.skuCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning-card">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="data-wrapper">
              <div class="label">库存预警</div>
              <div class="value color-danger">{{ dashboardStore.stats.lowStockCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card header="系统概况" shadow="never">
          <div class="welcome-section">
            <h3>欢迎回来, {{ authStore.user?.username }}</h3>
            <p>
              这里是电商平台的后台管理中心。你可以通过左侧菜单管理商品、分类、SKU以及查看库存状态。
            </p>
            <div class="quick-actions">
              <el-button type="primary" plain @click="$router.push('/product')">管理商品</el-button>
              <el-button type="success" plain @click="$router.push('/stock')">库存盘点</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="快捷入口" shadow="never">
          <div class="shortcut-list">
            <div class="shortcut-item" @click="$router.push('/category')">
              <el-icon><Menu /></el-icon>
              <span>分类管理</span>
            </div>
            <div class="shortcut-item" @click="$router.push('/sku')">
              <el-icon><Box /></el-icon>
              <span>SKU 维护</span>
            </div>
            <div class="shortcut-item" @click="$router.push('/stock')">
              <el-icon><Files /></el-icon>
              <span>变动记录</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/store/dashboard';
import { useAuthStore } from '@/store/auth';
import { Goods, Menu, Box, Warning, Files } from '@element-plus/icons-vue';

const dashboardStore = useDashboardStore();
const authStore = useAuthStore();

onMounted(() => {
  dashboardStore.fetchOverview();
});
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 10px;

  .stat-cards {
    .stat-card {
      border: none;
      border-radius: 12px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .card-content {
        display: flex;
        align-items: center;

        .icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-right: 15px;
        }

        .data-wrapper {
          .label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
          }
          .value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
          .color-danger {
            color: #f56c6c;
          }
        }
      }

      &.product-card .icon-wrapper {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
      &.category-card .icon-wrapper {
        background: rgba(103, 194, 58, 0.1);
        color: #67c23a;
      }
      &.sku-card .icon-wrapper {
        background: rgba(144, 147, 153, 0.1);
        color: #909399;
      }
      &.warning-card .icon-wrapper {
        background: rgba(245, 108, 108, 0.1);
        color: #f56c6c;
      }
    }
  }

  .mt-20 {
    margin-top: 20px;
  }

  .welcome-section {
    padding: 20px 0;
    h3 {
      margin-bottom: 10px;
      color: #303133;
    }
    p {
      color: #606266;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .quick-actions {
      display: flex;
      gap: 10px;
    }
  }

  .shortcut-list {
    .shortcut-item {
      display: flex;
      align-items: center;
      padding: 12px;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background-color: #f5f7fa;
        color: #409eff;
      }

      .el-icon {
        font-size: 18px;
        margin-right: 10px;
      }
      span {
        font-size: 14px;
      }
    }
  }
}
</style>
