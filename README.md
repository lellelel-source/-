# 券码核销系统 (Coupon Verification System)

一个基于Spring Boot开发的券码管理和核销系统，支持券码的创建、查询、核销等功能。

## 🚀 在线演示

项目已部署到Vercel，可直接访问：[https://your-app.vercel.app](https://your-app.vercel.app)

## ✨ 功能特性

- 🎫 **券码管理**: 创建和管理各种类型的券码
- 🔍 **券码查询**: 根据券码快速查询详细信息
- ✅ **券码核销**: 支持一次性券码核销
- 📊 **状态管理**: 券码状态跟踪 (ACTIVE, USED, EXPIRED)
- 🗄️ **数据库**: 使用H2内存数据库，自动建表
- 🔧 **RESTful API**: 标准的REST接口设计

## 🛠️ 技术栈

- **后端**: Spring Boot 3.2.0
- **数据库**: H2 (内存数据库)
- **ORM**: Spring Data JPA
- **安全**: Spring Security (基础配置)
- **构建**: Maven
- **部署**: Vercel

## 📦 快速开始

### 本地运行

1. 克隆项目
```bash
git clone https://github.com/your-username/coupon-verification-system.git
cd coupon-verification-system
```

2. 编译和运行
```bash
mvn clean compile
mvn spring-boot:run
```

3. 访问应用
- 主页: http://localhost:8080
- H2数据库控制台: http://localhost:8080/h2-console
- API文档: http://localhost:8080/api/info

### Vercel部署

1. 导入项目到Vercel
2. 自动检测配置并部署
3. 访问生成的URL

## 📚 API 接口

### 基本信息
- **基础URL**: `/api`
- **响应格式**: JSON

### 接口列表

#### 1. 创建券码
```http
POST /api/coupons
Content-Type: application/x-www-form-urlencoded

type=discount&value=100.00
```

#### 2. 查询券码
```http
GET /api/coupons/{code}
```

#### 3. 核销券码
```http
POST /api/coupons/{code}/verify
```

#### 4. 获取所有券码
```http
GET /api/coupons
```

#### 5. 按状态查询券码
```http
GET /api/coupons/status/{status}
```

### 响应示例

成功响应:
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "code": "ABC12345",
    "type": "discount",
    "value": 100.00,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T12:00:00",
    "expiresAt": "2024-01-31T23:59:59"
  }
}
```

错误响应:
```json
{
  "success": false,
  "message": "券码不存在"
}
```

## 🗃️ 数据库设计

### 用户表 (users)
- `id`: 主键
- `username`: 用户名
- `password`: 密码（加密）
- `email`: 邮箱
- `role`: 角色
- `enabled`: 是否启用
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 券码表 (coupons)
- `id`: 主键
- `code`: 券码（唯一）
- `type`: 券码类型
- `value`: 面值
- `status`: 状态 (ACTIVE/USED/EXPIRED)
- `created_by`: 创建者ID
- `used_by`: 使用者ID
- `used_at`: 使用时间
- `expires_at`: 过期时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 核销记录表 (verification_logs)
- `id`: 主键
- `coupon_id`: 券码ID
- `user_id`: 用户ID
- `action`: 操作类型
- `created_at`: 创建时间
- `ip_address`: IP地址
- `user_agent`: 用户代理

## 🔧 配置说明

### application.yml
- 使用H2内存数据库
- 启用H2控制台 (`/h2-console`)
- JPA自动建表 (`create-drop`)
- 显示SQL日志

### vercel.json
- 使用 `@vercel/java` 构建器
- 配置路由规则
- 环境变量设置

## 🚀 部署到Vercel

1. 将项目推送到GitHub
2. 在Vercel中导入项目
3. 选择Framework Preset: "Other"
4. 构建命令: `mvn clean package -DskipTests`
5. 输出目录: `target`
6. 部署

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 📄 许可证

本项目采用MIT许可证。

## 📧 联系方式

如有问题或建议，请联系：[your-email@example.com](mailto:your-email@example.com)

## 技术支持

如有问题，请查看：
1. [常见问题解答](https://github.com/your-repo/issues)
2. [API文档](https://your-domain.com/api-docs)
3. [部署指南](https://your-domain.com/deploy)

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