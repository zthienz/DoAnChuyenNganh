// Script để test Product Sections API
import { pool } from "../config/db.js";

async function testProductSections() {
    console.log('🧪 Testing Product Sections System...\n');

    try {
        // 1. Check if tables exist
        console.log('1️⃣ Checking tables...');
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME IN ('product_sections', 'product_section_items')
        `);
        
        if (tables.length === 2) {
            console.log('✅ Tables exist: product_sections, product_section_items\n');
        } else {
            console.log('❌ Tables missing! Please run migration first.\n');
            return;
        }

        // 2. Check sections
        console.log('2️⃣ Checking sections...');
        const [sections] = await pool.query('SELECT * FROM product_sections ORDER BY thu_tu');
        console.log(`✅ Found ${sections.length} sections:`);
        sections.forEach(s => {
            console.log(`   - ${s.ma_section}: ${s.ten_section}`);
        });
        console.log('');

        // 3. Get some products
        console.log('3️⃣ Getting sample products...');
        const [products] = await pool.query('SELECT id_sanpham, ten_sanpham FROM sanpham LIMIT 5');
        console.log(`✅ Found ${products.length} products for testing\n`);

        // 4. Test adding products to sections
        console.log('4️⃣ Testing add products to sections...');
        for (const section of sections) {
            // Add first 3 products to each section
            for (let i = 0; i < Math.min(3, products.length); i++) {
                const product = products[i];
                
                // Check if already exists
                const [existing] = await pool.query(
                    'SELECT id FROM product_section_items WHERE id_section = ? AND id_sanpham = ?',
                    [section.id_section, product.id_sanpham]
                );

                if (existing.length === 0) {
                    await pool.query(
                        `INSERT INTO product_section_items 
                         (id_section, id_sanpham, thu_tu, hien_thi) 
                         VALUES (?, ?, ?, 1)`,
                        [section.id_section, product.id_sanpham, i]
                    );
                    console.log(`   ✅ Added "${product.ten_sanpham}" to "${section.ten_section}"`);
                } else {
                    console.log(`   ⏭️  "${product.ten_sanpham}" already in "${section.ten_section}"`);
                }
            }
        }
        console.log('');

        // 5. Test querying products by section
        console.log('5️⃣ Testing query products by section...');
        for (const section of sections) {
            const [items] = await pool.query(`
                SELECT 
                    sp.ten_sanpham,
                    psi.thu_tu,
                    psi.hien_thi
                FROM product_section_items psi
                INNER JOIN sanpham sp ON psi.id_sanpham = sp.id_sanpham
                WHERE psi.id_section = ?
                ORDER BY psi.thu_tu
            `, [section.id_section]);

            console.log(`   📦 ${section.ten_section}: ${items.length} products`);
            items.forEach(item => {
                console.log(`      - ${item.ten_sanpham} (Order: ${item.thu_tu}, Visible: ${item.hien_thi ? 'Yes' : 'No'})`);
            });
        }
        console.log('');

        // 6. Test custom fields
        console.log('6️⃣ Testing custom fields...');
        if (products.length > 0) {
            const testProduct = products[0];
            const testSection = sections[0];

            await pool.query(`
                UPDATE product_section_items 
                SET ten_sanpham_custom = ?,
                    gia_custom = 99000,
                    mota_ngan_custom = ?
                WHERE id_section = ? AND id_sanpham = ?
            `, [
                `${testProduct.ten_sanpham} - CUSTOM`,
                'Mô tả tùy chỉnh cho test',
                testSection.id_section,
                testProduct.id_sanpham
            ]);

            const [customResult] = await pool.query(`
                SELECT 
                    sp.ten_sanpham as original_name,
                    psi.ten_sanpham_custom,
                    psi.gia_custom,
                    psi.mota_ngan_custom
                FROM product_section_items psi
                INNER JOIN sanpham sp ON psi.id_sanpham = sp.id_sanpham
                WHERE psi.id_section = ? AND psi.id_sanpham = ?
            `, [testSection.id_section, testProduct.id_sanpham]);

            if (customResult.length > 0) {
                const result = customResult[0];
                console.log(`   ✅ Custom fields test:`);
                console.log(`      Original: ${result.original_name}`);
                console.log(`      Custom: ${result.ten_sanpham_custom}`);
                console.log(`      Price: ${result.gia_custom}`);
                console.log(`      Description: ${result.mota_ngan_custom}`);
            }
        }
        console.log('');

        // 7. Summary
        console.log('7️⃣ Summary:');
        const [summary] = await pool.query(`
            SELECT 
                ps.ten_section,
                COUNT(psi.id) as total_products,
                SUM(CASE WHEN psi.hien_thi = 1 THEN 1 ELSE 0 END) as visible_products
            FROM product_sections ps
            LEFT JOIN product_section_items psi ON ps.id_section = psi.id_section
            GROUP BY ps.id_section, ps.ten_section
            ORDER BY ps.thu_tu
        `);

        summary.forEach(s => {
            console.log(`   📊 ${s.ten_section}:`);
            console.log(`      Total: ${s.total_products || 0} products`);
            console.log(`      Visible: ${s.visible_products || 0} products`);
        });

        console.log('\n✅ All tests completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Start the backend server: npm start');
        console.log('   2. Open the frontend in browser');
        console.log('   3. Login as admin');
        console.log('   4. Look for "Chỉnh sửa" buttons on index.html and shop.html');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await pool.end();
    }
}

// Run tests
testProductSections();
