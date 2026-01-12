// Script để setup sections với sản phẩm khác nhau
import { pool } from "../config/db.js";

async function setupSections() {
    console.log('🔧 Setting up Product Sections with different products...\n');

    try {
        // 1. Clear existing section items
        console.log('1️⃣ Clearing existing section items...');
        await pool.query('DELETE FROM product_section_items');
        console.log('✅ Cleared\n');

        // 2. Get all products
        console.log('2️⃣ Getting all products...');
        const [allProducts] = await pool.query(`
            SELECT id_sanpham, ten_sanpham, gia, gia_goc 
            FROM sanpham 
            WHERE hien_thi = 1 
            ORDER BY id_sanpham
        `);
        console.log(`✅ Found ${allProducts.length} products\n`);

        if (allProducts.length < 6) {
            console.log('⚠️  Need at least 6 products for proper setup');
            return;
        }

        // 3. Get section IDs
        const [sections] = await pool.query('SELECT id_section, ma_section, ten_section FROM product_sections');
        const saleSection = sections.find(s => s.ma_section === 'sale');
        const featuredSection = sections.find(s => s.ma_section === 'featured');
        const allSection = sections.find(s => s.ma_section === 'all');

        // 4. Add products to SALE section (products with sale_price)
        console.log('3️⃣ Adding products to SALE section...');
        const saleProducts = allProducts.filter(p => p.gia_goc && p.gia < p.gia_goc).slice(0, 4);
        
        if (saleProducts.length === 0) {
            // If no products with sale, use first 4 products
            console.log('   ⚠️  No products with sale price, using first 4 products');
            for (let i = 0; i < Math.min(4, allProducts.length); i++) {
                await pool.query(
                    `INSERT INTO product_section_items (id_section, id_sanpham, thu_tu, hien_thi) 
                     VALUES (?, ?, ?, 1)`,
                    [saleSection.id_section, allProducts[i].id_sanpham, i]
                );
                console.log(`   ✅ Added: ${allProducts[i].ten_sanpham}`);
            }
        } else {
            for (let i = 0; i < saleProducts.length; i++) {
                await pool.query(
                    `INSERT INTO product_section_items (id_section, id_sanpham, thu_tu, hien_thi) 
                     VALUES (?, ?, ?, 1)`,
                    [saleSection.id_section, saleProducts[i].id_sanpham, i]
                );
                console.log(`   ✅ Added: ${saleProducts[i].ten_sanpham}`);
            }
        }
        console.log('');

        // 5. Add products to FEATURED section (different products, starting from index 4)
        console.log('4️⃣ Adding products to FEATURED section...');
        const startIdx = Math.min(4, allProducts.length - 4);
        for (let i = 0; i < Math.min(4, allProducts.length - startIdx); i++) {
            const product = allProducts[startIdx + i];
            await pool.query(
                `INSERT INTO product_section_items (id_section, id_sanpham, thu_tu, hien_thi) 
                 VALUES (?, ?, ?, 1)`,
                [featuredSection.id_section, product.id_sanpham, i]
            );
            console.log(`   ✅ Added: ${product.ten_sanpham}`);
        }
        console.log('');

        // 6. Add ALL products to ALL section
        console.log('5️⃣ Adding all products to ALL section...');
        for (let i = 0; i < allProducts.length; i++) {
            await pool.query(
                `INSERT INTO product_section_items (id_section, id_sanpham, thu_tu, hien_thi) 
                 VALUES (?, ?, ?, 1)`,
                [allSection.id_section, allProducts[i].id_sanpham, i]
            );
        }
        console.log(`   ✅ Added all ${allProducts.length} products\n`);

        // 7. Verify
        console.log('6️⃣ Verification:');
        const [summary] = await pool.query(`
            SELECT 
                ps.ma_section,
                ps.ten_section,
                COUNT(psi.id) as total_products,
                GROUP_CONCAT(sp.ten_sanpham SEPARATOR ', ') as products
            FROM product_sections ps
            LEFT JOIN product_section_items psi ON ps.id_section = psi.id_section
            LEFT JOIN sanpham sp ON psi.id_sanpham = sp.id_sanpham
            GROUP BY ps.id_section, ps.ma_section, ps.ten_section
            ORDER BY ps.thu_tu
        `);

        summary.forEach(s => {
            console.log(`\n   📦 ${s.ten_section} (${s.ma_section}):`);
            console.log(`      Total: ${s.total_products} products`);
            if (s.products) {
                const productList = s.products.split(', ');
                productList.forEach((p, idx) => {
                    console.log(`      ${idx + 1}. ${p}`);
                });
            }
        });

        console.log('\n✅ Setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Refresh the frontend page');
        console.log('   2. Check that each section shows different products');
        console.log('   3. Click "Chỉnh sửa" buttons to verify correct products load');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await pool.end();
    }
}

// Run setup
setupSections();
