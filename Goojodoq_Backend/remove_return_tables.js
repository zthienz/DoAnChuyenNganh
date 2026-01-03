import { pool } from "./config/db.js";

async function removeReturnTables() {
    try {
        console.log('🔄 Removing return functionality from database...');
        
        // Drop return tables
        console.log('🗑️ Dropping chi_tiet_tra_hang table...');
        await pool.query('DROP TABLE IF EXISTS chi_tiet_tra_hang');
        
        console.log('🗑️ Dropping yeu_cau_tra_hang table...');
        await pool.query('DROP TABLE IF EXISTS yeu_cau_tra_hang');
        
        // Remove ngay_xacnhan_nhan column
        console.log('🗑️ Removing ngay_xacnhan_nhan column...');
        try {
            await pool.query('ALTER TABLE donhang DROP COLUMN ngay_xacnhan_nhan');
            console.log('✅ Column ngay_xacnhan_nhan removed successfully');
        } catch (error) {
            if (error.message.includes("check that column/key exists")) {
                console.log('ℹ️ Column ngay_xacnhan_nhan does not exist');
            } else {
                throw error;
            }
        }
        
        console.log('✅ Return functionality removed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Failed to remove return functionality:', error);
        process.exit(1);
    }
}

removeReturnTables();