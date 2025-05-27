# Vercel 部署指南

## 🚀 快速部署步骤

### 1. 准备数据库

由于Vercel是无服务器环境，您需要使用云数据库服务：

#### 推荐选项：
- **PlanetScale** (免费额度，MySQL兼容)
- **Railway** (免费额度，支持MySQL)
- **Aiven** (免费额度，支持MySQL)
- **阿里云RDS** (付费，稳定可靠)

### 2. 获取数据库连接URL

以PlanetScale为例：
1. 注册 [PlanetScale](https://planetscale.com/)
2. 创建新数据库
3. 获取连接字符串，格式如：
   ```
   mysql://username:password@hostname:port/database_name?ssl={"rejectUnauthorized":true}
   ```

### 3. 配置Vercel环境变量

在Vercel项目设置中添加以下环境变量：

```bash
# 必需的环境变量
DATABASE_URL=mysql://your-connection-string
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NODE_ENV=production

# 可选的环境变量
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=10
```

### 4. 部署到Vercel

#### 方法一：通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

#### 方法二：通过GitHub集成
1. 将代码推送到GitHub
2. 在Vercel中连接GitHub仓库
3. 配置环境变量
4. 部署

### 5. 验证部署

部署成功后，访问以下端点验证：

- `https://your-app.vercel.app/api/health` - 健康检查
- `https://your-app.vercel.app/` - 主页

## 🔧 故障排除

### 常见错误及解决方案

#### 1. 500 INTERNAL_SERVER_ERROR
**原因：** 通常是数据库连接问题

**解决方案：**
- 检查 `DATABASE_URL` 环境变量是否正确设置
- 确保数据库服务正常运行
- 检查数据库连接字符串格式

#### 2. FUNCTION_INVOCATION_FAILED
**原因：** 函数执行超时或内存不足

**解决方案：**
- 检查 `vercel.json` 中的 `maxDuration` 设置
- 优化数据库查询性能
- 减少不必要的依赖

#### 3. 数据库连接超时
**原因：** 云数据库连接限制

**解决方案：**
- 使用连接池
- 设置合适的超时时间
- 检查数据库服务商的连接限制

### 调试技巧

1. **查看Vercel函数日志：**
   ```bash
   vercel logs your-deployment-url
   ```

2. **本地测试生产环境：**
   ```bash
   NODE_ENV=production npm start
   ```

3. **测试数据库连接：**
   访问 `/api/health` 端点查看连接状态

## 📝 环境变量说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | ✅ | MySQL数据库连接URL | `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | ✅ | JWT签名密钥 | `your-secret-key-32-chars-min` |
| `NODE_ENV` | ✅ | 环境模式 | `production` |
| `RATE_LIMIT_MAX` | ❌ | API限流次数 | `100` |
| `BCRYPT_ROUNDS` | ❌ | 密码加密强度 | `10` |

## 🔒 安全建议

1. **JWT密钥：** 使用至少32位的随机字符串
2. **数据库密码：** 使用强密码
3. **环境变量：** 不要在代码中硬编码敏感信息
4. **HTTPS：** Vercel自动提供HTTPS

## 📊 性能优化

1. **数据库连接池：** 已配置适合Vercel的连接池大小
2. **函数超时：** 设置为30秒
3. **静态文件：** 使用Vercel的CDN加速

## 🆘 获取帮助

如果遇到问题：
1. 检查Vercel函数日志
2. 验证环境变量配置
3. 测试数据库连接
4. 查看本项目的GitHub Issues

---

**注意：** 首次部署后，数据库表会自动创建，默认管理员账号：
- 手机号：`13800138000`
- 密码：`123456`

请及时修改默认密码！ 