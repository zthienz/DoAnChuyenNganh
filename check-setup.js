// =============================================
// SCRIPT KIỂM TRA SETUP
// =============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'Goojodoq_Backend', '.env') });

console.log('🔍 KIỂM TRA SETUP GOOJODOQ\n');

// Check 1: Environment Variables
console.log('1️⃣ Kiểm tra Environment Variables:');
console.log('   DB_HOST:', process.env.DB_HOST || '❌ Chưa có');
console.log('   DB_USER:', process.env.DB_USER || '❌ Chưa có');
console.log('   DB_NAME:', process.env.DB_NAME || '❌ Chưa có');
console.log('   DB_PORT:', process.env.DB_PORT || '❌ Chưa có');
console.log('');

// Check 2: Database Connection
console.log('2️⃣ Kiểm tra kết nối Database:');
try {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    
    console.log('   ✅ Kết nối Database thành công!');
    
    // Check 3: Tables
    console.log('\n3️⃣ Kiểm tra các bảng:');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   Tìm thấy ${tables.length} bảng`);
    
    // Check 4: Products
    console.log('\n4️⃣ Kiểm tra sản phẩm:');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    console.log(`   Có ${products[0].count} sản phẩm trong database`);
    
    if (products[0].count > 0) {
        const [productList] = await connection.query('SELECT product_id, product_name, price FROM products LIMIT 5');
        console.log('   Danh sách sản phẩm:');
        productList.forEach(p => {
            console.log(`   - ${p.product_name} (${p.price}₫)`);
        });
    } else {
        console.log('   ⚠️ Chưa có sản phẩm nào!');
        console.log('   → Chạy file: database/insert_products_with_images.sql');
    }
    
    // Check 5: Images
    console.log('\n5️⃣ Kiểm tra ảnh sản phẩm:');
    const [images] = await connection.query('SELECT COUNT(*) as count FROM product_images');
    console.log(`   Có ${images[0].count} ảnh trong database`);
    
    if (images[0].count > 0) {
        const [imageList] = await connection.query('SELECT image_url FROM product_images WHERE is_primary = TRUE LIMIT 5');
        console.log('   Danh sách ảnh chính:');
        imageList.forEach(img => {
            const imagePath = join(__dirname, 'frontend', img.image_url);
            const exists = fs.existsSync(imagePath);
            console.log(`   ${exists ? '✅' : '❌'} ${img.image_url}`);
        });
    }
    
    await connection.end();
    
    console.log('\n✅ KIỂM TRA HOÀN TẤT!');
    console.log('\n📝 Bước tiếp theo:');
    console.log('   1. cd Goojodoq_Backend');
    console.log('   2. node server.js');
    console.log('   3. Mở TEST_SIMPLE.html để test');
    
} catch (error) {
    console.log('   ❌ Lỗi:', error.message);
    console.log('\n🔧 Giải pháp:');
    console.log('   1. Kiểm tra MySQL đang chạy');
    console.log('   2. Kiểm tra file .env có đúng thông tin');
    console.log('   3. Kiểm tra password MySQL');
    console.log('   4. Chạy: mysql -u root -p để test connection');
}

process.exit(0);