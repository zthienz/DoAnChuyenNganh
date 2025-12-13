import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function createPaymentTable() {
  try {
    console.log('🏗️ Creating payment_transactions table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id_transaction BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        id_donhang BIGINT UNSIGNED NOT NULL,
        order_code BIGINT NOT NULL UNIQUE,
        amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'payos',
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        payment_url TEXT,
        response_code VARCHAR(10),
        response_desc TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_order_code (order_code),
        INDEX idx_status (status),
        INDEX idx_donhang (id_donhang)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await pool.query(createTableSQL);
    console.log('✅ Table payment_transactions created successfully!');
    
    // Check if table exists and show structure
    const [tables] = await pool.query("SHOW TABLES LIKE 'payment_transactions'");
    if (tables.length > 0) {
      console.log('📋 Table structure:');
      const [columns] = await pool.query('DESCRIBE payment_transactions');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await pool.end();
  }
}

createPaymentTable();