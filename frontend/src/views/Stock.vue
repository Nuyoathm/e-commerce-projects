<template>
  <div class="stock-wrapper animate-fade-in">
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">仓储物流协同中心</h2>
        <p class="page-subtitle">实时监控库存周转，高效追踪每一笔进出库记录</p>
      </div>
      <div class="header-search-box">
        <el-input
          v-model="search"
          placeholder="搜索商品或 SKU 编码..."
          class="premium-search"
          :prefix-icon="Search"
          clearable
        />
      </div>
    </div>

    <el-tabs v-model="activeTab" class="premium-tabs">
      <el-tab-pane label="库存实时概览" name="overview">
        <el-card class="table-card" shadow="never">
          <el-table v-loading="productStore.loading" :data="filteredSkus" style="width: 100%" row-class-name="premium-row">
            <el-table-column label="商品与规格" min-width="300">
              <template #default="{ row }">
                <div class="stock-sku-info">
                  <span class="p-title">{{ getProductTitle(row.productId) }}</span>
                  <div class="spec-chips">
                    <span v-for="(val, key) in row.specCombo" :key="key" class="chip">
                      {{ key }}: {{ val }}
                    </span>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="skuCode" label="唯一代码" width="180">
              <template #default="{ row }">
                <code class="sku-code">{{ row.skuCode || 'N/A' }}</code>
              </template>
            </el-table-column>

            <el-table-column label="可用库存" width="160">
              <template #default="{ row }">
                <div class="stock-counter" :class="{ 'is-low': row.stock <= (row.warningStock || 10) }">
                  <span class="count-num">{{ row.stock }}</span>
                  <el-tag v-if="row.stock <= (row.warningStock || 10)" size="small" type="danger" effect="dark" round>
                    预警
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="库存调度" width="200" fixed="right">
              <template #default="{ row }">
                <div class="dispatch-actions">
                  <el-button class="in-btn" @click="handleMovement(row, 'IN')">
                    <el-icon><CirclePlus /></el-icon>快捷入库
                  </el-button>
                  <el-button class="out-btn" @click="handleMovement(row, 'OUT')">
                    <el-icon><Remove /></el-icon>申请出库
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="全量异动日志" name="records">
        <el-card class="table-card" shadow="never">
          <el-table v-loading="stockStore.loading" :data="stockStore.records" style="width: 100%">
            <el-table-column label="调度时间" width="200">
              <template #default="{ row }">
                <div class="date-cell">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatDate(row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <div class="type-pill" :class="row.type">
                  {{ row.type === 'IN' ? '增加' : '减少' }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="变动量" width="140">
              <template #default="{ row }">
                <span class="qty-num" :class="row.type">
                  {{ row.type === 'IN' ? '+' : '-' }} {{ row.qty }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="关联 SKU" width="220">
              <template #default="{ row }">
                <span class="ref-link">{{ row.skuId }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="remark" label="操作备注" min-width="200">
              <template #default="{ row }">
                <span class="remark-text">{{ row.remark || '系统自动调整' }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="operatorId" label="执行人" width="180">
              <template #default="{ row }">
                <div class="operator-tag">
                  <el-avatar :size="20">{{ row.operatorId?.charAt(0).toUpperCase() }}</el-avatar>
                  <span>{{ row.operatorId || 'SYSTEM' }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-footer">
            <el-pagination
              v-model:current-page="recordParams.page"
              :page-size="recordParams.limit"
              layout="total, prev, pager, next"
              :total="stockStore.total"
              @current-change="handleRecordPageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 库存调度弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="moveType === 'IN' ? '库存补货申请' : '库存核销申请'"
      width="440px"
      align-center
    >
      <div class="dialog-sku-preview">
        <p class="preview-label">正在操作：</p>
        <p class="preview-title">{{ currentSku ? getProductTitle(currentSku.productId) : '' }}</p>
      </div>
      
      <el-form :model="moveForm" label-position="top" class="movement-form">
        <el-form-item label="变动数量（件/套）">
          <el-input-number v-model="moveForm.qty" :min="1" :max="9999" style="width: 100%" border-controls />
        </el-form-item>
        <el-form-item label="事务备注 / 异常说明">
          <el-input 
            v-model="moveForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请详细说明库存变动的原因，如：新批次到货、破损报废等" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消调度</el-button>
          <el-button type="primary" class="submit-btn" @click="confirmMovement">
            确认执行提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useProductStore } from '@/store/product';
import { useStockStore } from '@/store/stock';
import { ElMessage } from 'element-plus';
import { Search, Warning, CirclePlus, Remove, Clock } from '@element-plus/icons-vue';

const productStore = useProductStore();
const stockStore = useStockStore();

const activeTab = ref('overview');
const search = ref('');
const dialogVisible = ref(false);
const moveType = ref<'IN' | 'OUT'>('IN');
const currentSku = ref<any>(null);

const moveForm = reactive({
  qty: 1,
  remark: '',
});

const recordParams = reactive({
  page: 1,
  limit: 20,
});

const allSkus = ref<any[]>([]);

onMounted(async () => {
  await productStore.fetchProducts({ page: 1, limit: 100 });
  extractSkus();
  stockStore.fetchRecords(recordParams);
});

const extractSkus = () => {
  const skus: any[] = [];
  productStore.products.forEach((p) => {
    if (p.skus) {
      p.skus.forEach((s) => {
        skus.push({ ...s, productId: p._id });
      });
    }
  });
  allSkus.value = skus;
};

const filteredSkus = computed(() => {
  if (!search.value) return allSkus.value;
  const q = search.value.toLowerCase();
  return allSkus.value.filter((s) => {
    const title = getProductTitle(s.productId).toLowerCase();
    const code = (s.skuCode || '').toLowerCase();
    return title.includes(q) || code.includes(q);
  });
});

const getProductTitle = (productId: string) => {
  const p = productStore.products.find((p) => p._id === productId);
  return p ? p.title : '未知商品';
};

const handleMovement = (sku: any, type: 'IN' | 'OUT') => {
  currentSku.value = sku;
  moveType.value = type;
  moveForm.qty = 1;
  moveForm.remark = '';
  dialogVisible.value = true;
};

const confirmMovement = async () => {
  const data = {
    skuId: currentSku.value._id,
    qty: moveForm.qty,
    remark: moveForm.remark,
  };

  const res =
    moveType.value === 'IN' ? await stockStore.inStock(data) : await stockStore.outStock(data);

  if (res.success) {
    ElMessage.success('库存调度已完成');
    dialogVisible.value = false;
    await productStore.fetchProducts({ page: 1, limit: 100 });
    extractSkus();
    stockStore.fetchRecords(recordParams);
  } else {
    ElMessage.error(res.message);
  }
};

const handleRecordPageChange = (val: number) => {
  recordParams.page = val;
  stockStore.fetchRecords(recordParams);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
</script>

<style scoped lang="scss">
.stock-wrapper {
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
  
  .premium-search {
    width: 320px;
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
  }
}

.premium-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
    border: none;
    .el-tabs__nav-wrap::after { display: none; }
    .el-tabs__active-bar {
      height: 3px;
      border-radius: 3px;
    }
    .el-tabs__item {
      font-size: 16px;
      font-weight: 600;
      color: #94a3b8;
      &.is-active { color: #6366f1; }
    }
  }
}

.table-card {
  border-radius: 20px !important;
  border: 1px solid #e2e8f0 !important;
}

.stock-sku-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .p-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 15px;
  }
  
  .spec-chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    
    .chip {
      background: #f1f5f9;
      color: #64748b;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
  }
}

.sku-code {
  font-family: 'JetBrains Mono', monospace;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  color: #475569;
  font-size: 12px;
}

.stock-counter {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .count-num {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }
  
  &.is-low .count-num {
    color: #ef4444;
  }
}

.dispatch-actions {
  display: flex;
  gap: 8px;
  
  .el-button {
    border: 1px solid #e2e8f0;
    font-weight: 600;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 10px;
    
    .el-icon { margin-right: 4px; }
  }
  
  .in-btn:hover { color: #22c55e; border-color: #22c55e; background: rgba(34, 197, 94, 0.05); }
  .out-btn:hover { color: #f59e0b; border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.type-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  
  &.IN { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
  &.OUT { background: rgba(245, 158, 11, 0.1); color: #d97706; }
}

.qty-num {
  font-weight: 700;
  font-size: 15px;
  &.IN { color: #16a34a; }
  &.OUT { color: #d97706; }
}

.operator-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
}

.pagination-footer {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}

.dialog-sku-preview {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  
  .preview-label { font-size: 12px; color: #94a3b8; margin: 0 0 4px; }
  .preview-title { font-weight: 700; color: #1e293b; margin: 0; }
}

.submit-btn {
  padding-left: 24px;
  padding-right: 24px;
}
</style>
