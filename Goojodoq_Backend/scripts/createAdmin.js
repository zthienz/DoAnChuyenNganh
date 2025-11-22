import dotenv from "dotenv";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

async function createAdmin() {
  try {
    const adminEmail = "admin@goojodoq.com";
    const adminPassword = "admin123";
    
    // Check if admin exists
    const [existing] = await pool.query(
      "SELECT id_nguoidung FROM nguoidung WHERE email = ?",
      [adminEmail]
    );
    
    if (existing.length > 0) {
      console.log("✅ Admin account already exists!");
      console.log("Email:", adminEmail);
      console.log("Password:", adminPassword);
      process.exit(0);
    }
    
    // Create admin account
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await pool.query(
      `INSERT INTO nguoidung (email, matkhau, hoten, quyen, trangthai) 
       VALUES (?, ?, ?, ?, ?)`,
      [adminEmail, hashedPassword, "Administrator", "admin", 1]
    );
    
    console.log("✅ Admin account created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("\n⚠️  Please change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
