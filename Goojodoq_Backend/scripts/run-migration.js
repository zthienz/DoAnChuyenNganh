// Script để chạy migration cho Product Sections
import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    console.log('🚀 Running Product Sections Migration...\n');

    try {
        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/add_product_sections.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Parse SQL statements properly
        console.log('📄 Parsing migration SQL...\n');
        
        // Remove comments and split by semicolon
        const cleanSQL = migrationSQL
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');
        
        // Split by semicolon but keep complete statements
        const statements = [];
        let currentStatement = '';
        
        for (const line of cleanSQL.split('\n')) {
            currentStatement += line + '\n';
            if (line.trim().endsWith(';')) {
                const stmt = currentStatement.trim();
                if (stmt.length > 1) {
                    statements.push(stmt);
                }
                currentStatement = '';
            }
        }
        
        console.log(`Found ${statements.length} SQL statements\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
            console.log(`${i + 1}. ${preview}...`);
            
            try {
                await pool.query(statement);
                console.log('   ✅ Success\n');
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('   ⏭️  Already exists, skipping\n');
                } else {
                    console.error('   ❌ Error:', err.message, '\n');
                }
            }
        }

        // Verify tables
        console.log('🔍 Verifying tables...');
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME IN ('product_sections', 'product_section_items')
        `);

        if (tables.length === 2) {
            console.log('✅ Tables created successfully!\n');
            
            // Check sections
            const [sections] = await pool.query('SELECT * FROM product_sections');
            console.log(`📦 Sections: ${sections.length}`);
            sections.forEach(s => {
                console.log(`   - ${s.ma_section}: ${s.ten_section}`);
            });
        } else {
            console.log('❌ Tables not found!\n');
        }

        console.log('\n✅ Migration completed!');
        console.log('\n📝 Next step: Run test script');
        console.log('   node scripts/test-product-sections.js');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

// Run migration
runMigration();
