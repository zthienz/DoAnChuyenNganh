// =============================================
// ADD PRODUCT PAGE JAVASCRIPT
// =============================================

// Store uploaded images
let uploadedImages = {
    main: null,
    additional: [null, null, null, null]
};

// =============================================
// IMAGE PREVIEW FUNCTIONS
// =============================================
function previewMainImage(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Kích thước ảnh không được vượt quá 5MB', 'error');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages.main = e.target.result;
            const preview = document.getElementById('mainImagePreview');
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Main Image">
                <button type="button" class="remove-image-btn" onclick="removeMainImage()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function previewImage(event, index) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Kích thước ảnh không được vượt quá 5MB', 'error');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages.additional[index - 1] = e.target.result;
            const preview = document.getElementById(`imagePreview${index}`);
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Image ${index}">
                <button type="button" class="remove-image-btn" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function removeMainImage() {
    uploadedImages.main = null;
    document.getElementById('mainImage').value = '';
    document.getElementById('mainImagePreview').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Click để tải ảnh chính</p>
        <small class="text-muted">PNG, JPG (Max: 5MB)</small>
    `;
}

function removeImage(index) {
    uploadedImages.additional[index - 1] = null;
    document.getElementById(`image${index}`).value = '';
    document.getElementById(`imagePreview${index}`).innerHTML = `
        <i class="fas fa-plus"></i>
    `;
}

// =============================================
// FORM SUBMISSION
// =============================================
function submitProduct(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const productData = {
        product_name: document.getElementById('productName').value,
        product_slug: generateSlug(document.getElementById('productName').value),
        sku: document.getElementById('productSKU').value,
        category_id: document.getElementById('productCategory').value,
        brand: document.getElementById('productBrand').value || 'GOOJODOQ',
        short_description: document.getElementById('shortDescription').value,
        description: document.getElementById('fullDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        sale_price: document.getElementById('productSalePrice').value ? parseFloat(document.getElementById('productSalePrice').value) : null,
        stock_quantity: parseInt(document.getElementById('productStock').value),
        weight: document.getElementById('productWeight').value ? parseFloat(document.getElementById('productWeight').value) : null,
        dimensions: document.getElementById('productDimensions').value || null,
        origin_country: document.getElementById('productOrigin').value || null,
        warranty_period: document.getElementById('productWarranty').value ? parseInt(document.getElementById('productWarranty').value) : 12,
        is_active: document.getElementById('isActive').checked,
        is_featured: document.getElementById('isFeatured').checked,
        is_new: document.getElementById('isNew').checked,
        images: {
            main: uploadedImages.main,
            additional: uploadedImages.additional.filter(img => img !== null)
        }
    };
    
    // Show loading
    showLoading('Đang thêm sản phẩm...');
    
    // Simulate API call (replace with actual API call later)
    setTimeout(() => {
        // Save to localStorage temporarily
        saveProductToLocalStorage(productData);
        
        // Hide loading
        hideLoading();
        
        // Show success message
        showSuccessMessage(productData);
    }, 2000);
}

// =============================================
// VALIDATION
// =============================================
function validateForm() {
    // Check main image
    if (!uploadedImages.main) {
        showNotification('Vui lòng tải lên ảnh chính của sản phẩm', 'error');
        return false;
    }
    
    // Check price
    const price = parseFloat(document.getElementById('productPrice').value);
    const salePrice = document.getElementById('productSalePrice').value ? parseFloat(document.getElementById('productSalePrice').value) : null;
    
    if (price <= 0) {
        showNotification('Giá sản phẩm phải lớn hơn 0', 'error');
        return false;
    }
    
    if (salePrice && salePrice >= price) {
        showNotification('Giá khuyến mãi phải nhỏ hơn giá gốc', 'error');
        return false;
    }
    
    // Check SKU uniqueness (in real app, check with API)
    const existingProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const skuExists = existingProducts.some(p => p.sku === document.getElementById('productSKU').value);
    
    if (skuExists) {
        showNotification('SKU đã tồn tại, vui lòng sử dụng SKU khác', 'error');
        return false;
    }
    
    return true;
}

// =============================================
// SAVE TO LOCALSTORAGE
// =============================================
function saveProductToLocalStorage(productData) {
    // Get existing products
    let products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    
    // Add new product with ID
    productData.product_id = Date.now();
    productData.created_at = new Date().toISOString();
    
    products.push(productData);
    
    // Save back to localStorage
    localStorage.setItem('adminProducts', JSON.stringify(products));
    
    // Also save to regular products for display
    let allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    allProducts.push({
        product_id: productData.product_id,
        product_name: productData.product_name,
        price: productData.price,
        sale_price: productData.sale_price,
        stock_quantity: productData.stock_quantity,
        image: productData.images.main,
        category_id: productData.category_id,
        is_new: productData.is_new,
        is_featured: productData.is_featured,
        is_bestseller: false
    });
    localStorage.setItem('products', JSON.stringify(allProducts));
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function showLoading(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function showSuccessMessage(productData) {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Thêm sản phẩm thành công!</h3>
            <p>Sản phẩm "${productData.product_name}" đã được thêm vào hệ thống.</p>
            <button class="btn btn-primary btn-lg" onclick="goBackToPreviousPage()">
                <i class="fas fa-arrow-left me-2"></i>Quay lại
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function cancelAddProduct() {
    if (confirm('Bạn có chắc muốn hủy? Tất cả dữ liệu đã nhập sẽ bị mất.')) {
        goBackToPreviousPage();
    }
}

function goBackToPreviousPage() {
    // Get previous page from localStorage or default to index
    const previousPage = localStorage.getItem('previousPage') || 'index.html';
    window.location.href = previousPage;
}

// =============================================
// AUTO-GENERATE SKU
// =============================================
document.getElementById('productName').addEventListener('blur', function() {
    const skuInput = document.getElementById('productSKU');
    if (!skuInput.value) {
        const name = this.value;
        const words = name.split(' ');
        const sku = words.map(w => w.charAt(0).toUpperCase()).join('') + '-' + Date.now().toString().slice(-4);
        skuInput.value = sku;
    }
});

// =============================================
// PRICE FORMATTING
// =============================================
document.getElementById('productPrice').addEventListener('blur', function() {
    if (this.value) {
        this.value = Math.round(parseFloat(this.value) / 1000) * 1000;
    }
});

document.getElementById('productSalePrice').addEventListener('blur', function() {
    if (this.value) {
        this.value = Math.round(parseFloat(this.value) / 1000) * 1000;
    }
});