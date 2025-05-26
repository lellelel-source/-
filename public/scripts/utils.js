/**
 * 通用工具函数
 */

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, error, warning
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * 显示/隐藏加载提示
 * @param {boolean} show - 是否显示
 */
function showLoading(show = true) {
  const loading = document.getElementById('loading');
  if (show) {
    loading.classList.add('show');
  } else {
    loading.classList.remove('show');
  }
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 * @returns {Promise<boolean>} 用户选择结果
 */
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('show');
    
    const handleChoice = (result) => {
      modal.classList.remove('show');
      cancelBtn.removeEventListener('click', handleCancel);
      okBtn.removeEventListener('click', handleOk);
      resolve(result);
    };
    
    const handleCancel = () => handleChoice(false);
    const handleOk = () => handleChoice(true);
    
    cancelBtn.addEventListener('click', handleCancel);
    okBtn.addEventListener('click', handleOk);
    
    // ESC键取消
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeydown);
        handleChoice(false);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  });
}

/**
 * 切换页面显示
 * @param {string} pageId - 页面ID
 */
function showPage(pageId) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 显示指定页面
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期
 * @param {boolean} showTime - 是否显示时间
 * @returns {string} 格式化后的日期字符串
 */
function formatDateTime(date, showTime = true) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (!showTime) {
    return `${year}-${month}-${day}`;
  }
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD格式的日期
 */
function getTodayString() {
  return formatDateTime(new Date(), false);
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证券码格式
 * @param {string} code - 券码
 * @returns {boolean} 是否有效
 */
function validateCouponCode(code) {
  const codeRegex = /^[A-Z0-9]{8}$/;
  return codeRegex.test(code);
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间(毫秒)
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 清除表单验证错误状态
 * @param {HTMLFormElement} form - 表单元素
 */
function clearFormErrors(form) {
  form.querySelectorAll('input, select').forEach(input => {
    input.classList.remove('error');
  });
  
  form.querySelectorAll('.error-message').forEach(errorMsg => {
    errorMsg.remove();
  });
}

/**
 * 显示表单字段错误
 * @param {HTMLElement} field - 字段元素
 * @param {string} message - 错误消息
 */
function showFieldError(field, message) {
  field.classList.add('error');
  
  // 移除已存在的错误消息
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // 添加新的错误消息
  const errorEl = document.createElement('small');
  errorEl.className = 'error-message';
  errorEl.textContent = message;
  field.parentNode.appendChild(errorEl);
}

/**
 * 本地存储操作
 */
const storage = {
  /**
   * 设置数据
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('存储数据失败:', e);
    }
  },
  
  /**
   * 获取数据
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('读取数据失败:', e);
      return defaultValue;
    }
  },
  
  /**
   * 删除数据
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('删除数据失败:', e);
    }
  },
  
  /**
   * 清空所有数据
   */
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('清空数据失败:', e);
    }
  }
};

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 