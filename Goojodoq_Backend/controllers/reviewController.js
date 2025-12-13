import { pool } from "../config/db.js";

// Lấy đánh giá của một sản phẩm
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const [reviews] = await pool.query(`
      SELECT 
        dg.id_danhgia,
        dg.so_sao,
        dg.noidung,
        dg.ngay_tao,
        nd.hoten as ten_nguoidung,
        nd.email,
        tl.id_traloi,
        tl.noidung as traloi_noidung,
        tl.ngay_tao as traloi_ngay_tao,
        admin.hoten as admin_ten
      FROM danhgia_sanpham dg
      JOIN nguoidung nd ON dg.id_nguoidung = nd.id_nguoidung
      LEFT JOIN traloi_danhgia tl ON dg.id_danhgia = tl.id_danhgia
      LEFT JOIN nguoidung admin ON tl.id_admin = admin.id_nguoidung
      WHERE dg.id_sanpham = ?
      ORDER BY dg.ngay_tao DESC
    `, [productId]);

    res.json(reviews);
  } catch (error) {
    console.error("Error getting product reviews:", error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy thống kê đánh giá của sản phẩm
export const getProductReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(so_sao) as avg_rating,
        SUM(CASE WHEN so_sao = 5 THEN 1 ELSE 0 END) as star_5,
        SUM(CASE WHEN so_sao = 4 THEN 1 ELSE 0 END) as star_4,
        SUM(CASE WHEN so_sao = 3 THEN 1 ELSE 0 END) as star_3,
        SUM(CASE WHEN so_sao = 2 THEN 1 ELSE 0 END) as star_2,
        SUM(CASE WHEN so_sao = 1 THEN 1 ELSE 0 END) as star_1,
        SUM(CASE WHEN so_sao = 0 THEN 1 ELSE 0 END) as star_0
      FROM danhgia_sanpham
      WHERE id_sanpham = ?
    `, [productId]);

    res.json(stats[0]);
  } catch (error) {
    console.error("Error getting review stats:", error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách sản phẩm trong đơn hàng để đánh giá
export const getOrderProductsForReview = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra đơn hàng có tồn tại và đã giao không
    const [orders] = await pool.query(`
      SELECT trangthai, id_nguoidung 
      FROM donhang 
      WHERE id_donhang = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: "Đơn hàng không tồn tại" });
    }

    if (orders[0].trangthai !== 'hoanthanh') {
      return res.status(400).json({ error: "Chỉ có thể đánh giá đơn hàng đã giao" });
    }

    // Lấy danh sách sản phẩm trong đơn hàng
    const [products] = await pool.query(`
      SELECT 
        ct.id_sanpham,
        sp.ten_sanpham,
        sp.ma_sku,
        ct.soluong,
        ct.gia_donvi,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image,
        dg.id_danhgia,
        dg.so_sao,
        dg.noidung as danhgia_noidung
      FROM chitiet_donhang ct
      JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      LEFT JOIN danhgia_sanpham dg ON dg.id_donhang = ct.id_donhang AND dg.id_sanpham = ct.id_sanpham
      WHERE ct.id_donhang = ?
    `, [orderId]);

    res.json({
      order_id: orderId,
      user_id: orders[0].id_nguoidung,
      products: products
    });
  } catch (error) {
    console.error("Error getting order products for review:", error);
    res.status(500).json({ error: error.message });
  }
};

// Tạo đánh giá cho sản phẩm
export const createReview = async (req, res) => {
  try {
    const { orderId, productId, userId, rating, content } = req.body;

    // Validate
    if (!orderId || !productId || !userId || rating === undefined) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: "Số sao phải từ 0 đến 5" });
    }

    // Kiểm tra đơn hàng có tồn tại và đã giao không
    const [orders] = await pool.query(`
      SELECT trangthai, id_nguoidung 
      FROM donhang 
      WHERE id_donhang = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: "Đơn hàng không tồn tại" });
    }

    if (orders[0].trangthai !== 'hoanthanh') {
      return res.status(400).json({ error: "Chỉ có thể đánh giá đơn hàng đã giao" });
    }

    if (orders[0].id_nguoidung !== userId) {
      return res.status(403).json({ error: "Bạn không có quyền đánh giá đơn hàng này" });
    }

    // Kiểm tra sản phẩm có trong đơn hàng không
    const [products] = await pool.query(`
      SELECT id_sanpham 
      FROM chitiet_donhang 
      WHERE id_donhang = ? AND id_sanpham = ?
    `, [orderId, productId]);

    if (products.length === 0) {
      return res.status(400).json({ error: "Sản phẩm không có trong đơn hàng này" });
    }

    // Thêm hoặc cập nhật đánh giá
    await pool.query(`
      INSERT INTO danhgia_sanpham (id_donhang, id_sanpham, id_nguoidung, so_sao, noidung)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE so_sao = ?, noidung = ?
    `, [orderId, productId, userId, rating, content, rating, content]);

    res.json({ success: true, message: "Đánh giá thành công" });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: error.message });
  }
};

// Admin trả lời đánh giá
export const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminId, content } = req.body;

    if (!adminId || !content) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra admin
    const [admins] = await pool.query(`
      SELECT quyen FROM nguoidung WHERE id_nguoidung = ?
    `, [adminId]);

    if (admins.length === 0 || admins[0].quyen !== 'admin') {
      return res.status(403).json({ error: "Bạn không có quyền trả lời đánh giá" });
    }

    // Kiểm tra đánh giá có tồn tại không
    const [reviews] = await pool.query(`
      SELECT id_danhgia FROM danhgia_sanpham WHERE id_danhgia = ?
    `, [reviewId]);

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Đánh giá không tồn tại" });
    }

    // Thêm hoặc cập nhật trả lời
    const [existing] = await pool.query(`
      SELECT id_traloi FROM traloi_danhgia WHERE id_danhgia = ?
    `, [reviewId]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE traloi_danhgia 
        SET noidung = ?, ngay_tao = CURRENT_TIMESTAMP 
        WHERE id_danhgia = ?
      `, [content, reviewId]);
    } else {
      await pool.query(`
        INSERT INTO traloi_danhgia (id_danhgia, id_admin, noidung)
        VALUES (?, ?, ?)
      `, [reviewId, adminId, content]);
    }

    res.json({ success: true, message: "Trả lời đánh giá thành công" });
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({ error: error.message });
  }
};

// Xóa trả lời đánh giá
export const deleteReviewReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { adminId } = req.body;

    // Kiểm tra admin
    const [admins] = await pool.query(`
      SELECT quyen FROM nguoidung WHERE id_nguoidung = ?
    `, [adminId]);

    if (admins.length === 0 || admins[0].quyen !== 'admin') {
      return res.status(403).json({ error: "Bạn không có quyền xóa trả lời" });
    }

    await pool.query(`DELETE FROM traloi_danhgia WHERE id_traloi = ?`, [replyId]);

    res.json({ success: true, message: "Đã xóa trả lời" });
  } catch (error) {
    console.error("Error deleting review reply:", error);
    res.status(500).json({ error: error.message });
  }
};
