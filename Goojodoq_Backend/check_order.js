import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function checkOrder() {
  try {
    console.log('🔍 Checking orders...');
    
    // Kiểm tra đơn hàng
    const [orders] = await pool.query('SELECT * FROM donhang ORDER BY id_donhang DESC LIMIT 5');
    console.log('📋 Recent orders:');
    orders.forEach(order => {
      console.log(`  ID: ${order.id_donhang}, Code: ${order.ma_donhang}, Status: ${order.trangthai}, Total: ${order.tong_tien}`);
    });
    
    // Kiểm tra payment transactions
    const [payments] = await pool.query('SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 5');
    console.log('\n💳 Recent payments:');
    payments.forEach(payment => {
      console.log(`  Order: ${payment.id_donhang}, Code: ${payment.order_code}, Status: ${payment.status}, Amount: ${payment.amount}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkOrder();