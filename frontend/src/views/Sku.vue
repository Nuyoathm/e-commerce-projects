<template>
  <div class="sku-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SKU 列表</span>
          <div class="header-ops">
            <el-input
              v-model="queryParams.skuCode"
              placeholder="搜索 SKU 编码"
              style="width: 250px; margin-right: 15px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button type="primary" :icon="Refresh" @click="handleSearch">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="skuStore.loading" :data="skuStore.skus" style="width: 100%">
        <el-table-column label="商品/型号" min-width="250">
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

        <el-table-column prop="skuCode" label="编码" width="180">
          <template #default="{ row }">
            <el-input v-model="row.skuCode" size="small" @change="fastUpdate(row, 'skuCode')" />
          </template>
        </el-table-column>

        <el-table-column label="售价" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.price"
              :precision="2"
              :step="1"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="fastUpdate(row, 'price')"
            />
          </template>
        </el-table-column>

        <el-table-column label="库存/预警" width="150">
          <template #default="{ row }">
            <div class="stock-display">
              <span :class="{ 'low-stock': row.stock <= row.warningStock }">{{ row.stock }}</span>
              <span class="stock-separator">/</span>
              <span class="warning-val">{{ row.warningStock }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          :page-size="queryParams.limit"
          layout="total, prev, pager, next"
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
import { Search, Refresh } from '@element-plus/icons-vue';

const skuStore = useSkuStore();
const productStore = useProductStore();

const queryParams = reactive({
  page: 1,
  limit: 10,
  skuCode: '',
});

onMounted(async () => {
  // Need product list for titles
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
    ElMessage.success('更新成功');
  } else {
    ElMessage.error(res.message);
  }
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('删除 SKU 将不可恢复，确定吗？', '警告', {
    type: 'warning',
  }).then(async () => {
    const res = await skuStore.deleteSku(row._id);
    if (res.success) {
      ElMessage.success('删除成功');
      skuStore.fetchSkus(queryParams);
    } else {
      ElMessage.error(res.message);
    }
  });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};
</script>

<style scoped lang="scss">
.sku-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-ops {
      display: flex;
      align-items: center;
    }
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
  .stock-display {
    font-size: 14px;
    .low-stock {
      color: #f56c6c;
      font-weight: bold;
    }
    .stock-separator {
      margin: 0 4px;
      color: #c0c4cc;
    }
    .warning-val {
      color: #909399;
    }
  }
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
