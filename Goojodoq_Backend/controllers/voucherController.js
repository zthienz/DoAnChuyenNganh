import { pool } from "../config/db.js";

// Kiểm tra mã giảm giá
export const checkVoucher = async (req, res) => {
  try {
    const { code, userId } = req.body;

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
      return res.status(404).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    const voucher = vouchers[0];

    // Tính giá trị giảm giá
    let discountValue = 0;
    let discountType = voucher.loai_giam;
    
    if (discountType === 'theo_phantram') {
      discountValue = voucher.giatri_giam; // Phần trăm
    } else {
      discountValue = voucher.giatri_giam; // Số tiền cố định
    }

    res.json({
      id: voucher.id_magiamgia,
      code: voucher.ma,
      discount: discountValue,
      discountType: discountType,
      minOrder: voucher.donhang_toi_thieu || 0,
      description: voucher.mo_ta
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
