/**
 * API接口调用模块
 */

// API基础配置
const API_BASE_URL = window.location.origin + '/api';

/**
 * HTTP请求封装
 * @param {string} url - 请求URL
 * @param {object} options - 请求选项
 * @returns {Promise<object>} 响应数据
 */
async function httpRequest(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 合并选项
  const requestOptions = { ...defaultOptions, ...options };

  // 添加认证token
  const token = storage.get('token');
  if (token) {
    requestOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    // 处理认证失败
    if (response.status === 401 || response.status === 403) {
      storage.remove('token');
      storage.remove('user');
      showToast('登录已过期，请重新登录', 'error');
      setTimeout(() => {
        showPage('loginPage');
      }, 1500);
      return null;
    }

    // 处理其他错误
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

/**
 * 认证API
 */
const authAPI = {
  /**
   * 用户登录
   * @param {string} phone - 手机号
   * @param {string} password - 密码
   * @returns {Promise<object>} 登录结果
   */
  async login(phone, password) {
    return httpRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  },

  /**
   * 验证token
   * @returns {Promise<object>} 验证结果
   */
  async verifyToken() {
    return httpRequest(`${API_BASE_URL}/auth/verify`);
  },

  /**
   * 用户退出
   * @returns {Promise<object>} 退出结果
   */
  async logout() {
    return httpRequest(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  },
};

/**
 * 券码API
 */
const couponAPI = {
  /**
   * 获取企业列表
   * @param {string} search - 搜索关键词
   * @returns {Promise<object>} 企业列表
   */
  async getCompanies(search = '') {
    const url = search 
      ? `${API_BASE_URL}/coupon/companies?search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/coupon/companies`;
    return httpRequest(url);
  },

  /**
   * 核销券码
   * @param {string} code - 券码
   * @param {number} companyId - 企业ID
   * @returns {Promise<object>} 核销结果
   */
  async verifyCoupon(code, companyId) {
    return httpRequest(`${API_BASE_URL}/coupon/verify`, {
      method: 'POST',
      body: JSON.stringify({ code, companyId }),
    });
  },

  /**
   * 查询核销记录
   * @param {object} params - 查询参数
   * @param {string} params.date - 查询日期
   * @param {number} params.companyId - 企业ID
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @returns {Promise<object>} 记录列表
   */
  async getRecords(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });

    const url = `${API_BASE_URL}/coupon/records?${searchParams.toString()}`;
    return httpRequest(url);
  },

  /**
   * 批量生成券码（测试用）
   * @param {number} companyId - 企业ID
   * @param {number} count - 生成数量
   * @returns {Promise<object>} 生成结果
   */
  async batchAddCoupons(companyId, count = 10) {
    return httpRequest(`${API_BASE_URL}/coupon/batch-add`, {
      method: 'POST',
      body: JSON.stringify({ companyId, count }),
    });
  },
};

/**
 * 统一错误处理
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 */
function handleAPIError(error, defaultMessage = '操作失败，请稍后重试') {
  let message = defaultMessage;
  
  if (error.message) {
    message = error.message;
  }
  
  // 网络错误处理
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    message = '网络连接失败，请检查网络设置';
  }
  
  showToast(message, 'error');
  console.error('API Error:', error);
}

/**
 * 带加载状态的API调用
 * @param {Function} apiCall - API调用函数
 * @param {string} loadingText - 加载提示文本
 * @param {string} errorMessage - 错误提示文本
 * @returns {Promise<any>} API调用结果
 */
async function callAPIWithLoading(apiCall, loadingText = '加载中...', errorMessage = '操作失败') {
  try {
    showLoading(true);
    const result = await apiCall();
    return result;
  } catch (error) {
    handleAPIError(error, errorMessage);
    return null;
  } finally {
    showLoading(false);
  }
}

/**
 * 重试机制的API调用
 * @param {Function} apiCall - API调用函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟(毫秒)
 * @returns {Promise<any>} API调用结果
 */
async function retryAPICall(apiCall, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // 如果是网络错误，进行重试
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        console.log(`第${i + 1}次重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // 其他错误直接抛出
      throw error;
    }
  }
}

/**
 * 并发API调用
 * @param {Array<Function>} apiCalls - API调用函数数组
 * @param {number} concurrency - 并发数量
 * @returns {Promise<Array>} 所有API调用结果
 */
async function concurrentAPICalls(apiCalls, concurrency = 3) {
  const results = [];
  
  for (let i = 0; i < apiCalls.length; i += concurrency) {
    const batch = apiCalls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(call => call()));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * 检查网络连接状态
 * @returns {boolean} 是否在线
 */
function isOnline() {
  return navigator.onLine;
}

/**
 * 监听网络状态变化
 */
function setupNetworkListener() {
  window.addEventListener('online', () => {
    showToast('网络连接已恢复', 'success');
  });
  
  window.addEventListener('offline', () => {
    showToast('网络连接已断开', 'warning');
  });
}

// 初始化网络状态监听
setupNetworkListener(); 