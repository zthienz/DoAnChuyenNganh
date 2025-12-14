// =============================================
// ADMIN VOUCHERS MANAGEMENT
// =============================================

let allVouchers = [];
let filteredVouchers = [];
let editingVoucherId = null;

// Load page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get current user from storage
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    let currentUser = null;
    if (localUser) {
        currentUser = JSON.parse(localUser);
    } else if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
    }

    // Check admin authentication
    if (!currentUser || currentUser.quyen !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'admin-login.html';
        return;
    }

    loadVouchers();
});

// Load all vouchers
async function loadVouchers() {
    try {
        const response = await fetch(`${API_BASE_URL}/vouchers/admin/all`);

        if (!response.ok) {
            throw new Error('Không thể tải danh sách mã giảm giá');
        }

        allVouchers = await response.json();
        filteredVouchers = [...allVouchers];
        
        displayVouchers();
        updateStats();

    } catch (error) {
        console.error('Error loading vouchers:', error);
        showNotification('Không thể tải danh sách mã giảm giá!', 'error');
    }
}

// Display vouchers
function displayVouchers() {
    const container = document.getElementById('vouchersContainer');
    
    if (filteredVouchers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-tags fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Không có mã giảm giá nào</h5>
                <p class="text-muted">Hãy tạo mã giảm giá đầu tiên!</p>
            </div>
        `;
        return;
    }

    const vouchersHtml = filteredVouchers.map(voucher => {
        const status = getVoucherStatus(voucher);
        const statusClass = getStatusClass(status);
        
        let discountText = '';
        if (voucher.loai_giam === 'theo_phantram') {
            discountText = `${voucher.giatri_giam}%`;
        } else {
            discountText = formatPrice(voucher.giatri_giam);
        }

        return `
            <div class="voucher-card">
                <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
                    <!-- Voucher Code & Status -->
                    <div class="voucher-info-main flex-shrink-0">
                        <div class="voucher-code">${voucher.ma}</div>
                        <span class="voucher-status ${statusClass}">${status}</span>
                    </div>
                    
                    <!-- Description & Discount -->
                    <div class="voucher-details flex-grow-1">
                        <h6 class="mb-1">${voucher.mo_ta || 'Không có mô tả'}</h6>
                        <div class="d-flex flex-wrap align-items-center gap-3 text-muted">
                            <span>
                                <i class="fas fa-gift me-1"></i>
                                Giảm ${discountText}
                            </span>
                            ${voucher.donhang_toi_thieu > 0 ? `
                                <span>
                                    <i class="fas fa-shopping-cart me-1"></i>
                                    Đơn tối thiểu ${formatPrice(voucher.donhang_toi_thieu)}
                                </span>
                            ` : ''}
                            <span>
                                <i class="fas fa-users me-1"></i>
                                ${voucher.gioihan_sudung ? `Còn ${voucher.gioihan_sudung} lượt` : 'Không giới hạn'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Date Info -->
                    <div class="voucher-dates flex-shrink-0">
                        <div class="d-flex flex-column gap-1">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                Từ: ${voucher.hieu_luc_tu ? formatDateShort(voucher.hieu_luc_tu) : 'Không giới hạn'}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-calendar-times me-1"></i>
                                Đến: ${voucher.hieu_luc_den ? formatDateShort(voucher.hieu_luc_den) : 'Không giới hạn'}
                            </small>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="voucher-actions flex-shrink-0">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editVoucher(${voucher.id_magiamgia})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteVoucher(${voucher.id_magiamgia}, '${voucher.ma}')" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = vouchersHtml;
}

// Get voucher status
function getVoucherStatus(voucher) {
    const now = new Date();
    const validFrom = voucher.hieu_luc_tu ? new Date(voucher.hieu_luc_tu) : null;
    const validTo = voucher.hieu_luc_den ? new Date(voucher.hieu_luc_den) : null;

    // Check usage limit first
    if (voucher.gioihan_sudung === 0) {
        return 'Hết lượt';
    }
    
    // Check expiry
    if (validTo && now > validTo) {
        return 'Hết hạn';
    }
    
    // Check if not yet valid
    if (validFrom && now < validFrom) {
        return 'Chưa có hiệu lực';
    }
    
    // Check if expiring soon (within 7 days)
    if (validTo) {
        const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            return `Còn ${daysUntilExpiry} ngày`;
        }
    }
    
    return 'Hoạt động';
}

// Get status CSS class
function getStatusClass(status) {
    if (status === 'Hoạt động') {
        return 'status-active';
    } else if (status === 'Hết hạn' || status === 'Hết lượt') {
        return 'status-expired';
    } else if (status === 'Chưa có hiệu lực') {
        return 'status-upcoming';
    } else if (status.includes('Còn') && status.includes('ngày')) {
        return 'status-warning';
    } else {
        return 'status-active';
    }
}

// Update statistics
function updateStats() {
    const total = allVouchers.length;
    let active = 0;
    let expiring = 0;
    let expired = 0;

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    allVouchers.forEach(voucher => {
        const status = getVoucherStatus(voucher);
        const validTo = voucher.hieu_luc_den ? new Date(voucher.hieu_luc_den) : null;

        if (status === 'Hoạt động' || status.includes('Còn')) {
            active++;
            if (status.includes('Còn') || (validTo && validTo <= nextWeek)) {
                expiring++;
            }
        } else if (status === 'Hết hạn' || status === 'Hết lượt') {
            expired++;
        }
    });

    document.getElementById('totalVouchers').textContent = total;
    document.getElementById('activeVouchers').textContent = active;
    document.getElementById('expiringVouchers').textContent = expiring;
    document.getElementById('expiredVouchers').textContent = expired;
}

// Show create voucher modal
function showCreateVoucherModal() {
    editingVoucherId = null;
    document.getElementById('voucherModalTitle').textContent = 'Tạo mã giảm giá mới';
    document.getElementById('voucherForm').reset();
    document.getElementById('voucherId').value = '';
    
    // Set default values
    document.getElementById('minOrder').value = '0';
    
    const modal = new bootstrap.Modal(document.getElementById('voucherModal'));
    modal.show();
}

// Edit voucher
function editVoucher(voucherId) {
    const voucher = allVouchers.find(v => v.id_magiamgia === voucherId);
    if (!voucher) return;

    editingVoucherId = voucherId;
    document.getElementById('voucherModalTitle').textContent = 'Chỉnh sửa mã giảm giá';
    
    // Fill form
    document.getElementById('voucherId').value = voucher.id_magiamgia;
    document.getElementById('voucherCode').value = voucher.ma;
    document.getElementById('discountType').value = voucher.loai_giam;
    document.getElementById('discountValue').value = voucher.giatri_giam;
    document.getElementById('minOrder').value = voucher.donhang_toi_thieu || 0;
    document.getElementById('description').value = voucher.mo_ta || '';
    document.getElementById('usageLimit').value = voucher.gioihan_sudung || '';
    
    // Format dates for datetime-local input
    if (voucher.hieu_luc_tu) {
        document.getElementById('validFrom').value = formatDateTimeLocal(voucher.hieu_luc_tu);
    }
    if (voucher.hieu_luc_den) {
        document.getElementById('validTo').value = formatDateTimeLocal(voucher.hieu_luc_den);
    }
    
    toggleDiscountFields();
    
    const modal = new bootstrap.Modal(document.getElementById('voucherModal'));
    modal.show();
}

// Toggle discount fields based on type
function toggleDiscountFields() {
    const discountType = document.getElementById('discountType').value;
    const label = document.getElementById('discountValueLabel');
    const input = document.getElementById('discountValue');
    
    if (discountType === 'theo_phantram') {
        label.textContent = 'Phần trăm giảm (%) *';
        input.setAttribute('max', '100');
        input.setAttribute('step', '0.01');
    } else if (discountType === 'theo_tien') {
        label.textContent = 'Số tiền giảm (VNĐ) *';
        input.removeAttribute('max');
        input.setAttribute('step', '1000');
    }
}

// Save voucher
async function saveVoucher() {
    try {
        const formData = {
            code: document.getElementById('voucherCode').value.trim().toUpperCase(),
            discountType: document.getElementById('discountType').value,
            discountValue: parseFloat(document.getElementById('discountValue').value),
            minOrder: parseFloat(document.getElementById('minOrder').value) || 0,
            description: document.getElementById('description').value.trim(),
            usageLimit: parseInt(document.getElementById('usageLimit').value) || null,
            validFrom: document.getElementById('validFrom').value || null,
            validTo: document.getElementById('validTo').value || null
        };

        // Validation
        if (!formData.code || !formData.discountType || !formData.discountValue) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'warning');
            return;
        }

        if (formData.discountType === 'theo_phantram' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
            showNotification('Phần trăm giảm phải từ 0.01% đến 100%!', 'warning');
            return;
        }

        if (formData.discountType === 'theo_tien' && formData.discountValue <= 0) {
            showNotification('Số tiền giảm phải lớn hơn 0!', 'warning');
            return;
        }

        if (formData.validFrom && formData.validTo && new Date(formData.validFrom) >= new Date(formData.validTo)) {
            showNotification('Ngày kết thúc phải sau ngày bắt đầu!', 'warning');
            return;
        }

        const url = editingVoucherId 
            ? `${API_BASE_URL}/vouchers/admin/${editingVoucherId}`
            : `${API_BASE_URL}/vouchers/admin`;
            
        const method = editingVoucherId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể lưu mã giảm giá');
        }

        showNotification(
            editingVoucherId ? 'Cập nhật mã giảm giá thành công!' : 'Tạo mã giảm giá thành công!', 
            'success'
        );

        // Close modal and reload
        bootstrap.Modal.getInstance(document.getElementById('voucherModal')).hide();
        loadVouchers();

    } catch (error) {
        console.error('Error saving voucher:', error);
        showNotification(error.message, 'error');
    }
}

