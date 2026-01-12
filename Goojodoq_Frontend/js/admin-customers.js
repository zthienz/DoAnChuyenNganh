// =============================================
// ADMIN CUSTOMERS MANAGEMENT
// =============================================

const API_URL = 'http://localhost:3000/api';

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadCustomers();
});

// =============================================
// CHECK ADMIN AUTHENTICATION
// =============================================
function checkAdminAuth() {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    let currentUser = null;
    if (localUser) {
        currentUser = JSON.parse(localUser);
    } else if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
    }
    
    if (!currentUser || currentUser.quyen !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'admin-login.html';
        return;
    }
    
    const adminName = currentUser.hoten || currentUser.email?.split('@')[0] || 'Admin';
    document.getElementById('adminName').textContent = adminName;
}

// =============================================
// LOAD CUSTOMERS
// =============================================
async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/auth/users`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải danh sách khách hàng');
        }
        
        const tbody = document.querySelector('#customersTable tbody');
        tbody.innerHTML = '';
        
        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Chưa có khách hàng nào</td></tr>';
            return;
        }
        
        data.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id_nguoidung}</td>
                <td>${user.hoten || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                <td>${user.email}</td>
                <td>${user.sdt || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                <td>${formatDateTime(user.ngay_tao)}</td>
                <td>
                    ${user.trangthai === 1 ? 
                        '<span class="badge bg-success">Hoạt động</span>' : 
                        '<span class="badge bg-danger">Đã khóa</span>'}
                </td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="viewUserDetail(${user.id_nguoidung})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${user.trangthai === 1 ? 
                        `<button class="btn btn-sm btn-warning me-1" onclick="toggleUserStatus(${user.id_nguoidung}, 0, '${escapeHtml(user.email)}')" title="Khóa tài khoản">
                            <i class="fas fa-lock"></i>
                        </button>` :
                        `<button class="btn btn-sm btn-success me-1" onclick="toggleUserStatus(${user.id_nguoidung}, 1, '${escapeHtml(user.email)}')" title="Mở khóa tài khoản">
                            <i class="fas fa-unlock"></i>
                        </button>`
                    }
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id_nguoidung}, '${escapeHtml(user.email)}')" title="Xóa người dùng">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading customers:', error);
        document.querySelector('#customersTable tbody').innerHTML = 
            `<tr><td colspan="7" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Lỗi tải dữ liệu: ${error.message}
            </td></tr>`;
    }
}

// =============================================
// VIEW USER DETAIL
// =============================================
async function viewUserDetail(userId) {
    try {
        const response = await fetch(`${API_URL}/profile/${userId}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin người dùng');
        }
        
        const data = await response.json();
        const user = data.user;
        const address = data.address;
        
        let content = `
            <div class="row g-3">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0"><i class="fas fa-user me-2"></i>Thông tin cơ bản</h6>
                        </div>
                        <div class="card-body">
                            <table class="table table-borderless mb-0">
                                <tr>
                                    <td width="40%"><strong>ID:</strong></td>
                                    <td>${user.id_nguoidung}</td>
                                </tr>
                                <tr>
                                    <td><strong>Họ tên:</strong></td>
                                    <td>${user.hoten || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email:</strong></td>
                                    <td>${user.email}</td>
                                </tr>
                                <tr>
                                    <td><strong>Số điện thoại:</strong></td>
                                    <td>${user.sdt || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Ngày đăng ký:</strong></td>
                                    <td>${formatDateTime(user.ngay_tao)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
        `;
        
        if (address) {
            content += `
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0"><i class="fas fa-map-marker-alt me-2"></i>Địa chỉ</h6>
                        </div>
                        <div class="card-body">
                            <table class="table table-borderless mb-0">
                                <tr>
                                    <td width="40%"><strong>Người nhận:</strong></td>
                                    <td>${address.ten_nguoinhan || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Số điện thoại:</strong></td>
                                    <td>${address.sdt || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Địa chỉ:</strong></td>
                                    <td>${address.diachi_chitiet || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Quận/Huyện:</strong></td>
                                    <td>${address.quanhuyen || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Thành phố:</strong></td>
                                    <td>${address.thanhpho || '<em class="text-muted">Chưa cập nhật</em>'}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        content += `</div>`;
        
        document.getElementById('userDetailContent').innerHTML = content;
        const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading user detail:', error);
        alert('Lỗi tải thông tin người dùng: ' + error.message);
    }
}

// =============================================
// TOGGLE USER STATUS (LOCK/UNLOCK)
// =============================================
function toggleUserStatus(userId, newStatus, email) {
    const action = newStatus === 1 ? 'mở khóa' : 'khóa';
    const actionText = newStatus === 1 ? 'Mở khóa' : 'Khóa';
    const iconClass = newStatus === 1 ? 'fa-unlock text-success' : 'fa-lock text-warning';
    const btnClass = newStatus === 1 ? 'btn-success' : 'btn-warning';
    
    // Cập nhật modal
    document.getElementById('confirmStatusTitle').textContent = `${actionText} tài khoản`;
    document.getElementById('confirmStatusIcon').className = `fas ${iconClass} fa-3x`;
    document.getElementById('confirmStatusMessage').innerHTML = 
        `Bạn có chắc muốn <strong>${action}</strong> tài khoản:<br><strong>"${email}"</strong>?`;
    
    const confirmBtn = document.getElementById('confirmStatusBtn');
    confirmBtn.className = `btn ${btnClass}`;
    confirmBtn.textContent = actionText;
    
    // Xóa event listener cũ và thêm mới
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', async function() {
        try {
            // Disable button và hiển thị loading
            newConfirmBtn.disabled = true;
            newConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
            
            const response = await fetch(`${API_URL}/auth/user/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || `Không thể ${action} tài khoản`);
            }
            
            // Đóng modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmStatusModal'));
            modal.hide();
            
            // Hiển thị thông báo thành công
            showSuccessToast(`Đã ${action} tài khoản "${email}" thành công!`);
            
            // Reload table
            loadCustomers();
            
        } catch (error) {
            console.error(`Error ${action} user:`, error);
            showErrorToast(`Lỗi ${action} tài khoản: ` + error.message);
            
            // Reset button
            newConfirmBtn.disabled = false;
            newConfirmBtn.textContent = actionText;
        }
    });
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('confirmStatusModal'));
    modal.show();
}

// =============================================
// DELETE USER
// =============================================
async function deleteUser(userId, email) {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${email}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/user/${userId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể xóa người dùng');
        }
        
        showSuccessToast('Đã xóa tài khoản thành công!');
        loadCustomers();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showErrorToast('Lỗi xóa tài khoản: ' + error.message);
    }
}

// =============================================
// HELPER FUNCTIONS
// =============================================
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'danger');
}

function showToast(message, type) {
    // Tạo toast container nếu chưa có
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Tạo toast element
    const toastId = 'toast_' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Hiển thị toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Xóa toast sau khi ẩn
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// =============================================
// LOGOUT
// =============================================
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'admin-login.html';
    }
}
