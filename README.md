# 电商后台管理系统 (E-commerce Admin)

这是一个全栈电商后台管理系统，包含了分类管理、商品管理、SKU管理、库存管理及仪表盘统计等功能。

## 技术栈

- **后端**: NestJS + MongoDB (Mongoose) + JWT + Multer
- **前端**: Vue 3 + Vite + Element Plus + Pinia
- **工程化**: ESLint + Prettier + 统一错误码设计

## 快速启动

### 准备工作

1. 确保已安装 [Node.js](https://nodejs.org/) (推荐 v18+)
2. 确保已安装并运行 [MongoDB](https://www.mongodb.com/try/download/community)
3. 推荐使用 [pnpm](https://pnpm.io/) 作为包管理器

### 1. 后端启动 (Backend)

```bash
cd backend
# 安装依赖
pnpm install
# 复制并配置环境变量
cp .env.example .env
# 启动开发服务器
pnpm run start:dev
```

*默认 API 地址*: `http://localhost:3000/api`

### 2. 前端启动 (Frontend)

```bash
cd frontend
# 安装依赖
pnpm install
# 启动开发服务器
pnpm run dev
```

*默认访问地址*: `http://localhost:5173` (或 5174，请根据终端提示)

## 主要功能

- **仪表盘**: 概览平台核心数据及库存预警。
- **商品维护**: 支持规格(SPU/SKU)管理、图片多图上传。
- **库存管理**: 记录每一次入库与出库变动。
- **系统安全**: 基于 JWT 的登录鉴权及全局异常拦截。
- **代码规范**: 前端已接入 Prettier 格式化及 ESLint 校验。

## 统一响应格式

所有接口遵循以下响应格式：
```json
{
  "code": 200,      // 200 为成功，其他为错误码
  "msg": "success",  // 提示消息
  "data": { ... }    // 返回数据
}
```
