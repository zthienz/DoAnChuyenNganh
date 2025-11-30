import { pool } from "../config/db.js";

// Script to check specific user orders

async function checkUserOrders() {
  try {
    const userId = 15; // User ID from screenshot
    
    console.log(`\n🔍 Checking orders for User ID: ${userId}\n`);
    
    // Get user info
    const [users] = await pool.query(
      'SELECT id_nguoidung, email, hoten FROM nguoidung WHERE id_nguoidung = ?',
      [userId]
    );
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('👤 User Info:');
    console.log(`   ID: ${user.id_nguoidung}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.hoten}`);
    
    // Get orders
    const [orders] = await pool.query(`
      SELECT 
        dh.id_donhang,
        dh.ma_donhang,
        dh.id_nguoidung,
        dh.id_diachi,
        dh.tong_tien,
        dh.trangthai,
        dc.ten_nguoinhan,
        dc.sdt,
        dc.diachi_chitiet,
        dc.thanhpho,
        dc.quanhuyen
      FROM donhang dh
      LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
      WHERE dh.id_nguoidung = ?
      ORDER BY dh.ngay_tao DESC
    `, [userId]);
    
    console.log(`\n📦 Found ${orders.length} orders:\n`);
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.ma_donhang}`);
      console.log(`   Order ID: ${order.id_donhang}`);
      console.log(`   User ID: ${order.id_nguoidung} ${order.id_nguoidung === userId ? '✅' : '❌ WRONG!'}`);
      console.log(`   Status: ${order.trangthai}`);
      console.log(`   Total: ${order.tong_tien}`);
      console.log(`   Recipient: ${order.ten_nguoinhan || 'N/A'}`);
      console.log(`   Phone: ${order.sdt || 'N/A'}`);
      console.log(`   Address: ${order.diachi_chitiet || 'N/A'}, ${order.quanhuyen || ''}, ${order.thanhpho || ''}`);
      console.log('');
    });
    
    // Check if any orders have wrong user ID
    const wrongOrders = orders.filter(o => o.id_nguoidung !== userId);
    if (wrongOrders.length > 0) {
      console.log(`\n⚠️ WARNING: Found ${wrongOrders.length} orders with wrong user ID!`);
      wrongOrders.forEach(order => {
        console.log(`   - ${order.ma_donhang}: User ID ${order.id_nguoidung} (should be ${userId})`);
      });
    } else {
      console.log('\n✅ All orders belong to the correct user!');
    }
    
    // Check addresses
    console.log('\n📍 Checking user addresses:\n');
    const [addresses] = await pool.query(
      'SELECT * FROM diachi WHERE id_nguoidung = ?',
      [userId]
    );
    
    console.log(`Found ${addresses.length} addresses:`);
    addresses.forEach((addr, index) => {
      console.log(`${index + 1}. Address ID: ${addr.id_diachi}`);
      console.log(`   Recipient: ${addr.ten_nguoinhan}`);
      console.log(`   Phone: ${addr.sdt}`);
      console.log(`   Address: ${addr.diachi_chitiet}, ${addr.quanhuyen}, ${addr.thanhpho}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUserOrders();
