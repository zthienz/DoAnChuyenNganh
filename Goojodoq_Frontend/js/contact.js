// =============================================
// CONTACT PAGE JAVASCRIPT
// =============================================

// =============================================
// SELECT CONTACT TYPE
// =============================================
function selectContactType(type) {
    // Set contact type
    document.getElementById('contactType').value = type;
    
    // Scroll to form
    document.getElementById('contactFormSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Update form title based on type
    const formTitle = document.querySelector('.form-title');
    switch(type) {
        case 'individual':
            formTitle.textContent = 'Liên hệ - Người dùng cá nhân';
            break;
        case 'business':
            formTitle.textContent = 'Liên hệ - Khách hàng doanh nghiệp';
            break;
        case 'creator':
            formTitle.textContent = 'Liên hệ - Người sáng tạo nội dung';
            break;
    }
    
    // Highlight selected option
    document.querySelectorAll('.contact-option-card').forEach(card => {
        card.style.border = '2px solid transparent';
    });
    
    event.target.closest('.contact-option-card').style.border = '2px solid #007bff';
}

// =============================================
// SUBMIT CONTACT FORM
// =============================================
function submitContactForm(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        contactType: document.getElementById('contactType').value,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // Validate form
    if (!validateContactForm(formData)) {
        return;
    }
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
    submitBtn.disabled = true;
    
    // Simulate API call (replace with actual API call later)
    setTimeout(() => {
        // Show success message
        showSuccessMessage();
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    }, 2000);
}

// =============================================
// VALIDATE FORM
// =============================================
function validateContactForm(data) {
    // Validate name
    if (data.fullName.trim().length < 2) {
        showNotification('Vui lòng nhập họ tên hợp lệ', 'error');
        return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Vui lòng nhập email hợp lệ', 'error');
        return false;
    }
    
    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showNotification('Vui lòng nhập số điện thoại hợp lệ (10-11 số)', 'error');
        return false;
    }
    
    // Validate message
    if (data.message.trim().length < 10) {
        showNotification('Tin nhắn phải có ít nhất 10 ký tự', 'error');
        return false;
    }
    
    return true;
}

// =============================================
// SHOW SUCCESS MESSAGE
// =============================================
function showSuccessMessage() {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-check-circle me-3" style="font-size: 2rem;"></i>
            <div>
                <h4 class="mb-1">Gửi tin nhắn thành công!</h4>
                <p class="mb-0">Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
            </div>
        </div>
    `;
    
    // Insert before form
    const formCard = document.querySelector('.contact-form-card');
    formCard.insertBefore(successDiv, formCard.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// =============================================
// PHONE NUMBER FORMATTING
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove non-numeric characters
            let value = e.target.value.replace(/\D/g, '');
            
            // Limit to 11 digits
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            e.target.value = value;
        });
    }
});

// =============================================
// AUTO-SCROLL TO FORM ON PAGE LOAD WITH HASH
// =============================================
window.addEventListener('load', function() {
    if (window.location.hash === '#contact-form') {
        document.getElementById('contactFormSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
});