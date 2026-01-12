let allOrders = [];
let currentFilter = 'all';

// Check admin authentication
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
        return false;
    }
    
    const adminName = currentUser.hoten || currentUser.email?.split('@')[0] || 'Admin';
    if (document.getElementById('adminName')) {
        document.getElementById('adminName').textContent = adminName;
    }
    return true;
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'admin-login.html';
    }
}

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminAuth()) return;
    loadOrders();
});

// Load all orders from API
async function loadOrders() {
    try {
        console.log('📦 Loading all orders for admin...');
        console.log('API URL:', `${API_BASE_URL}/orders`);
        
        const response = await fetch(`${API_BASE_URL}/orders`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allOrders = await response.json();
        console.log('✅ Orders loaded:', allOrders);
        
        displayOrders(allOrders);

    } catch (error) {
        console.error('❌ Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Không thể tải đơn hàng. Vui lòng thử lại sau.
            </div>
        `;
    }
}

// Display orders
function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-bag fa-4x text-muted mb-3"></i>
                <h4>Chưa có đơn hàng nào</h4>
            </div>
        `;
        return;
    }

    let html = '';
    orders.forEach(order => {
        const statusBadge = getStatusBadge(order.trangthai);
        const canConfirm = order.trangthai === 'cho_xacnhan';
        
        // Logic hủy đơn hàng cho admin - chỉ cho phép hủy khi chưa thanh toán
        let canCancel = false;
        let cancelTooltip = '';
        
        // Admin chỉ có thể hủy đơn hàng khi chờ xác nhận và chưa thanh toán
        if (order.trangthai === 'cho_xacnhan') {
            if (order.trangthai_thanhtoan === 'chua_tt') {
                canCancel = true;
                cancelTooltip = 'Hủy đơn hàng';
            } else if (order.trangthai_thanhtoan === 'da_tt') {
                canCancel = false;
                cancelTooltip = 'Không thể hủy đơn hàng đã thanh toán thành công';
            }
        } else if (order.trangthai === 'huy') {
            canCancel = false;
            cancelTooltip = 'Đơn hàng đã bị hủy';
        } else {
            canCancel = false;
            cancelTooltip = 'Không thể hủy đơn hàng ở trạng thái này';
        }
        
        // Build address string
        let addressStr = '';
        if (order.diachi_chitiet) {
            addressStr = `${order.diachi_chitiet}, ${order.quanhuyen}, ${order.thanhpho}`;
        }
        
        // Hiển thị phương thức thanh toán
        let paymentMethodText = '';
        let paymentStatusText = '';
        
        // Phương thức thanh toán
        switch(order.phuongthuc_thanhtoan) {
            case 'cod':
                paymentMethodText = '<span class="badge bg-secondary"><i class="fas fa-money-bill-wave me-1"></i>COD</span>';
                break;
            case 'bank_transfer':
            case 'payos':
                paymentMethodText = '<span class="badge bg-primary"><i class="fas fa-qrcode me-1"></i>Chuyển khoản QR</span>';
                break;
            case 'momo':
                paymentMethodText = '<span class="badge bg-danger"><i class="fas fa-mobile-alt me-1"></i>MoMo</span>';
                break;
            case 'vnpay':
                paymentMethodText = '<span class="badge bg-info"><i class="fas fa-credit-card me-1"></i>VNPay</span>';
                break;
            default:
                paymentMethodText = '<span class="badge bg-light text-dark">Khác</span>';
        }
        
        // Trạng thái thanh toán - LOGIC MỚI
        if (order.trangthai_thanhtoan === 'da_tt') {
            // ĐÃ THANH TOÁN - Hiển thị badge xanh lá
            paymentStatusText = '<span class="badge bg-success ms-1"><i class="fas fa-check-circle me-1"></i>Đã thanh toán</span>';
        } else if (order.phuongthuc_thanhtoan === 'bank_transfer' || order.phuongthuc_thanhtoan === 'payos') {
            // CHUYỂN KHOẢN QR
            if (order.trangthai === 'huy') {
                // Đơn hàng đã hủy (người dùng hủy tại bước quét QR)
                paymentStatusText = '<span class="badge bg-danger ms-1"><i class="fas fa-times-circle me-1"></i>Đã hủy thanh toán</span>';
            } else {
                // Đơn hàng chờ thanh toán (chưa quét QR hoặc chưa hoàn tất)
                paymentStatusText = '<span class="badge bg-warning text-dark ms-1"><i class="fas fa-clock me-1"></i>Chờ thanh toán QR</span>';
            }
        } else if (order.phuongthuc_thanhtoan === 'cod') {
            // COD
            if (order.trangthai_thanhtoan === 'chua_tt') {
                paymentStatusText = '<span class="badge bg-secondary ms-1"><i class="fas fa-truck me-1"></i>Thanh toán khi nhận hàng</span>';
            }
        } else {
            // Các phương thức khác
            paymentStatusText = '<span class="badge bg-secondary ms-1"><i class="fas fa-clock me-1"></i>Chưa thanh toán</span>';
        }
        
        html += `
            <div class="card mb-3 order-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Mã đơn hàng: ${order.ma_donhang}</strong>
                        <span class="text-muted ms-3">
                            <i class="fas fa-calendar me-1"></i>
                            ${new Date(order.ngay_tao).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div>
                        ${statusBadge}
                        <span class="ms-2">${paymentMethodText}${paymentStatusText}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <h6 class="text-primary mb-2">
                                <i class="fas fa-user me-2"></i>Thông tin khách hàng
                            </h6>
                            ${order.ten_nguoinhan ? `
                                <p class="mb-1">
                                    <strong>Người nhận:</strong> ${order.ten_nguoinhan}
                                </p>
                            ` : ''}
                            ${order.ten_nguoidung ? `
                                <p class="mb-1">
                                    <strong>Tài khoản:</strong> ${order.ten_nguoidung}
                                </p>
                            ` : ''}
                            ${order.email ? `
                                <p class="mb-1">
                                    <strong>Email:</strong> ${order.email}
                                </p>
                            ` : ''}
                            ${order.sdt ? `
                                <p class="mb-1">
                                    <strong>Số điện thoại:</strong> ${order.sdt}
                                </p>
                            ` : ''}
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary mb-2">
                                <i class="fas fa-map-marker-alt me-2"></i>Địa chỉ giao hàng
                            </h6>
                            ${addressStr ? `
                                <p class="mb-1">${addressStr}</p>
                            ` : '<p class="text-muted">Chưa có địa chỉ</p>'}
                        </div>
                    </div>
                    
                    <!-- Products -->
                    <h6 class="text-primary mb-2">
                        <i class="fas fa-box me-2"></i>Sản phẩm
                    </h6>
                    <div class="order-products">
                        ${order.items ? order.items.map(item => {
                            let imageUrl = item.image || '/images/products/default.jpg';
                            if (imageUrl.startsWith('/images')) {
                                imageUrl = `http://localhost:3000${imageUrl}`;
                            }
                            return `
                                <div class="order-product-item">
                                    <img src="${imageUrl}" alt="${item.ten_sanpham}" onerror="this.src='images/products/default.jpg'">
                                    <div class="flex-grow-1">
                                        <h6 class="mb-1">${item.ten_sanpham}</h6>
                                        <p class="text-muted mb-0">SKU: ${item.ma_sku || 'N/A'}</p>
                                        <p class="text-muted mb-0">Số lượng: x${item.soluong}</p>
                                    </div>
                                    <div class="text-end">
                                        <p class="mb-0 text-primary fw-bold">${formatPrice(item.gia_donvi)}</p>
                                        <p class="mb-0 text-muted small">Tổng: ${formatPrice(item.thanh_tien)}</p>
                                    </div>
                                </div>
                            `;
                        }).join('') : ''}
                    </div>
                    
                    <hr>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Tổng tiền:</strong> 
                            <span class="text-danger fs-5 fw-bold">${formatPrice(order.tong_tien)}</span>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-info text-white" onclick="viewOrderDetail(${order.id_donhang})">
                                <i class="fas fa-eye me-1"></i>Chi tiết
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="exportOrderInvoice(${order.id_donhang})" title="Xuất hóa đơn">
                                <i class="fas fa-file-invoice me-1"></i>Hóa đơn
                            </button>
                            ${canConfirm ? `
                                <button class="btn btn-sm btn-success" onclick="confirmOrder(${order.id_donhang})">
                                    <i class="fas fa-check me-1"></i>Xác nhận
                                </button>
                            ` : ''}
                            ${canCancel ? `
                                <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id_donhang})">
                                    <i class="fas fa-times me-1"></i>Hủy đơn
                                </button>
                            ` : (cancelTooltip ? `
                                <button class="btn btn-sm btn-outline-secondary" disabled title="${cancelTooltip}">
                                    <i class="fas fa-times me-1"></i>Hủy đơn
                                </button>
                            ` : '')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Filter orders by status
function filterOrders(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('#orderTabs .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`#orderTabs .nav-link[data-status="${status}"]`).classList.add('active');
    
    // Filter orders
    if (status === 'all') {
        displayOrders(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.trangthai === status);
        displayOrders(filtered);
    }
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'cho_xacnhan': '<span class="badge bg-warning text-dark"><i class="fas fa-clock me-1"></i>Chờ xác nhận</span>',
        'dang_giao': '<span class="badge bg-info"><i class="fas fa-shipping-fast me-1"></i>Đang giao</span>',
        'hoanthanh': '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Hoàn thành</span>',
        'huy': '<span class="badge bg-danger"><i class="fas fa-times-circle me-1"></i>Đã hủy</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Không xác định</span>';
}

// View order detail
function viewOrderDetail(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

// Confirm order (Admin)
async function confirmOrder(orderId) {
    if (!confirm('Xác nhận đơn hàng này?\n\nĐơn hàng sẽ chuyển sang trạng thái "Đang giao".')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể xác nhận đơn hàng');
        }

        showNotification('Đã xác nhận đơn hàng thành công!', 'success');
        await loadOrders();

    } catch (error) {
        console.error('Error confirming order:', error);
        showNotification(error.message || 'Không thể xác nhận đơn hàng!', 'error');
    }
}

// Cancel order (Admin)
async function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?\n\nSản phẩm sẽ được hoàn lại vào kho.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể hủy đơn hàng');
        }

        showNotification('Đã hủy đơn hàng thành công!', 'success');
        await loadOrders();

    } catch (error) {
        console.error('Error canceling order:', error);
        showNotification(error.message || 'Không thể hủy đơn hàng!', 'error');
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}
