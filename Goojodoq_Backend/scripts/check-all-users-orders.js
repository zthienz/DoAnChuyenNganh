import { pool } from "../config/db.js";

// Script to check all users and their orders

async function checkAllUsersOrders() {
  try {
    console.log('\n🔍 Checking all users and their orders...\n');
    
    // Get all users
    const [users] = await pool.query(
      'SELECT id_nguoidung, email, hoten FROM nguoidung WHERE quyen = "nguoidung" ORDER BY id_nguoidung'
    );
    
    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`👤 User: ${user.hoten} (${user.email})`);
      console.log(`   ID: ${user.id_nguoidung}`);
      console.log(`${'='.repeat(80)}`);
      
      // Get orders for this user
      const [orders] = await pool.query(`
        SELECT 
          dh.id_donhang,
          dh.ma_donhang,
          dh.id_nguoidung,
          dh.tong_tien,
          dh.trangthai,
          dh.ngay_tao,
          dc.ten_nguoinhan,
          dc.sdt
        FROM donhang dh
        LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
        WHERE dh.id_nguoidung = ?
        ORDER BY dh.ngay_tao DESC
      `, [user.id_nguoidung]);
      
      console.log(`\n📦 Orders: ${orders.length}\n`);
      
      if (orders.length > 0) {
        orders.forEach((order, index) => {
          const userIdMatch = order.id_nguoidung === user.id_nguoidung;
          console.log(`${index + 1}. ${order.ma_donhang}`);
          console.log(`   Order User ID: ${order.id_nguoidung} ${userIdMatch ? '✅' : '❌ WRONG!'}`);
          console.log(`   Status: ${order.trangthai}`);
          console.log(`   Recipient: ${order.ten_nguoinhan || 'N/A'}`);
          console.log(`   Total: ${order.tong_tien}`);
          console.log(`   Date: ${order.ngay_tao}`);
          console.log('');
        });
        
        // Check for wrong orders
        const wrongOrders = orders.filter(o => o.id_nguoidung !== user.id_nguoidung);
        if (wrongOrders.length > 0) {
          console.log(`\n⚠️ WARNING: ${wrongOrders.length} orders have wrong user ID!`);
        }
      } else {
        console.log('   No orders found.\n');
      }
    }
    
    // Check for cross-contamination
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('🔍 Checking for cross-contamination...');
    console.log(`${'='.repeat(80)}\n`);
    
    // Get all orders with recipient name "Lê Văn Z"
    const [leVanZOrders] = await pool.query(`
      SELECT 
        dh.id_donhang,
        dh.ma_donhang,
        dh.id_nguoidung,
        nd.email,
        nd.hoten,
        dc.ten_nguoinhan
      FROM donhang dh
      LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
      LEFT JOIN nguoidung nd ON dh.id_nguoidung = nd.id_nguoidung
      WHERE dc.ten_nguoinhan = 'Lê Văn Z'
      ORDER BY dh.id_nguoidung
    `);
    
    console.log(`Found ${leVanZOrders.length} orders with recipient "Lê Văn Z":\n`);
    
    const userGroups = {};
    leVanZOrders.forEach(order => {
      if (!userGroups[order.id_nguoidung]) {
        userGroups[order.id_nguoidung] = {
          email: order.email,
          hoten: order.hoten,
          orders: []
        };
      }
      userGroups[order.id_nguoidung].orders.push(order.ma_donhang);
    });
    
    Object.entries(userGroups).forEach(([userId, data]) => {
      console.log(`User ID ${userId}: ${data.hoten} (${data.email})`);
      console.log(`   Orders: ${data.orders.length}`);
      console.log(`   Order codes: ${data.orders.join(', ')}`);
      console.log('');
    });
    
    if (Object.keys(userGroups).length > 1) {
      console.log('⚠️ WARNING: Multiple users have orders with recipient "Lê Văn Z"!');
      console.log('This could indicate:');
      console.log('1. Different users ordering to the same recipient (NORMAL)');
      console.log('2. Data corruption (PROBLEM)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAllUsersOrders();
