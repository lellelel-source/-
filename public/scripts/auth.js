/**
 * 认证功能模块
 */

/**
 * 认证状态管理
 */
const auth = {
  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const token = storage.get('token');
    const user = storage.get('user');
    return !!(token && user);
  },

  /**
   * 获取当前用户信息
   * @returns {object|null} 用户信息
   */
  getCurrentUser() {
    return storage.get('user');
  },

  /**
   * 保存登录信息
   * @param {string} token - 认证token
   * @param {object} user - 用户信息
   */
  saveLogin(token, user) {
    storage.set('token', token);
    storage.set('user', user);
  },

  /**
   * 清除登录信息
   */
  clearLogin() {
    storage.remove('token');
    storage.remove('user');
  },

  /**
   * 验证token有效性
   * @returns {Promise<boolean>} 是否有效
   */
  async validateToken() {
    try {
      const result = await authAPI.verifyToken();
      return result && result.success;
    } catch (error) {
      console.error('Token验证失败:', error);
      return false;
    }
  }
};

/**
 * 初始化认证状态
 */
async function initAuth() {
  // 检查本地存储的登录状态
  if (auth.isLoggedIn()) {
    // 验证token是否仍然有效
    const isValid = await auth.validateToken();
    
    if (isValid) {
      // Token有效，显示主页面
      showPage('mainPage');
      await initMainPage();
    } else {
      // Token无效，清除登录信息并显示登录页
      auth.clearLogin();
      showPage('loginPage');
      showToast('登录已过期，请重新登录', 'warning');
    }
  } else {
    // 未登录，显示登录页
    showPage('loginPage');
  }
}

/**
 * 处理登录
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {Promise<boolean>} 登录是否成功
 */
async function handleLogin(phone, password) {
  try {
    showLoading(true);
    
    const result = await authAPI.login(phone, password);
    
    if (result && result.success) {
      // 保存登录信息
      auth.saveLogin(result.data.token, result.data.user);
      
      showToast('登录成功', 'success');
      
      // 切换到主页面
      setTimeout(() => {
        showPage('mainPage');
        initMainPage();
      }, 1000);
      
      return true;
    } else {
      showToast(result?.message || '登录失败', 'error');
      return false;
    }
  } catch (error) {
    handleAPIError(error, '登录失败，请检查网络连接');
    return false;
  } finally {
    showLoading(false);
  }
}

/**
 * 处理退出登录
 */
async function handleLogout() {
  try {
    const confirmed = await showConfirm('确认退出', '确定要退出登录吗？');
    
    if (!confirmed) {
      return;
    }
    
    showLoading(true);
    
    // 调用退出API
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('调用退出API失败:', error);
      // 即使API调用失败，也要清除本地登录信息
    }
    
    // 清除本地登录信息
    auth.clearLogin();
    
    showToast('已退出登录', 'success');
    
    // 切换到登录页面
    setTimeout(() => {
      showPage('loginPage');
      resetLoginForm();
    }, 1000);
    
  } catch (error) {
    console.error('退出登录失败:', error);
    showToast('退出失败', 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * 重置登录表单
 */
function resetLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.reset();
    clearFormErrors(loginForm);
  }
}

/**
 * 登录表单验证
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {boolean} 验证是否通过
 */
function validateLoginForm(phone, password) {
  let isValid = true;
  
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  
  // 清除之前的错误状态
  clearFormErrors(document.getElementById('loginForm'));
  
  // 验证手机号
  if (!phone) {
    showFieldError(phoneInput, '请输入手机号');
    isValid = false;
  } else if (!validatePhone(phone)) {
    showFieldError(phoneInput, '手机号格式不正确');
    isValid = false;
  }
  
  // 验证密码
  if (!password) {
    showFieldError(passwordInput, '请输入密码');
    isValid = false;
  } else if (password.length < 6) {
    showFieldError(passwordInput, '密码长度不能少于6位');
    isValid = false;
  }
  
  return isValid;
}

/**
 * 自动登录
 * 在应用启动时检查是否有保存的登录信息
 */
function setupAutoLogin() {
  // 监听页面可见性变化，当页面重新可见时检查登录状态
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && auth.isLoggedIn()) {
      const isValid = await auth.validateToken();
      if (!isValid) {
        auth.clearLogin();
        showPage('loginPage');
        showToast('登录已过期，请重新登录', 'warning');
      }
    }
  });
}

/**
 * 设置登录表单事件监听
 */
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  
  if (!loginForm) return;
  
  // 表单提交事件
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    
    // 表单验证
    if (!validateLoginForm(phone, password)) {
      return;
    }
    
    // 执行登录
    await handleLogin(phone, password);
  });
  
  // 手机号输入格式化
  phoneInput.addEventListener('input', (e) => {
    // 只允许输入数字
    e.target.value = e.target.value.replace(/\D/g, '');
    
    // 清除错误状态
    if (e.target.classList.contains('error')) {
      e.target.classList.remove('error');
      const errorMsg = e.target.parentNode.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    }
  });
  
  // 密码输入清除错误状态
  passwordInput.addEventListener('input', (e) => {
    if (e.target.classList.contains('error')) {
      e.target.classList.remove('error');
      const errorMsg = e.target.parentNode.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    }
  });
  
  // 回车键快捷登录
  [phoneInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
  });
}

/**
 * 记住登录状态的时长检查
 */
function setupLoginExpiration() {
  const LOGIN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7天
  
  setInterval(() => {
    const user = storage.get('user');
    if (user && user.loginTime) {
      const now = Date.now();
      const loginTime = user.loginTime;
      
      if (now - loginTime > LOGIN_EXPIRATION) {
        auth.clearLogin();
        showPage('loginPage');
        showToast('登录已过期，请重新登录', 'warning');
      }
    }
  }, 60 * 1000); // 每分钟检查一次
}

/**
 * 设置安全相关功能
 */
function setupSecurity() {
  // 监听多标签页登录状态同步
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' || e.key === 'user') {
      if (!e.newValue) {
        // 其他标签页退出了登录
        if (document.getElementById('mainPage').classList.contains('active')) {
          showPage('loginPage');
          showToast('账号在其他地方退出登录', 'warning');
        }
      }
    }
  });
  
  // 监听网络重新连接时的token验证
  window.addEventListener('online', async () => {
    if (auth.isLoggedIn()) {
      const isValid = await auth.validateToken();
      if (!isValid) {
        auth.clearLogin();
        showPage('loginPage');
        showToast('登录状态异常，请重新登录', 'warning');
      }
    }
  });
}

// 初始化认证功能
document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupAutoLogin();
  setupLoginExpiration();
  setupSecurity();
  initAuth();
}); 