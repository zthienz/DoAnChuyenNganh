import { pool } from "./config/db.js";

// Script debug để kiểm tra trạng thái đơn hàng
async function debugOrderStatus() {
  try {
    console.log('🔍 Debugging order status...');
    
    // Lấy đơn hàng gần nhất
    const [orders] = await pool.query(`
      SELECT 
        id_donhang,
        ma_donhang,
        trangthai,
        trangthai_thanhtoan,
        phuongthuc_thanhtoan,
        tong_tien,
        ngay_tao,
        ngay_capnhat
      FROM donhang 
      ORDER BY ngay_tao DESC 
      LIMIT 5
    `);

    console.log('📦 Recent orders:');
    orders.forEach(order => {
      console.log(`
        ID: ${order.id_donhang}
        Mã: ${order.ma_donhang}
        Trạng thái: ${order.trangthai}
        Trạng thái TT: ${order.trangthai_thanhtoan}
        Phương thức TT: ${order.phuongthuc_thanhtoan}
        Tổng tiền: ${order.tong_tien}
        Ngày tạo: ${order.ngay_tao}
        Ngày cập nhật: ${order.ngay_capnhat}
        ---
      `);
    });

    // Kiểm tra payment transactions
    const [transactions] = await pool.query(`
      SELECT 
        pt.*,
        dh.ma_donhang
      FROM payment_transactions pt
      JOIN donhang dh ON pt.id_donhang = dh.id_donhang
      ORDER BY pt.created_at DESC 
      LIMIT 5
    `);

    console.log('💳 Recent payment transactions:');
    transactions.forEach(tx => {
      console.log(`
        Order: ${tx.ma_donhang}
        Order Code: ${tx.order_code}
        Amount: ${tx.amount}
        Status: ${tx.status}
        Method: ${tx.payment_method}
        Created: ${tx.created_at}
        Updated: ${tx.updated_at}
        ---
      `);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
}

debugOrderStatus();