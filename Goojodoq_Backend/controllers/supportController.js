import { pool } from "../config/db.js";

// Create support request
export const createSupportRequest = async (req, res) => {
  try {
    const { userId, fullName, email, phone, contactType, subject, message } = req.body;

    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const [result] = await pool.query(
      `INSERT INTO yeucau_hotro (id_nguoidung, hoten, email, sodienthoai, loai_lienhe, chude, noidung) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, fullName, email, phone, contactType || 'individual', subject, message]
    );

    res.json({ 
      success: true, 
      message: 'Yêu cầu hỗ trợ đã được gửi thành công',
      requestId: result.insertId 
    });
  } catch (err) {
    console.error("❌ Error in createSupportRequest:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all support requests (Admin)
export const getAllSupportRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        yr.id_yeucau,
        yr.id_nguoidung,
        yr.hoten,
        yr.email,
        yr.sodienthoai,
        yr.loai_lienhe,
        yr.chude,
        yr.noidung,
        yr.trangthai,
        yr.ngay_tao,
        yr.ngay_capnhat,
        nd.email as username
      FROM yeucau_hotro yr
      LEFT JOIN nguoidung nd ON yr.id_nguoidung = nd.id_nguoidung
    `;

    const params = [];
    
    if (status) {
      query += ' WHERE yr.trangthai = ?';
      params.push(status);
    }

    query += ' ORDER BY yr.ngay_tao DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [requests] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM yeucau_hotro';
    if (status) {
      countQuery += ' WHERE trangthai = ?';
    }
    const [countResult] = await pool.query(countQuery, status ? [status] : []);

    res.json({
      requests,
      total: countResult[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult[0].total / limit)
    });
  } catch (err) {
    console.error("❌ Error in getAllSupportRequests:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get support request by ID
export const getSupportRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const [requests] = await pool.query(
      `SELECT 
        yr.id_yeucau,
        yr.id_nguoidung,
        yr.hoten,
        yr.email,
        yr.sodienthoai,
        yr.loai_lienhe,
        yr.chude,
        yr.noidung,
        yr.trangthai,
        yr.ngay_tao,
        yr.ngay_capnhat,
        nd.email as username,
        nd.email as user_email
      FROM yeucau_hotro yr
      LEFT JOIN nguoidung nd ON yr.id_nguoidung = nd.id_nguoidung
      WHERE yr.id_yeucau = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu hỗ trợ' });
    }

    res.json(requests[0]);
  } catch (err) {
    console.error("❌ Error in getSupportRequestById:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update support request status
export const updateSupportRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    await pool.query(
      'UPDATE yeucau_hotro SET trangthai = ? WHERE id_yeucau = ?',
      [status, requestId]
    );

    res.json({ success: true, message: 'Đã cập nhật trạng thái' });
  } catch (err) {
    console.error("❌ Error in updateSupportRequestStatus:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get support requests by user ID
export const getSupportRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [requests] = await pool.query(
      `SELECT 
        id_yeucau,
        hoten,
        email,
        sodienthoai,
        loai_lienhe,
        chude,
        noidung,
        trangthai,
        ngay_tao,
        ngay_capnhat
      FROM yeucau_hotro
      WHERE id_nguoidung = ?
      ORDER BY ngay_tao DESC`,
      [userId]
    );

    res.json(requests);
  } catch (err) {
    console.error("❌ Error in getSupportRequestsByUser:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get support request statistics
export const getSupportStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN trangthai = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN trangthai = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN trangthai = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN trangthai = 'closed' THEN 1 ELSE 0 END) as closed
      FROM yeucau_hotro
    `);

    res.json(stats[0]);
  } catch (err) {
    console.error("❌ Error in getSupportStats:", err);
    res.status(500).json({ error: err.message });
  }
};
