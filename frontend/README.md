# E-commerce Frontend

基于 Vue3 + Vite + Element Plus + Pinia + Vue Router 的电商后台管理系统前端应用。

## 技术栈

- **框架**: Vue 3.3.x
- **构建工具**: Vite 5.x
- **UI组件库**: Element Plus 2.x
- **状态管理**: Pinia 2.x
- **路由**: Vue Router 4.x
- **HTTP客户端**: Axios
- **语言**: TypeScript

## 项目结构

```
frontend/
├── src/
│   ├── layouts/        # 布局组件
│   │   └── Layout.vue  # 主布局
│   ├── views/          # 页面组件
│   │   ├── Login.vue   # 登录页
│   │   ├── Dashboard.vue
│   │   ├── Category.vue
│   │   ├── Product.vue
│   │   ├── Sku.vue
│   │   └── Stock.vue
│   ├── store/          # Pinia状态管理
│   │   ├── index.ts
│   │   └── auth.ts     # 认证状态
│   ├── router/         # 路由配置
│   │   └── index.ts
│   ├── utils/          # 工具函数
│   │   └── request.ts  # Axios封装
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

## 构建生产版本

```bash
npm run build
```

## 预览生产构建

```bash
npm run preview
```

## 功能模块

- **登录认证**: 用户登录、JWT令牌管理
- **仪表盘**: 数据概览（待实现）
- **分类管理**: 商品分类CRUD（待实现）
- **商品管理**: 商品CRUD（待实现）
- **SKU管理**: SKU管理（待实现）
- **库存管理**: 库存出入库（待实现）

## 路由说明

- `/login` - 登录页
- `/dashboard` - 仪表盘
- `/category` - 分类管理
- `/product` - 商品管理
- `/sku` - SKU管理
- `/stock` - 库存管理

所有业务路由都需要登录认证，未登录会自动跳转到登录页。
