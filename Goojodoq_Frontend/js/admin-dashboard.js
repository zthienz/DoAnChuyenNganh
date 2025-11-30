// =============================================
// ADMIN DASHBOARD
// =============================================

const API_URL = 'http://localhost:3000/api';

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardData();
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
// LOAD DASHBOARD DATA
// =============================================
async function loadDashboardData() {
    await Promise.all([
        loadOverviewStats(),
        loadRecentActivity(),
        loadOrderStats(),
        loadSupportStats()
    ]);
}

// =============================================
// LOAD OVERVIEW STATISTICS
// =============================================
async function loadOverviewStats() {
    try {
        // Load users count
        const usersResponse = await fetch(`${API_URL}/auth/users`);
        const usersData = await usersResponse.json();
        document.getElementById('totalUsers').textContent = usersData.users?.length || 0;

        // Load orders count and revenue
        const ordersResponse = await fetch(`${API_URL}/orders`);
        const ordersData = await ordersResponse.json();
        const orders = ordersData.orders || [];
        document.getElementById('totalOrders').textContent = orders.length;

        // Calculate total revenue (only completed orders)
        const totalRevenue = orders
            .filter(order => order.trangthai === 'Đã giao')
            .reduce((sum, order) => sum + parseFloat(order.tongtien || 0), 0);
        document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);

        // Load products count
        const productsResponse = await fetch(`${API_URL}/products`);
        const productsData = await productsResponse.json();
        document.getElementById('totalProducts').textContent = productsData.length || 0;

    } catch (error) {
        console.error('Error loading overview stats:', error);
    }
}

// =============================================
// LOAD RECENT ACTIVITY
// =============================================
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_URL}/orders?limit=5`);
        const data = await response.json();
        const orders = data.orders || [];

        const activityList = document.getElementById('recentActivity');
        
        if (orders.length === 0) {
            activityList.innerHTML = '<p class="text-muted text-center">Chưa có hoạt động nào</p>';
            return;
        }

        activityList.innerHTML = orders.map(order => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-title">Đơn hàng #${order.id_donhang}</p>
                    <p class="activity-desc">${order.ten_nguoidung || 'Khách hàng'} - ${formatPrice(order.tongtien)}</p>
                    <p class="activity-time">${formatDateTime(order.ngay_tao)}</p>
                </div>
                <div class="activity-status">
                    ${getOrderStatusBadge(order.trangthai)}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recentActivity').innerHTML = 
            '<p class="text-danger text-center">Không thể tải dữ liệu</p>';
    }
}

// =============================================
// LOAD ORDER STATISTICS
// =============================================
async function loadOrderStats() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        const data = await response.json();
        const orders = data.orders || [];

        // Count orders by status
        const stats = {
            'Chờ xác nhận': 0,
            'Đã xác nhận': 0,
            'Đang giao': 0,
            'Đã giao': 0,
            'Đã hủy': 0
        };

        orders.forEach(order => {
            if (stats.hasOwnProperty(order.trangthai)) {
                stats[order.trangthai]++;
            }
        });

        const orderStatsDiv = document.getElementById('orderStats');
        orderStatsDiv.innerHTML = `
            <div class="order-stats-list">
                <div class="order-stat-item">
                    <span class="stat-label">Chờ xác nhận</span>
                    <span class="stat-value badge bg-warning">${stats['Chờ xác nhận']}</span>
                </div>
                <div class="order-stat-item">
                    <span class="stat-label">Đã xác nhận</span>
                    <span class="stat-value badge bg-info">${stats['Đã xác nhận']}</span>
                </div>
                <div class="order-stat-item">
                    <span class="stat-label">Đang giao</span>
                    <span class="stat-value badge bg-primary">${stats['Đang giao']}</span>
                </div>
                <div class="order-stat-item">
                    <span class="stat-label">Đã giao</span>
                    <span class="stat-value badge bg-success">${stats['Đã giao']}</span>
                </div>
                <div class="order-stat-item">
                    <span class="stat-label">Đã hủy</span>
                    <span class="stat-value badge bg-danger">${stats['Đã hủy']}</span>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading order stats:', error);
        document.getElementById('orderStats').innerHTML = 
            '<p class="text-danger text-center">Không thể tải dữ liệu</p>';
    }
}

// =============================================
// LOAD SUPPORT STATISTICS
// =============================================
async function loadSupportStats() {
    try {
        const response = await fetch(`${API_URL}/support/stats`);
        const stats = await response.json();

        document.getElementById('pendingSupport').textContent = stats.pending || 0;
        document.getElementById('processingSupport').textContent = stats.processing || 0;
        document.getElementById('resolvedSupport').textContent = stats.resolved || 0;
        document.getElementById('closedSupport').textContent = stats.closed || 0;

    } catch (error) {
        console.error('Error loading support stats:', error);
    }
}

// =============================================
// HELPER FUNCTIONS
// =============================================
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function getOrderStatusBadge(status) {
    const badges = {
        'Chờ xác nhận': '<span class="badge bg-warning">Chờ xác nhận</span>',
        'Đã xác nhận': '<span class="badge bg-info">Đã xác nhận</span>',
        'Đang giao': '<span class="badge bg-primary">Đang giao</span>',
        'Đã giao': '<span class="badge bg-success">Đã giao</span>',
        'Đã hủy': '<span class="badge bg-danger">Đã hủy</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
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
