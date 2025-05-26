require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const couponRoutes = require('./routes/coupon');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 限流中间件
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.RATE_LIMIT_MAX || 100, // 限制每个IP 15分钟内最多请求数
  message: '请求过于频繁，请稍后再试'
});

// 中间件设置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 路由设置
app.use('/api/auth', authRoutes);
app.use('/api/coupon', couponRoutes);

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    console.log('数据库初始化成功');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`访问地址: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer(); 