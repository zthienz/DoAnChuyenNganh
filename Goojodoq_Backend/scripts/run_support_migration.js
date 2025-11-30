import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("🚀 Running support requests migration...");

    // Read SQL file
    const sqlFile = path.join(__dirname, "../migrations/create_support_requests_table.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Split by semicolon and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log("✅ Migration completed successfully!");
    console.log("📋 Table 'yeucau_hotro' has been created.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
