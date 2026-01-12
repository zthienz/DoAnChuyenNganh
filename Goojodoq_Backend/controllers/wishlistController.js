import { pool } from "../config/db.js";

// Lấy danh sách yêu thích
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const [items] = await pool.query(`
      SELECT 
        sp.id_sanpham as product_id,
        sp.ten_sanpham as product_name,
        sp.ma_sku as sku,
        sp.gia as price,
        sp.gia_goc as sale_price,
        sp.tonkho as stock,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM sanpham_yeuthich sy
      JOIN sanpham sp ON sy.id_sanpham = sp.id_sanpham
      WHERE sy.id_nguoidung = ?
      ORDER BY sy.ngay_them DESC
    `, [userId]);

    res.json(items);

  } catch (err) {
    console.error('Error in getWishlist:', err);
    res.status(500).json({ error: err.message });
  }
};

// Thêm vào danh sách yêu thích
export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Kiểm tra đã tồn tại chưa
    const [existing] = await pool.query(
      'SELECT id FROM sanpham_yeuthich WHERE id_nguoidung = ? AND id_sanpham = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: 'Sản phẩm đã có trong danh sách yêu thích' });
    }

    // Thêm mới
    await pool.query(
      'INSERT INTO sanpham_yeuthich (id_nguoidung, id_sanpham) VALUES (?, ?)',
      [userId, productId]
    );

    res.json({ success: true, message: 'Đã thêm vào danh sách yêu thích' });

  } catch (err) {
    console.error('Error in addToWishlist:', err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa khỏi danh sách yêu thích
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await pool.query(
      'DELETE FROM sanpham_yeuthich WHERE id_nguoidung = ? AND id_sanpham = ?',
      [userId, productId]
    );

    res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' });

  } catch (err) {
    console.error('Error in removeFromWishlist:', err);
    res.status(500).json({ error: err.message });
  }
};

// Kiểm tra sản phẩm có trong wishlist không
export const checkWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const [items] = await pool.query(
      'SELECT id FROM sanpham_yeuthich WHERE id_nguoidung = ? AND id_sanpham = ?',
      [userId, productId]
    );

    res.json({ inWishlist: items.length > 0 });

  } catch (err) {
    console.error('Error in checkWishlist:', err);
    res.status(500).json({ error: err.message });
  }
};
