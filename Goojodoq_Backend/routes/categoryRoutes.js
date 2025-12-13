import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// Lấy tất cả danh mục
router.get("/", async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT 
        id_danhmuc as category_id,
        ten_danhmuc as category_name,
        duongdan as category_slug,
        id_cha as parent_id,
        ngay_tao as created_at
      FROM danhmuc 
      ORDER BY ten_danhmuc ASC
    `);
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (err) {
    console.error('Error getting categories:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Lấy danh mục theo ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [categories] = await pool.query(`
      SELECT 
        id_danhmuc as category_id,
        ten_danhmuc as category_name,
        duongdan as category_slug,
        id_cha as parent_id,
        ngay_tao as created_at
      FROM danhmuc 
      WHERE id_danhmuc = ?
    `, [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy danh mục'
      });
    }
    
    res.json({
      success: true,
      category: categories[0]
    });
  } catch (err) {
    console.error('Error getting category:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;