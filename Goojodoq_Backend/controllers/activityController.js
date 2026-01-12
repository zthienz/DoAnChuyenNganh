import { pool } from "../config/db.js";

// Ghi lại hoạt động vào log
export const logActivity = async (activityData) => {
  try {
    const {
      loai_hoatdong,
      id_nguoidung,
      id_sanpham = null,
      id_donhang = null,
      tieu_de,
      mo_ta = null,
      du_lieu_cu = null,
      du_lieu_moi = null
    } = activityData;

    await pool.query(
      `INSERT INTO activity_log 
       (loai_hoatdong, id_nguoidung, id_sanpham, id_donhang, tieu_de, mo_ta, du_lieu_cu, du_lieu_moi) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        loai_hoatdong,
        id_nguoidung,
        id_sanpham,
        id_donhang,
        tieu_de,
        mo_ta,
        du_lieu_cu ? JSON.stringify(du_lieu_cu) : null,
        du_lieu_moi ? JSON.stringify(du_lieu_moi) : null
      ]
    );

    console.log('✅ Activity logged:', tieu_de);
  } catch (error) {
    console.error('❌ Error logging activity:', error);
  }
};

// Lấy danh sách hoạt động gần đây
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [activities] = await pool.query(`
      SELECT 
        al.id_activity,
        al.loai_hoatdong,
        al.tieu_de,
        al.mo_ta,
        al.ngay_tao,
        nd.hoten as ten_nguoidung,
        sp.ten_sanpham,
        dh.ma_donhang
      FROM activity_log al
      LEFT JOIN nguoidung nd ON al.id_nguoidung = nd.id_nguoidung
      LEFT JOIN sanpham sp ON al.id_sanpham = sp.id_sanpham
      LEFT JOIN donhang dh ON al.id_donhang = dh.id_donhang
      ORDER BY al.ngay_tao DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(activities);
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy hoạt động theo loại
export const getActivitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    const [activities] = await pool.query(`
      SELECT 
        al.id_activity,
        al.loai_hoatdong,
        al.tieu_de,
        al.mo_ta,
        al.ngay_tao,
        al.du_lieu_cu,
        al.du_lieu_moi,
        nd.hoten as ten_nguoidung,
        sp.ten_sanpham,
        dh.ma_donhang
      FROM activity_log al
      LEFT JOIN nguoidung nd ON al.id_nguoidung = nd.id_nguoidung
      LEFT JOIN sanpham sp ON al.id_sanpham = sp.id_sanpham
      LEFT JOIN donhang dh ON al.id_donhang = dh.id_donhang
      WHERE al.loai_hoatdong = ?
      ORDER BY al.ngay_tao DESC
      LIMIT ?
    `, [type, parseInt(limit)]);

    res.json(activities);
  } catch (error) {
    console.error('Error getting activities by type:', error);
    res.status(500).json({ error: error.message });
  }
};