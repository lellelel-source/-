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

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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
  console.error('服务器错误:', err);
  console.error('错误堆栈:', err.stack);
  
  // 根据错误类型返回不同的响应
  if (err.code === 'ECONNREFUSED') {
    res.status(503).json({ error: '数据库连接失败，请稍后重试' });
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    res.status(503).json({ error: '数据库认证失败' });
  } else {
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * 启动服务器
 */
async function startServer() {
  try {
    console.log('开始启动服务器...');
    console.log('环境:', process.env.NODE_ENV || 'development');
    
    // 在Vercel环境中，只有在有数据库配置时才初始化数据库
    if (process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_USER)) {
      console.log('检测到数据库配置，开始初始化数据库...');
      try {
        await initDatabase();
        console.log('数据库初始化成功');
      } catch (error) {
        console.error('数据库初始化失败:', error);
        // 在生产环境中，如果数据库初始化失败，仍然启动服务器但记录错误
        if (process.env.NODE_ENV === 'production') {
          console.warn('生产环境数据库初始化失败，服务器将继续启动但功能可能受限');
        } else {
          throw error;
        }
      }
    } else {
      console.warn('未检测到数据库配置，跳过数据库初始化');
    }
    
    // 在Vercel环境中，不需要手动启动监听
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`服务器运行在端口 ${PORT}`);
        console.log(`访问地址: http://localhost:${PORT}`);
      });
    } else {
      console.log('Vercel环境检测到，跳过手动启动监听');
    }
  } catch (error) {
    console.error('启动服务器失败:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// 只在非Vercel环境或开发环境中启动服务器
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

// 导出app供Vercel使用
module.exports = app; 