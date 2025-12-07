// =============================================
// ADMIN STATISTICS PAGE
// =============================================

// Check admin authentication
function checkAdminAuth() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.quyen !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminAuth()) return;
    
    loadBestSellingProducts();
    loadSlowSellingProducts();
});

// Load best selling products
async function loadBestSellingProducts() {
    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/products/stats/best-selling`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch best selling products');
        }
        
        const data = await response.json();
        
        if (data.success && data.products) {
            displayBestSellingProducts(data.products);
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('Error loading best selling products:', error);
        document.getElementById('bestSellingTable').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Không thể tải dữ liệu
                </td>
            </tr>
        `;
    }
}

// Display best selling products
function displayBestSellingProducts(products) {
    const tbody = document.getElementById('bestSellingTable');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Chưa có dữ liệu bán hàng
                </td>
            </tr>
        `;
        return;
    }
    
    const html = products.map((product, index) => {
        const imageUrl = product.image ? 
            (product.image.startsWith('/images') ? `http://localhost:3000${product.image}` : product.image) :
            'images/products/default.jpg';
        
        const rankBadge = index < 3 ? 
            `<span class="badge badge-rank ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-danger'}">
                ${index + 1}
            </span>` :
            `<span class="badge badge-rank bg-light text-dark">${index + 1}</span>`;
        
        return `
            <tr>
                <td class="text-center">${rankBadge}</td>
                <td>
                    <img src="${imageUrl}" alt="${product.product_name}" 
                         onerror="this.src='images/products/default.jpg'">
                </td>
                <td>
                    <strong>${product.product_name}</strong>
                    <br>
                    <small class="text-muted">SKU: ${product.sku}</small>
                </td>
                <td>${formatPrice(product.price)}</td>
                <td class="text-center">
                    <span class="badge bg-success fs-6">${product.total_sold}</span>
                </td>
                <td class="text-primary fw-bold">${formatPrice(product.total_revenue)}</td>
                <td class="text-center">
                    <span class="badge ${product.stock_quantity > 10 ? 'bg-success' : product.stock_quantity > 0 ? 'bg-warning' : 'bg-danger'}">
                        ${product.stock_quantity}
                    </span>
                </td>
                <td class="text-center">
                    ${product.is_active ? 
                        '<span class="badge bg-success">Hiển thị</span>' : 
                        '<span class="badge bg-secondary">Ẩn</span>'}
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = html;
}

// Load slow selling products
async function loadSlowSellingProducts() {
    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/products/stats/slow-selling`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch slow selling products');
        }
        
        const data = await response.json();
        
        if (data.success && data.products) {
            displaySlowSellingProducts(data.products);
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('Error loading slow selling products:', error);
        document.getElementById('slowSellingTable').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Không thể tải dữ liệu
                </td>
            </tr>
        `;
    }
}

// Display slow selling products
function displaySlowSellingProducts(products) {
    const tbody = document.getElementById('slowSellingTable');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Chưa có dữ liệu bán hàng
                </td>
            </tr>
        `;
        return;
    }
    
    const html = products.map((product, index) => {
        const imageUrl = product.image ? 
            (product.image.startsWith('/images') ? `http://localhost:3000${product.image}` : product.image) :
            'images/products/default.jpg';
        
        return `
            <tr>
                <td class="text-center">
                    <span class="badge badge-rank bg-light text-dark">${index + 1}</span>
                </td>
                <td>
                    <img src="${imageUrl}" alt="${product.product_name}" 
                         onerror="this.src='images/products/default.jpg'">
                </td>
                <td>
                    <strong>${product.product_name}</strong>
                    <br>
                    <small class="text-muted">SKU: ${product.sku}</small>
                </td>
                <td>${formatPrice(product.price)}</td>
                <td class="text-center">
                    <span class="badge ${product.total_sold === 0 ? 'bg-danger' : 'bg-warning'} fs-6">
                        ${product.total_sold}
                    </span>
                </td>
                <td class="text-primary fw-bold">${formatPrice(product.total_revenue)}</td>
                <td class="text-center">
                    <span class="badge ${product.stock_quantity > 10 ? 'bg-success' : product.stock_quantity > 0 ? 'bg-warning' : 'bg-danger'}">
                        ${product.stock_quantity}
                    </span>
                </td>
                <td class="text-center">
                    ${product.is_active ? 
                        '<span class="badge bg-success">Hiển thị</span>' : 
                        '<span class="badge bg-secondary">Ẩn</span>'}
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = html;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Get current user
function getCurrentUser() {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    if (localUser) {
        return JSON.parse(localUser);
    } else if (sessionUser) {
        return JSON.parse(sessionUser);
    }
    return null;
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'admin-login.html';
    }
}
