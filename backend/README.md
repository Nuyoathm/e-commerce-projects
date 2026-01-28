# E-commerce Backend

基于 NestJS + TypeScript + MongoDB 的电商后台管理系统后端服务。

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: MongoDB (Mongoose)
- **认证**: JWT + Passport

## 项目结构

```
backend/
├── src/
│   ├── auth/           # 认证模块
│   ├── category/       # 分类模块
│   ├── product/        # 商品模块
│   ├── sku/            # SKU模块
│   ├── stock/          # 库存模块
│   ├── upload/         # 上传模块
│   ├── app.module.ts   # 根模块
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts         # 入口文件
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 安装依赖

```bash
npm install
```

## 环境配置

复制 `.env.example` 为 `.env` 并配置相关参数：

```bash
cp .env.example .env
```

## 初始化用户

首次运行前，需要创建默认用户：

```bash
npm run init:user
```

这将创建两个默认用户：
- **admin** / admin123 (角色: admin)
- **superadmin** / superadmin123 (角色: super_admin)

## 运行项目

### 开发模式
```bash
npm run start:dev
```

### 生产模式
```bash
npm run build
npm run start:prod
```

## API 地址

默认运行在 `http://localhost:3000`

API 前缀: `/api`

## 认证接口

### POST /api/auth/login
用户登录
```json
{
  "username": "admin",
  "password": "admin123"
}
```

响应格式：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### GET /api/auth/me
获取当前用户信息（需要 Authorization Header）

响应格式：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "user_id",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## 统一响应格式

所有接口统一返回格式：
```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

## 模块说明

- **auth**: 用户认证、登录、JWT 令牌管理
- **category**: 商品分类管理
- **product**: 商品管理
- **sku**: SKU（库存量单位）管理
- **stock**: 库存出入库管理
- **upload**: 文件上传服务
