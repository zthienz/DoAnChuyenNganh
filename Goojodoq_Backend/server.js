import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (images)
app.use('/images', express.static('../frontend/images'));

// ✅ Test route kiểm tra kết nối DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM nguoidung");
    res.json({ message: "Database connected!", result: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛍️ Route sản phẩm
app.use("/api/products", productRoutes);

// 🔥 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
