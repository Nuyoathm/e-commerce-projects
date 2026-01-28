<template>
  <div class="stock-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="库存概览" name="overview">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>库存列表</span>
              <el-input
                v-model="search"
                placeholder="搜索商品标题"
                style="width: 300px"
                :prefix-icon="Search"
              />
            </div>
          </template>

          <el-table v-loading="productStore.loading" :data="filteredSkus" style="width: 100%">
            <el-table-column label="商品信息" min-width="250">
              <template #default="{ row }">
                <div class="sku-info">
                  <span class="product-title">{{ getProductTitle(row.productId) }}</span>
                  <div class="spec-tags">
                    <el-tag
                      v-for="(val, key) in row.specCombo"
                      :key="key"
                      size="small"
                      type="info"
                      effect="plain"
                    >
                      {{ key }}: {{ val }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="skuCode" label="编码" width="150" />
            <el-table-column label="当前库存" width="150">
              <template #default="{ row }">
                <span :class="{ 'low-stock': row.stock <= (row.warningStock || 10) }">
                  {{ row.stock }}
                </span>
                <el-tooltip
                  v-if="row.stock <= (row.warningStock || 10)"
                  content="库存低于预警值"
                  placement="top"
                >
                  <el-icon color="#F56C6C" style="margin-left: 5px"><Warning /></el-icon>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="warningStock" label="预警值" width="100" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleMovement(row, 'IN')">入库</el-button>
                <el-button type="warning" link @click="handleMovement(row, 'OUT')">出库</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="操作记录" name="records">
        <el-table v-loading="stockStore.loading" :data="stockStore.records" style="width: 100%">
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'IN' ? 'success' : 'warning'">
                {{ row.type === 'IN' ? '入库' : '出库' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="qty" label="数量" width="120">
            <template #default="{ row }">
              {{ row.type === 'IN' ? '+' : '-' }}{{ row.qty }}
            </template>
          </el-table-column>
          <el-table-column label="SKU 编码" width="180">
            <template #default="{ row }">
              {{ row.skuId }}
              <!-- We could map this to code if loaded -->
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200" />
          <el-table-column prop="operatorId" label="操作人" width="150" />
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="recordParams.page"
            :page-size="recordParams.limit"
            layout="total, prev, pager, next"
            :total="stockStore.total"
            @current-change="handleRecordPageChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 库存操作弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="moveType === 'IN' ? '商品入库' : '商品出库'"
      width="400px"
    >
      <el-form :model="moveForm" label-width="80px">
        <el-form-item label="变动数量">
          <el-input-number v-model="moveForm.qty" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="moveForm.remark" type="textarea" placeholder="请输入操作原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMovement">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useProductStore } from '@/store/product';
import { useStockStore } from '@/store/stock';
import { ElMessage } from 'element-plus';
import { Search, Warning } from '@element-plus/icons-vue';

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
  // We need to fetch products to get their SKUs
  // For stock mgmt, we might want a dedicated SKU list API,
  // but for now we'll extract from products or fetch a wider page.
  await productStore.fetchProducts({ page: 1, limit: 100 });
  extractSkus();
  stockStore.fetchRecords(recordParams);
});

const extractSkus = () => {
  const skus: any[] = [];
  productStore.products.forEach((p) => {
    // Note: Detail fetch might be needed if products list doesn't have skus.
    // Our backend findAll on products usually returns items.
    // Let's assume for small scale it's fine, or we'll need to fetch details.
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
  return allSkus.value.filter((s) => {
    const title = getProductTitle(s.productId).toLowerCase();
    return title.includes(search.value.toLowerCase());
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
    ElMessage.success('操作成功');
    dialogVisible.value = false;
    // Refresh
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
  return new Date(dateStr).toLocaleString();
};
</script>

<style scoped lang="scss">
.stock-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sku-info {
    .product-title {
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }
    .spec-tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
  }
  .low-stock {
    color: #f56c6c;
    font-weight: bold;
  }
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
