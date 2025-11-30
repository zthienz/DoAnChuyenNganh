// =============================================
// ADMIN SUPPORT REQUESTS MANAGEMENT
// =============================================

const API_URL = 'http://localhost:3000/api';
let allRequests = [];
let currentPage = 1;
const itemsPerPage = 20;

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadSupportStats();
    loadSupportRequests();
});

// =============================================
// CHECK ADMIN AUTHENTICATION
// =============================================
function checkAdminAuth() {
    // Lấy user từ localStorage hoặc sessionStorage
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    let currentUser = null;
    if (localUser) {
        currentUser = JSON.parse(localUser);
    } else if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
    }
    
    console.log('🔍 Checking admin auth:', currentUser);
    
    // Kiểm tra quyền admin (sử dụng 'quyen' thay vì 'role')
    if (!currentUser || currentUser.quyen !== 'admin') {
        console.log('❌ Not admin, redirecting to login');
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'admin-login.html';
        return;
    }
    
    console.log('✅ Admin authenticated');
    const adminName = currentUser.hoten || currentUser.email?.split('@')[0] || 'Admin';
    document.getElementById('adminName').textContent = adminName;
}

// =============================================
// LOAD SUPPORT STATISTICS
// =============================================
async function loadSupportStats() {
    try {
        const response = await fetch(`${API_URL}/support/stats`);
        const stats = await response.json();
        
        document.getElementById('pendingCount').textContent = stats.pending || 0;
        document.getElementById('processingCount').textContent = stats.processing || 0;
        document.getElementById('resolvedCount').textContent = stats.resolved || 0;
        document.getElementById('closedCount').textContent = stats.closed || 0;
    } catch (error) {
        console.error('Error loading support stats:', error);
    }
}

// =============================================
// LOAD SUPPORT REQUESTS
// =============================================
async function loadSupportRequests() {
    try {
        const status = document.getElementById('statusFilter').value;
        const url = status 
            ? `${API_URL}/support?status=${status}&page=${currentPage}&limit=${itemsPerPage}`
            : `${API_URL}/support?page=${currentPage}&limit=${itemsPerPage}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        allRequests = data.requests;
        displaySupportRequests(allRequests);
        displayPagination(data.totalPages);
        
        // Reload stats
        loadSupportStats();
    } catch (error) {
        console.error('Error loading support requests:', error);
        document.getElementById('supportRequestsTable').innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    Không thể tải dữ liệu. Vui lòng thử lại sau.
                </td>
            </tr>
        `;
    }
}

// =============================================
// DISPLAY SUPPORT REQUESTS
// =============================================
function displaySupportRequests(requests) {
    const tbody = document.getElementById('supportRequestsTable');
    
    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">Không có yêu cầu hỗ trợ nào</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = requests.map(request => `
        <tr>
            <td>#${request.id_yeucau}</td>
            <td>
                <div>
                    <strong>${request.hoten}</strong>
                    ${request.username ? `<br><small class="text-muted">@${request.username}</small>` : ''}
                </div>
            </td>
            <td>${request.email}</td>
            <td>${request.sodienthoai}</td>
            <td>${getContactTypeLabel(request.loai_lienhe)}</td>
            <td>${request.chude}</td>
            <td>${formatDate(request.ngay_tao)}</td>
            <td>${getStatusBadge(request.trangthai)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewRequestDetail(${request.id_yeucau})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// =============================================
// VIEW REQUEST DETAIL
// =============================================
async function viewRequestDetail(requestId) {
    try {
        const response = await fetch(`${API_URL}/support/${requestId}`);
        const request = await response.json();
        
        const content = document.getElementById('requestDetailContent');
        content.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>ID yêu cầu:</strong> #${request.id_yeucau}</p>
                    <p><strong>Họ tên:</strong> ${request.hoten}</p>
                    <p><strong>Email:</strong> ${request.email}</p>
                    <p><strong>Số điện thoại:</strong> ${request.sodienthoai}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Loại liên hệ:</strong> ${getContactTypeLabel(request.loai_lienhe)}</p>
                    <p><strong>Chủ đề:</strong> ${request.chude}</p>
                    <p><strong>Ngày gửi:</strong> ${formatDateTime(request.ngay_tao)}</p>
                    <p><strong>Cập nhật:</strong> ${formatDateTime(request.ngay_capnhat)}</p>
                </div>
            </div>
            
            <div class="mb-3">
                <strong>Nội dung tin nhắn:</strong>
                <div class="border rounded p-3 mt-2 bg-light">
                    ${request.noidung.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            ${request.username ? `
                <div class="mb-3">
                    <strong>Tài khoản người dùng:</strong> @${request.username}
                    ${request.user_email ? `<br><small class="text-muted">${request.user_email}</small>` : ''}
                </div>
            ` : ''}
            
            <div class="mb-3">
                <label class="form-label"><strong>Cập nhật trạng thái:</strong></label>
                <select class="form-select" id="statusUpdate" onchange="updateRequestStatus(${request.id_yeucau}, this.value)">
                    <option value="pending" ${request.trangthai === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                    <option value="processing" ${request.trangthai === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                    <option value="resolved" ${request.trangthai === 'resolved' ? 'selected' : ''}>Đã giải quyết</option>
                    <option value="closed" ${request.trangthai === 'closed' ? 'selected' : ''}>Đã đóng</option>
                </select>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('requestDetailModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading request detail:', error);
        showNotification('Không thể tải chi tiết yêu cầu', 'error');
    }
}

// =============================================
// UPDATE REQUEST STATUS
// =============================================
async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`${API_URL}/support/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Đã cập nhật trạng thái', 'success');
            loadSupportRequests();
        } else {
            showNotification(result.error || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Không thể cập nhật trạng thái', 'error');
    }
}

// =============================================
// FILTER REQUESTS
// =============================================
function filterRequests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filtered = allRequests;
    
    // Filter by type
    if (typeFilter) {
        filtered = filtered.filter(req => req.loai_lienhe === typeFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(req => 
            req.hoten.toLowerCase().includes(searchTerm) ||
            req.email.toLowerCase().includes(searchTerm) ||
            req.sodienthoai.includes(searchTerm) ||
            (req.username && req.username.toLowerCase().includes(searchTerm))
        );
    }
    
    displaySupportRequests(filtered);
}

// =============================================
// DISPLAY PAGINATION
// =============================================
function displayPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = html;
}

// =============================================
// CHANGE PAGE
// =============================================
function changePage(page) {
    currentPage = page;
    loadSupportRequests();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// HELPER FUNCTIONS
// =============================================
function getContactTypeLabel(type) {
    const labels = {
        'individual': '<span class="badge bg-primary">Cá nhân</span>',
        'business': '<span class="badge bg-success">Doanh nghiệp</span>',
        'creator': '<span class="badge bg-info">Người sáng tạo</span>'
    };
    return labels[type] || type;
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning">Chờ xử lý</span>',
        'processing': '<span class="badge bg-info">Đang xử lý</span>',
        'resolved': '<span class="badge bg-success">Đã giải quyết</span>',
        'closed': '<span class="badge bg-secondary">Đã đóng</span>'
    };
    return badges[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// =============================================
// LOGOUT
// =============================================
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'admin-login.html';
    }
}
