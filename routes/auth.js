const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database/config');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * 用户登录
 * POST /api/auth/login
 * @body {string} phone - 手机号
 * @body {string} password - 密码
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 输入验证
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '手机号和密码不能为空' 
      });
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: '手机号格式不正确' 
      });
    }

    // 查询用户
    const users = await query(
      'SELECT * FROM users WHERE phone = ? AND is_active = 1',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '手机号未注册或已被禁用' 
      });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '密码错误' 
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

/**
 * 验证令牌中间件
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '访问令牌缺失' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: '访问令牌无效' 
      });
    }
    req.user = user;
    next();
  });
}

/**
 * 验证令牌有效性
 * GET /api/auth/verify
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: '令牌有效',
    data: {
      user: req.user
    }
  });
});

/**
 * 用户退出登录
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, (req, res) => {
  // 在实际应用中，可以将令牌加入黑名单
  res.json({
    success: true,
    message: '退出成功'
  });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken; 