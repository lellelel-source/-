# 券码核销系统 - 部署指南

## 概述
本项目是一个券码核销手机H5应用，后端使用Node.js + Express，数据库使用MySQL 8.0，支持部署到Vercel平台。

## 技术栈
- **后端**: Node.js 18+ + Express.js
- **数据库**: MySQL 8.0
- **部署平台**: Vercel
- **认证**: JWT
- **加密**: bcryptjs

## 本地开发环境设置

### 1. 安装依赖
```bash
npm install
```

### 2. 环境变量配置
复制 `env.example` 到 `.env` 并配置以下变量：

```env
# 服务器端口
PORT=3000

# JWT密钥 - 生产环境请使用复杂的随机字符串
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=coupon_system

# 或者使用MySQL连接URL（推荐用于Vercel部署）
DATABASE_URL=mysql://username:password@hostname:port/database_name

# 环境模式
NODE_ENV=development

# API请求限制（每15分钟）
RATE_LIMIT_MAX=100

# 密码加密强度
BCRYPT_ROUNDS=10
```

### 3. 数据库设置
确保MySQL 8.0已安装并运行，创建数据库：
```sql
CREATE DATABASE coupon_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动开发服务器
```bash
npm run dev
```

## Vercel部署

### 1. 准备MySQL数据库
推荐使用以下云数据库服务：
- **PlanetScale** (推荐)
- **AWS RDS**
- **Google Cloud SQL**
- **Azure Database for MySQL**

### 2. 配置环境变量
在Vercel项目设置中添加以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-key-very-long-and-secure
DATABASE_URL=mysql://username:password@hostname:port/database_name
RATE_LIMIT_MAX=200
BCRYPT_ROUNDS=12
```

### 3. 部署到Vercel
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

### 4. 数据库初始化
部署完成后，第一次访问API会自动初始化数据库表结构和默认数据。

## 默认账户
- **手机号**: 13800138000
- **密码**: 123456

## API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify` - 验证token
- `POST /api/auth/logout` - 用户退出

### 券码相关
- `GET /api/coupon/companies` - 获取企业列表
- `POST /api/coupon/verify` - 核销券码
- `GET /api/coupon/records` - 查询核销记录
- `POST /api/coupon/batch-add` - 批量添加券码（测试用）

## 数据库表结构

### users（用户表）
- `id` - 主键
- `phone` - 手机号（唯一）
- `password_hash` - 密码哈希
- `is_active` - 是否激活
- `created_at` - 创建时间
- `updated_at` - 更新时间

### companies（企业表）
- `id` - 主键
- `name` - 企业名称（唯一）
- `is_active` - 是否激活
- `created_at` - 创建时间

### coupons（券码表）
- `id` - 主键
- `code` - 8位券码（唯一）
- `company_id` - 企业ID（外键）
- `is_used` - 是否已使用
- `used_at` - 使用时间
- `used_by` - 使用者手机号
- `created_at` - 创建时间

### verification_logs（核销记录表）
- `id` - 主键
- `coupon_id` - 券码ID（外键）
- `user_phone` - 用户手机号
- `verification_time` - 核销时间
- `ip_address` - IP地址

## 安全特性
- JWT令牌认证
- 密码bcrypt加密
- API请求频率限制
- SQL注入防护
- 数据库事务保证一致性

## 监控和日志
- 详细的错误日志记录
- 数据库连接状态监控
- API响应时间监控

## 故障排除

### 数据库连接失败
1. 检查DATABASE_URL格式是否正确
2. 确认数据库服务器可访问
3. 验证用户名密码是否正确

### Vercel部署失败
1. 检查Node.js版本是否>=18.0.0
2. 确认所有环境变量已正确设置
3. 查看Vercel部署日志

### API响应慢
1. 检查数据库连接池配置
2. 优化SQL查询性能
3. 考虑添加数据库索引

## 生产环境注意事项
1. 使用强密码的JWT_SECRET
2. 定期备份数据库
3. 监控API使用情况
4. 设置适当的RATE_LIMIT_MAX值
5. 定期更新依赖包

## 联系支持
如有技术问题，请查看代码注释或提交Issue。 