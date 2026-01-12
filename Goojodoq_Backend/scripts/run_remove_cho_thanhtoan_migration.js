import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Remove cho_thanhtoan status...');
        
        // Step 1: Update existing orders with cho_thanhtoan status
        console.log('📝 Step 1: Updating existing orders...');
        const [updateResult] = await pool.query(
            "UPDATE donhang SET trangthai = 'cho_xacnhan' WHERE trangthai = 'cho_thanhtoan'"
        );
        console.log(`✅ Updated ${updateResult.affectedRows} orders from cho_thanhtoan to cho_xacnhan`);
        
        // Step 2: Modify the ENUM to remove cho_thanhtoan
        console.log('📝 Step 2: Updating ENUM definition...');
        await pool.query(`
            ALTER TABLE donhang 
            MODIFY COLUMN trangthai ENUM('cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy') 
            DEFAULT 'cho_xacnhan'
        `);
        console.log('✅ ENUM updated successfully');
        
        // Step 3: Add comment
        console.log('📝 Step 3: Adding table comment...');
        await pool.query(`
            ALTER TABLE donhang 
            COMMENT = 'Orders table - Updated 2026-01-12: Removed cho_thanhtoan status, orders now start with cho_xacnhan and payment status determines cancellation ability'
        `);
        console.log('✅ Table comment added');
        
        // Verify the changes
        console.log('\n🔍 Verifying migration results...');
        
        // Check if any orders still have cho_thanhtoan status
        const [choThanhToanOrders] = await pool.query(
            "SELECT COUNT(*) as count FROM donhang WHERE trangthai = 'cho_thanhtoan'"
        );
        console.log(`📊 Orders with cho_thanhtoan status: ${choThanhToanOrders[0].count}`);
        
        // Check current ENUM values
        const [enumInfo] = await pool.query(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'donhang' 
            AND COLUMN_NAME = 'trangthai'
            AND TABLE_SCHEMA = DATABASE()
        `);
        console.log(`📋 Current trangthai ENUM: ${enumInfo[0].COLUMN_TYPE}`);
        
        // Check order status distribution
        const [statusDistribution] = await pool.query(`
            SELECT trangthai, COUNT(*) as count 
            FROM donhang 
            GROUP BY trangthai 
            ORDER BY count DESC
        `);
        
        console.log('\n📈 Order status distribution after migration:');
        statusDistribution.forEach(row => {
            console.log(`   ${row.trangthai}: ${row.count} orders`);
        });
        
        console.log('\n✅ Migration completed successfully!');
        console.log('\n📋 Summary of changes:');
        console.log('   - Removed "cho_thanhtoan" from order status ENUM');
        console.log('   - Updated existing orders with cho_thanhtoan → cho_xacnhan');
        console.log('   - Orders now start with "cho_xacnhan" status');
        console.log('   - Payment status (trangthai_thanhtoan) determines cancellation ability');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migration
runMigration();