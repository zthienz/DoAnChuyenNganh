// =============================================
// ADMIN DASHBOARD
// =============================================

const API_URL = 'http://localhost:3000/api';

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    if (checkAdminAuth()) {
        loadDashboardData();
    }
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
    
    console.log('🔍 Checking admin auth:', currentUser);
    
    if (!currentUser || currentUser.quyen !== 'admin') {
        console.log('❌ Not admin or no user, redirecting to admin login');
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'admin-login.html';
        return false;
    }
    
    // Check session validity
    if (!checkAdminSessionValidity()) {
        return false;
    }
    
    console.log('✅ Admin authenticated:', currentUser.hoten || currentUser.email);
    const adminName = currentUser.hoten || currentUser.email?.split('@')[0] || 'Admin';
    document.getElementById('adminName').textContent = adminName;
    
    return true;
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
        const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
        document.getElementById('totalOrders').textContent = orders.length;

        // Calculate total revenue (only completed orders - status 'hoanthanh')
        const totalRevenue = orders
            .filter(order => order.trangthai === 'hoanthanh')
            .reduce((sum, order) => sum + parseFloat(order.tong_tien || 0), 0);
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
        console.log('🔄 Loading recent activity...');
        
        const response = await fetch(`${API_URL}/orders`);
        console.log('📡 Orders API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📡 Orders API response type:', Array.isArray(data) ? 'Array' : 'Object');
        console.log('📡 Orders API raw data:', data);
        
        const allOrders = Array.isArray(data) ? data : (data.orders || []);
        
        console.log('📦 Total orders found:', allOrders.length);
        if (allOrders.length > 0) {
            console.log('📦 Sample order:', allOrders[0]);
        }
        
        // Get the 5 most recent orders
        const recentOrders = allOrders
            .sort((a, b) => new Date(b.ngay_tao) - new Date(a.ngay_tao))
            .slice(0, 5);

        console.log('📦 Recent orders:', recentOrders.length);

        const activityList = document.getElementById('recentActivity');
        
        if (recentOrders.length === 0) {
            activityList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-inbox text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2 mb-0">Chưa có đơn hàng nào</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = recentOrders.map(order => `
            <div class="activity-item d-flex align-items-center p-3 border-bottom">
                <div class="activity-icon me-3">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                </div>
                <div class="activity-content flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="activity-title mb-1 fw-bold">Đơn hàng #${order.id_donhang}</p>
                            <p class="activity-desc mb-1 text-muted small">
                                ${order.ten_nguoidung || order.hoten || 'Khách hàng'} - ${formatPrice(order.tong_tien || 0)}
                            </p>
                            <p class="activity-time mb-0 text-muted" style="font-size: 0.8rem;">
                                <i class="fas fa-clock me-1"></i>${formatDateTime(order.ngay_tao)}
                            </p>
                        </div>
                        <div class="activity-status">
                            ${getOrderStatusBadge(order.trangthai)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        console.log('✅ Recent activity loaded successfully');

    } catch (error) {
        console.error('❌ Error loading recent activity:', error);
        document.getElementById('recentActivity').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle text-danger" style="font-size: 2rem;"></i>
                <p class="text-danger mt-2 mb-0">Không thể tải dữ liệu</p>
                <small class="text-muted">${error.message}</small>
            </div>
        `;
    }
}

// =============================================
// LOAD ORDER STATISTICS
// =============================================
async function loadOrderStats() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        const data = await response.json();
        
        // Check if data is an array (direct response) or has orders property
        const orders = Array.isArray(data) ? data : (data.orders || []);

        console.log('📊 Loading order stats, found orders:', orders.length);
        console.log('📊 Sample order statuses:', orders.slice(0, 3).map(o => o.trangthai));

        // Count orders by status
        const stats = {
            'cho_xacnhan': 0,
            'dang_giao': 0,
            'hoanthanh': 0,
            'huy': 0
        };

        orders.forEach(order => {
            const status = order.trangthai;
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            } else {
                console.log('⚠️ Unknown order status:', status);
            }
        });

        console.log('📊 Order stats:', stats);

        const orderStatsDiv = document.getElementById('orderStats');
        orderStatsDiv.innerHTML = `
            <div class="order-stats-list">
                <div class="order-stat-item d-flex justify-content-between align-items-center mb-2">
                    <span class="stat-label">
                        <i class="fas fa-clock text-warning me-2"></i>Chờ xác nhận
                    </span>
                    <span class="stat-value badge bg-warning">${stats['cho_xacnhan']}</span>
                </div>
                <div class="order-stat-item d-flex justify-content-between align-items-center mb-2">
                    <span class="stat-label">
                        <i class="fas fa-truck text-primary me-2"></i>Đang giao
                    </span>
                    <span class="stat-value badge bg-primary">${stats['dang_giao']}</span>
                </div>
                <div class="order-stat-item d-flex justify-content-between align-items-center mb-2">
                    <span class="stat-label">
                        <i class="fas fa-check-circle text-success me-2"></i>Hoàn thành
                    </span>
                    <span class="stat-value badge bg-success">${stats['hoanthanh']}</span>
                </div>
                <div class="order-stat-item d-flex justify-content-between align-items-center mb-2">
                    <span class="stat-label">
                        <i class="fas fa-times-circle text-danger me-2"></i>Đã hủy
                    </span>
                    <span class="stat-value badge bg-danger">${stats['huy']}</span>
                </div>
            </div>
            <div class="mt-3 pt-3 border-top">
                <div class="d-flex justify-content-between">
                    <span class="fw-bold">Tổng đơn hàng:</span>
                    <span class="badge bg-info">${orders.length}</span>
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
        'cho_xacnhan': '<span class="badge bg-warning">Chờ xác nhận</span>',
        'dang_giao': '<span class="badge bg-primary">Đang giao</span>',
        'hoanthanh': '<span class="badge bg-success">Hoàn thành</span>',
        'huy': '<span class="badge bg-danger">Đã hủy</span>',
        // Legacy support for Vietnamese status names
        'Chờ xác nhận': '<span class="badge bg-warning">Chờ xác nhận</span>',
        'Đã xác nhận': '<span class="badge bg-info">Đã xác nhận</span>',
        'Đang giao': '<span class="badge bg-primary">Đang giao</span>',
        'Đã giao': '<span class="badge bg-success">Đã giao</span>',
        'Hoàn thành': '<span class="badge bg-success">Hoàn thành</span>',
        'Đã hủy': '<span class="badge bg-danger">Đã hủy</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}



// =============================================
// CHARTS INITIALIZATION
// =============================================

let orderStatusChart = null;
let inventoryChart = null;
let revenueChart = null;

// Initialize charts after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add chart initialization after other data is loaded
    setTimeout(() => {
        initializeCharts();
        loadChartData();
    }, 1000);
    
    // Add event listeners for revenue filter
    document.querySelectorAll('input[name="revenueFilter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            loadRevenueChart(this.value);
        });
    });
});

