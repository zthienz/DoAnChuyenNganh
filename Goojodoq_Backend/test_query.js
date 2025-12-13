// Test query trực tiếp
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

async function testQuery() {
  try {
    console.log('🔍 Testing database connection...');
    
    // 1. Kiểm tra sản phẩm
    const [products] = await pool.query('SELECT COUNT(*) as count FROM sanpham');
    console.log('📦 Total products:', products[0].count);
    
    // 2. Kiểm tra đơn hàng
    const [orders] = await pool.query('SELECT COUNT(*) as count, trangthai FROM donhang GROUP BY trangthai');
    console.log('📋 Orders by status:', orders);
    
    // 3. Kiểm tra chi tiết đơn hàng
    const [orderDetails] = await pool.query('SELECT COUNT(*) as count FROM chitiet_donhang');
    console.log('📝 Order details:', orderDetails[0].count);
    
    // 4. Kiểm tra đánh giá
    const [reviews] = await pool.query('SELECT COUNT(*) as count FROM danhgia_sanpham');
    console.log('⭐ Reviews:', reviews[0].count);
    
    // 5. Test query chính
    const query = `
      SELECT 
        sp.id_sanpham as product_id,
        sp.ten_sanpham as product_name,
        COALESCE(sales.total_sold, 0) as total_sold,
        COALESCE(reviews.review_count, 0) as review_count,
        COALESCE(reviews.avg_rating, 0) as avg_rating
      FROM sanpham sp
      LEFT JOIN (
        SELECT 
          ct.id_sanpham,
          SUM(ct.soluong) as total_sold
        FROM chitiet_donhang ct
        JOIN donhang dh ON ct.id_donhang = dh.id_donhang 
        WHERE dh.trangthai = 'hoanthanh'
        GROUP BY ct.id_sanpham
      ) sales ON sp.id_sanpham = sales.id_sanpham
      LEFT JOIN (
        SELECT 
          dg.id_sanpham,
          COUNT(*) as review_count,
          AVG(dg.so_sao) as avg_rating
        FROM danhgia_sanpham dg
        GROUP BY dg.id_sanpham
      ) reviews ON sp.id_sanpham = reviews.id_sanpham
      WHERE sp.hien_thi = 1
      LIMIT 5
    `;
    
    const [result] = await pool.query(query);
    console.log('🎯 Query result:');
    result.forEach(product => {
      console.log(`  - ${product.product_name}: sold=${product.total_sold}, reviews=${product.review_count}, rating=${product.avg_rating}`);
    });
    
    // 6. Tạo dữ liệu mẫu nếu cần
    if (result.every(p => p.total_sold === 0)) {
      console.log('⚠️ No sales data found. Creating sample data...');
      
      // Tạo đơn hàng mẫu
      const [orderResult] = await pool.query(`
        INSERT INTO donhang (id_nguoidung, ma_donhang, trangthai, tong_tien, ngay_tao) 
        VALUES (1, 'SAMPLE001', 'hoanthanh', 1000000, NOW())
      `);
      
      const orderId = orderResult.insertId;
      const productId = result[0].product_id;
      
      // Thêm chi tiết đơn hàng
      await pool.query(`
        INSERT INTO chitiet_donhang (id_donhang, id_sanpham, soluong, gia_donvi, thanh_tien)
        VALUES (?, ?, 2, 500000, 1000000)
      `, [orderId, productId]);
      
      // Thêm đánh giá
      await pool.query(`
        INSERT INTO danhgia_sanpham (id_donhang, id_sanpham, id_nguoidung, so_sao, noidung)
        VALUES (?, ?, 1, 5, 'Sản phẩm tuyệt vời!')
      `, [orderId, productId]);
      
      console.log('✅ Sample data created!');
      
      // Test lại
      const [newResult] = await pool.query(query);
      console.log('🎯 New query result:');
      newResult.forEach(product => {
        console.log(`  - ${product.product_name}: sold=${product.total_sold}, reviews=${product.review_count}, rating=${product.avg_rating}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testQuery();