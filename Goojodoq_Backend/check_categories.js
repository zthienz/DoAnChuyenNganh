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

async function checkCategories() {
  try {
    const [categories] = await pool.query('SELECT * FROM danhmuc ORDER BY thu_tu');
    console.log('📂 Categories in database:');
    categories.forEach(cat => {
      console.log(`  ID: ${cat.id_danhmuc}, Name: ${cat.ten_danhmuc}, Active: ${cat.hien_thi}`);
    });
    
    if (categories.length === 0) {
      console.log('⚠️ No categories found. Creating sample categories...');
      
      const sampleCategories = [
        ['Tai nghe Bluetooth', 'tai-nghe-bluetooth', 'Tai nghe không dây chất lượng cao', 1, 1],
        ['Loa Bluetooth', 'loa-bluetooth', 'Loa không dây di động', 2, 1],
        ['Quạt mini', 'quat-mini', 'Quạt cầm tay và để bàn', 3, 1],
        ['Bàn phím', 'ban-phim', 'Bàn phím cơ và không dây', 4, 1],
        ['Chuột', 'chuot', 'Chuột máy tính không dây', 5, 1],
        ['Phụ kiện khác', 'phu-kien-khac', 'Các phụ kiện điện tử khác', 6, 1]
      ];
      
      for (const cat of sampleCategories) {
        await pool.query(
          'INSERT INTO danhmuc (ten_danhmuc, duongdan, mo_ta, thu_tu, hien_thi) VALUES (?, ?, ?, ?, ?)',
          cat
        );
      }
      
      console.log('✅ Created sample categories');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCategories();