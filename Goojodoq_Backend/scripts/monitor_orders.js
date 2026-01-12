import { pool } from '../config/db.js';

async function monitorOrders() {
    try {
        console.log('👀 Monitoring recent orders...');
        
        // Get recent orders
        const [recentOrders] = await pool.query(`
            SELECT 
                id_donhang,
                ma_donhang,
                trangthai,
                trangthai_thanhtoan,
                phuongthuc_thanhtoan,
                tong_tien,
                ngay_tao
            FROM donhang 
            ORDER BY ngay_tao DESC 
            LIMIT 10
        `);
        
        console.log('\n📋 Recent orders:');
        recentOrders.forEach(order => {
            console.log(`  ${order.ma_donhang}: ${order.trangthai} | ${order.trangthai_thanhtoan} | ${order.phuongthuc_thanhtoan} | ${order.tong_tien}đ`);
        });
        
        // Check for any orders with invalid status
        const [invalidOrders] = await pool.query(`
            SELECT COUNT(*) as count
            FROM donhang 
            WHERE trangthai NOT IN ('cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy')
        `);
        
        console.log(`\n❌ Orders with invalid status: ${invalidOrders[0].count}`);
        
        // Show current ENUM
        const [enumInfo] = await pool.query(`
            SHOW COLUMNS FROM donhang WHERE Field = 'trangthai'
        `);
        
        console.log(`\n📋 Current ENUM: ${enumInfo[0].Type}`);
        
    } catch (error) {
        console.error('❌ Error monitoring orders:', error);
    } finally {
        await pool.end();
    }
}

monitorOrders();