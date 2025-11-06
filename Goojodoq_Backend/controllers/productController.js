import { pool } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id, 
        p.product_name, 
        p.price, 
        p.sale_price, 
        p.stock_quantity,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) AS image
      FROM products p
      WHERE p.is_active = TRUE
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
