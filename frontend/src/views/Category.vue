<template>
  <div class="category">
    <el-card v-loading="categoryStore.loading">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAddRoot">新增一级分类</el-button>
        </div>
      </template>

      <div class="category-content">
        <el-tree
          :data="categoryStore.categories"
          :props="defaultProps"
          node-key="_id"
          default-expand-all
          draggable
          :expand-on-click-node="false"
          @node-drop="handleDrop"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span class="actions">
                <el-link type="primary" @click="handleAddChild(data)">添加子类</el-link>
                <el-divider direction="vertical" />
                <el-link type="warning" @click="handleEdit(data)">编辑</el-link>
                <el-divider direction="vertical" />
                <el-link type="danger" @click="handleDelete(data)">删除</el-link>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 分类弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="padding: 20px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类" v-if="parentIdName">
          <el-tag>{{ parentIdName }}</el-tag>
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useCategoryStore, type Category } from '@/store/category';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';

const categoryStore = useCategoryStore();
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');
const parentIdName = ref('');
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

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
  ElMessageBox.confirm(`确定要删除分类 "${data.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await categoryStore.deleteCategory(data._id);
    if (res.success) {
      ElMessage.success('删除成功');
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
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
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
    ElMessage.success('排序更新成功');
  } else {
    ElMessage.error(res.message);
  }
};
</script>

<style scoped lang="scss">
.category {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .category-content {
    padding: 20px;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    .actions {
      .el-link {
        font-size: 12px;
      }
    }
  }
}
</style>
