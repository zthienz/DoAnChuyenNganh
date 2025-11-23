import { pool } from "../config/db.js";

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const { userId, items, total, subtotal, discount, addressId, paymentMethod = 'cod', note = '', voucherCode = null } = req.body;

    if (!userId || !items || items.length === 0 || !addressId) {
      return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
    }

    // Tạo mã đơn hàng
    const orderCode = 'DH' + Date.now();

    // Tính tổng tiền từ items nếu không có
    const totalAmount = total || items.reduce((sum, item) => sum + (item.soluong * parseFloat(item.gia_donvi)), 0);

    // Tạo đơn hàng
    const [orderResult] = await pool.query(
      `INSERT INTO donhang 
      (id_nguoidung, ma_donhang, trangthai, tong_tien, tien_giam, id_diachi, phuongthuc_thanhtoan, ghichu) 
      VALUES (?, ?, 'cho_xacnhan', ?, ?, ?, ?, ?)`,
      [userId, orderCode, totalAmount, discount || 0, addressId, paymentMethod, note]
    );

    const orderId = orderResult.insertId;

    // Thêm chi tiết đơn hàng
    for (const item of items) {
      const productId = item.id_sanpham || item.product_id;
      const quantity = item.soluong || item.quantity;
      const price = item.gia_donvi || item.price;
      
      await pool.query(
        `INSERT INTO chitiet_donhang 
        (id_donhang, id_sanpham, soluong, gia_donvi, thanhtien) 
        VALUES (?, ?, ?, ?, ?)`,
        [orderId, productId, quantity, price, quantity * price]
      );

      // Giảm tồn kho
      await pool.query(
        'UPDATE sanpham SET tonkho = tonkho - ? WHERE id_sanpham = ?',
        [quantity, productId]
      );
    }

    // Xử lý voucher nếu có
    if (voucherCode) {
      const [vouchers] = await pool.query(
        'SELECT id_voucher FROM voucher WHERE ma_voucher = ?',
        [voucherCode]
      );

      if (vouchers.length > 0) {
        const voucherId = vouchers[0].id_voucher;
        
        // Giảm số lượng voucher
        await pool.query(
          'UPDATE voucher SET soluong = soluong - 1 WHERE id_voucher = ?',
          [voucherId]
        );

        // Lưu lịch sử sử dụng voucher
        await pool.query(
          'INSERT INTO voucher_sudung (id_voucher, id_nguoidung, id_donhang) VALUES (?, ?, ?)',
          [voucherId, userId, orderId]
        );
      }
    }

    // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
    const [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length > 0) {
      // Xóa từng sản phẩm đã đặt hàng
      for (const item of items) {
        const productId = item.id_sanpham || item.product_id;
        await pool.query(
          'DELETE FROM chitiet_giohang WHERE id_giohang = ? AND id_sanpham = ?',
          [carts[0].id_giohang, productId]
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Đặt hàng thành công',
      orderId: orderId,
      orderCode: orderCode
    });

  } catch (err) {
    console.error('Error in createOrder:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách đơn hàng
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT 
        dh.*,
        dc.ten_nguoinhan,
        dc.sdt,
        dc.diachi_chitiet,
        dc.thanhpho,
        dc.quanhuyen
      FROM donhang dh
      LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
      WHERE dh.id_nguoidung = ?
    `;

    const params = [userId];

    if (status && status !== 'all') {
      query += ' AND dh.trangthai = ?';
      params.push(status);
    }

    query += ' ORDER BY dh.ngay_tao DESC';

    const [orders] = await pool.query(query, params);

    // Lấy chi tiết từng đơn hàng
    for (let order of orders) {
      const [items] = await pool.query(`
        SELECT 
          ct.*,
          sp.ten_sanpham,
          sp.ma_sku,
          (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
        FROM chitiet_donhang ct
        JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
        WHERE ct.id_donhang = ?
      `, [order.id_donhang]);

      order.items = items;
    }

    res.json(orders);

  } catch (err) {
    console.error('Error in getOrders:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orders] = await pool.query(`
      SELECT 
        dh.*,
        dc.ten_nguoinhan,
        dc.sdt,
        dc.diachi_chitiet,
        dc.thanhpho,
        dc.quanhuyen,
        dc.ma_buudien
      FROM donhang dh
      LEFT JOIN diachi dc ON dh.id_diachi = dc.id_diachi
      WHERE dh.id_donhang = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];

    // Lấy chi tiết sản phẩm
    const [items] = await pool.query(`
      SELECT 
        ct.*,
        sp.ten_sanpham,
        sp.ma_sku,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM chitiet_donhang ct
      JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      WHERE ct.id_donhang = ?
    `, [orderId]);

    order.items = items;

    res.json(order);

  } catch (err) {
    console.error('Error in getOrderDetail:', err);
    res.status(500).json({ error: err.message });
  }
};

// Hủy đơn hàng
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra trạng thái đơn hàng
    const [orders] = await pool.query(
      'SELECT trangthai FROM donhang WHERE id_donhang = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    if (orders[0].trangthai !== 'cho_xacnhan') {
      return res.status(400).json({ error: 'Không thể hủy đơn hàng này' });
    }

    // Cập nhật trạng thái
    await pool.query(
      'UPDATE donhang SET trangthai = "huy" WHERE id_donhang = ?',
      [orderId]
    );

    // Hoàn lại tồn kho
    const [items] = await pool.query(
      'SELECT id_sanpham, soluong FROM chitiet_donhang WHERE id_donhang = ?',
      [orderId]
    );

    for (const item of items) {
      await pool.query(
        'UPDATE sanpham SET tonkho = tonkho + ? WHERE id_sanpham = ?',
        [item.soluong, item.id_sanpham]
      );
    }

    res.json({ success: true, message: 'Đã hủy đơn hàng' });

  } catch (err) {
    console.error('Error in cancelOrder:', err);
    res.status(500).json({ error: err.message });
  }
};

// Xác nhận đã nhận hàng
export const confirmReceived = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra trạng thái
    const [orders] = await pool.query(
      'SELECT trangthai FROM donhang WHERE id_donhang = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    if (orders[0].trangthai !== 'dang_giao') {
      return res.status(400).json({ error: 'Đơn hàng chưa ở trạng thái đang giao' });
    }

    // Cập nhật trạng thái
    await pool.query(
      'UPDATE donhang SET trangthai = "hoanthanh", trangthai_thanhtoan = "da_tt" WHERE id_donhang = ?',
      [orderId]
    );

    res.json({ success: true, message: 'Đã xác nhận nhận hàng' });

  } catch (err) {
    console.error('Error in confirmReceived:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin: Xác nhận đơn hàng
export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    await pool.query(
      'UPDATE donhang SET trangthai = "dang_giao" WHERE id_donhang = ?',
      [orderId]
    );

    res.json({ success: true, message: 'Đã xác nhận đơn hàng' });

  } catch (err) {
    console.error('Error in confirmOrder:', err);
    res.status(500).json({ error: err.message });
  }
};