// Delete voucher
function deleteVoucher(voucherId, voucherCode) {
    editingVoucherId = voucherId;
    document.getElementById('deleteVoucherCode').textContent = voucherCode;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Confirm delete voucher
async function confirmDeleteVoucher() {
    try {
        const response = await fetch(`${API_BASE_URL}/vouchers/admin/${editingVoucherId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể xóa mã giảm giá');
        }

        showNotification('Xóa mã giảm giá thành công!', 'success');
        
        // Close modal and reload
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        loadVouchers();

    } catch (error) {
        console.error('Error deleting voucher:', error);
        showNotification(error.message, 'error');
    }
}

// Filter vouchers
function filterVouchers() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const searchTerm = document.getElementById('searchVoucher').value.toLowerCase();

    filteredVouchers = allVouchers.filter(voucher => {
        const status = getVoucherStatus(voucher);
        const matchesStatus = !statusFilter || 
            (statusFilter === 'active' && (status === 'Hoạt động' || status.includes('Còn'))) ||
            (statusFilter === 'expired' && (status === 'Hết hạn' || status === 'Hết lượt')) ||
            (statusFilter === 'upcoming' && status === 'Chưa có hiệu lực');

        const matchesType = !typeFilter || voucher.loai_giam === typeFilter;
        
        const matchesSearch = !searchTerm || 
            voucher.ma.toLowerCase().includes(searchTerm) ||
            (voucher.mo_ta && voucher.mo_ta.toLowerCase().includes(searchTerm));

        return matchesStatus && matchesType && matchesSearch;
    });

    displayVouchers();
}

// Reset filters
function resetFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('searchVoucher').value = '';
    
    filteredVouchers = [...allVouchers];
    displayVouchers();
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// showNotification is already available from main.js