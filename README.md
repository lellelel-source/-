# 券码核销系统

一个基于 Node.js + Express + SQLite 的券码核销手机H5应用，支持特定手机号登录、券码验证、核销记录查询等功能。

## 功能特性

### 核心功能
- ✅ **用户认证**: 仅特定手机号可登录，不支持自主注册
- ✅ **券码核销**: 支持8位大写英文+数字组合券码核销
- ✅ **企业管理**: 企业选择支持下拉+搜索功能
- ✅ **记录查询**: 可按日期或企业查询核销记录
- ✅ **前端验证**: 输入格式实时验证

### 技术特性
- 📱 **移动端优化**: 响应式设计，适配各种移动设备
- 🔐 **安全认证**: JWT token认证，自动登录状态检查
- 💾 **轻量数据库**: SQLite数据库，无需额外配置
- 🚀 **高性能**: 防抖搜索、分页加载、API缓存
- 🎨 **现代UI**: 美观的界面设计，良好的用户体验

## 技术栈

### 前端
- **HTML5** + **CSS3** + **原生JavaScript**
- 响应式设计，支持各种移动设备
- PWA特性支持

### 后端
- **Node.js** + **Express.js**
- **SQLite** 数据库
- **JWT** 身份认证
- **bcrypt** 密码加密

### 部署
- 支持 **Railway** 部署
- 支持 **Vercel** 部署
- 支持传统服务器部署

## 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 启动生产服务器
```bash
npm start
```

应用将在 `http://localhost:3000` 启动

## 默认账号

系统已预设测试账号：
- **手机号**: 13800138000
- **密码**: 123456

## 数据库结构

### 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| phone | VARCHAR(11) | 手机号(唯一) |
| password_hash | VARCHAR(255) | 密码哈希 |
| is_active | BOOLEAN | 是否激活 |
| created_at | DATETIME | 创建时间 |

### 企业表 (companies)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | VARCHAR(255) | 企业名称(唯一) |
| is_active | BOOLEAN | 是否激活 |
| created_at | DATETIME | 创建时间 |

### 券码表 (coupons)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| code | VARCHAR(8) | 券码(唯一) |
| company_id | INTEGER | 关联企业ID |
| is_used | BOOLEAN | 是否已使用 |
| used_at | DATETIME | 使用时间 |
| used_by | VARCHAR(11) | 使用者手机号 |
| created_at | DATETIME | 创建时间 |

### 核销记录表 (verification_logs)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| coupon_id | INTEGER | 券码ID |
| user_phone | VARCHAR(11) | 操作员手机号 |
| verification_time | DATETIME | 核销时间 |
| ip_address | VARCHAR(45) | IP地址 |

## API 接口

### 认证接口

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456"
}
```

#### 验证token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

#### 用户退出
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### 券码接口

#### 获取企业列表
```http
GET /api/coupon/companies?search=关键词
Authorization: Bearer <token>
```

#### 核销券码
```http
POST /api/coupon/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "ABC12345",
  "companyId": 1
}
```

#### 查询核销记录
```http
GET /api/coupon/records?date=2024-01-01&companyId=1&page=1&limit=20
Authorization: Bearer <token>
```

#### 批量生成券码（测试用）
```http
POST /api/coupon/batch-add
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": 1,
  "count": 10
}
```

## 部署指南

### Railway 部署

1. 推送代码到 GitHub
2. 在 Railway 导入项目
3. 设置环境变量：
   ```
   PORT=3000
   JWT_SECRET=your-secret-key
   ```
4. 部署完成

### Vercel 部署

1. 安装 Vercel CLI: `npm i -g vercel`
2. 在项目根目录运行: `vercel`
3. 按提示完成部署配置
4. 设置环境变量

### 传统服务器部署

1. 上传代码到服务器
2. 安装依赖: `npm install --production`
3. 配置环境变量
4. 使用 PM2 启动: `pm2 start server.js`

## 开发指南

### 项目结构
```
.
├── server.js              # 服务器入口文件
├── package.json           # 项目配置
├── README.md             # 项目说明
├── database/             # 数据库相关
│   └── init.js          # 数据库初始化
├── routes/              # 路由文件
│   ├── auth.js         # 认证路由
│   └── coupon.js       # 券码路由
├── public/              # 前端文件
│   ├── index.html      # 主页面
│   ├── styles/         # 样式文件
│   │   ├── main.css
│   │   └── mobile.css
│   └── scripts/        # JavaScript文件
│       ├── utils.js    # 工具函数
│       ├── api.js      # API调用
│       ├── auth.js     # 认证逻辑
│       └── main.js     # 主要逻辑
└── data/               # SQLite数据库文件目录
```

### 开发工具

#### 生成测试券码
在开发模式下（localhost），使用快捷键 `Ctrl+Shift+G` 可快速生成测试券码。

#### API 测试
推荐使用 Postman 或 curl 测试API接口。

### 添加新用户

需要手动在数据库中添加用户：

```sql
INSERT INTO users (phone, password_hash) VALUES 
('手机号', '加密后的密码');
```

可以使用 bcrypt 在线工具生成密码哈希，或在开发工具中使用：
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('密码', 10);
console.log(hash);
```

## 安全考虑

1. **密码加密**: 使用 bcrypt 加密存储
2. **JWT认证**: 24小时过期时间
3. **输入验证**: 前后端双重验证
4. **SQL注入防护**: 使用参数化查询
5. **限流保护**: API请求频率限制

## 浏览器兼容性

- ✅ Chrome 80+
- ✅ Safari 13+
- ✅ Firefox 75+
- ✅ Edge 80+
- ✅ 移动端浏览器

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 技术支持

如有问题，请查看：
1. [常见问题解答](https://github.com/your-repo/issues)
2. [API文档](https://your-domain.com/api-docs)
3. [部署指南](https://your-domain.com/deploy) 