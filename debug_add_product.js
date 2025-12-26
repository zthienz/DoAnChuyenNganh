// Debug script để kiểm tra vấn đề thêm sản phẩm
// Chạy trong Node.js: node debug_add_product.js

const API_BASE_URL = 'http://localhost:3000/api';

async function debugAddProduct() {
    console.log('🔍 Debug Add Product API\n');
    
    // Test 1: Kiểm tra server có chạy không
    console.log('1️⃣ Kiểm tra server connection...');
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            const products = await response.json();
            console.log(`✅ Server OK - Có ${products.length} sản phẩm hiện tại\n`);
        } else {
            console.log(`❌ Server error: ${response.status} ${response.statusText}\n`);
            return;
        }
    } catch (error) {
        console.log(`❌ Không thể kết nối server: ${error.message}\n`);
        return;
    }
    
    // Test 2: Thử thêm sản phẩm minimal
    console.log('2️⃣ Thử thêm sản phẩm minimal...');
    const minimalProduct = {
        product_name: 'Debug Test Product',
        product_slug: 'debug-test-product',
        sku: 'DEBUG001',
        category_id: 1,
        price: 100000,
        stock_quantity: 10,
        short_description: 'Debug test',
        description: 'Debug test description'
    };
    
    try {
        console.log('📤 Sending request:', JSON.stringify(minimalProduct, null, 2));
        
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(minimalProduct)
        });
        
        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log(`📡 Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('📦 Response data:', JSON.stringify(result, null, 2));
            
            if (response.ok && result.success) {
                console.log(`✅ Thêm sản phẩm thành công! ID: ${result.product_id}`);
            } else {
                console.log(`❌ Thêm sản phẩm thất bại: ${result.error || 'Unknown error'}`);
            }
        } else {
            const textResponse = await response.text();
            console.log(`❌ Server trả về non-JSON response:`);
            console.log(textResponse);
        }
        
    } catch (error) {
        console.log(`❌ Lỗi khi gọi API: ${error.message}`);
        console.log(`Stack trace:`, error.stack);
    }
    
    // Test 3: Kiểm tra database schema
    console.log('\n3️⃣ Kiểm tra database schema...');
    try {
        const response = await fetch(`${API_BASE_URL}/../test-db`);
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Database connection OK:', result);
        } else {
            console.log('❌ Database connection failed');
        }
    } catch (error) {
        console.log('❌ Cannot test database connection:', error.message);
    }
}

// Polyfill fetch for Node.js
if (typeof fetch === 'undefined') {
    console.log('Installing fetch polyfill...');
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
}

debugAddProduct().catch(console.error);