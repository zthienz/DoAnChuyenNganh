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

async function checkPrices() {
  try {
    const [products] = await pool.query(`
      SELECT id_sanpham, ten_sanpham, gia, gia_goc 
      FROM sanpham 
      WHERE id_sanpham IN (34, 35, 36, 37) 
      ORDER BY id_sanpham DESC
    `);
    
    console.log('💰 Price data in database:');
    products.forEach(p => {
      console.log(`ID: ${p.id_sanpham} - ${p.ten_sanpham}`);
      console.log(`  gia (current): ${p.gia}`);
      console.log(`  gia_goc (original): ${p.gia_goc}`);
      console.log('---');
    });
    
    console.log('\n🔍 What should be the correct logic:');
    console.log('- gia_goc should be HIGHER (original price)');
    console.log('- gia should be LOWER (discounted price)');
    console.log('- If gia >= gia_goc, there is no discount');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPrices();