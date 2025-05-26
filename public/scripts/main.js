/**
 * 主要业务逻辑
 */

// 全局状态
let companies = [];
let currentRecords = [];
let currentPage = 1;
let totalPages = 1;

/**
 * 初始化主页面
 */
async function initMainPage() {
  try {
    // 加载企业列表
    await loadCompanies();
    
    // 设置事件监听
    setupMainPageEvents();
    
    // 设置默认日期为今天
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
      dateFilter.value = getTodayString();
    }
    
    // 加载今日记录
    await loadRecords();
    
  } catch (error) {
    console.error('初始化主页面失败:', error);
    showToast('页面加载失败', 'error');
  }
}

/**
 * 加载企业列表
 * @param {string} search - 搜索关键词
 */
async function loadCompanies(search = '') {
  try {
    const result = await couponAPI.getCompanies(search);
    
    if (result && result.success) {
      companies = result.data;
      updateCompanySelects();
      return true;
    } else {
      console.error('加载企业列表失败:', result?.message);
      return false;
    }
  } catch (error) {
    console.error('加载企业列表失败:', error);
    handleAPIError(error, '加载企业列表失败');
    return false;
  }
}

/**
 * 更新企业选择框
 */
function updateCompanySelects() {
  const companySelect = document.getElementById('companySelect');
  const companyFilter = document.getElementById('companyFilter');
  
  // 更新核销表单中的企业选择
  if (companySelect) {
    companySelect.innerHTML = '<option value="">请选择企业</option>';
    companies.forEach(company => {
      const option = document.createElement('option');
      option.value = company.id;
      option.textContent = company.name;
      companySelect.appendChild(option);
    });
  }
  
  // 更新筛选器中的企业选择
  if (companyFilter) {
    companyFilter.innerHTML = '<option value="">全部企业</option>';
    companies.forEach(company => {
      const option = document.createElement('option');
      option.value = company.id;
      option.textContent = company.name;
      companyFilter.appendChild(option);
    });
  }
}

/**
 * 核销券码
 * @param {string} code - 券码
 * @param {number} companyId - 企业ID
 */
async function verifyCoupon(code, companyId) {
  try {
    showLoading(true);
    
    const result = await couponAPI.verifyCoupon(code, companyId);
    
    if (result && result.success) {
      showToast('核销成功！', 'success');
      
      // 显示核销结果
      const company = companies.find(c => c.id == companyId);
      const confirmResult = await showConfirm(
        '核销成功',
        `券码：${result.data.code}\n企业：${company?.name || '未知'}\n时间：${formatDateTime(result.data.verificationTime)}`
      );
      
      // 清空表单
      resetVerificationForm();
      
      // 重新加载记录列表
      await loadRecords();
      
      return true;
    } else {
      showToast(result?.message || '核销失败', 'error');
      return false;
    }
  } catch (error) {
    handleAPIError(error, '核销失败');
    return false;
  } finally {
    showLoading(false);
  }
}

/**
 * 加载核销记录
 * @param {object} params - 查询参数
 */
async function loadRecords(params = {}) {
  try {
    const dateFilter = document.getElementById('dateFilter');
    const companyFilter = document.getElementById('companyFilter');
    
    const queryParams = {
      page: currentPage,
      limit: 20,
      ...params
    };
    
    // 添加日期筛选
    if (dateFilter && dateFilter.value) {
      queryParams.date = dateFilter.value;
    }
    
    // 添加企业筛选
    if (companyFilter && companyFilter.value) {
      queryParams.companyId = companyFilter.value;
    }
    
    const result = await couponAPI.getRecords(queryParams);
    
    if (result && result.success) {
      currentRecords = result.data.records;
      totalPages = result.data.pagination.totalPages;
      
      renderRecordsList();
      renderPagination();
      
      return true;
    } else {
      console.error('加载记录失败:', result?.message);
      return false;
    }
  } catch (error) {
    console.error('加载记录失败:', error);
    handleAPIError(error, '加载记录失败');
    return false;
  }
}

/**
 * 渲染记录列表
 */
function renderRecordsList() {
  const recordsList = document.getElementById('recordsList');
  
  if (!recordsList) return;
  
  if (currentRecords.length === 0) {
    recordsList.innerHTML = `
      <div class="record-item">
        <p style="text-align: center; color: #6c757d;">暂无记录</p>
      </div>
    `;
    return;
  }
  
  recordsList.innerHTML = currentRecords.map(record => `
    <div class="record-item">
      <div class="record-header">
        <span class="record-code">${record.code}</span>
        <span class="record-time">${formatDateTime(record.verification_time)}</span>
      </div>
      <div class="record-details">
        <span class="record-company">${record.company_name}</span>
        <span style="margin-left: 15px; color: #6c757d;">
          操作员: ${record.user_phone}
        </span>
      </div>
    </div>
  `).join('');
}

/**
 * 渲染分页控件
 */
function renderPagination() {
  const pagination = document.getElementById('pagination');
  
  if (!pagination || totalPages <= 1) {
    if (pagination) pagination.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // 上一页按钮
  paginationHTML += `
    <button ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      上一页
    </button>
  `;
  
  // 页码按钮
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  if (startPage > 1) {
    paginationHTML += `<button onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span>...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button ${i === currentPage ? 'class="active"' : ''} onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span>...</span>`;
    }
    paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
  }
  
  // 下一页按钮
  paginationHTML += `
    <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      下一页
    </button>
  `;
  
  pagination.innerHTML = paginationHTML;
}

/**
 * 切换页码
 * @param {number} page - 页码
 */
async function changePage(page) {
  if (page < 1 || page > totalPages || page === currentPage) {
    return;
  }
  
  currentPage = page;
  await loadRecords();
}

/**
 * 重置核销表单
 */
function resetVerificationForm() {
  const form = document.getElementById('verificationForm');
  if (form) {
    form.reset();
    clearFormErrors(form);
  }
  
  // 清空搜索框
  const companySearch = document.getElementById('companySearch');
  if (companySearch) {
    companySearch.value = '';
  }
}

/**
 * 验证核销表单
 * @param {string} code - 券码
 * @param {string} companyId - 企业ID
 * @returns {boolean} 验证是否通过
 */
function validateVerificationForm(code, companyId) {
  let isValid = true;
  
  const codeInput = document.getElementById('couponCode');
  const companySelect = document.getElementById('companySelect');
  
  // 清除之前的错误状态
  clearFormErrors(document.getElementById('verificationForm'));
  
  // 验证券码
  if (!code) {
    showFieldError(codeInput, '请输入券码');
    isValid = false;
  } else if (!validateCouponCode(code)) {
    showFieldError(codeInput, '券码格式不正确，请输入8位大写英文和数字组合');
    isValid = false;
  }
  
  // 验证企业
  if (!companyId) {
    showFieldError(companySelect, '请选择企业');
    isValid = false;
  }
  
  return isValid;
}

/**
 * 设置主页面事件监听
 */
function setupMainPageEvents() {
  // 退出登录按钮
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 核销表单提交
  const verificationForm = document.getElementById('verificationForm');
  if (verificationForm) {
    verificationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const code = document.getElementById('couponCode').value.trim().toUpperCase();
      const companyId = document.getElementById('companySelect').value;
      
      if (!validateVerificationForm(code, companyId)) {
        return;
      }
      
      await verifyCoupon(code, parseInt(companyId));
    });
  }
  
  // 券码输入框格式化
  const couponCodeInput = document.getElementById('couponCode');
  if (couponCodeInput) {
    couponCodeInput.addEventListener('input', (e) => {
      // 转换为大写并过滤无效字符
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // 清除错误状态
      if (e.target.classList.contains('error')) {
        e.target.classList.remove('error');
        const errorMsg = e.target.parentNode.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });
  }
  
  // 企业搜索功能
  const companySearch = document.getElementById('companySearch');
  if (companySearch) {
    const debouncedSearch = debounce(async (searchTerm) => {
      await loadCompanies(searchTerm);
    }, 300);
    
    companySearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.trim();
      debouncedSearch(searchTerm);
    });
    
    // 搜索框失去焦点时选择企业
    companySearch.addEventListener('blur', () => {
      const searchTerm = companySearch.value.trim();
      if (searchTerm) {
        const matchingCompany = companies.find(company => 
          company.name.includes(searchTerm)
        );
        if (matchingCompany) {
          document.getElementById('companySelect').value = matchingCompany.id;
        }
      }
    });
  }
  
  // 记录查询按钮
  const searchRecordsBtn = document.getElementById('searchRecords');
  if (searchRecordsBtn) {
    searchRecordsBtn.addEventListener('click', async () => {
      currentPage = 1;
      await loadRecords();
    });
  }
  
  // 日期筛选器变化
  const dateFilter = document.getElementById('dateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', async () => {
      currentPage = 1;
      await loadRecords();
    });
  }
  
  // 企业筛选器变化
  const companyFilter = document.getElementById('companyFilter');
  if (companyFilter) {
    companyFilter.addEventListener('change', async () => {
      currentPage = 1;
      await loadRecords();
    });
  }
}

/**
 * 开发者工具 - 批量生成测试券码
 */
async function generateTestCoupons() {
  try {
    if (companies.length === 0) {
      showToast('请先加载企业列表', 'warning');
      return;
    }
    
    const confirmed = await showConfirm(
      '生成测试券码', 
      '确定要为第一个企业生成10个测试券码吗？'
    );
    
    if (!confirmed) return;
    
    const result = await couponAPI.batchAddCoupons(companies[0].id, 10);
    
    if (result && result.success) {
      showToast(`成功生成${result.data.codes.length}个测试券码`, 'success');
      console.log('生成的券码:', result.data.codes);
    } else {
      showToast(result?.message || '生成失败', 'error');
    }
  } catch (error) {
    handleAPIError(error, '生成测试券码失败');
  }
}

// 开发模式下添加快捷键
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+G 生成测试券码
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
      e.preventDefault();
      generateTestCoupons();
    }
  });
}

// 暴露全局函数供HTML调用
window.changePage = changePage;
window.generateTestCoupons = generateTestCoupons; 