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
    document.getElementById('adminName').textContent = adminName;
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

// Load revenue on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check admin auth
    if (!checkAdminAuth()) return;

    // Set default dates
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('fromDate').valueAsDate = firstDay;
    document.getElementById('toDate').valueAsDate = today;

    // Load initial data
    loadRevenue();
});

// Load revenue statistics
async function loadRevenue() {
    try {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const filterType = document.getElementById('filterType').value;

        if (!fromDate || !toDate) {
            showNotification('Vui lòng chọn khoảng thời gian!', 'warning');
            return;
        }

        console.log('📊 Loading revenue stats...', { fromDate, toDate, filterType });

        const url = `${API_BASE_URL}/orders/revenue?fromDate=${fromDate}&toDate=${toDate}&groupBy=${filterType}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Revenue data loaded:', data);

        // Update summary cards
        updateSummaryCards(data.summary);

        // Update details table
        updateDetailsTable(data.details, filterType);

    } catch (error) {
        console.error('❌ Error loading revenue:', error);
        showNotification('Không thể tải dữ liệu doanh thu!', 'error');
        document.querySelector('#revenueTable tbody').innerHTML = 
            '<tr><td colspan="5" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
    }
}

// Update summary cards
function updateSummaryCards(summary) {
    document.getElementById('totalOrders').textContent = summary.total_orders || 0;
    document.getElementById('successOrders').textContent = summary.success_orders || 0;
    document.getElementById('canceledOrders').textContent = summary.canceled_orders || 0;
    
    // Convert to number if it's a string
    const revenue = parseFloat(summary.total_revenue) || 0;
    document.getElementById('totalRevenue').textContent = formatPrice(revenue);
}

// Update details table
function updateDetailsTable(details, filterType) {
    const tbody = document.querySelector('#revenueTable tbody');
    
    if (!details || details.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có dữ liệu</td></tr>';
        return;
    }

    let html = '';
    details.forEach((row, index) => {
        const period = formatPeriod(row.period, filterType);
        const orderCount = parseInt(row.order_count) || 0;
        const successCount = parseInt(row.success_count) || 0;
        const canceledCount = parseInt(row.canceled_count) || 0;
        const revenue = parseFloat(row.revenue) || 0;
        
        const successRate = orderCount > 0 
            ? ((successCount / orderCount) * 100).toFixed(1) 
            : 0;

        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${period}</strong></td>
                <td>
                    <span class="badge bg-primary">${orderCount}</span>
                </td>
                <td>
                    <span class="badge bg-success">${successCount}</span>
                    <span class="badge bg-danger ms-1">${canceledCount}</span>
                    <small class="text-muted ms-2">(${successRate}% thành công)</small>
                </td>
                <td class="text-end">
                    <strong class="text-success">${formatPrice(revenue)}</strong>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Format period based on filter type
function formatPeriod(period, filterType) {
    if (!period) return 'N/A';

    switch (filterType) {
        case 'day':
            const date = new Date(period);
            return date.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'month':
            const [year, month] = period.split('-');
            return `Tháng ${month}/${year}`;
        case 'year':
            return `Năm ${period}`;
        default:
            return period;
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export to Excel (optional feature)
function exportToExcel() {
    showNotification('Tính năng xuất Excel đang được phát triển...', 'info');
}
