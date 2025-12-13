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

async function checkTable() {
  try {
    const [columns] = await pool.query('DESCRIBE danhmuc');
    console.log('📋 Table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });
    
    const [data] = await pool.query('SELECT * FROM danhmuc LIMIT 5');
    console.log('\n📂 Sample data:');
    data.forEach(row => {
      console.log(`  ${JSON.stringify(row)}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkTable();