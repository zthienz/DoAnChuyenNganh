import { PayOS } from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

console.log('🧪 Testing PayOS SDK...');

// Test PayOS configuration
console.log('PayOS credentials:');
console.log('CLIENT_ID:', process.env.PAYOS_CLIENT_ID ? 'Set' : 'Missing');
console.log('API_KEY:', process.env.PAYOS_API_KEY ? 'Set' : 'Missing');
console.log('CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? 'Set' : 'Missing');

try {
    const payOS = new PayOS(
        process.env.PAYOS_CLIENT_ID,
        process.env.PAYOS_API_KEY,
        process.env.PAYOS_CHECKSUM_KEY
    );
    
    console.log('\n✅ PayOS instance created successfully');
    console.log('PayOS methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(payOS)));
    
    // Test các method có sẵn
    console.log('\n🔄 Testing available methods...');
    
    // Thử method POST để tạo payment
    const orderCode = Date.now();
    const paymentData = {
        orderCode: orderCode,
        amount: 50000,
        description: "Test payment",
        returnUrl: "http://localhost:3000/payment-success.html",
        cancelUrl: "http://localhost:3000/payment-cancel.html",
        items: [
            {
                name: "Test item",
                quantity: 1,
                price: 50000
            }
        ]
    };
    
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));
    
    try {
        // Thử gọi API trực tiếp
        const result = await payOS.post('/v2/payment-requests', paymentData);
        console.log('✅ Payment created:', result);
    } catch (error) {
        console.log('❌ POST error:', error.message);
        
        // Thử method khác
        try {
            const result2 = await payOS.request('POST', '/v2/payment-requests', paymentData);
            console.log('✅ Payment created with request:', result2);
        } catch (error2) {
            console.log('❌ Request error:', error2.message);
        }
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}