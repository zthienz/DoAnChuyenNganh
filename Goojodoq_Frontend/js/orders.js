// =============================================
// ORDERS PAGE JAVASCRIPT
// =============================================

let allOrders = [];
let currentFilter = 'all';

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Refresh currentUser from storage
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    if (localUser) {
        currentUser = JSON.parse(localUser);
    } else if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
    }
    
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để xem đơn hàng!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Redirect admin to admin orders page
    if (currentUser.quyen === 'admin') {
        console.log('⚠️ Admin detected, redirecting to admin-orders.html');
        showNotification('Đang chuyển đến trang quản lý đơn hàng...', 'info');
        setTimeout(() => {
            window.location.href = 'admin-orders.html';
        }, 1000);
        return;
    }
    
    loadOrders();
});

// Load orders from API
async function loadOrders() {
    try {
        // Refresh currentUser from storage to ensure we have the latest data
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');
        
        console.log('🔍 LocalStorage user:', localUser);
        console.log('🔍 SessionStorage user:', sessionUser);
        
        if (localUser) {
            currentUser = JSON.parse(localUser);
        } else if (sessionUser) {
            currentUser = JSON.parse(sessionUser);
        }
        
        // Ensure we have current user
        if (!currentUser || !currentUser.id_nguoidung) {
            throw new Error('User not found');
        }

        console.log('📦 Loading orders for user:', currentUser.id_nguoidung);
        console.log('📦 User email:', currentUser.email);
        console.log('📦 User name:', currentUser.hoten);
        console.log('📦 Full user info:', currentUser);

        const url = `${API_BASE_URL}/orders/user/${currentUser.id_nguoidung}`;
        console.log('📦 API URL:', url);

        const response = await fetch(url);
        
        console.log('📦 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        allOrders = await response.json();
        console.log('✅ Orders loaded:', allOrders.length, 'orders');
        console.log('✅ Orders data:', allOrders);
        
        // Verify orders belong to current user
        const wrongOrders = allOrders.filter(order => order.id_nguoidung !== currentUser.id_nguoidung);
        if (wrongOrders.length > 0) {
            console.error('⚠️ CRITICAL ERROR: Found orders that do not belong to current user!');
            console.error('⚠️ Current user ID:', currentUser.id_nguoidung);
            console.error('⚠️ Current user email:', currentUser.email);
            console.error('⚠️ Wrong orders:', wrongOrders);
            console.error('⚠️ Wrong order IDs:', wrongOrders.map(o => `${o.ma_donhang} (User ID: ${o.id_nguoidung})`));
            
            // This should NEVER happen - it means backend is returning wrong data
            // Force logout and clear storage
            alert('LỖI NGHIÊM TRỌNG: Phát hiện dữ liệu không hợp lệ!\n\nHệ thống sẽ tự động đăng xuất để bảo vệ dữ liệu của bạn.');
            
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Show error message
            document.getElementById('ordersList').innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-exclamation-triangle me-2"></i>LỖI NGHIÊM TRỌNG!</h5>
                    <p class="fw-bold">Phát hiện ${wrongOrders.length} đơn hàng không thuộc về tài khoản của bạn.</p>
                    
                    <div class="bg-light p-3 rounded mb-3">
                        <p class="mb-2"><strong>Tài khoản hiện tại:</strong></p>
                        <ul class="mb-0">
                            <li>Email: ${currentUser.email}</li>
                            <li>Tên: ${currentUser.hoten || 'N/A'}</li>
                            <li>User ID: ${currentUser.id_nguoidung}</li>
                        </ul>
                    </div>
                    
                    <div class="bg-light p-3 rounded mb-3">
                        <p class="mb-2"><strong>Đơn hàng lỗi:</strong></p>
                        <ul class="mb-0">
                            ${wrongOrders.map(o => `
                                <li class="text-danger">
                                    <strong>${o.ma_donhang}</strong> - 
                                    Thuộc về User ID: ${o.id_nguoidung} 
                                    (Người nhận: ${o.ten_nguoinhan || 'N/A'})
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <hr>
                    
                    <div class="alert alert-warning mb-3">
                        <h6><i class="fas fa-info-circle me-2"></i>Nguyên nhân có thể:</h6>
                        <ul class="mb-0">
                            <li>LocalStorage bị lỗi hoặc ghi đè</li>
                            <li>Nhiều người dùng cùng sử dụng một trình duyệt</li>
                            <li>Không đăng xuất đúng cách</li>
                        </ul>
                    </div>
                    
                    <p class="mb-3">
                        <strong>Hệ thống đã tự động xóa dữ liệu lỗi.</strong><br>
                        Vui lòng đăng nhập lại để tiếp tục.
                    </p>
                    
                    <a href="login.html" class="btn btn-primary btn-lg">
                        <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập lại
                    </a>
                </div>
            `;
            
            // Redirect to login after 5 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 5000);
            
            return;
        }

        displayOrders(allOrders);

    } catch (error) {
        console.error('❌ Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Không thể tải đơn hàng. Vui lòng thử lại sau.
                <br><small>Lỗi: ${error.message}</small>
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
        
        // Logic hủy đơn hàng - CHỈ CHO PHÉP HỦY KHI CHƯA THANH TOÁN
        let canCancel = false;
        let cancelTooltip = '';
        
        // LOGIC MỚI: Chỉ cho phép hủy đơn hàng khi CHƯA THANH TOÁN
        if (order.trangthai === 'cho_xacnhan' && order.trangthai_thanhtoan === 'chua_tt') {
            // Đơn hàng chờ xác nhận và chưa thanh toán -> CÓ THỂ HỦY
            canCancel = true;
            cancelTooltip = 'Hủy đơn hàng';
        } else if (order.trangthai_thanhtoan === 'da_tt') {
            // Đơn hàng đã thanh toán -> KHÔNG THỂ HỦY (bất kể trạng thái đơn hàng)
            canCancel = false;
            cancelTooltip = 'Không thể hủy đơn hàng đã thanh toán thành công';
        } else if (order.trangthai === 'huy') {
            // Đơn hàng đã hủy
            canCancel = false;
            cancelTooltip = 'Đơn hàng đã bị hủy';
        } else {
            // Các trạng thái khác (đang giao, hoàn thành)
            canCancel = false;
            cancelTooltip = 'Không thể hủy đơn hàng ở trạng thái này';
        }
        
        const canConfirmReceived = order.trangthai === 'dang_giao';
        const canReview = order.trangthai === 'hoanthanh';
        
        // Build address string
        let addressStr = '';
        if (order.diachi_chitiet) {
            addressStr = `${order.diachi_chitiet}, ${order.quanhuyen}, ${order.thanhpho}`;
        }
        
        // Hiển thị phương thức thanh toán và trạng thái thanh toán
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
                    <div class="alert alert-light mb-3 py-2">
                        <small>
                            <i class="fas fa-info-circle me-1"></i>
                            <strong>Thông tin giao hàng</strong>
                        </small>
                    </div>
                    ${order.ten_nguoinhan ? `
                        <p class="mb-2">
                            <i class="fas fa-user me-2"></i>
                            <strong>Người nhận hàng:</strong> ${order.ten_nguoinhan}
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
                            ${canReview ? `
                                <button class="btn btn-sm btn-warning" onclick="reviewOrder(${order.id_donhang})">
                                    <i class="fas fa-star me-1"></i>Đánh giá
                                </button>
                            ` : ''}
                            ${canCancel ? `
                                <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id_donhang})">
                                    <i class="fas fa-times me-1"></i>Hủy đơn
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-outline-secondary" disabled title="${cancelTooltip}" style="opacity: 0.5; cursor: not-allowed;">
                                    <i class="fas fa-times me-1"></i>Hủy đơn
                                </button>
                            `}
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

// Review order
function reviewOrder(orderId) {
    window.location.href = `review-order.html?orderId=${orderId}`;
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
