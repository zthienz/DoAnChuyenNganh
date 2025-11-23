// =============================================
// ORDERS PAGE JAVASCRIPT
// =============================================

let allOrders = [];
let currentFilter = 'all';

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để xem đơn hàng!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    loadOrders();
});

// Load orders from API
async function loadOrders() {
    try {
        console.log('📦 Loading orders for user:', currentUser.id_nguoidung);

        const response = await fetch(`${API_BASE_URL}/orders/${currentUser.id_nguoidung}`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
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
                <p class="text-muted">Hãy mua sắm ngay!</p>
                <a href="shop.html" class="btn btn-primary">
                    <i class="fas fa-shopping-cart me-2"></i>Mua sắm ngay
                </a>
            </div>
        `;
        return;
    }

    let html = '';
    orders.forEach(order => {
        const statusBadge = getStatusBadge(order.trangthai);
        const canCancel = order.trangthai === 'cho_xacnhan';
        const canConfirmReceived = order.trangthai === 'dang_giao';
        
        // Build address string
        let addressStr = '';
        if (order.diachi_chitiet) {
            addressStr = `${order.diachi_chitiet}, ${order.quanhuyen}, ${order.thanhpho}`;
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
                    <div>${statusBadge}</div>
                </div>
                <div class="card-body">
                    ${order.ten_nguoinhan ? `
                        <p class="mb-2">
                            <i class="fas fa-user me-2"></i>
                            <strong>Người nhận:</strong> ${order.ten_nguoinhan}
                        </p>
                    ` : ''}
                    ${order.sdt ? `
                        <p class="mb-2">
                            <i class="fas fa-phone me-2"></i>
                            <strong>Số điện thoại:</strong> ${order.sdt}
                        </p>
                    ` : ''}
                    ${addressStr ? `
                        <p class="mb-2">
                            <i class="fas fa-map-marker-alt me-2"></i>
                            <strong>Địa chỉ:</strong> ${addressStr}
                        </p>
                    ` : ''}
                    
                    <!-- Products -->
                    <div class="order-products mt-3">
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
                                        <p class="text-muted mb-0">x${item.soluong}</p>
                                    </div>
                                    <div class="text-end">
                                        <p class="mb-0 text-primary">${formatPrice(item.gia_donvi)}</p>
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
                            <button class="btn btn-sm btn-primary" onclick="viewOrderDetail(${order.id_donhang})">
                                <i class="fas fa-eye me-1"></i>Chi tiết
                            </button>
                            ${canCancel ? `
                                <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id_donhang})">
                                    <i class="fas fa-times me-1"></i>Hủy đơn
                                </button>
                            ` : ''}
                            ${canConfirmReceived ? `
                                <button class="btn btn-sm btn-success" onclick="confirmReceived(${order.id_donhang})">
                                    <i class="fas fa-check me-1"></i>Đã nhận hàng
                                </button>
                            ` : ''}
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
        'hoanthanh': '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Đã giao</span>',
        'huy': '<span class="badge bg-danger"><i class="fas fa-times-circle me-1"></i>Đã hủy</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Không xác định</span>';
}

// View order detail
function viewOrderDetail(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

// Cancel order
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

// Confirm received
async function confirmReceived(orderId) {
    if (!confirm('Xác nhận bạn đã nhận được hàng?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/received`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể xác nhận');
        }

        showNotification('Cảm ơn bạn đã xác nhận nhận hàng!', 'success');
        await loadOrders();

    } catch (error) {
        console.error('Error confirming received:', error);
        showNotification(error.message || 'Không thể xác nhận!', 'error');
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}
