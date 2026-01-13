// =============================================
// ADD PRODUCT PAGE JAVASCRIPT
// =============================================

// Store uploaded images
let uploadedImages = {
    main: null,
    additional: [null, null, null, null]
};

// =============================================
// IMAGE COMPRESSION FUNCTIONS
// =============================================
function compressImage(base64, maxWidth, maxHeight, quality) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Tính toán kích thước mới
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            // Vẽ ảnh với kích thước mới
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Chuyển về base64 với chất lượng nén
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            
            console.log(`📸 Image compressed: ${img.width}x${img.height} → ${width}x${height}`);
            console.log(`📦 Size reduced: ${Math.round(base64.length/1024)}KB → ${Math.round(compressedBase64.length/1024)}KB`);
            
            resolve(compressedBase64);
        };
        
        img.src = base64;
    });
}

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
            // Tối ưu hóa ảnh trước khi lưu
            compressImage(e.target.result, 800, 800, 0.8).then(compressedImage => {
                uploadedImages.main = compressedImage;
                const preview = document.getElementById('mainImagePreview');
                preview.innerHTML = `
                    <img src="${compressedImage}" alt="Main Image">
                    <button type="button" class="remove-image-btn" onclick="removeMainImage()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                console.log('📸 Main image compressed and saved');
            });
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
            // Tối ưu hóa ảnh trước khi lưu
            compressImage(e.target.result, 800, 800, 0.8).then(compressedImage => {
                uploadedImages.additional[index - 1] = compressedImage;
                const preview = document.getElementById(`imagePreview${index}`);
                preview.innerHTML = `
                    <img src="${compressedImage}" alt="Image ${index}">
                    <button type="button" class="remove-image-btn" onclick="removeImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                console.log(`📸 Additional image ${index} compressed and saved`);
            });
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
    
    console.log('🚀 Starting product submission...');
    
    // Validate form
    if (!validateForm()) {
        console.log('❌ Form validation failed, stopping submission');
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
    
    console.log('📦 Product data prepared:', {
        ...productData,
        images: {
            main: productData.images.main ? 'Present (base64)' : 'Missing',
            additional: `${productData.images.additional.length} images`
        }
    });
    
    // Show loading
    showLoading('Đang thêm sản phẩm...');
    
    // Call API to save product
    saveProductToDatabase(productData);
}

