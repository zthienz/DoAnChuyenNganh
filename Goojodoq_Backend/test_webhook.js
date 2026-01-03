import fetch from 'node-fetch';

// Test webhook thủ công cho đơn hàng mới
async function testWebhookForNewOrder() {
  try {
    console.log('🧪 Testing webhook for new order...');
    
    // Giả lập webhook data cho đơn hàng mới DH1766758084510
    const webhookData = {
      orderCode: 5808453068, // Order code từ database
      code: "00",
      desc: "Thành công",
      success: true,
      data: {
        orderCode: 5808453068,
        amount: 5000,
        description: "DH68",
        accountNumber: "12345678",
        reference: "FT22348404445"
      }
    };

    console.log('📤 Sending webhook data for new order:', webhookData);

    const response = await fetch('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.text();
    console.log('📥 Webhook response status:', response.status);
    console.log('📥 Webhook response:', result);

    if (response.ok) {
      console.log('✅ Webhook test successful for new order!');
    } else {
      console.log('❌ Webhook test failed for new order!');
    }

  } catch (error) {
    console.error('❌ Webhook test error:', error);
  }
}

testWebhookForNewOrder();