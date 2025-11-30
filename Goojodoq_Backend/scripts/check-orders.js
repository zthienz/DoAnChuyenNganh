import { pool } from "../config/db.js";

// Script to check orders and verify data integrity

async function checkOrders() {
  try {
    console.log('🔍 Checking orders data integrity...\n');
    
    // Get all users
    const [users] = await pool.query('SELECT id_nguoidung, email, hoten FROM nguoidung WHERE quyen = "nguoidung"');
    console.log(`👥 Found ${users.length} users\n`);
    
    // Check orders for each user
    for (const user of users) {
      console.log(`\n📧 User: ${user.email} (ID: ${user.id_nguoidung})`);
      
      const [orders] = await pool.query(
        'SELECT id_donhang, ma_donhang, id_nguoidung, tong_tien, trangthai FROM donhang WHERE id_nguoidung = ?',
        [user.id_nguoidung]
      );
      
      console.log(`   📦 Orders: ${orders.length}`);
      
      if (orders.length > 0) {
        orders.forEach(order => {
          console.log(`      - ${order.ma_donhang} | User ID: ${order.id_nguoidung} | Status: ${order.trangthai} | Total: ${order.tong_tien}`);
        });
      }
    }
    
    // Check for orphaned orders (orders without valid user)
    console.log('\n\n🔍 Checking for orphaned orders...');
    const [orphanedOrders] = await pool.query(`
      SELECT dh.id_donhang, dh.ma_donhang, dh.id_nguoidung 
      FROM donhang dh
      LEFT JOIN nguoidung nd ON dh.id_nguoidung = nd.id_nguoidung
      WHERE nd.id_nguoidung IS NULL
    `);
    
    if (orphanedOrders.length > 0) {
      console.log(`⚠️ Found ${orphanedOrders.length} orphaned orders:`);
      orphanedOrders.forEach(order => {
        console.log(`   - ${order.ma_donhang} | User ID: ${order.id_nguoidung} (user not found)`);
      });
    } else {
      console.log('✅ No orphaned orders found');
    }
    
    // Check for duplicate orders
    console.log('\n\n🔍 Checking for potential issues...');
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(DISTINCT id_nguoidung) as unique_users,
        COUNT(DISTINCT ma_donhang) as unique_order_codes
      FROM donhang
    `);
    
    console.log(`📊 Statistics:`);
    console.log(`   Total orders: ${stats[0].total_orders}`);
    console.log(`   Unique users: ${stats[0].unique_users}`);
    console.log(`   Unique order codes: ${stats[0].unique_order_codes}`);
    
    if (stats[0].total_orders !== stats[0].unique_order_codes) {
      console.log('⚠️ WARNING: Duplicate order codes detected!');
    }
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkOrders();
