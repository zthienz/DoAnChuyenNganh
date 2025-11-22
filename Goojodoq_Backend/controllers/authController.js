import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Đăng ký người dùng mới
export const register = async (req, res) => {
  try {
    const { email, matkhau, hoten, sdt } = req.body;

    // Validate input
    if (!email || !matkhau) {
      return res.status(400).json({ 
        success: false, 
        message: "Email và mật khẩu là bắt buộc" 
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await pool.query(
      "SELECT id_nguoidung FROM nguoidung WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Email đã được sử dụng" 
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(matkhau, 10);

    // Thêm người dùng mới
    const [result] = await pool.query(
      `INSERT INTO nguoidung (email, matkhau, hoten, sdt, quyen, trangthai) 
       VALUES (?, ?, ?, ?, 'nguoidung', 1)`,
      [email, hashedPassword, hoten || null, sdt || null]
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: {
        id_nguoidung: result.insertId,
        email: email,
        hoten: hoten,
        sodienthoai: sdt,
        quyen: "nguoidung"
      }
    });

  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server: " + error.message 
    });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, matkhau } = req.body;

    // Validate input
    if (!email || !matkhau) {
      return res.status(400).json({ 
        success: false, 
        message: "Email và mật khẩu là bắt buộc" 
      });
    }

    // Tìm người dùng
    const [users] = await pool.query(
      `SELECT id_nguoidung, email, matkhau, hoten, sdt, quyen, trangthai 
       FROM nguoidung 
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Email hoặc mật khẩu không đúng" 
      });
    }

    const user = users[0];

    // Kiểm tra tài khoản có bị khóa không
    if (user.trangthai === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Tài khoản đã bị khóa" 
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(matkhau, user.matkhau);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Email hoặc mật khẩu không đúng" 
      });
    }

    // Đăng nhập thành công
    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id_nguoidung: user.id_nguoidung,
        email: user.email,
        hoten: user.hoten,
        sodienthoai: user.sdt,
        diachi: null, // Sẽ được cập nhật trong profile
        quyen: user.quyen
      }
    });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server: " + error.message 
    });
  }
};

// Lấy thông tin người dùng
export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `SELECT id_nguoidung, email, hoten, sdt, quyen, ngay_tao 
       FROM nguoidung 
       WHERE id_nguoidung = ? AND trangthai = 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy người dùng" 
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error("Error in getUserInfo:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server: " + error.message 
    });
  }
};
