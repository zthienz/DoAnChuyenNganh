import { pool } from "../config/db.js";

// Script để tạo dữ liệu đơn hàng mẫu cho testing
async function seedOrders() {
  try {
    console.log('🌱 Bắt đầu tạo dữ liệu đơn hàng mẫu...');

    // Lấy danh sách người dùng
    const [users] = await pool.query('SELECT id_nguoidung FROM nguoidung LIMIT 5');
    if (users.length === 0) {
      console.log('❌ Không có người dùng nào trong database!');
      return;
    }

    // Lấy danh sách sản phẩm
    const [products] = await pool.query('SELECT id_sanpham, gia FROM sanpham LIMIT 10');
    if (products.length === 0) {
      console.log('❌ Không có sản phẩm nào trong database!');
      return;
    }

    // Lấy địa chỉ của người dùng đầu tiên
    const [addresses] = await pool.query('SELECT id_diachi FROM diachi LIMIT 1');
    let addressId;
    
    if (addresses.length === 0) {
      // Tạo địa chỉ mẫu
      const [result] = await pool.query(
        `INSERT INTO diachi (id_nguoidung, ten_nguoinhan, sdt, diachi_chitiet, thanhpho, quanhuyen, macdinh) 
         VALUES (?, 'Nguyễn Văn A', '0123456789', '123 Đường ABC', 'TP.HCM', 'Quận 1', 1)`,
        [users[0].id_nguoidung]
      );
      addressId = result.insertId;
    } else {
      addressId = addresses[0].id_diachi;
    }

    const statuses = ['cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy'];
    const orderCount = 30; // Tạo 30 đơn hàng

    for (let i = 0; i < orderCount; i++) {
      // Random ngày trong 3 tháng gần đây
      const daysAgo = Math.floor(Math.random() * 90);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      // Random user
      const user = users[Math.floor(Math.random() * users.length)];

      // Random status (70% hoàn thành, 10% hủy, 10% đang giao, 10% chờ xác nhận)
      const rand = Math.random();
      let status;
      if (rand < 0.7) status = 'hoanthanh';
      else if (rand < 0.8) status = 'huy';
      else if (rand < 0.9) status = 'dang_giao';
      else status = 'cho_xacnhan';

      // Random số lượng sản phẩm (1-3)
      const itemCount = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;

      // Tạo mã đơn hàng
      const orderCode = 'DH' + Date.now() + i;

      // Tạo đơn hàng
      const [orderResult] = await pool.query(
        `INSERT INTO donhang 
        (id_nguoidung, ma_donhang, trangthai, tong_tien, id_diachi, phuongthuc_thanhtoan, ngay_tao) 
        VALUES (?, ?, ?, ?, ?, 'cod', ?)`,
        [user.id_nguoidung, orderCode, status, 0, addressId, orderDate]
      );

      const orderId = orderResult.insertId;

      // Thêm chi tiết đơn hàng
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(product.gia);
        const itemTotal = quantity * price;
        totalAmount += itemTotal;

        await pool.query(
          `INSERT INTO chitiet_donhang 
          (id_donhang, id_sanpham, soluong, gia_donvi, thanh_tien) 
          VALUES (?, ?, ?, ?, ?)`,
          [orderId, product.id_sanpham, quantity, price, itemTotal]
        );
      }

      // Cập nhật tổng tiền
      await pool.query(
        'UPDATE donhang SET tong_tien = ? WHERE id_donhang = ?',
        [totalAmount, orderId]
      );

      console.log(`✅ Đã tạo đơn hàng ${orderCode} - ${status} - ${totalAmount.toLocaleString('vi-VN')}₫`);
    }

    console.log(`\n🎉 Hoàn thành! Đã tạo ${orderCount} đơn hàng mẫu.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedOrders();
