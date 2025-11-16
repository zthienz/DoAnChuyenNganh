import { pool } from "../config/db.js";

// Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sp.id_sanpham as product_id,
        sp.ten_sanpham as product_name,
        sp.duongdan as product_slug,
        sp.id_danhmuc as category_id,
        sp.gia as price,
        sp.gia_goc as sale_price,
        sp.tonkho as stock_quantity,
        sp.mota_ngan as short_description,
        sp.hien_thi as is_active,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM sanpham sp
      WHERE sp.hien_thi = 1
      ORDER BY sp.ngay_tao DESC
    `);
    
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
    const [result] = await pool.query(
      `INSERT INTO sanpham 
      (ma_sku, ten_sanpham, duongdan, mota_ngan, mota_chitiet, 
       id_danhmuc, gia, gia_goc, tonkho, hien_thi) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        sku,
        product_name,
        product_slug,
        short_description,
        description,
        category_id,
        sale_price || price, // gia là giá sau giảm
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
