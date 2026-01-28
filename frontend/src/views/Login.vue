<template>
  <div class="login-wrapper">
    <div class="main-content">
      <div class="login-glass-card animate-fade-in">
        <div class="card-header">
          <div class="logo-icon">
            <el-icon :size="32" color="#fff"><Management /></el-icon>
          </div>
          <h1 class="card-title">Stellar Admin</h1>
          <p class="card-subtitle">欢迎回到电商管理中心</p>
        </div>

        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="modern-form"
          label-position="top"
        >
          <el-form-item prop="username" label="用户名">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="glow-button"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="card-footer">
          <span>还没有账号？</span>
          <el-link type="primary" :underline="false">立即注册</el-link>
        </div>
      </div>
    </div>
    
    <!-- Decorative Elements -->
    <div class="decoration circle-1"></div>
    <div class="decoration circle-2"></div>
    <div class="decoration blob-1"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { User, Lock, Management } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const result = await authStore.login(loginForm.username, loginForm.password);
        if (result.success) {
          ElMessage.success({
            message: '登录成功，欢迎回来！',
            plain: true,
            customClass: 'premium-message'
          });
          router.push('/');
        } else {
          ElMessage.error(result.message || '登录失败');
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.login-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: url('../assets/images/login-bg.png') no-repeat center center;
  background-size: cover;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
  }
}

.main-content {
  position: relative;
  index: 10;
  width: 100%;
  max-width: 460px;
  padding: 20px;
}

.login-glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  .card-header {
    text-align: center;
    margin-bottom: 32px;
    
    .logo-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
    }
    
    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .card-subtitle {
      color: #64748b;
      font-size: 15px;
    }
  }
}

.modern-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #475569;
    padding-bottom: 8px;
  }
  
  :deep(.el-input__wrapper) {
    background-color: rgba(248, 250, 252, 0.8);
    box-shadow: none;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0 16px;
    height: 48px;
    transition: all 0.2s ease;
    
    &.is-focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      background-color: #fff;
    }
  }
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.glow-button {
  width: 100%;
  height: 52px !important;
  font-size: 16px !important;
  border-radius: 14px !important;
  margin-top: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
  border: none !important;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 20px -3px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.card-footer {
  margin-top: 32px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  
  .el-link {
    margin-left: 4px;
    vertical-align: baseline;
    font-weight: 600;
  }
}

/* Decorations */
.decoration {
  position: absolute;
  z-index: 1;
  filter: blur(80px);
  opacity: 0.5;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  top: -50px;
  right: -50px;
  border-radius: 50%;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: #a855f7;
  bottom: -100px;
  left: -100px;
  border-radius: 50%;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: #ec4899;
  top: 40%;
  left: 20%;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-glass-card {
    padding: 32px 24px;
    border-radius: 16px;
  }
}
</style>
