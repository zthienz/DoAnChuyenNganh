import { pool } from "./config/db.js";

async function checkVouchers() {
    try {
        console.log('🔍 Checking vouchers in database...\n');
        
        // Lấy tất cả vouchers
        const [allVouchers] = await pool.query('SELECT * FROM magiamgia ORDER BY ngay_tao DESC');
        
        console.log('📋 All vouchers:');
        console.table(allVouchers.map(v => ({
            ID: v.id_magiamgia,
            Code: v.ma,
            Type: v.loai_giam,
            Value: v.giatri_giam,
            MinOrder: v.donhang_toi_thieu,
            UsageLimit: v.gioihan_sudung,
            ValidFrom: v.hieu_luc_tu,
            ValidTo: v.hieu_luc_den,
            Created: v.ngay_tao
        })));
        
        // Kiểm tra vouchers còn hiệu lực
        const [validVouchers] = await pool.query(`
            SELECT * FROM magiamgia 
            WHERE (hieu_luc_tu IS NULL OR hieu_luc_tu <= NOW()) 
            AND (hieu_luc_den IS NULL OR hieu_luc_den >= NOW())
            AND (gioihan_sudung IS NULL OR gioihan_sudung > 0)
        `);
        
        console.log('\n✅ Valid vouchers:');
        if (validVouchers.length === 0) {
            console.log('❌ No valid vouchers found!');
        } else {
            console.table(validVouchers.map(v => ({
                Code: v.ma,
                Description: v.mo_ta,
                Type: v.loai_giam,
                Value: v.giatri_giam,
                MinOrder: v.donhang_toi_thieu,
                ValidTo: v.hieu_luc_den
            })));
        }
        
        // Kiểm tra vouchers đã hết hạn
        const [expiredVouchers] = await pool.query(`
            SELECT * FROM magiamgia 
            WHERE hieu_luc_den IS NOT NULL AND hieu_luc_den < NOW()
        `);
        
        if (expiredVouchers.length > 0) {
            console.log('\n⏰ Expired vouchers:');
            console.table(expiredVouchers.map(v => ({
                Code: v.ma,
                ExpiredAt: v.hieu_luc_den
            })));
        }
        
        // Test specific voucher
        console.log('\n🧪 Testing WELCOME10 voucher...');
        const [testVoucher] = await pool.query(`
            SELECT * FROM magiamgia 
            WHERE ma = 'WELCOME10'
            AND (hieu_luc_tu IS NULL OR hieu_luc_tu <= NOW()) 
            AND (hieu_luc_den IS NULL OR hieu_luc_den >= NOW())
            AND (gioihan_sudung IS NULL OR gioihan_sudung > 0)
        `);
        
        if (testVoucher.length > 0) {
            console.log('✅ WELCOME10 is valid:', testVoucher[0]);
        } else {
            console.log('❌ WELCOME10 is not valid or expired');
            
            // Check why it's not valid
            const [checkWelcome] = await pool.query('SELECT * FROM magiamgia WHERE ma = ?', ['WELCOME10']);
            if (checkWelcome.length > 0) {
                const voucher = checkWelcome[0];
                console.log('📋 WELCOME10 details:', {
                    validFrom: voucher.hieu_luc_tu,
                    validTo: voucher.hieu_luc_den,
                    usageLimit: voucher.gioihan_sudung,
                    now: new Date()
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking vouchers:', error);
    } finally {
        process.exit(0);
    }
}

async function resetVouchers() {
    try {
        console.log('🔄 Resetting vouchers...');
        
        // Xóa vouchers cũ
        await pool.query('DELETE FROM magiamgia');
        
        // Thêm vouchers mới
        await pool.query(`
            INSERT INTO magiamgia (ma, mo_ta, loai_giam, giatri_giam, donhang_toi_thieu, gioihan_sudung, hieu_luc_den) VALUES
            ('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'theo_phantram', 10, 200000, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
            ('FREESHIP', 'Miễn phí vận chuyển', 'theo_sotien', 30000, 500000, 50, DATE_ADD(NOW(), INTERVAL 15 DAY)),
            ('SAVE50K', 'Giảm 50K cho đơn từ 1 triệu', 'theo_sotien', 50000, 1000000, 20, DATE_ADD(NOW(), INTERVAL 7 DAY)),
            ('NEWUSER', 'Giảm 15% cho khách hàng mới', 'theo_phantram', 15, 300000, 50, DATE_ADD(NOW(), INTERVAL 60 DAY))
        `);
        
        console.log('✅ Vouchers reset successfully!');
        
        // Kiểm tra lại
        await checkVouchers();
        
    } catch (error) {
        console.error('❌ Error resetting vouchers:', error);
    }
}

// Chạy script
const action = process.argv[2];

if (action === 'reset') {
    resetVouchers();
} else {
    checkVouchers();
}