// =============================================
// SHOP PAGE JAVASCRIPT
// =============================================

// API_BASE_URL is defined in main.js and available via window.API_BASE_URL

// Global variables
let allProducts = [];
let displayedProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 12;
let filteredProducts = [];
let saleProductIds = []; // Danh sách ID sản phẩm giảm giá từ section "sale"

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
    loadSaleProductIds(); // Load danh sách sản phẩm giảm giá
    setupEventListeners();
    
    // Initialize search suggestions
    if (typeof initializeSearchSuggestions === 'function') {
        initializeSearchSuggestions();
    }
    
    // Update user display if function exists
    if (typeof updateUserDisplay === 'function') {
        updateUserDisplay();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// =============================================
// LOAD PRODUCTS
// =============================================
async function loadAllProducts() {
    try {
        showLoading();
        
        const response = await fetch(`${window.API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        console.log(`✅ Loaded ${allProducts.length} products`);
        
        displayShopProducts();
        updateResultCount();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    }
}

// Load danh sách ID sản phẩm giảm giá từ section "sale"
async function loadSaleProductIds() {
    try {
        console.log('🔄 Loading sale product IDs...');
        
        const response = await fetch(`${window.API_BASE_URL}/products/sections/sale`);
        if (!response.ok) {
            throw new Error('Failed to fetch sale products');
        }
        
        const data = await response.json();
        if (data.success && data.products) {
            saleProductIds = data.products.map(product => product.product_id);
            console.log(`✅ Loaded ${saleProductIds.length} sale product IDs:`, saleProductIds);
        } else {
            saleProductIds = [];
            console.log('❌ No sale products found');
        }
        
    } catch (error) {
        console.error('Error loading sale product IDs:', error);
        saleProductIds = [];
    }
}

// =============================================
// DISPLAY PRODUCTS
// =============================================
function displayShopProducts(reset = true) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (reset) {
        currentPage = 1;
        displayedProducts = [];
    }
    
    // Calculate products to display
    const startIndex = 0;
    const endIndex = currentPage * PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    displayedProducts = productsToShow;
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h4>Không tìm thấy sản phẩm</h4>
                <p class="text-muted">Vui lòng thử lại với bộ lọc khác</p>
            </div>
        `;
        hideLoadMoreButton();
        return;
    }
    
    let html = '';
    
    productsToShow.forEach(product => {
        const imageUrl = product.image ? `http://localhost:3000${product.image}` : 'images/products/default.jpg';
        const price = parseFloat(product.price);
        const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
        
        html += `
            <div class="col-lg-4 col-md-6 col-sm-6 mb-4 product-item">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${imageUrl}" 
                             alt="${product.product_name}" 
                             onerror="this.src='images/products/default.jpg'">
                        ${salePrice && salePrice > price ? '<div class="product-badge sale">SALE</div>' : ''}
                        ${product.is_new ? '<div class="product-badge new">MỚI</div>' : ''}
                        ${product.is_bestseller ? '<div class="product-badge bestseller">BÁN CHẠY</div>' : ''}
                        <div class="product-overlay">
                            <button class="btn-quick-view" onclick="viewProduct(${product.product_id})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h5 class="product-title">
                            <a href="product-detail.html?id=${product.product_id}">${product.product_name}</a>
                        </h5>
                        <div class="product-rating">
                            <span class="stars">
                                ${'★'.repeat(Math.round(product.avg_rating || 0))}${'☆'.repeat(5 - Math.round(product.avg_rating || 0))}
                            </span>
                            <span class="rating-count">(${product.review_count || 0})</span>
                        </div>
                        <div class="product-sales">
                            <small class="text-muted">
                                <i class="fas fa-shopping-cart me-1"></i>
                                Đã bán: ${product.total_sold || 0}
                            </small>
                        </div>
                        <div class="product-price">
                            <span class="price-current">${formatPrice(price)}</span>
                            ${salePrice && salePrice > price ? `<span class="price-original">${formatPrice(salePrice)}</span>` : ''}
                        </div>
                        <div class="product-stock">
                            ${product.stock_quantity > 0 ? 
                                `<span class="in-stock"><i class="fas fa-check-circle me-1"></i>Còn hàng (${product.stock_quantity})</span>` : 
                                '<span class="out-of-stock"><i class="fas fa-times-circle me-1"></i>Hết hàng</span>'}
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-cart" onclick="addToCart(${product.product_id}, '${escapeHtml(product.product_name)}', ${price}, '${imageUrl}')" ${product.stock_quantity <= 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ
                            </button>
                            <button class="btn btn-outline-danger btn-sm ms-2" onclick="toggleWishlist(${product.product_id}, '${escapeHtml(product.product_name)}', ${price}, '${imageUrl}')" title="Thêm vào yêu thích">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
    
    // Show/hide load more button
    if (endIndex < filteredProducts.length) {
        showLoadMoreButton();
    } else {
        hideLoadMoreButton();
    }
    
    updateResultCount();
}

// =============================================
// LOAD MORE FUNCTIONALITY
// =============================================
function showLoadMoreButton() {
    let loadMoreSection = document.getElementById('loadMoreSection');
    
    if (!loadMoreSection) {
        const productsGrid = document.getElementById('productsGrid');
        loadMoreSection = document.createElement('div');
        loadMoreSection.id = 'loadMoreSection';
        loadMoreSection.className = 'col-12 text-center mt-4';
        loadMoreSection.innerHTML = `
            <button class="btn btn-primary btn-lg" onclick="loadMore()">
                <i class="fas fa-plus-circle me-2"></i>Xem thêm sản phẩm
            </button>
            <p class="text-muted mt-2">
                Đang hiển thị <span id="displayedCount">${displayedProducts.length}</span> / <span id="totalCount">${filteredProducts.length}</span> sản phẩm
            </p>
        `;
        productsGrid.parentElement.appendChild(loadMoreSection);
    } else {
        loadMoreSection.style.display = 'block';
        document.getElementById('displayedCount').textContent = displayedProducts.length;
        document.getElementById('totalCount').textContent = filteredProducts.length;
    }
}

function hideLoadMoreButton() {
    const loadMoreSection = document.getElementById('loadMoreSection');
    if (loadMoreSection) {
        loadMoreSection.style.display = 'none';
    }
}

function loadMore() {
    currentPage++;
    displayShopProducts(false);
    
    // Smooth scroll to new products
    setTimeout(() => {
        const newProducts = document.querySelectorAll('.product-item');
        if (newProducts.length > 0) {
            const lastOldProduct = newProducts[displayedProducts.length - PRODUCTS_PER_PAGE - 1];
            if (lastOldProduct) {
                lastOldProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, 100);
}

// =============================================
// FILTER FUNCTIONS
// =============================================
function filterProducts() {
    // Get search term from header search input
    const headerSearchInput = document.getElementById('searchInput');
    const searchTerm = headerSearchInput ? headerSearchInput.value.toLowerCase() : '';
    const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
    const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;
    
    // Get selected categories
    const selectedCategories = [];
    const catAll = document.getElementById('catAll');
    
    if (!catAll || !catAll.checked) {
        document.querySelectorAll('.category-filter:checked').forEach(checkbox => {
            selectedCategories.push(parseInt(checkbox.value));
        });
    }
    
    // Get selected status filters
    const statusFilters = {
        sale: document.getElementById('filterSale')?.checked || false,
        inStock: document.getElementById('filterInStock')?.checked || false,
        outOfStock: document.getElementById('filterOutOfStock')?.checked || false
    };
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        const price = parseFloat(product.price);
        const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
        
        // Search filter
        if (searchTerm && !product.product_name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Price filter
        if (price < priceMin || price > priceMax) {
            return false;
        }
        
        // Category filter - only apply if specific categories are selected
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id)) {
            return false;
        }
        
        // Status filters - only apply if at least one is checked
        const hasStatusFilter = statusFilters.sale || statusFilters.inStock || statusFilters.outOfStock;
        
        if (hasStatusFilter) {
            let matchesStatus = false;
            
            // Check sale filter - sử dụng danh sách từ section "sale"
            if (statusFilters.sale && saleProductIds.includes(product.product_id)) {
                matchesStatus = true;
            }
            
            // Check in-stock filter
            if (statusFilters.inStock && product.stock_quantity > 0) {
                matchesStatus = true;
            }
            
            // Check out-of-stock filter
            if (statusFilters.outOfStock && product.stock_quantity <= 0) {
                matchesStatus = true;
            }
            
            if (!matchesStatus) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`🔍 Filtered: ${filteredProducts.length} products`);
    displayShopProducts(true);
}

function resetFilters() {
    // Reset header search input
    const headerSearchInput = document.getElementById('searchInput');
    if (headerSearchInput) {
        headerSearchInput.value = '';
    }
    
    // Reset price
    document.getElementById('priceMin').value = '0';
    document.getElementById('priceMax').value = '10000000';
    
    // Reset categories
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('catAll').checked = true;
    
    // Reset status filters
    document.querySelectorAll('.status-filter').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset sort
    document.getElementById('sortSelect').value = 'default';
    
    // Reload sale product IDs (in case admin updated)
    loadSaleProductIds();
    
    // Reload all products
    filteredProducts = [...allProducts];
    displayShopProducts(true);
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
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => b.product_id - a.product_id);
            break;
        default:
            // Default sort by ID
            filteredProducts.sort((a, b) => a.product_id - b.product_id);
    }
    
    displayShopProducts(true);
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function updateResultCount() {
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = filteredProducts.length;
    }
}

function showLoading() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-3 text-muted">Đang tải sản phẩm...</p>
        </div>
    `;
}

function showError(message) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-4x text-danger mb-3"></i>
            <h4>Có lỗi xảy ra</h4>
            <p class="text-muted">${message}</p>
            <button class="btn btn-primary" onclick="loadAllProducts()">
                <i class="fas fa-redo me-2"></i>Thử lại
            </button>
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
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

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// =============================================
// EVENT LISTENERS
// =============================================
function setupEventListeners() {
    // Category "All" checkbox
    const catAll = document.getElementById('catAll');
    if (catAll) {
        catAll.addEventListener('change', function() {
            if (this.checked) {
                document.querySelectorAll('.category-filter').forEach(checkbox => {
                    checkbox.checked = false;
                });
                filterProducts();
            }
        });
    }
    
    // Individual category checkboxes
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('catAll').checked = false;
            }
            
            // If no categories are selected, check "All"
            const anyChecked = document.querySelector('.category-filter:checked');
            if (!anyChecked) {
                document.getElementById('catAll').checked = true;
            }
            
            filterProducts();
        });
    });
    
    // Status filters
    document.querySelectorAll('.status-filter').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    
    // Header search input - auto-filter on input (with debounce)
    const headerSearchInput = document.getElementById('searchInput');
    if (headerSearchInput) {
        let searchTimeout;
        headerSearchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterProducts();
            }, 500);
        });
        
        // Also filter on Enter key
        headerSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
    }
    
    // Price inputs on Enter
    ['priceMin', 'priceMax'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    filterProducts();
                }
            });
        }
    });
}

function searchProducts() {
    // Trigger filter when search button is clicked
    filterProducts();
}

// Hàm để refresh danh sách sản phẩm giảm giá (có thể gọi từ bên ngoài)
async function refreshSaleProducts() {
    await loadSaleProductIds();
    // Nếu đang lọc sản phẩm giảm giá, cập nhật lại kết quả
    const saleFilter = document.getElementById('filterSale');
    if (saleFilter && saleFilter.checked) {
        filterProducts();
    }
}

// Make function globally accessible
window.refreshSaleProducts = refreshSaleProducts;
