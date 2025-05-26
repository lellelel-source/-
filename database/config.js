const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL数据库连接配置
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coupon_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

/**
 * 创建数据库连接池
 */
let pool;

/**
 * 获取数据库连接池
 * @returns {mysql.Pool}
 */
function getPool() {
  if (!pool) {
    // 如果有DATABASE_URL环境变量（Vercel等云平台），使用URL连接
    if (process.env.DATABASE_URL) {
      pool = mysql.createPool(process.env.DATABASE_URL);
    } else {
      pool = mysql.createPool(dbConfig);
    }
  }
  return pool;
}

/**
 * 获取数据库连接
 * @returns {Promise<mysql.Connection>}
 */
async function getConnection() {
  const pool = getPool();
  return await pool.getConnection();
}

/**
 * 执行SQL查询
 * @param {string} sql SQL语句
 * @param {Array} params 参数
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  const pool = getPool();
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

/**
 * 测试数据库连接
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('MySQL数据库连接成功');
    return true;
  } catch (error) {
    console.error('MySQL数据库连接失败:', error);
    return false;
  }
}

/**
 * 执行事务
 * @param {Function} transactionCallback 事务回调函数
 * @returns {Promise<any>}
 */
async function transaction(transactionCallback) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await transactionCallback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getPool,
  getConnection,
  query,
  testConnection,
  transaction
}; 