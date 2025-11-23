import { pool } from "../config/db.js";

// Lấy giỏ hàng của người dùng
export const getCart = async (req, res) => {
  try {
    console.log('🛒 getCart called with userId:', req.params.userId);
    const { userId } = req.params;

    // Lấy hoặc tạo giỏ hàng
    let [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length === 0) {
      // Tạo giỏ hàng mới nếu chưa có
      const [result] = await pool.query(
        'INSERT INTO giohang (id_nguoidung) VALUES (?)',
        [userId]
      );
      const cartId = result.insertId;
      return res.json({ cart_id: cartId, items: [], total: 0 });
    }

    const cartId = carts[0].id_giohang;

    // Lấy chi tiết giỏ hàng
    const [items] = await pool.query(`
      SELECT 
        ct.id_chitiet,
        ct.id_sanpham,
        ct.soluong,
        ct.gia_donvi,
        sp.ten_sanpham as product_name,
        sp.ma_sku as sku,
        sp.tonkho as stock,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM chitiet_giohang ct
      JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      WHERE ct.id_giohang = ?
      ORDER BY ct.ngay_them DESC
    `, [cartId]);

    // Tính tổng tiền
    const total = items.reduce((sum, item) => sum + (item.soluong * parseFloat(item.gia_donvi)), 0);

    res.json({
      cart_id: cartId,
      items: items,
      total: total
    });

  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1, price } = req.body;

    if (!userId || !productId || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Lấy hoặc tạo giỏ hàng
    let [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    let cartId;
    if (carts.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO giohang (id_nguoidung) VALUES (?)',
        [userId]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id_giohang;
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const [existing] = await pool.query(
      'SELECT id_chitiet, soluong FROM chitiet_giohang WHERE id_giohang = ? AND id_sanpham = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      // Cập nhật số lượng
      await pool.query(
        'UPDATE chitiet_giohang SET soluong = soluong + ? WHERE id_chitiet = ?',
        [quantity, existing[0].id_chitiet]
      );
    } else {
      // Thêm mới
      await pool.query(
        'INSERT INTO chitiet_giohang (id_giohang, id_sanpham, soluong, gia_donvi) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, price]
      );
    }

    // Cập nhật thời gian giỏ hàng
    await pool.query(
      'UPDATE giohang SET ngay_capnhat = CURRENT_TIMESTAMP WHERE id_giohang = ?',
      [cartId]
    );

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });

  } catch (err) {
    console.error('Error in addToCart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật số lượng sản phẩm
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }

    await pool.query(
      'UPDATE chitiet_giohang SET soluong = ? WHERE id_chitiet = ?',
      [quantity, itemId]
    );

    res.json({ success: true, message: 'Đã cập nhật số lượng' });

  } catch (err) {
    console.error('Error in updateCartItem:', err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    await pool.query('DELETE FROM chitiet_giohang WHERE id_chitiet = ?', [itemId]);

    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });

  } catch (err) {
    console.error('Error in removeFromCart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length > 0) {
      await pool.query('DELETE FROM chitiet_giohang WHERE id_giohang = ?', [carts[0].id_giohang]);
    }

    res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' });

  } catch (err) {
    console.error('Error in clearCart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Đếm số lượng sản phẩm trong giỏ
export const getCartCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length === 0) {
      return res.json({ count: 0 });
    }

    const [result] = await pool.query(
      'SELECT SUM(soluong) as total FROM chitiet_giohang WHERE id_giohang = ?',
      [carts[0].id_giohang]
    );

    res.json({ count: result[0].total || 0 });

  } catch (err) {
    console.error('Error in getCartCount:', err);
    res.status(500).json({ error: err.message });
  }
};
