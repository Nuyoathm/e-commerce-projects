<template>
  <div class="product-container animate-fade-in">
    <div class="product-page-header">
      <div class="header-title-box">
        <h2 class="page-title">商品库管理</h2>
        <p class="page-subtitle">管理、搜索并发布您的商城商品</p>
      </div>
      <div class="header-actions-group">
        <el-button class="action-btn" :icon="Download" @click="handleExport">导出</el-button>
        <el-button class="action-btn" :icon="Upload" @click="importDialogVisible = true">导入</el-button>
        <el-button type="primary" class="add-btn" :icon="Plus" @click="handleAdd">新增商品</el-button>
      </div>
    </div>

    <el-card class="product-list-card animate-fade-in" v-loading="productStore.loading">
      <div class="table-container">
        <el-table :data="productStore.products" style="width: 100%" row-class-name="product-row">
          <el-table-column label="商品预览" width="100">
            <template #default="{ row }">
              <el-image 
                :src="row.images?.[0]" 
                class="product-thumb"
                :preview-src-list="row.images"
                preview-teleported
                fit="cover"
              >
                <template #error>
                  <div class="image-placeholder"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="商品标题" min-width="240">
            <template #default="{ row }">
              <div class="title-cell">
                <span class="product-title">{{ row.title }}</span>
                <span class="product-id">ID: {{ row._id.substring(0, 8) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="categoryId.name" label="分类" width="140">
            <template #default="{ row }">
              <el-tag effect="light" class="category-tag">{{ row.categoryId?.name || '未分类' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="上架状态" width="120">
            <template #default="{ row }">
              <div class="status-indicator" :class="row.status === 1 ? 'active' : 'inactive'">
                <div class="dot"></div>
                <span>{{ row.status === 1 ? '上架中' : '已下架' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="管理操作" width="160" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-tooltip content="编辑商品" placement="top">
                  <el-button circle class="edit-btn" :icon="Edit" @click="handleEdit(row)" />
                </el-tooltip>
                <el-tooltip content="更多设置" placement="top">
                  <el-button circle class="more-btn" :icon="Setting" />
                </el-tooltip>
                <el-tooltip content="删除商品" placement="top">
                  <el-button circle class="del-btn" :icon="Delete" @click="handleDelete(row)" />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-box">
        <el-pagination
          v-model:current-page="queryParams.page"
          :page-size="queryParams.limit"
          layout="total, prev, pager, next, jumper"
          :total="productStore.total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 商品表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="1000px"
      top="5vh"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入商品标题" />
            </el-form-item>
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="简介" />
            </el-form-item>
            <el-form-item label="轮播图">
              <el-upload
                action="#"
                list-type="picture-card"
                :file-list="imageFileList"
                :http-request="handleCustomUpload"
                :on-remove="handleRemoveImage"
                :on-preview="handlePictureCardPreview"
                :auto-upload="true"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <el-dialog v-model="previewVisible">
                <img :src="previewImageUrl" alt="Preview Image" style="width: 100%" />
              </el-dialog>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
                active-text="上架"
                inactive-text="下架"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="规格与SKU" name="sku">
            <div class="specs-section">
              <div v-for="(spec, sIndex) in form.specs" :key="sIndex" class="spec-item">
                <el-row :gutter="10">
                  <el-col :span="6">
                    <el-input
                      v-model="spec.name"
                      placeholder="规格名, 如颜色"
                      @change="generateSkuMatrix"
                    />
                  </el-col>
                  <el-col :span="14">
                    <div class="tag-input">
                      <el-tag
                        v-for="(val, vIndex) in spec.values"
                        :key="vIndex"
                        closable
                        @close="removeSpecValue(sIndex, vIndex)"
                      >
                        {{ val }}
                      </el-tag>
                      <el-input
                        v-model="specInput[sIndex]"
                        class="new-tag-input"
                        size="small"
                        placeholder="新增属性值"
                        @keyup.enter="addSpecValue(sIndex)"
                        @blur="addSpecValue(sIndex)"
                      />
                    </div>
                  </el-col>
                  <el-col :span="4">
                    <el-button type="danger" circle :icon="Delete" @click="removeSpec(sIndex)" />
                  </el-col>
                </el-row>
              </div>
              <el-button type="primary" plain @click="addSpec">添加规格项</el-button>
            </div>

            <div v-if="form.skus.length > 0" class="sku-section">
              <div class="batch-settings mb-10">
                <span>批量设置：</span>
                <el-input-number v-model="batchPrice" placeholder="价格" :precision="2" :min="0" size="small" />
                <el-input-number v-model="batchStock" placeholder="库存" :min="0" size="small" class="ml-10" />
                <el-button type="primary" size="small" class="ml-10" @click="applyBatch">应用</el-button>
              </div>

              <el-table :data="form.skus" border size="small">
                <el-table-column
                  v-for="spec in form.specs.filter((s) => s.name)"
                  :key="spec.name"
                  :label="spec.name"
                  width="120"
                >
                  <template #default="{ row }">
                    {{ row.specCombo[spec.name] }}
                  </template>
                </el-table-column>
                <el-table-column label="价格" width="150">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.price"
                      :precision="2"
                      :step="0.1"
                      controls-position="right"
                      style="width: 120px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="130">
                  <template #default="{ row }">
                    <el-input-number v-model="row.stock" :min="0" controls-position="right" style="width: 100px" />
                  </template>
                </el-table-column>
                <el-table-column label="预警库存" width="130">
                  <template #default="{ row }">
                    <el-input-number v-model="row.warningStock" :min="0" controls-position="right" style="width: 100px" />
                  </template>
                </el-table-column>
                <el-table-column label="SKU编码" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.skuCode" placeholder="编码" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入商品"
      width="600px"
      @closed="handleImportClosed"
    >
      <div class="import-content">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 .xlsx 文件。第一行为表头，字段顺序：标题、分类名、售价、库存、状态(可选)
            </div>
          </template>
        </el-upload>

        <div v-if="importResult" class="import-result mt-20">
          <el-alert
            :title="`导入完成：成功 ${importResult.successCount} 条，失败 ${importResult.failCount} 条`"
            :type="importResult.failCount > 0 ? 'warning' : 'success'"
            :closable="false"
            show-icon
          />
          
          <div v-if="importResult.errors.length > 0" class="error-table mt-10">
            <el-table :data="importResult.errors" size="small" border height="250px">
              <el-table-column prop="row" label="行号" width="70" />
              <el-table-column prop="title" label="商品名称" width="150" />
              <el-table-column prop="reason" label="失败原因" min-width="200" />
            </el-table>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="importLoading" @click="submitImport">开始导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useProductStore } from '@/store/product';
import { useCategoryStore } from '@/store/category';
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type UploadProps,
  type UploadUserFile,
} from 'element-plus';
import { Delete, Plus, Upload, UploadFilled, Download, Picture, Edit, Setting } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref('');
const activeTab = ref('basic');
const formRef = ref<FormInstance>();

const queryParams = reactive({
  page: 1,
  limit: 10,
});

// Import Logic
const importDialogVisible = ref(false);
const importLoading = ref(false);
const importFile = ref<File | null>(null);
const importResult = ref<any>(null);

const handleFileChange = (file: any) => {
  importFile.value = file.raw;
  importResult.value = null;
};

const submitImport = async () => {
  if (!importFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }
  importLoading.value = true;
  try {
    const res = await productStore.importProducts(importFile.value) as any;
    importResult.value = res;
    if (res.failCount === 0) {
      ElMessage.success('导入全部成功');
    } else {
      ElMessage.warning(`导入部分成功，失败 ${res.failCount} 条`);
    }
    productStore.fetchProducts(queryParams);
  } catch (error: any) {
    console.error('Import failed', error);
  } finally {
    importLoading.value = false;
  }
};

const handleImportClosed = () => {
  importFile.value = null;
  importResult.value = null;
};

const handleExport = async () => {
  try {
    const blob = (await productStore.exportProducts()) as any;
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('Export failed', error);
  }
};

const categoryOptions = ref<any[]>([]);

// Upload & Image Logic
const imageFileList = ref<UploadUserFile[]>([]);
const previewImageUrl = ref('');
const previewVisible = ref(false);

const handleCustomUpload = async (options: any) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post('/api/upload/image', formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.code === 200) {
      const imageUrl = res.data.data.url;
      form.images.push(imageUrl);
      imageFileList.value.push({
        name: file.name,
        url: imageUrl,
      });
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(res.data.msg || '上传失败');
    }
  } catch (error) {
    console.error('Upload Error:', error);
    ElMessage.error('网络错误，上传失败');
  }
};

const handleRemoveImage = (file: any) => {
  const url = file.response ? file.response.url : file.url;
  const index = form.images.indexOf(url);
  if (index !== -1) {
    form.images.splice(index, 1);
  }
};

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  previewImageUrl.value = uploadFile.url!;
  previewVisible.value = true;
};

const specInput = ref<string[]>([]);
const batchPrice = ref<number | null>(null);
const batchStock = ref<number | null>(null);

const applyBatch = () => {
  form.skus.forEach((sku: any) => {
    if (batchPrice.value !== null) sku.price = batchPrice.value;
    if (batchStock.value !== null) sku.stock = batchStock.value;
  });
  ElMessage.success('批量设置成功');
};

const form = reactive({
  title: '',
  categoryId: '',
  description: '',
  status: 1,
  images: [] as string[],
  specs: [] as { name: string; values: string[] }[],
  skus: [] as any[],
});

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

onMounted(async () => {
  console.log('Product Store Instance:', productStore);
  productStore.fetchProducts(queryParams);
  // Flatten categories for select
  await categoryStore.fetchCategoryTree();
  categoryOptions.value = flattenCategories(categoryStore.categories);
});

const flattenCategories = (list: any[]) => {
  let result: any[] = [];
  list.forEach((node) => {
    result.push(node);
    if (node.children) {
      result = result.concat(flattenCategories(node.children));
    }
  });
  return result;
};

const handlePageChange = (val: number) => {
  queryParams.page = val;
  productStore.fetchProducts(queryParams);
};

const handleAdd = () => {
  isEdit.value = false;
  activeTab.value = 'basic';
  imageFileList.value = [];
  Object.assign(form, {
    title: '',
    categoryId: '',
    description: '',
    status: 1,
    images: [],
    specs: [],
    skus: [],
  });
  dialogVisible.value = true;
};

const handleEdit = async (row: any) => {
  isEdit.value = true;
  editId.value = row._id;
  activeTab.value = 'basic';
  const detail = await productStore.getDetail(row._id);
  if (detail) {
    // If categoryId is populated, extract the ID
    const categoryId = typeof detail.categoryId === 'object' ? (detail.categoryId as any)?._id : detail.categoryId;
    Object.assign(form, { ...detail, categoryId });
    // Sync imageFileList for preview
    imageFileList.value = detail.images.map((url) => ({
      name: url.split('/').pop() || 'image',
      url: url,
    }));
    dialogVisible.value = true;
  }
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除商品 "${row.title}" 吗？`).then(async () => {
    await productStore.deleteProduct(row._id);
    productStore.fetchProducts(queryParams);
  });
};

// Specs Management
const addSpec = () => {
  form.specs.push({ name: '', values: [] });
  specInput.value.push('');
};

const removeSpec = (index: number) => {
  form.specs.splice(index, 1);
  specInput.value.splice(index, 1);
  generateSkuMatrix();
};

const addSpecValue = (index: number) => {
  const val = specInput.value[index]?.trim();
  if (val && !form.specs[index].values.includes(val)) {
    form.specs[index].values.push(val);
    generateSkuMatrix();
  }
  specInput.value[index] = '';
};

const removeSpecValue = (sIndex: number, vIndex: number) => {
  form.specs[sIndex].values.splice(vIndex, 1);
  generateSkuMatrix();
};

const generateSkuMatrix = () => {
  const validSpecs = form.specs.filter((s) => s.name && s.values.length > 0);
  if (validSpecs.length === 0) {
    form.skus = [];
    return;
  }

  const combinations = cartesianProduct(validSpecs.map((s) => s.values));

  // Try to preserve existing price/stock if combo matches
  const oldSkus = [...form.skus];

  form.skus = combinations.map((combo) => {
    const comboMap: Record<string, string> = {};
    validSpecs.forEach((spec, i) => {
      comboMap[spec.name] = combo[i];
    });

    const key = JSON.stringify(comboMap);
    const existing = oldSkus.find((s) => JSON.stringify(s.specCombo) === key);

    return (
      existing || {
        specCombo: comboMap,
        price: 0,
        stock: 0,
        skuCode: '',
        warningStock: 10,
      }
    );
  });
};

const cartesianProduct = (arrays: string[][]) => {
  return arrays.reduce(
    (acc, curr) => {
      return acc.flatMap((a) => curr.map((b) => [...a, b]));
    },
    [[]] as string[][],
  );
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // Clean data for backend (avoid sending _id, __v etc if not needed in body)
      const { title, categoryId, description, status, images, specs, skus } = form;
      const submitData = { title, categoryId, description, status, images, specs, skus };

      const res = isEdit.value
        ? await productStore.updateProduct(editId.value, submitData)
        : await productStore.createProduct(submitData);

      if (res.success) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
        dialogVisible.value = false;
        productStore.fetchProducts(queryParams);
      } else {
        ElMessage.error(res.message);
      }
    }
  });
};
</script>

<style scoped lang="scss">
.product-container {
  padding: 4px;
}

.product-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 0 4px;
  
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
  
  .header-actions-group {
    display: flex;
    gap: 12px;
    
    .action-btn {
      background: #fff;
      border: 1px solid #e2e8f0;
      font-weight: 600;
      color: #475569;
    }
  }
}

.product-list-card {
  padding: 10px;
  border-radius: 20px !important;
  border: 1px solid #e2e8f0 !important;
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.product-thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 20px;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .product-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
  }
  
  .product-id {
    font-size: 11px;
    color: #94a3b8;
    font-family: monospace;
  }
}

.category-tag {
  border: none;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  border-radius: 6px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  
  &.active {
    color: #16a34a;
    .dot { background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15); }
  }
  
  &.inactive {
    color: #94a3b8;
    .dot { background: #cbd5e1; }
  }
}

.action-btns {
  display: flex;
  gap: 8px;
  
  .el-button {
    border-color: #f1f5f9;
    background: #fff;
    color: #64748b;
    transition: all 0.2s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }
  
  .edit-btn:hover { color: #6366f1; border-color: #6366f1; }
  .more-btn:hover { color: #22c55e; border-color: #22c55e; }
  .del-btn:hover { color: #ef4444; border-color: #ef4444; }
}

.pagination-box {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}

.specs-section {
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  border: 1px dashed #e2e8f0;
}

.spec-item {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.sku-table-area {
  margin-top: 24px;
  
  .batch-edit-card {
    background: #f1f5f9;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 24px;
    
    .batch-title {
      font-weight: 700;
      color: #1e293b;
      margin-right: 20px;
    }
  }
}
</style>