// =============================================
// SAVE TO DATABASE VIA API
// =============================================
async function saveProductToDatabase(productData) {
    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        
        console.log('💾 Saving product to database:', productData);
        
        // Tính toán kích thước payload
        const payloadSize = JSON.stringify(productData).length;
        console.log(`📦 Payload size: ${Math.round(payloadSize/1024)}KB`);
        
        if (payloadSize > 10 * 1024 * 1024) { // 10MB
            console.warn('⚠️ Large payload detected, this might take longer...');
        }
        
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('❌ Server returned non-JSON response:', textResponse);
            
            // Kiểm tra lỗi payload quá lớn
            if (response.status === 413 || textResponse.includes('PayloadTooLargeError')) {
                throw new Error('Dữ liệu quá lớn! Vui lòng sử dụng ảnh có kích thước nhỏ hơn hoặc giảm chất lượng ảnh.');
            }
            
            throw new Error(`Server trả về lỗi: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📦 Server response:', result);
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Hide loading
        hideLoading();
        
        // Refresh product cache in other pages
        refreshProductCache();
        
        // Show success message
        showSuccessMessage(productData);
        
    } catch (error) {
        console.error('❌ Error saving product:', error);
        hideLoading();
        
        // Show detailed error message
        let errorMessage = error.message;
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n- Server có đang chạy không?\n- URL API có đúng không?';
        }
        
        if (confirm(`Lỗi khi thêm sản phẩm:\n${errorMessage}\n\nBạn có muốn lưu tạm thời vào localStorage không?`)) {
            // Fallback to localStorage if API fails
            saveProductToLocalStorage(productData);
            showSuccessMessage(productData);
        }
    }
}

// =============================================
// VALIDATION
// =============================================
function validateForm() {
    console.log('🔍 Starting form validation...');
    
    // Check main image
    console.log('📸 Checking main image:', uploadedImages.main ? 'Present' : 'Missing');
    if (!uploadedImages.main) {
        console.log('❌ Validation failed: No main image');
        showNotification('Vui lòng tải lên ảnh chính của sản phẩm', 'error');
        return false;
    }
    
    // Check required fields
    const requiredFields = [
        { id: 'productName', name: 'Tên sản phẩm' },
        { id: 'productSKU', name: 'SKU' },
        { id: 'productCategory', name: 'Danh mục' },
        { id: 'productPrice', name: 'Giá sản phẩm' },
        { id: 'productStock', name: 'Số lượng tồn kho' },
        { id: 'shortDescription', name: 'Mô tả ngắn' }
    ];
    
    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        const value = element ? element.value.trim() : '';
        console.log(`📝 ${field.name}:`, value || 'Empty');
        
        if (!value) {
            console.log(`❌ Validation failed: ${field.name} is empty`);
            showNotification(`Vui lòng nhập ${field.name}`, 'error');
            element?.focus();
            return false;
        }
    }
    
    // Check price
    const price = parseFloat(document.getElementById('productPrice').value);
    const salePrice = document.getElementById('productSalePrice').value ? parseFloat(document.getElementById('productSalePrice').value) : null;
    
    console.log('💰 Price validation:', { price, salePrice });
    
    if (price <= 0) {
        console.log('❌ Validation failed: Invalid price');
        showNotification('Giá sản phẩm phải lớn hơn 0', 'error');
        return false;
    }
    
    // Giá gốc phải lớn hơn giá khuyến mãi
    if (salePrice !== null && salePrice >= price) {
        console.log('❌ Validation failed: Sale price >= original price');
        showNotification('Giá khuyến mãi phải nhỏ hơn giá gốc', 'error');
        document.getElementById('productSalePrice').focus();
        return false;
    }
    
    // Check SKU uniqueness (in real app, check with API)
    const existingProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const sku = document.getElementById('productSKU').value;
    const skuExists = existingProducts.some(p => p.sku === sku);
    
    console.log('🏷️ SKU check:', { sku, exists: skuExists });
    
    if (skuExists) {
        console.log('❌ Validation failed: SKU already exists');
        showNotification('SKU đã tồn tại, vui lòng sử dụng SKU khác', 'error');
        return false;
    }
    
    console.log('✅ All validations passed');
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

// Fallback showNotification if not available from main.js
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        console.log(`📢 Notification (${type}):`, message);
        
        // Simple alert fallback
        if (type === 'error') {
            alert('❌ Lỗi: ' + message);
        } else if (type === 'success') {
            alert('✅ Thành công: ' + message);
        } else if (type === 'warning') {
            alert('⚠️ Cảnh báo: ' + message);
        } else {
            alert('ℹ️ Thông báo: ' + message);
        }
    };
}

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
            <div class="success-actions">
                <button class="btn btn-primary btn-lg me-3" onclick="goBackAndRefresh()">
                    <i class="fas fa-arrow-left me-2"></i>Quay lại và làm mới
                </button>
                <button class="btn btn-outline-secondary btn-lg" onclick="addAnotherProduct()">
                    <i class="fas fa-plus me-2"></i>Thêm sản phẩm khác
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function goBackAndRefresh() {
    // Clear any cached data
    if (typeof localStorage !== 'undefined') {
        // Clear product cache if exists
        localStorage.removeItem('products');
        localStorage.removeItem('featuredProducts');
        localStorage.removeItem('saleProducts');
    }
    
    // Get previous page from localStorage or default to index
    const previousPage = localStorage.getItem('previousPage') || 'index.html';
    
    // Add cache busting parameter
    const separator = previousPage.includes('?') ? '&' : '?';
    const refreshUrl = `${previousPage}${separator}refresh=${Date.now()}`;
    
    window.location.href = refreshUrl;
}

function addAnotherProduct() {
    // Remove success overlay
    const overlay = document.querySelector('.success-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Reset form
    document.getElementById('addProductForm').reset();
    
    // Reset uploaded images
    uploadedImages = {
        main: null,
        additional: [null, null, null, null]
    };
    
    // Reset image previews
    document.getElementById('mainImagePreview').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Click để tải ảnh chính</p>
        <small class="text-muted">PNG, JPG (Max: 5MB)</small>
    `;
    
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`imagePreview${i}`).innerHTML = `
            <i class="fas fa-plus"></i>
        `;
    }
    
    // Focus on product name
    document.getElementById('productName').focus();
    
    showNotification('Đã reset form để thêm sản phẩm mới', 'info');
}

function refreshProductCache() {
    console.log('🔄 Refreshing product cache...');
    
    // Clear localStorage cache
    if (typeof localStorage !== 'undefined') {
        const keysToRemove = [
            'products',
            'featuredProducts', 
            'saleProducts',
            'adminProducts',
            'productCache'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Cleared cache: ${key}`);
        });
        
        // Set a flag for storage event listeners (fallback for older browsers)
        localStorage.setItem('productCacheInvalidated', Date.now().toString());
    }
    
    // Notify other tabs/windows about the new product
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('product_updates');
        channel.postMessage({
            type: 'PRODUCT_ADDED',
            timestamp: Date.now()
        });
        console.log('📡 Broadcasted product update to other tabs');
    } else {
        console.warn('⚠️ BroadcastChannel not supported, using storage events only');
    }
    
    // If we're in an iframe or popup, try to refresh parent
    if (window.parent && window.parent !== window) {
        try {
            window.parent.postMessage({
                type: 'REFRESH_PRODUCTS',
                timestamp: Date.now()
            }, '*');
            console.log('📡 Sent refresh message to parent window');
        } catch (e) {
            console.log('⚠️ Could not message parent window:', e.message);
        }
    }
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
