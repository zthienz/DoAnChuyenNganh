import { pool } from "../config/db.js";

// Lấy thông tin người dùng và địa chỉ
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy thông tin user
    const [users] = await pool.query(
      'SELECT id_nguoidung, email, hoten, sdt, ngay_tao FROM nguoidung WHERE id_nguoidung = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Lấy địa chỉ mặc định
    const [addresses] = await pool.query(
      'SELECT * FROM diachi WHERE id_nguoidung = ? AND macdinh = 1 LIMIT 1',
      [userId]
    );

    res.json({
      user: users[0],
      address: addresses.length > 0 ? addresses[0] : null
    });

  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin cá nhân
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { hoten, sdt } = req.body;

    await pool.query(
      'UPDATE nguoidung SET hoten = ?, sdt = ? WHERE id_nguoidung = ?',
      [hoten, sdt, userId]
    );

    res.json({ success: true, message: 'Đã cập nhật thông tin' });

  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật địa chỉ
export const updateAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ten_nguoinhan, sdt, diachi_chitiet, thanhpho, quanhuyen, ma_buudien } = req.body;

    // Kiểm tra xem đã có địa chỉ chưa
    const [existing] = await pool.query(
      'SELECT id_diachi FROM diachi WHERE id_nguoidung = ? AND macdinh = 1',
      [userId]
    );

    if (existing.length > 0) {
      // Cập nhật địa chỉ hiện tại
      await pool.query(
        `UPDATE diachi SET 
          ten_nguoinhan = ?, 
          sdt = ?, 
          diachi_chitiet = ?, 
          thanhpho = ?, 
          quanhuyen = ?, 
          ma_buudien = ?
        WHERE id_diachi = ?`,
        [ten_nguoinhan, sdt, diachi_chitiet, thanhpho, quanhuyen, ma_buudien, existing[0].id_diachi]
      );
    } else {
      // Tạo địa chỉ mới
      await pool.query(
        `INSERT INTO diachi 
        (id_nguoidung, ten_nguoinhan, sdt, diachi_chitiet, thanhpho, quanhuyen, ma_buudien, macdinh) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [userId, ten_nguoinhan, sdt, diachi_chitiet, thanhpho, quanhuyen, ma_buudien]
      );
    }

    res.json({ success: true, message: 'Đã cập nhật địa chỉ' });

  } catch (err) {
    console.error('Error in updateAddress:', err);
    res.status(500).json({ error: err.message });
  }
};

// Kiểm tra địa chỉ đã đầy đủ chưa
export const checkAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    const [addresses] = await pool.query(
      `SELECT * FROM diachi 
       WHERE id_nguoidung = ? 
       AND ten_nguoinhan IS NOT NULL 
       AND sdt IS NOT NULL 
       AND diachi_chitiet IS NOT NULL 
       AND thanhpho IS NOT NULL 
       AND quanhuyen IS NOT NULL
       LIMIT 1`,
      [userId]
    );

    res.json({ 
      hasAddress: addresses.length > 0,
      address: addresses.length > 0 ? addresses[0] : null
    });

  } catch (err) {
    console.error('Error in checkAddress:', err);
    res.status(500).json({ error: err.message });
  }
};
