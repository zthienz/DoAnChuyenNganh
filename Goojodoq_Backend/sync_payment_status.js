import { pool } from "./config/db.js";
import PayOS from "@payos/node";

// PayOS configuration
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// Tự động đồng bộ trạng thái thanh toán cho tất cả đơn hàng pending
async function syncAllPaymentStatus() {
  try {
    console.log('🔄 Syncing all payment status...');
    
    // Lấy tất cả đơn hàng bank_transfer chưa thanh toán
    const [orders] = await pool.query(`
      SELECT 
        dh.id_donhang,
        dh.ma_donhang,
        dh.trangthai,
        dh.trangthai_thanhtoan,
        dh.phuongthuc_thanhtoan,
        pt.order_code,
        pt.status as transaction_status
      FROM donhang dh
      LEFT JOIN payment_transactions pt ON dh.id_donhang = pt.id_donhang
      WHERE dh.phuongthuc_thanhtoan = 'bank_transfer' 
        AND dh.trangthai_thanhtoan = 'chua_tt'
        AND dh.trangthai = 'cho_xacnhan'
        AND pt.order_code IS NOT NULL
      ORDER BY dh.ngay_tao DESC
    `);

    console.log(`📦 Found ${orders.length} pending bank transfer orders`);

    for (const order of orders) {
      try {
        console.log(`🔍 Checking order: ${order.ma_donhang} (${order.order_code})`);
        
        // Kiểm tra trạng thái từ PayOS
        const paymentInfo = await payOS.getPaymentLinkInformation(order.order_code);
        
        console.log(`💳 PayOS status for ${order.ma_donhang}:`, paymentInfo.status);
        
        if (paymentInfo.status === 'PAID') {
          console.log(`✅ Payment completed for ${order.ma_donhang}, updating database...`);
          
          // Cập nhật trạng thái đơn hàng
          await pool.query(
            `UPDATE donhang 
             SET trangthai_thanhtoan = 'da_tt', ngay_capnhat = NOW() 
             WHERE id_donhang = ?`,
            [order.id_donhang]
          );

          // Cập nhật trạng thái transaction
          await pool.query(
            `UPDATE payment_transactions 
             SET status = 'completed', updated_at = NOW() 
             WHERE order_code = ?`,
            [order.order_code]
          );
          
          console.log(`✅ Updated order ${order.ma_donhang} to paid status`);
        } else if (paymentInfo.status === 'CANCELLED') {
          console.log(`❌ Payment cancelled for ${order.ma_donhang}`);
          
          // Cập nhật trạng thái transaction
          await pool.query(
            `UPDATE payment_transactions 
             SET status = 'cancelled', updated_at = NOW() 
             WHERE order_code = ?`,
            [order.order_code]
          );
        } else {
          console.log(`⏳ Payment still pending for ${order.ma_donhang}`);
        }
        
      } catch (error) {
        console.error(`❌ Error checking order ${order.ma_donhang}:`, error.message);
      }
    }
    
    console.log('✅ Payment status sync completed!');
    
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
}

// Chạy sync
syncAllPaymentStatus();