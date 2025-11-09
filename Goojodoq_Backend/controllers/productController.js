import { pool } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id, 
        p.product_name,
        p.product_slug,
        p.category_id,
        p.price, 
        p.sale_price, 
        p.stock_quantity,
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        p.short_description,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1) AS image
      FROM products p
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
    `);
    
    // Add default review_count = 0 for all products
    const productsWithReviews = rows.map(product => ({
      ...product,
      review_count: 0,
      avg_rating: 0
    }));
    
    res.json(productsWithReviews);
  } catch (err) {
    console.error('Error in getAllProducts:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_slug,
      category_id,
      description,
      short_description,
      price,
      sale_price,
      stock_quantity,
      sku,
      brand,
      weight,
      dimensions,
      origin_country,
      warranty_period,
      is_active,
      is_featured,
      is_new,
      images
    } = req.body;

    // Insert product
    const [result] = await pool.query(
      `INSERT INTO products 
      (product_name, product_slug, category_id, description, short_description, 
       price, sale_price, stock_quantity, sku, brand, weight, dimensions, 
       origin_country, warranty_period, is_active, is_featured, is_new) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        product_slug,
        category_id,
        description,
        short_description,
        price,
        sale_price,
        stock_quantity,
        sku,
        brand || 'GOOJODOQ',
        weight,
        dimensions,
        origin_country,
        warranty_period || 12,
        is_active ? 1 : 0,
        is_featured ? 1 : 0,
        is_new ? 1 : 0
      ]
    );

    const productId = result.insertId;

    // Insert main image
    if (images && images.main) {
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
         VALUES (?, ?, ?, TRUE, 1)`,
        [productId, images.main, product_name]
      );
    }

    // Insert additional images
    if (images && images.additional && images.additional.length > 0) {
      for (let i = 0; i < images.additional.length; i++) {
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
           VALUES (?, ?, ?, FALSE, ?)`,
          [productId, images.additional[i], `${product_name} - Góc ${i + 2}`, i + 2]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      product_id: productId
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
};
