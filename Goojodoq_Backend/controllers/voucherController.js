import { pool } from "../config/db.js";

// Kiểm tra mã giảm giá
export const checkVoucher = async (req, res) => {
  try {
    const { code, userId } = req.body;
    console.log('🔍 Checking voucher:', { code, userId });

    if (!code) {
      return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });
    }

    // Kiểm tra voucher có tồn tại và còn hiệu lực
    const [vouchers] = await pool.query(
      `SELECT * FROM magiamgia 
       WHERE ma = ? 
       AND (hieu_luc_tu IS NULL OR hieu_luc_tu <= NOW()) 
       AND (hieu_luc_den IS NULL OR hieu_luc_den >= NOW())
       AND (gioihan_sudung IS NULL OR gioihan_sudung > 0)`,
      [code]
    );

    if (vouchers.length === 0) {
      console.log('❌ Voucher not found or expired:', code);
      return res.status(404).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    const voucher = vouchers[0];
    console.log('✅ Found voucher:', voucher);

    // Kiểm tra nếu user đã sử dụng voucher này (nếu cần)
    if (userId) {
      const [usageCount] = await pool.query(
        'SELECT COUNT(*) as count FROM voucher_sudung WHERE id_voucher = ? AND id_nguoidung = ?',
        [voucher.id_magiamgia, userId]
      );
      
      // Có thể thêm logic giới hạn số lần sử dụng per user ở đây
    }

    res.json({
      id: voucher.id_magiamgia,
      code: voucher.ma,
      discount: voucher.giatri_giam,
      discountType: voucher.loai_giam,
      minOrder: voucher.donhang_toi_thieu || 0,
      description: voucher.mo_ta,
      validFrom: voucher.hieu_luc_tu,
      validTo: voucher.hieu_luc_den,
      usageLimit: voucher.gioihan_sudung
    });

  } catch (err) {
    console.error('Error in checkVoucher:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách voucher khả dụng
export const getAvailableVouchers = async (req, res) => {
  try {
    const [vouchers] = await pool.query(
      `SELECT id_magiamgia, ma, mo_ta, loai_giam, giatri_giam, donhang_toi_thieu, hieu_luc_tu, hieu_luc_den 
       FROM magiamgia 
       WHERE (hieu_luc_tu IS NULL OR hieu_luc_tu <= NOW()) 
       AND (hieu_luc_den IS NULL OR hieu_luc_den >= NOW())
       AND (gioihan_sudung IS NULL OR gioihan_sudung > 0)
       ORDER BY giatri_giam DESC`
    );

    res.json(vouchers);

  } catch (err) {
    console.error('Error in getAvailableVouchers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Sử dụng voucher (gọi khi tạo đơn hàng)
export const useVoucher = async (req, res) => {
  try {
    const { voucherId, userId, orderId } = req.body;

    // Giảm giới hạn sử dụng nếu có
    await pool.query(
      'UPDATE magiamgia SET gioihan_sudung = gioihan_sudung - 1 WHERE id_magiamgia = ? AND gioihan_sudung > 0',
      [voucherId]
    );

    res.json({ success: true, message: 'Đã áp dụng voucher' });

  } catch (err) {
    console.error('Error in useVoucher:', err);
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// ADMIN VOUCHER MANAGEMENT
// =============================================

// Lấy tất cả vouchers cho admin
export const getAllVouchersAdmin = async (req, res) => {
  try {
    const [vouchers] = await pool.query(
      'SELECT * FROM magiamgia ORDER BY ngay_tao DESC'
    );

    res.json(vouchers);

  } catch (err) {
    console.error('Error in getAllVouchersAdmin:', err);
    res.status(500).json({ error: err.message });
  }
};

// Tạo voucher mới
export const createVoucher = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrder, description, usageLimit, validFrom, validTo } = req.body;

    // Kiểm tra mã đã tồn tại
    const [existing] = await pool.query('SELECT id_magiamgia FROM magiamgia WHERE ma = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mã giảm giá đã tồn tại' });
    }

    // Tạo voucher mới
    const [result] = await pool.query(
      `INSERT INTO magiamgia (ma, mo_ta, loai_giam, giatri_giam, donhang_toi_thieu, gioihan_sudung, hieu_luc_tu, hieu_luc_den) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, description, discountType, discountValue, minOrder, usageLimit, validFrom, validTo]
    );

    res.json({ 
      success: true, 
      message: 'Tạo mã giảm giá thành công',
      voucherId: result.insertId 
    });

  } catch (err) {
    console.error('Error in createVoucher:', err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật voucher
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minOrder, description, usageLimit, validFrom, validTo } = req.body;

    // Kiểm tra mã đã tồn tại (trừ chính nó)
    const [existing] = await pool.query(
      'SELECT id_magiamgia FROM magiamgia WHERE ma = ? AND id_magiamgia != ?', 
      [code, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mã giảm giá đã tồn tại' });
    }

    // Cập nhật voucher
    await pool.query(
      `UPDATE magiamgia 
       SET ma = ?, mo_ta = ?, loai_giam = ?, giatri_giam = ?, donhang_toi_thieu = ?, 
           gioihan_sudung = ?, hieu_luc_tu = ?, hieu_luc_den = ?
       WHERE id_magiamgia = ?`,
      [code, description, discountType, discountValue, minOrder, usageLimit, validFrom, validTo, id]
    );

    res.json({ success: true, message: 'Cập nhật mã giảm giá thành công' });

  } catch (err) {
    console.error('Error in updateVoucher:', err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa voucher
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra voucher có đang được sử dụng không
    const [usage] = await pool.query(
      'SELECT COUNT(*) as count FROM voucher_sudung WHERE id_voucher = ?',
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json({ 
        error: 'Không thể xóa mã giảm giá đã được sử dụng' 
      });
    }

    // Xóa voucher
    await pool.query('DELETE FROM magiamgia WHERE id_magiamgia = ?', [id]);

    res.json({ success: true, message: 'Xóa mã giảm giá thành công' });

  } catch (err) {
    console.error('Error in deleteVoucher:', err);
    res.status(500).json({ error: err.message });
  }
};
