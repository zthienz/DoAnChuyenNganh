// Script để thêm tất cả sản phẩm giảm giá vào Sale section
import { pool } from "../config/db.js";

async function addMoreSaleProducts() {
    console.log('🔧 Adding more products to Sale section...\n');

    try {
        // 1. Get sale section ID
        const [sections] = await pool.query(
            'SELECT id_section FROM product_sections WHERE ma_section = ?',
            ['sale']
        );
        
        if (sections.length === 0) {
            console.log('❌ Sale section not found');
            return;
        }
        
        const saleSection = sections[0].id_section;
        console.log(`✅ Found Sale section (ID: ${saleSection})\n`);

        // 2. Get all products with sale price (gia < gia_goc)
        console.log('📦 Finding products with sale price...');
        const [saleProducts] = await pool.query(`
            SELECT id_sanpham, ten_sanpham, gia, gia_goc
            FROM sanpham
            WHERE gia_goc IS NOT NULL 
              AND gia < gia_goc 
              AND hien_thi = 1
            ORDER BY id_sanpham
        `);
        
        console.log(`✅ Found ${saleProducts.length} products with sale price\n`);

        // 3. Get current products in sale section
        const [currentProducts] = await pool.query(`
            SELECT id_sanpham 
            FROM product_section_items 
            WHERE id_section = ?
        `, [saleSection]);
        
        const currentProductIds = currentProducts.map(p => p.id_sanpham);
        console.log(`📋 Currently ${currentProductIds.length} products in Sale section\n`);

        // 4. Add missing products
        console.log('➕ Adding missing products...');
        let addedCount = 0;
        
        for (let i = 0; i < saleProducts.length; i++) {
            const product = saleProducts[i];
            
            if (!currentProductIds.includes(product.id_sanpham)) {
                // Get max order
                const [maxOrder] = await pool.query(
                    'SELECT COALESCE(MAX(thu_tu), -1) + 1 as next_order FROM product_section_items WHERE id_section = ?',
                    [saleSection]
                );
                
                const nextOrder = maxOrder[0].next_order;
                
                // Insert
                await pool.query(
                    `INSERT INTO product_section_items (id_section, id_sanpham, thu_tu, hien_thi) 
                     VALUES (?, ?, ?, 1)`,
                    [saleSection, product.id_sanpham, nextOrder]
                );
                
                console.log(`   ✅ Added: ${product.ten_sanpham} (Order: ${nextOrder})`);
                addedCount++;
            } else {
                console.log(`   ⏭️  Already exists: ${product.ten_sanpham}`);
            }
        }
        
        console.log(`\n✅ Added ${addedCount} new products\n`);

        // 5. Show final list
        console.log('📊 Final Sale section products:');
        const [finalProducts] = await pool.query(`
            SELECT 
                psi.thu_tu,
                sp.ten_sanpham,
                sp.gia,
                sp.gia_goc,
                ROUND((1 - sp.gia / sp.gia_goc) * 100) as discount_percent
            FROM product_section_items psi
            JOIN sanpham sp ON psi.id_sanpham = sp.id_sanpham
            WHERE psi.id_section = ?
            ORDER BY psi.thu_tu
        `, [saleSection]);
        
        console.table(finalProducts);
        
        console.log(`\n✅ Total: ${finalProducts.length} products in Sale section`);
        console.log('\n📝 Next steps:');
        console.log('   1. Refresh the frontend page');
        console.log('   2. Check Sale section displays all products');
        console.log('   3. Click "Chỉnh sửa" to verify all products appear in manager');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

// Run
addMoreSaleProducts();
