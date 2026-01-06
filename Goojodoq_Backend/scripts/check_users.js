import { pool } from "../config/db.js";

async function checkUsers() {
  try {
    console.log('🔍 Checking users...');
    
    const [users] = await pool.query('SELECT id_nguoidung, email, hoten, quyen FROM nguoidung LIMIT 5');
    
    if (users.length === 0) {
      console.log('❌ No users found. Creating admin user...');
      
      // Tạo user admin
      const [result] = await pool.query(`
        INSERT INTO nguoidung (email, matkhau, hoten, quyen) 
        VALUES ('admin@goojodoq.com', '$2b$10$example', 'Administrator', 'admin')
      `);
      
      console.log('✅ Admin user created with ID:', result.insertId);
    } else {
      console.log('📋 Found users:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id_nguoidung}, Email: ${user.email}, Name: ${user.hoten}, Role: ${user.quyen}`);
      });
    }
    
    // Kiểm tra sản phẩm
    const [products] = await pool.query('SELECT id_sanpham, ten_sanpham FROM sanpham LIMIT 5');
    console.log('📋 Found products:');
    products.forEach(product => {
      console.log(`  - ID: ${product.id_sanpham}, Name: ${product.ten_sanpham}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();