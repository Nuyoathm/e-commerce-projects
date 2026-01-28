<template>
  <div class="sku-wrapper animate-fade-in">
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">SKU 单品效能中心</h2>
        <p class="page-subtitle">精细化管理最小明细单元，支持价格实时调整与条码快速检索</p>
      </div>
      <div class="header-search-group">
        <el-input
          v-model="queryParams.skuCode"
          placeholder="检索 SKU 编码 / 规格关键词"
          class="premium-search"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button class="refresh-btn" :icon="Refresh" @click="handleSearch">同步状态</el-button>
      </div>
    </div>

    <el-card class="sku-main-card" shadow="never">
      <el-table 
        v-loading="skuStore.loading" 
        :data="skuStore.skus" 
        style="width: 100%"
        row-class-name="premium-row"
      >
        <el-table-column label="商品定义" min-width="280">
          <template #default="{ row }">
            <div class="sku-meta-box">
              <span class="p-name">{{ getProductTitle(row.productId) }}</span>
              <div class="spec-bubble-group">
                <span v-for="(val, key) in row.specCombo" :key="key" class="spec-bubble">
                  {{ val }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="识别码 (SKU Code)" width="200">
          <template #default="{ row }">
            <el-input 
              v-model="row.skuCode" 
              class="inline-edit-input"
              placeholder="未分配编码"
              @change="fastUpdate(row, 'skuCode')" 
            />
          </template>
        </el-table-column>

        <el-table-column label="市场售价 (CNY)" width="160">
          <template #default="{ row }">
            <div class="price-input-box">
              <span class="currency">¥</span>
              <el-input-number
                v-model="row.price"
                :precision="2"
                :step="0.1"
                :controls="false"
                class="premium-number-input"
                @change="fastUpdate(row, 'price')"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="实时库存 / 警戒位" width="180">
          <template #default="{ row }">
            <div class="inventory-status" :class="{ 'warning': row.stock <= row.warningStock }">
              <div class="progress-mini">
                <div class="progress-inner" :style="{ width: Math.min((row.stock / (row.warningStock * 3 || 100)) * 100, 100) + '%' }"></div>
              </div>
              <div class="num-group">
                <span class="current">{{ row.stock }}</span>
                <span class="sep">/</span>
                <span class="limit">{{ row.warningStock }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="最后同步" width="160">
          <template #default="{ row }">
            <span class="date-text">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="控制" width="80" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="彻底移除此单品" placement="top">
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)" class="sku-del-btn" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          v-model:current-page="queryParams.page"
          :page-size="queryParams.limit"
          layout="total, prev, pager, next, jumper"
          :total="skuStore.total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useSkuStore } from '@/store/sku';
import { useProductStore } from '@/store/product';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';

const skuStore = useSkuStore();
const productStore = useProductStore();

const queryParams = reactive({
  page: 1,
  limit: 10,
  skuCode: '',
});

onMounted(async () => {
  if (productStore.products.length === 0) {
    productStore.fetchProducts({ page: 1, limit: 100 });
  }
  skuStore.fetchSkus(queryParams);
});

const handleSearch = () => {
  queryParams.page = 1;
  skuStore.fetchSkus(queryParams);
};

const handlePageChange = (val: number) => {
  queryParams.page = val;
  skuStore.fetchSkus(queryParams);
};

const getProductTitle = (productId: string) => {
  const p = productStore.products.find((p) => p._id === productId);
  return p ? p.title : '加载中...';
};

const fastUpdate = async (row: any, field: string) => {
  const res = await skuStore.updateSku(row._id, { [field]: row[field] });
  if (res.success) {
    ElMessage.success({
      message: '单品数据已实时同步',
      plain: true
    });
  } else {
    ElMessage.error(res.message);
  }
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('移除 SKU 可能导致关联订单数据异常，确定继续吗？', '重要提示', {
    confirmButtonText: '确定移除',
    cancelButtonText: '取消',
    type: 'warning',
    buttonSize: 'large'
  }).then(async () => {
    const res = await skuStore.deleteSku(row._id);
    if (res.success) {
      ElMessage.success('SKU 已成功移除');
      skuStore.fetchSkus(queryParams);
    } else {
      ElMessage.error(res.message);
    }
  });
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};
</script>

<style scoped lang="scss">
.sku-wrapper {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  
  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px;
  }
  
  .page-subtitle {
    color: #64748b;
    font-size: 14px;
    margin: 0;
  }
}

.header-search-group {
  display: flex;
  gap: 12px;
  
  .premium-search {
    width: 280px;
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
  }
  
  .refresh-btn {
    border-radius: 12px;
    font-weight: 600;
  }
}

.sku-main-card {
  border-radius: 20px !important;
  border: 1px solid #e2e8f0 !important;
}

.sku-meta-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  .p-name {
    font-weight: 700;
    color: #1e293b;
    font-size: 14px;
  }
  
  .spec-bubble-group {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    
    .spec-bubble {
      background: #f1f5f9;
      color: #64748b;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
  }
}

.inline-edit-input {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    background: transparent;
    padding: 0;
    &:hover { background: #f8fafc; padding: 0 8px; }
    &.is-focus { background: #fff; box-shadow: 0 0 0 1px #6366f1; padding: 0 8px; }
  }
  :deep(.el-input__inner) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #475569;
  }
}

.price-input-box {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .currency {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
  }
}

.premium-number-input {
  width: 100px;
  :deep(.el-input__wrapper) {
    box-shadow: none;
    background: transparent;
    &:hover, &.is-focus { background: #f8fafc; }
  }
  :deep(.el-input__inner) {
    font-weight: 700;
    color: #1e293b;
    text-align: left;
  }
}

.inventory-status {
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  .progress-mini {
    width: 60px;
    height: 4px;
    background: #f1f5f9;
    border-radius: 2px;
    overflow: hidden;
    
    .progress-inner {
      height: 100%;
      background: #6366f1;
      border-radius: 2px;
    }
  }
  
  .num-group {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 13px;
    font-weight: 700;
    
    .current { color: #1e293b; }
    .sep { color: #cbd5e1; font-size: 11px; }
    .limit { color: #94a3b8; font-size: 11px; }
  }
  
  &.warning {
    .progress-inner { background: #ef4444; }
    .current { color: #ef4444; }
  }
}

.date-text {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.sku-del-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  &:hover { background: rgba(239, 68, 68, 0.05); }
}

.pagination-area {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}
</style>
