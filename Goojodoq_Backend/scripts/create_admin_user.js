import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

async function createAdminUser() {
  try {
    const email = 'admin@goojodoq.com';
    const password = 'admin123';
    const hoten = 'Administrator';
    const sdt = '0123456789';

    // Kiểm tra xem admin đã tồn tại chưa
    const [existing] = await pool.query(
      'SELECT id_nguoidung FROM nguoidung WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log('❌ Tài khoản admin đã tồn tại!');
      console.log('📧 Email:', email);
      process.exit(0);
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm admin vào database
    const [result] = await pool.query(
      `INSERT INTO nguoidung (email, matkhau, hoten, sdt, quyen, trangthai) 
       VALUES (?, ?, ?, ?, 'admin', 1)`,
      [email, hashedPassword, hoten, sdt]
    );

    console.log('✅ Tạo tài khoản admin thành công!');
    console.log('📧 Email:', email);
    console.log('🔑 Mật khẩu:', password);
    console.log('👤 ID:', result.insertId);
    console.log('\n⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo tài khoản admin:', error);
    process.exit(1);
  }
}

createAdminUser();
