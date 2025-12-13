import { pool } from "../config/db.js";

async function checkTables() {
  try {
    console.log("📋 Checking table structures...\n");

    // Check donhang table
    console.log("=== DONHANG TABLE ===");
    const [donhangCols] = await pool.query("DESCRIBE donhang");
    console.log(JSON.stringify(donhangCols, null, 2));

    console.log("\n=== SANPHAM TABLE ===");
    const [sanphamCols] = await pool.query("DESCRIBE sanpham");
    console.log(JSON.stringify(sanphamCols, null, 2));

    console.log("\n=== NGUOIDUNG TABLE ===");
    const [nguoidungCols] = await pool.query("DESCRIBE nguoidung");
    console.log(JSON.stringify(nguoidungCols, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkTables();
