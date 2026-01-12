import { pool } from "../config/db.js";

// Lấy thông tin hóa đơn cho 1 đơn hàng
export const getOrderInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy thông tin đơn hàng
    const [orders] = await pool.query(`
      SELECT 
        dh.*,
        dc.ten_nguoinhan,
        dc.sdt,
        dc.diachi_chitiet,
        dc.thanhpho,
        dc.quanhuyen,
        dc.ma_buudien,
        nd.hoten as ten_nguoidung,
        nd.email as email_nguoidung
      FROM donhang dh
      LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
      LEFT JOIN nguoidung nd ON dh.id_nguoidung = nd.id_nguoidung
      WHERE dh.id_donhang = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];

    // Lấy chi tiết sản phẩm trong đơn hàng
    const [items] = await pool.query(`
      SELECT 
        ct.*,
        sp.ten_sanpham,
        sp.ma_sku,
        sp.mota_ngan,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM chitiet_donhang ct
      JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      WHERE ct.id_donhang = ?
      ORDER BY ct.id_chitiet
    `, [orderId]);

    // Lấy thông tin thanh toán nếu có
    const [payments] = await pool.query(`
      SELECT * FROM payment_transactions 
      WHERE id_donhang = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [orderId]);

    const invoiceData = {
      order: order,
      items: items,
      payment: payments.length > 0 ? payments[0] : null,
      company: {
        name: "GOOJODOQ",
        address: "123 Đường ABC, Quận XYZ, TP.HCM",
        phone: "0123-456-789",
        email: "info@goojodoq.com",
        website: "www.goojodoq.com"
      }
    };

    res.json(invoiceData);

  } catch (err) {
    console.error('Error in getOrderInvoice:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy thông tin hóa đơn tổng hợp theo khoảng thời gian
export const getPeriodInvoice = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'Vui lòng cung cấp khoảng thời gian' });
    }

    // Lấy tổng quan doanh thu
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as tong_donhang,
        COUNT(CASE WHEN trangthai = 'hoanthanh' THEN 1 END) as donhang_hoanthanh,
        COUNT(CASE WHEN trangthai = 'huy' THEN 1 END) as donhang_huy,
        SUM(CASE WHEN trangthai = 'hoanthanh' THEN tong_tien ELSE 0 END) as tong_doanhthu,
        AVG(CASE WHEN trangthai = 'hoanthanh' THEN tong_tien ELSE NULL END) as doanhthu_trungbinh
      FROM donhang 
      WHERE DATE(ngay_tao) BETWEEN ? AND ?
    `, [fromDate, toDate]);

    // Lấy chi tiết đơn hàng hoàn thành
    const [completedOrders] = await pool.query(`
      SELECT 
        dh.id_donhang,
        dh.ma_donhang,
        dh.tong_tien,
        dh.phuongthuc_thanhtoan,
        dh.ngay_tao,
        nd.hoten as ten_nguoidung,
        nd.email as email_nguoidung,
        dc.ten_nguoinhan,
        dc.thanhpho
      FROM donhang dh
      LEFT JOIN nguoidung nd ON dh.id_nguoidung = nd.id_nguoidung
      LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
      WHERE dh.trangthai = 'hoanthanh' 
        AND DATE(dh.ngay_tao) BETWEEN ? AND ?
      ORDER BY dh.ngay_tao DESC
    `, [fromDate, toDate]);

    // Lấy thống kê theo phương thức thanh toán
    const [paymentStats] = await pool.query(`
      SELECT 
        phuongthuc_thanhtoan,
        COUNT(*) as so_donhang,
        SUM(tong_tien) as tong_tien
      FROM donhang 
      WHERE trangthai = 'hoanthanh' 
        AND DATE(ngay_tao) BETWEEN ? AND ?
      GROUP BY phuongthuc_thanhtoan
    `, [fromDate, toDate]);

    // Lấy top sản phẩm bán chạy
    const [topProducts] = await pool.query(`
      SELECT 
        sp.ten_sanpham,
        sp.ma_sku,
        SUM(ct.soluong) as tong_soluong,
        SUM(ct.thanh_tien) as tong_doanhthu,
        AVG(ct.gia_donvi) as gia_trungbinh
      FROM chitiet_donhang ct
      JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      JOIN donhang dh ON ct.id_donhang = dh.id_donhang
      WHERE dh.trangthai = 'hoanthanh' 
        AND DATE(dh.ngay_tao) BETWEEN ? AND ?
      GROUP BY sp.id_sanpham, sp.ten_sanpham, sp.ma_sku
      ORDER BY tong_soluong DESC
      LIMIT 10
    `, [fromDate, toDate]);

    const invoiceData = {
      period: {
        fromDate: fromDate,
        toDate: toDate
      },
      summary: summary[0],
      completedOrders: completedOrders,
      paymentStats: paymentStats,
      topProducts: topProducts,
      company: {
        name: "GOOJODOQ",
        address: "123 Đường ABC, Quận XYZ, TP.HCM",
        phone: "0123-456-789",
        email: "info@goojodoq.com",
        website: "www.goojodoq.com"
      }
    };

    res.json(invoiceData);

  } catch (err) {
    console.error('Error in getPeriodInvoice:', err);
    res.status(500).json({ error: err.message });
  }
};