// Initialize all charts
function initializeCharts() {
    initOrderStatusChart();
    initInventoryChart();
    initRevenueChart();
}

// Order Status Pie Chart
function initOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart').getContext('2d');
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#ffc107', // warning - chờ xác nhận
                    '#17a2b8', // info - đang giao
                    '#28a745', // success - hoàn thành
                    '#dc3545'  // danger - đã hủy
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Inventory Status Pie Chart
function initInventoryChart() {
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    inventoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Còn hàng', 'Sắp hết', 'Hết hàng'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#28a745', // success - còn hàng
                    '#ffc107', // warning - sắp hết
                    '#dc3545'  // danger - hết hàng
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} sản phẩm (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Revenue Line Chart
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Doanh thu',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Doanh thu: ${formatPrice(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatPriceShort(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Load all chart data
async function loadChartData() {
    await Promise.all([
        loadOrderStatusChart(),
        loadInventoryChart(),
        loadRevenueChart('weekly')
    ]);
}

// Load Order Status Chart Data
async function loadOrderStatusChart() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        const orders = Array.isArray(data) ? data : (data.orders || []);
        
        console.log('📊 Loading order status chart, orders:', orders.length);
        
        const statusCounts = {
            'cho_xacnhan': 0,
            'dang_giao': 0,
            'hoanthanh': 0,
            'huy': 0
        };
        
        orders.forEach(order => {
            const status = order.trangthai;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });
        
        console.log('📊 Order status counts:', statusCounts);
        
        orderStatusChart.data.datasets[0].data = [
            statusCounts.cho_xacnhan,
            statusCounts.dang_giao,
            statusCounts.hoanthanh,
            statusCounts.huy
        ];
        
        orderStatusChart.update();
        
    } catch (error) {
        console.error('Error loading order status chart:', error);
    }
}

// Load Inventory Chart Data
async function loadInventoryChart() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        
        products.forEach(product => {
            const stock = parseInt(product.stock_quantity) || 0;
            if (stock === 0) {
                outOfStock++;
            } else if (stock < 100) {
                lowStock++;
            } else {
                inStock++;
            }
        });
        
        inventoryChart.data.datasets[0].data = [inStock, lowStock, outOfStock];
        inventoryChart.update();
        
    } catch (error) {
        console.error('Error loading inventory chart:', error);
    }
}

// Load Revenue Chart Data
async function loadRevenueChart(period = 'weekly') {
    try {
        const response = await fetch(`${API_URL}/orders/revenue-chart?period=${period}`);
        if (!response.ok) {
            // Fallback to generate sample data if API doesn't exist
            generateSampleRevenueData(period);
            return;
        }
        
        const data = await response.json();
        
        revenueChart.data.labels = data.labels;
        revenueChart.data.datasets[0].data = data.values;
        revenueChart.update();
        
    } catch (error) {
        console.error('Error loading revenue chart:', error);
        generateSampleRevenueData(period);
    }
}

// Generate sample revenue data (fallback)
function generateSampleRevenueData(period) {
    let labels = [];
    let data = [];
    
    if (period === 'weekly') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));
            data.push(Math.floor(Math.random() * 5000000) + 1000000); // 1M - 6M VND
        }
    } else if (period === 'monthly') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }));
            data.push(Math.floor(Math.random() * 50000000) + 10000000); // 10M - 60M VND
        }
    } else if (period === 'quarterly') {
        // Last 4 quarters
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const currentYear = new Date().getFullYear();
        for (let i = 3; i >= 0; i--) {
            const quarterIndex = (new Date().getMonth() / 3 - i + 4) % 4;
            const year = currentYear - Math.floor((new Date().getMonth() / 3 - i + 4) / 4);
            labels.push(`${quarters[Math.floor(quarterIndex)]} ${year}`);
            data.push(Math.floor(Math.random() * 150000000) + 50000000); // 50M - 200M VND
        }
    }
    
    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].data = data;
    revenueChart.update();
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatPriceShort(price) {
    if (price >= 1000000000) {
        return (price / 1000000000).toFixed(1) + 'B';
    } else if (price >= 1000000) {
        return (price / 1000000).toFixed(1) + 'M';
    } else if (price >= 1000) {
        return (price / 1000).toFixed(1) + 'K';
    }
    return price.toString();
}