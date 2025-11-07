// =============================================
// SHOP PAGE JAVASCRIPT
// =============================================

// Global Variables
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
});

function initializeShop() {
    loadAllProducts();
    setupFilterListeners();
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    const search = urlParams.get('search');
    
    if (search) {
        document.getElementById('sidebarSearch').value = search;
        document.getElementById('searchInput').value = search;
    }
}

// =============================================
// LOAD PRODUCTS
// =============================================
async function loadAllProducts() {
    try {
        showLoadingOverlay();
        
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        updateResultCount();
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoadingOverlay();
        showEmptyState('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    }
}

// =============================================
// DISPLAY PRODUCTS
// =============================================
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!filteredProducts || filteredProducts.length === 0) {
        showEmptyState('Không tìm thấy sản phẩm nào. Vui lòng thử lại với bộ lọc khác.');
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
            <div class="product-card fade-in">
                <div class="product-image">
                    <a href="product-detail.html?id=${product.product_id}">
                        <img src="${product.image || 'images/products/default.jpg'}" 
                             alt="${product.product_name}" 
                             onerror="this.src='images/products/default.jpg'">
                    </a>
                    ${product.sale_price ? '<div class="product-badge sale">SALE</div>' : ''}
                    ${product.is_new ? '<div class="product-badge new">MỚI</div>' : ''}
                    ${product.is_bestseller ? '<div class="product-badge" style="background: #ffc107; color: #333;">BÁN CHẠY</div>' : ''}
                </div>
                <div class="product-info">
                    <h5 class="product-title">
                        <a href="product-detail.html?id=${product.product_id}">${product.product_name}</a>
                    </h5>
                    <div class="product-rating">
                        <span class="stars">
                            ${'★'.repeat(5)}
                        </span>
                        <span class="rating-count">(${product.review_count || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.sale_price || product.price)}</span>
                        ${product.sale_price ? `<span class="price-original">${formatPrice(product.price)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.sale_price || product.price}, '${product.image || 'images/products/default.jpg'}')">
                            <i class="fas fa-shopping-cart me-2"></i>Đặt hàng
                        </button>
                        <button class="btn-wishlist" onclick="toggleWishlist(${product.product_id}, '${product.product_name}', ${product.sale_price || product.price}, '${product.image || 'images/products/default.jpg'}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Generate pagination
    generatePagination();
}

// =============================================
// FILTER FUNCTIONS
// =============================================
function setupFilterListeners() {
    // Category filters
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    
    // "All" checkbox
    document.getElementById('catAll').addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
        }
        filterProducts();
    });
    
    // Status filters
    document.getElementById('filterSale').addEventListener('change', filterProducts);
    document.getElementById('filterNew').addEventListener('change', filterProducts);
    document.getElementById('filterBestseller').addEventListener('change', filterProducts);
    
    // Search on Enter
    document.getElementById('sidebarSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });
}

function filterProducts() {
    let filtered = [...allProducts];
    
    // Search filter
    const searchTerm = document.getElementById('sidebarSearch').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.product_name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedCategories.length > 0 && !document.getElementById('catAll').checked) {
        filtered = filtered.filter(product => 
            selectedCategories.includes(product.category_id)
        );
    }
    
    // Price filter
    const minPrice = parseInt(document.getElementById('priceMin').value) || 0;
    const maxPrice = parseInt(document.getElementById('priceMax').value) || Infinity;
    
    filtered = filtered.filter(product => {
        const price = product.sale_price || product.price;
        return price >= minPrice && price <= maxPrice;
    });
    
    // Status filters
    if (document.getElementById('filterSale').checked) {
        filtered = filtered.filter(product => product.sale_price);
    }
    
    if (document.getElementById('filterNew').checked) {
        filtered = filtered.filter(product => product.is_new);
    }
    
    if (document.getElementById('filterBestseller').checked) {
        filtered = filtered.filter(product => product.is_bestseller);
    }
    
    filteredProducts = filtered;
    currentPage = 1;
    displayProducts();
    updateResultCount();
}

function resetFilters() {
    // Reset search
    document.getElementById('sidebarSearch').value = '';
    document.getElementById('searchInput').value = '';
    
    // Reset categories
    document.getElementById('catAll').checked = true;
    document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
    
    // Reset price
    document.getElementById('priceMin').value = 0;
    document.getElementById('priceMax').value = 10000000;
    
    // Reset status
    document.getElementById('filterSale').checked = false;
    document.getElementById('filterNew').checked = false;
    document.getElementById('filterBestseller').checked = false;
    
    // Reset sort
    document.getElementById('sortSelect').value = 'default';
    
    // Reload products
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
    updateResultCount();
}

// =============================================
// SORT FUNCTIONS
// =============================================
function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    
    switch(sortValue) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.product_name.localeCompare(b.product_name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.product_name.localeCompare(a.product_name));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        default:
            filteredProducts = [...allProducts];
            filterProducts();
            return;
    }
    
    currentPage = 1;
    displayProducts();
}

// =============================================
// PAGINATION
// =============================================
function generatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayProducts();
    
    // Scroll to top of products
    document.querySelector('.shop-section').scrollIntoView({ behavior: 'smooth' });
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function updateResultCount() {
    document.getElementById('resultCount').textContent = filteredProducts.length;
}

function showEmptyState(message) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="col-12">
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Không có sản phẩm</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="resetFilters()">
                    <i class="fas fa-redo me-2"></i>Đặt lại bộ lọc
                </button>
            </div>
        </div>
    `;
    document.getElementById('pagination').innerHTML = '';
}

function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p>Đang tải sản phẩm...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Search from header
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    document.getElementById('sidebarSearch').value = searchTerm;
    filterProducts();
}