import { pool } from "../config/db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running activity_log migration...');
    
    // Đọc file SQL
    const sqlFile = path.join(__dirname, '../migrations/create_activity_log.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Thực thi SQL
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Created table: activity_log');
    
    // Kiểm tra bảng đã được tạo
    const [tables] = await pool.query("SHOW TABLES LIKE 'activity_log'");
    if (tables.length > 0) {
      console.log('✅ Table activity_log exists');
      
      // Hiển thị cấu trúc bảng
      const [columns] = await pool.query("DESCRIBE activity_log");
      console.log('📋 Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `(${col.Key})` : ''}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();