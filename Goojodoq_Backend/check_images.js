import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function checkImages() {
  try {
    const [images] = await pool.query('SELECT id_sanpham, duongdan_anh FROM anh_sanpham LIMIT 10');
    console.log('🖼️ Sample image paths:');
    images.forEach(img => {
      console.log(`  Product ${img.id_sanpham}: ${img.duongdan_anh}`);
    });
    
    // Kiểm tra API response
    const [products] = await pool.query(`
      SELECT 
        sp.id_sanpham,
        sp.ten_sanpham,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM sanpham sp
      LIMIT 5
    `);
    
    console.log('\n📦 Products with images:');
    products.forEach(product => {
      console.log(`  ${product.ten_sanpham}: ${product.image || 'NO IMAGE'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkImages();