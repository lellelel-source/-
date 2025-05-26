const express = require('express');
const { query, transaction } = require('../database/config');
const { authenticateToken } = require('./auth');

const router = express.Router();

/**
 * 获取企业列表
 * GET /api/coupon/companies
 */
router.get('/companies', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    
    let sql = 'SELECT id, name FROM companies WHERE is_active = 1';
    let params = [];
    
    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    sql += ' ORDER BY name';
    
    const companies = await query(sql, params);
    
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('获取企业列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 核销券码
 * POST /api/coupon/verify
 * @body {string} code - 8位券码
 * @body {number} companyId - 企业ID
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { code, companyId } = req.body;
    const userPhone = req.user.phone;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // 输入验证
    if (!code || !companyId) {
      return res.status(400).json({
        success: false,
        message: '券码和企业不能为空'
      });
    }
    
    // 券码格式验证：8位大写英文和数字组合
    const codeRegex = /^[A-Z0-9]{8}$/;
    if (!codeRegex.test(code)) {
      return res.status(400).json({
        success: false,
        message: '券码格式不正确，请输入8位大写英文和数字组合'
      });
    }
    
    // 使用事务处理核销
    const result = await transaction(async (connection) => {
      // 查询券码
      const [coupons] = await connection.execute(`
        SELECT c.*, comp.name as company_name 
        FROM coupons c 
        JOIN companies comp ON c.company_id = comp.id 
        WHERE c.code = ? AND c.company_id = ?
      `, [code, companyId]);
      
      if (coupons.length === 0) {
        throw new Error('券码不存在或企业不匹配');
      }
      
      const coupon = coupons[0];
      
      if (coupon.is_used) {
        throw new Error(`券码已被使用，使用时间: ${coupon.used_at}`);
      }
      
      // 更新券码状态
      await connection.execute(`
        UPDATE coupons 
        SET is_used = TRUE, used_at = CURRENT_TIMESTAMP, used_by = ?
        WHERE id = ?
      `, [userPhone, coupon.id]);
      
      // 记录核销日志
      await connection.execute(`
        INSERT INTO verification_logs (coupon_id, user_phone, ip_address)
        VALUES (?, ?, ?)
      `, [coupon.id, userPhone, ipAddress]);
      
      return {
        code: coupon.code,
        company: coupon.company_name,
        verificationTime: new Date().toISOString()
      };
    });
    
    res.json({
      success: true,
      message: '核销成功',
      data: result
    });
  } catch (error) {
    console.error('券码核销失败:', error);
    if (error.message.includes('券码')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 查询核销记录
 * GET /api/coupon/records
 * @query {string} date - 查询日期 (YYYY-MM-DD)
 * @query {number} companyId - 企业ID (可选)
 * @query {number} page - 页码
 * @query {number} limit - 每页数量
 */
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const { date, companyId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    
    if (date) {
      whereConditions.push("DATE(vl.verification_time) = ?");
      params.push(date);
    }
    
    if (companyId) {
      whereConditions.push("c.company_id = ?");
      params.push(companyId);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // 查询总记录数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM verification_logs vl
      JOIN coupons c ON vl.coupon_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;
    
    // 查询记录列表
    const listQuery = `
      SELECT 
        vl.verification_time,
        c.code,
        comp.name as company_name,
        vl.user_phone,
        vl.ip_address
      FROM verification_logs vl
      JOIN coupons c ON vl.coupon_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      ${whereClause}
      ORDER BY vl.verification_time DESC
      LIMIT ? OFFSET ?
    `;
    
    const listParams = [...params, parseInt(limit), parseInt(offset)];
    const records = await query(listQuery, listParams);
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('查询核销记录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 批量添加券码（测试用）
 * POST /api/coupon/batch-add
 * @body {number} companyId - 企业ID
 * @body {number} count - 生成数量
 */
router.post('/batch-add', authenticateToken, async (req, res) => {
  try {
    const { companyId, count = 10 } = req.body;
    
    if (!companyId || count <= 0 || count > 100) {
      return res.status(400).json({
        success: false,
        message: '参数错误，count范围1-100'
      });
    }
    
    // 生成券码
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = generateCouponCode();
      codes.push(code);
    }
    
    // 使用事务批量插入
    await transaction(async (connection) => {
      for (const code of codes) {
        await connection.execute(
          'INSERT INTO coupons (code, company_id) VALUES (?, ?)',
          [code, companyId]
        );
      }
    });
    
    res.json({
      success: true,
      message: `成功生成${count}个券码`,
      data: { codes }
    });
  } catch (error) {
    console.error('批量生成券码失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 生成8位券码
 * @returns {string}
 */
function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router; 