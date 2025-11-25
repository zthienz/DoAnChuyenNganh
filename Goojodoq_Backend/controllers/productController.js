import { pool } from "../config/db.js";

// Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    const { includeHidden } = req.query;
    
    let query = `
      SELECT 
        sp.id_sanpham as product_id,
        sp.ma_sku as sku,
        sp.ten_sanpham as product_name,
        sp.duongdan as product_slug,
        sp.id_danhmuc as category_id,
        sp.gia as price,
        sp.gia_goc as sale_price,
        sp.tonkho as stock_quantity,
        sp.mota_ngan as short_description,
        sp.hien_thi as is_active,
        sp.ngay_tao as created_at,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM sanpham sp
    `;
    
    // Nếu không phải admin, chỉ hiển thị sản phẩm đang hiển thị
    if (includeHidden !== 'true') {
      query += ' WHERE sp.hien_thi = 1';
    }
    
    // Sắp xếp: sản phẩm mới nhất lên đầu
    query += ' ORDER BY sp.ngay_tao DESC, sp.id_sanpham DESC';
    
    const [rows] = await pool.query(query);
    
    // Add default values
    const products = rows.map(product => ({
      ...product,
      is_featured: true,
      is_new: false,
      is_bestseller: false,
      review_count: 0,
      avg_rating: 0
    }));
    
    res.json(products);
  } catch (err) {
    console.error('Error in getAllProducts:', err);
    res.status(500).json({ error: err.message });
  }
};

// Thêm sản phẩm mới
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
      images
    } = req.body;

    // Insert sản phẩm
    // Lưu ý: gia_goc là giá gốc, gia là giá bán (sau giảm giá nếu có)
    const [result] = await pool.query(
      `INSERT INTO sanpham 
      (ma_sku, ten_sanpham, duongdan, mota_ngan, mota_chitiet, 
       id_danhmuc, gia, gia_goc, tonkho, hien_thi, ngay_tao) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        sku,
        product_name,
        product_slug,
        short_description,
        description,
        category_id,
        sale_price || price, // gia là giá bán (giá sau giảm nếu có)
        price, // gia_goc là giá gốc
        stock_quantity
      ]
    );

    const productId = result.insertId;

    // Insert ảnh chính
    if (images && images.main) {
      await pool.query(
        `INSERT INTO anh_sanpham (id_sanpham, duongdan_anh, mo_ta, thu_tu) 
         VALUES (?, ?, ?, 0)`,
        [productId, images.main, product_name]
      );
    }

    // Insert ảnh phụ
    if (images && images.additional && images.additional.length > 0) {
      for (let i = 0; i < images.additional.length; i++) {
        await pool.query(
          `INSERT INTO anh_sanpham (id_sanpham, duongdan_anh, mo_ta, thu_tu) 
           VALUES (?, ?, ?, ?)`,
          [productId, images.additional[i], `${product_name} - Góc ${i + 2}`, i + 1]
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

// Lấy chi tiết sản phẩm
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin sản phẩm
    const [products] = await pool.query(`
      SELECT 
        sp.id_sanpham as product_id,
        sp.ma_sku as sku,
        sp.ten_sanpham as product_name,
        sp.duongdan as product_slug,
        sp.mota_ngan as short_description,
        sp.mota_chitiet as description,
        sp.id_danhmuc as category_id,
        sp.gia as price,
        sp.gia_goc as sale_price,
        sp.tonkho as stock_quantity,
        dm.ten_danhmuc as category_name
      FROM sanpham sp
      LEFT JOIN danhmuc dm ON sp.id_danhmuc = dm.id_danhmuc
      WHERE sp.id_sanpham = ? AND sp.hien_thi = 1
    `, [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    const product = products[0];
    
    // Lấy ảnh sản phẩm
    const [images] = await pool.query(`
      SELECT duongdan_anh as image_url, mo_ta as alt_text, thu_tu as sort_order
      FROM anh_sanpham
      WHERE id_sanpham = ?
      ORDER BY thu_tu
    `, [id]);
    
    product.images = images.map(img => img.image_url);
    
    // Lấy đánh giá
    const [reviews] = await pool.query(`
      SELECT 
        dg.so_sao as rating,
        dg.tieude as title,
        dg.noidung as comment,
        dg.ngay_tao as created_at,
        nd.hoten as user_name
      FROM danhgia dg
      LEFT JOIN nguoidung nd ON dg.id_nguoidung = nd.id_nguoidung
      WHERE dg.id_sanpham = ? AND dg.hien_thi = 1
      ORDER BY dg.ngay_tao DESC
    `, [id]);
    
    product.reviews = reviews;
    product.review_count = reviews.length;
    product.avg_rating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    res.json(product);
  } catch (err) {
    console.error('Error in getProductById:', err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa sản phẩm (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm có tồn tại không
    const [products] = await pool.query(
      'SELECT id_sanpham FROM sanpham WHERE id_sanpham = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy sản phẩm' 
      });
    }

    // Xóa ảnh sản phẩm
    await pool.query('DELETE FROM anh_sanpham WHERE id_sanpham = ?', [id]);

    // Xóa đánh giá
    await pool.query('DELETE FROM danhgia WHERE id_sanpham = ?', [id]);

    // Xóa khỏi wishlist
    await pool.query('DELETE FROM yeuthich WHERE id_sanpham = ?', [id]);

    // Xóa khỏi giỏ hàng
    await pool.query('DELETE FROM chitiet_giohang WHERE id_sanpham = ?', [id]);

    // Xóa sản phẩm
    await pool.query('DELETE FROM sanpham WHERE id_sanpham = ?', [id]);

    res.json({
      success: true,
      message: 'Đã xóa sản phẩm thành công'
    });

  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Cập nhật trạng thái hiển thị sản phẩm (Admin only)
export const toggleProductVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const [products] = await pool.query(
      'SELECT id_sanpham, hien_thi FROM sanpham WHERE id_sanpham = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy sản phẩm' 
      });
    }

    // Cập nhật trạng thái
    const newStatus = is_active !== undefined ? (is_active ? 1 : 0) : (products[0].hien_thi === 1 ? 0 : 1);
    
    await pool.query(
      'UPDATE sanpham SET hien_thi = ? WHERE id_sanpham = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: newStatus === 1 ? 'Đã hiển thị sản phẩm' : 'Đã ẩn sản phẩm',
      is_active: newStatus === 1
    });

  } catch (err) {
    console.error('Error toggling product visibility:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Cập nhật sản phẩm (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      product_slug,
      category_id,
      description,
      short_description,
      price,
      sale_price,
      stock_quantity,
      sku
    } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const [products] = await pool.query(
      'SELECT id_sanpham FROM sanpham WHERE id_sanpham = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy sản phẩm' 
      });
    }

    // Cập nhật sản phẩm
    // Lưu ý: gia_goc là giá gốc, gia là giá bán (sau giảm giá nếu có)
    await pool.query(
      `UPDATE sanpham 
       SET ma_sku = ?, ten_sanpham = ?, duongdan = ?, mota_ngan = ?, 
           mota_chitiet = ?, id_danhmuc = ?, gia = ?, gia_goc = ?, tonkho = ?
       WHERE id_sanpham = ?`,
      [
        sku,
        product_name,
        product_slug,
        short_description,
        description,
        category_id,
        sale_price || price, // gia là giá bán
        price, // gia_goc là giá gốc
        stock_quantity,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Đã cập nhật sản phẩm thành công'
    });

  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
