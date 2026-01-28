<template>
  <div class="category-wrapper animate-fade-in">
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">全类目映射中心</h2>
        <p class="page-subtitle">构建灵活的商品层级结构，支持无限级分类与实时排序</p>
      </div>
      <div class="action-section">
        <el-button type="primary" class="premium-add-btn" :icon="Plus" @click="handleAddRoot">新增根分类</el-button>
      </div>
    </div>

    <el-card class="category-main-card" v-loading="categoryStore.loading" shadow="never">
      <div class="tree-container">
        <el-tree
          :data="categoryStore.categories"
          :props="defaultProps"
          node-key="_id"
          default-expand-all
          draggable
          :expand-on-click-node="false"
          @node-drop="handleDrop"
          class="custom-premium-tree"
        >
          <template #default="{ node, data }">
            <div class="tree-node-item">
              <div class="node-info">
                <el-icon class="node-icon" :color="data.children?.length > 0 ? '#6366f1' : '#94a3b8'">
                  <component :is="data.children?.length > 0 ? 'FolderOpened' : 'Document'" />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
                <el-tag v-if="data.status === 0" size="small" type="info" class="status-tag">已禁用</el-tag>
              </div>
              
              <div class="node-actions">
                <el-tooltip content="添加子分类" placement="top">
                  <el-button link type="primary" :icon="Plus" @click.stop="handleAddChild(data)" />
                </el-tooltip>
                <el-tooltip content="修改信息" placement="top">
                  <el-button link type="primary" :icon="Edit" @click.stop="handleEdit(data)" />
                </el-tooltip>
                <el-tooltip content="删除分类" placement="top">
                  <el-button link type="danger" :icon="Delete" @click.stop="handleDelete(data)" />
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 分类编辑/新增弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑分类信息' : '创建新分类'" 
      width="500px"
      class="premium-dialog"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="premium-form">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" size="large" />
        </el-form-item>
        
        <el-form-item label="上级分类" v-if="parentIdName">
          <div class="parent-reference">
            <el-icon><Connection /></el-icon>
            <span>{{ parentIdName }}</span>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="全局排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效状态" prop="status">
              <el-segmented v-model="form.status" :options="statusOptions" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述说明" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="关于该分类的业务定义或备注信息" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit" size="large" class="confirm-btn">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useCategoryStore, type Category } from '@/store/category';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { 
  Plus, Edit, Delete, FolderOpened, Document, 
  Connection 
} from '@element-plus/icons-vue';

const categoryStore = useCategoryStore();
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');
const parentIdName = ref('');
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const defaultProps = {
  children: 'children',
  label: 'name',
};

const form = reactive({
  name: '',
  parentId: null as string | null,
  sort: 0,
  status: 1,
  description: '',
});

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
};

onMounted(() => {
  categoryStore.fetchCategoryTree();
});

const resetForm = () => {
  form.name = '';
  form.parentId = null;
  form.sort = 0;
  form.status = 1;
  form.description = '';
  parentIdName.value = '';
  currentId.value = '';
};

const handleAddRoot = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleAddChild = (data: Category) => {
  isEdit.value = false;
  resetForm();
  form.parentId = data._id;
  parentIdName.value = data.name;
  dialogVisible.value = true;
};

const handleEdit = (data: Category) => {
  isEdit.value = true;
  currentId.value = data._id;
  form.name = data.name;
  form.parentId = data.parentId || null;
  form.sort = data.sort;
  form.status = data.status;
  form.description = data.description || '';
  dialogVisible.value = true;
};

const handleDelete = (data: Category) => {
  ElMessageBox.confirm(`确定要删除分类 "${data.name}" 吗？`, '高危操作', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error',
    buttonSize: 'large',
  }).then(async () => {
    const res = await categoryStore.deleteCategory(data._id);
    if (res.success) {
      ElMessage.success('类目已成功移除');
    } else {
      ElMessage.error(res.message);
    }
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      let res;
      if (isEdit.value) {
        res = await categoryStore.updateCategory(currentId.value, form);
      } else {
        res = await categoryStore.createCategory(form);
      }
      submitLoading.value = false;
      if (res.success) {
        ElMessage.success({
          message: isEdit.value ? '类目信息更新成功' : '新类目已成功创建',
          plain: true
        });
        dialogVisible.value = false;
      } else {
        ElMessage.error(res.message);
      }
    }
  });
};

const handleDrop = async (draggingNode: any, dropNode: any, dropType: string) => {
  const pNode = dropType === 'inner' ? dropNode : dropNode.parent;
  const parentId = pNode && pNode.data ? pNode.data._id : null;
  const siblingNodes = pNode ? pNode.childNodes : draggingNode.parent.childNodes;

  const items = siblingNodes.map((node: any, index: number) => ({
    id: node.data._id,
    parentId,
    sort: index,
  }));

  const res = await categoryStore.updateSort(items);
  if (res.success) {
    ElMessage.success('类目层级与顺序调整成功');
  } else {
    ElMessage.error(res.message);
  }
};
</script>

<style scoped lang="scss">
.category-wrapper {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  
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

.category-main-card {
  border-radius: 20px !important;
  border: 1px solid #e2e8f0 !important;
  
  .tree-container {
    padding: 12px;
  }
}

.custom-premium-tree {
  background: transparent;
  
  :deep(.el-tree-node__content) {
    height: 52px;
    border-radius: 12px;
    margin: 2px 0;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f8fafc;
      .node-actions { opacity: 1; }
    }
  }
  
  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: rgba(99, 102, 241, 0.05);
    color: #6366f1;
  }
}

.tree-node-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 16px;
  
  .node-info {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .node-icon {
      font-size: 18px;
    }
    
    .node-label {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
    }
    
    .status-tag {
      font-size: 10px;
      font-weight: 700;
      transform: scale(0.85);
    }
  }
  
  .node-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    
    .el-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }
  }
}

.premium-form {
  padding: 0 8px;
  
  .parent-reference {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f1f5f9;
    border-radius: 12px;
    color: #475569;
    font-weight: 600;
    font-size: 14px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  
  .confirm-btn {
    padding-left: 32px;
    padding-right: 32px;
  }
}

:deep(.el-segmented) {
  --el-segmented-bg-color: #f1f5f9;
  --el-segmented-item-selected-bg-color: #fff;
  --el-segmented-item-selected-color: #6366f1;
  font-weight: 600;
}
</style>
