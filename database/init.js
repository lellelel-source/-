const { query, testConnection } = require('./config');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * 初始化数据库表结构
 */
async function initDatabase() {
  try {
    // 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('无法连接到MySQL数据库');
    }

    // 创建用户表 - 存储允许登录的手机号
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(11) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone (phone),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 用户表创建成功');

    // 创建企业表
    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 企业表创建成功');

    // 创建券码表
    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        company_id INT NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        used_by VARCHAR(11) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_company_id (company_id),
        INDEX idx_is_used (is_used),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 券码表创建成功');

    // 创建核销记录表
    await query(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupon_id INT NOT NULL,
        user_phone VARCHAR(11) NOT NULL,
        verification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        INDEX idx_coupon_id (coupon_id),
        INDEX idx_user_phone (user_phone),
        INDEX idx_verification_time (verification_time),
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 核销记录表创建成功');

    // 插入默认数据
    await insertDefaultData();
    
    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 插入默认数据
 */
async function insertDefaultData() {
  try {
    // 插入默认企业
    const companies = [
      '阿里巴巴集团',
      '腾讯科技',
      '百度公司',
      '京东集团',
      '美团点评'
    ];

    for (const company of companies) {
      try {
        await query('INSERT IGNORE INTO companies (name) VALUES (?)', [company]);
      } catch (error) {
        console.log(`企业 ${company} 已存在，跳过插入`);
      }
    }
    console.log('✓ 默认企业数据插入完成');

    // 插入默认管理员用户 (密码需要加密)
    const defaultPassword = bcrypt.hashSync('123456', parseInt(process.env.BCRYPT_ROUNDS) || 10);
    
    try {
      await query(
        'INSERT IGNORE INTO users (phone, password_hash) VALUES (?, ?)',
        ['13800138000', defaultPassword]
      );
      console.log('✓ 默认用户创建成功 - 手机号: 13800138000, 密码: 123456');
    } catch (error) {
      console.log('默认用户已存在，跳过创建');
    }

  } catch (error) {
    console.error('插入默认数据失败:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  insertDefaultData
}; 