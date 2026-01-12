import { pool } from "../config/db.js";

// Lấy sản phẩm theo section
export const getProductsBySection = async (req, res) => {
  try {
    const { sectionCode } = req.params; // 'sale', 'featured', 'all'
    
    const query = `
      SELECT 
        sp.id_sanpham as product_id,
        COALESCE(psi.ten_sanpham_custom, sp.ten_sanpham) as product_name,
        sp.ma_sku as sku,
        sp.duongdan as product_slug,
        sp.id_danhmuc as category_id,
        COALESCE(psi.gia_custom, sp.gia) as price,
        COALESCE(psi.gia_goc_custom, sp.gia_goc) as sale_price,
        sp.tonkho as stock_quantity,
        COALESCE(psi.mota_ngan_custom, sp.mota_ngan) as short_description,
        sp.hien_thi as is_active_global,
        psi.hien_thi as is_active_section,
        psi.thu_tu as section_order,
        psi.id as section_item_id,
        COALESCE(reviews.review_count, 0) as review_count,
        COALESCE(reviews.avg_rating, 0) as avg_rating,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM product_section_items psi
      INNER JOIN sanpham sp ON psi.id_sanpham = sp.id_sanpham
      INNER JOIN product_sections ps ON psi.id_section = ps.id_section
      LEFT JOIN (
        SELECT 
          dg.id_sanpham,
          COUNT(*) as review_count,
          AVG(dg.so_sao) as avg_rating
        FROM danhgia_sanpham dg
        GROUP BY dg.id_sanpham
      ) reviews ON sp.id_sanpham = reviews.id_sanpham
      WHERE ps.ma_section = ? 
        AND psi.hien_thi = 1
        AND sp.hien_thi = 1
      ORDER BY psi.thu_tu ASC, sp.ngay_tao DESC
    `;
    
    const [rows] = await pool.query(query, [sectionCode]);
    
    res.json({
      success: true,
      section: sectionCode,
      count: rows.length,
      products: rows
    });
  } catch (err) {
    console.error('Error in getProductsBySection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy tất cả sản phẩm trong section (bao gồm cả ẩn) - Admin only
export const getAllProductsInSection = async (req, res) => {
  try {
    const { sectionCode } = req.params;
    
    const query = `
      SELECT 
        sp.id_sanpham as product_id,
        COALESCE(psi.ten_sanpham_custom, sp.ten_sanpham) as product_name,
        sp.ten_sanpham as original_name,
        sp.ma_sku as sku,
        sp.duongdan as product_slug,
        sp.id_danhmuc as category_id,
        COALESCE(psi.gia_custom, sp.gia) as price,
        sp.gia as original_price,
        COALESCE(psi.gia_goc_custom, sp.gia_goc) as sale_price,
        sp.gia_goc as original_sale_price,
        sp.tonkho as stock_quantity,
        COALESCE(psi.mota_ngan_custom, sp.mota_ngan) as short_description,
        sp.mota_ngan as original_description,
        sp.hien_thi as is_active_global,
        psi.hien_thi as is_active_section,
        psi.thu_tu as section_order,
        psi.id as section_item_id,
        psi.ten_sanpham_custom,
        psi.gia_custom,
        psi.gia_goc_custom,
        psi.mota_ngan_custom,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM product_section_items psi
      INNER JOIN sanpham sp ON psi.id_sanpham = sp.id_sanpham
      INNER JOIN product_sections ps ON psi.id_section = ps.id_section
      WHERE ps.ma_section = ?
      ORDER BY psi.thu_tu ASC, sp.ngay_tao DESC
    `;
    
    const [rows] = await pool.query(query, [sectionCode]);
    
    res.json({
      success: true,
      section: sectionCode,
      count: rows.length,
      products: rows
    });
  } catch (err) {
    console.error('Error in getAllProductsInSection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Thêm sản phẩm vào section
export const addProductToSection = async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const { productId, customName, customPrice, customSalePrice, customDescription } = req.body;
    
    // Get section ID
    const [sections] = await pool.query(
      'SELECT id_section FROM product_sections WHERE ma_section = ?',
      [sectionCode]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section không tồn tại' });
    }
    
    const sectionId = sections[0].id_section;
    
    // Check if product exists
    const [products] = await pool.query(
      'SELECT id_sanpham FROM sanpham WHERE id_sanpham = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
    }
    
    // Check if already in section
    const [existing] = await pool.query(
      'SELECT id FROM product_section_items WHERE id_section = ? AND id_sanpham = ?',
      [sectionId, productId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Sản phẩm đã có trong mục này' });
    }
    
    // Get max order + 1 (add to top)
    const [maxOrder] = await pool.query(
      'SELECT COALESCE(MAX(thu_tu), -1) + 1 as next_order FROM product_section_items WHERE id_section = ?',
      [sectionId]
    );
    
    const nextOrder = maxOrder[0].next_order;
    
    // Insert
    await pool.query(
      `INSERT INTO product_section_items 
       (id_section, id_sanpham, thu_tu, hien_thi, ten_sanpham_custom, gia_custom, gia_goc_custom, mota_ngan_custom) 
       VALUES (?, ?, ?, 1, ?, ?, ?, ?)`,
      [sectionId, productId, nextOrder, customName || null, customPrice || null, customSalePrice || null, customDescription || null]
    );
    
    res.json({
      success: true,
      message: 'Đã thêm sản phẩm vào mục'
    });
  } catch (err) {
    console.error('Error in addProductToSection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Xóa sản phẩm khỏi section
export const removeProductFromSection = async (req, res) => {
  try {
    const { sectionCode, productId } = req.params;
    
    // Get section ID
    const [sections] = await pool.query(
      'SELECT id_section FROM product_sections WHERE ma_section = ?',
      [sectionCode]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section không tồn tại' });
    }
    
    const sectionId = sections[0].id_section;
    
    // Delete
    const [result] = await pool.query(
      'DELETE FROM product_section_items WHERE id_section = ? AND id_sanpham = ?',
      [sectionId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sản phẩm không có trong mục này' });
    }
    
    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi mục'
    });
  } catch (err) {
    console.error('Error in removeProductFromSection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Ẩn/hiện sản phẩm trong section
export const toggleProductInSection = async (req, res) => {
  try {
    const { sectionCode, productId } = req.params;
    const { isActive } = req.body;
    
    // Get section ID
    const [sections] = await pool.query(
      'SELECT id_section FROM product_sections WHERE ma_section = ?',
      [sectionCode]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section không tồn tại' });
    }
    
    const sectionId = sections[0].id_section;
    
    // Update
    const [result] = await pool.query(
      'UPDATE product_section_items SET hien_thi = ? WHERE id_section = ? AND id_sanpham = ?',
      [isActive ? 1 : 0, sectionId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sản phẩm không có trong mục này' });
    }
    
    res.json({
      success: true,
      message: isActive ? 'Đã hiển thị sản phẩm' : 'Đã ẩn sản phẩm'
    });
  } catch (err) {
    console.error('Error in toggleProductInSection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cập nhật thông tin tùy chỉnh sản phẩm trong section
export const updateProductInSection = async (req, res) => {
  try {
    const { sectionCode, productId } = req.params;
    const { customName, customPrice, customSalePrice, customDescription } = req.body;
    
    // Get section ID
    const [sections] = await pool.query(
      'SELECT id_section FROM product_sections WHERE ma_section = ?',
      [sectionCode]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section không tồn tại' });
    }
    
    const sectionId = sections[0].id_section;
    
    // Update
    const [result] = await pool.query(
      `UPDATE product_section_items 
       SET ten_sanpham_custom = ?, gia_custom = ?, gia_goc_custom = ?, mota_ngan_custom = ?
       WHERE id_section = ? AND id_sanpham = ?`,
      [customName || null, customPrice || null, customSalePrice || null, customDescription || null, sectionId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sản phẩm không có trong mục này' });
    }
    
    res.json({
      success: true,
      message: 'Đã cập nhật thông tin sản phẩm'
    });
  } catch (err) {
    console.error('Error in updateProductInSection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cập nhật thứ tự sản phẩm trong section
export const updateProductOrder = async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const { productOrders } = req.body; // Array of {productId, order}
    
    // Get section ID
    const [sections] = await pool.query(
      'SELECT id_section FROM product_sections WHERE ma_section = ?',
      [sectionCode]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section không tồn tại' });
    }
    
    const sectionId = sections[0].id_section;
    
    // Update orders
    for (const item of productOrders) {
      await pool.query(
        'UPDATE product_section_items SET thu_tu = ? WHERE id_section = ? AND id_sanpham = ?',
        [item.order, sectionId, item.productId]
      );
    }
    
    res.json({
      success: true,
      message: 'Đã cập nhật thứ tự sản phẩm'
    });
  } catch (err) {
    console.error('Error in updateProductOrder:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy danh sách sản phẩm chưa có trong section (để thêm mới)
export const getAvailableProducts = async (req, res) => {
  try {
    const { sectionCode } = req.params;
    
    // Get section ID
    const [sections] = await pool.query(
      'SELECT id_section FROM product_sections WHERE ma_section = ?',
      [sectionCode]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section không tồn tại' });
    }
    
    const sectionId = sections[0].id_section;
    
    // Get products not in this section
    const query = `
      SELECT 
        sp.id_sanpham as product_id,
        sp.ten_sanpham as product_name,
        sp.ma_sku as sku,
        sp.gia as price,
        sp.gia_goc as sale_price,
        sp.tonkho as stock_quantity,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM sanpham sp
      WHERE sp.hien_thi = 1
        AND sp.id_sanpham NOT IN (
          SELECT id_sanpham FROM product_section_items WHERE id_section = ?
        )
      ORDER BY sp.ngay_tao DESC
    `;
    
    const [rows] = await pool.query(query, [sectionId]);
    
    res.json({
      success: true,
      count: rows.length,
      products: rows
    });
  } catch (err) {
    console.error('Error in getAvailableProducts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
