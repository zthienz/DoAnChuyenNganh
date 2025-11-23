// =============================================
// PROFILE PAGE JAVASCRIPT
// =============================================

let profileData = null;

// Load profile when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để xem thông tin cá nhân!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    loadProfile();
});

// Load profile data
async function loadProfile() {
    try {
        console.log('👤 Loading profile for user:', currentUser.id_nguoidung);

        const response = await fetch(`${API_BASE_URL}/profile/${currentUser.id_nguoidung}`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        profileData = await response.json();
        console.log('📋 Profile data:', profileData);

        displayProfile();

    } catch (error) {
        console.error('❌ Error loading profile:', error);
        showNotification('Không thể tải thông tin cá nhân. Vui lòng thử lại!', 'error');
    }
}

// Display profile data
function displayProfile() {
    const user = profileData.user;
    const address = profileData.address;

    // Update profile header
    const firstLetter = user.hoten ? user.hoten.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    document.getElementById('profileAvatar').textContent = firstLetter;
    document.getElementById('profileName').textContent = user.hoten || 'Chưa cập nhật';
    document.getElementById('profileEmail').textContent = user.email;

    // Fill personal info form
    document.getElementById('hoten').value = user.hoten || '';
    document.getElementById('email').value = user.email;
    document.getElementById('sdt').value = user.sdt || '';
    
    if (user.ngay_tao) {
        const date = new Date(user.ngay_tao);
        document.getElementById('ngay_tao').value = date.toLocaleDateString('vi-VN');
    }

    // Fill address form
    if (address) {
        document.getElementById('ten_nguoinhan').value = address.ten_nguoinhan || '';
        document.getElementById('sdt_nguoinhan').value = address.sdt || '';
        document.getElementById('thanhpho').value = address.thanhpho || '';
        document.getElementById('quanhuyen').value = address.quanhuyen || '';
        document.getElementById('diachi_chitiet').value = address.diachi_chitiet || '';
        document.getElementById('ma_buudien').value = address.ma_buudien || '';
    }

    // Check if address is complete
    checkAddressComplete();
}

// Check if address is complete
function checkAddressComplete() {
    const address = profileData.address;
    const addressStatus = document.getElementById('addressStatus');
    const addressAlert = document.getElementById('addressAlert');

    const isComplete = address && 
                      address.ten_nguoinhan && 
                      address.sdt && 
                      address.thanhpho && 
                      address.quanhuyen && 
                      address.diachi_chitiet;

    if (isComplete) {
        addressStatus.className = 'address-status address-complete';
        addressStatus.innerHTML = '<i class="fas fa-check-circle me-1"></i>Thông tin đã đầy đủ';
        addressAlert.style.display = 'none';
    } else {
        addressStatus.className = 'address-status address-incomplete';
        addressStatus.innerHTML = '<i class="fas fa-exclamation-circle me-1"></i>Chưa hoàn thiện thông tin';
        addressAlert.style.display = 'block';
    }
}

// Handle personal info form submission
document.getElementById('personalInfoForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const hoten = document.getElementById('hoten').value.trim();
        const sdt = document.getElementById('sdt').value.trim();

        if (!hoten) {
            showNotification('Vui lòng nhập họ tên!', 'warning');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/profile/${currentUser.id_nguoidung}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hoten, sdt })
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const result = await response.json();
        
        // Update current user in localStorage
        currentUser.hoten = hoten;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Reload profile
        await loadProfile();
        
        showNotification('Đã cập nhật thông tin cá nhân!', 'success');

    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Không thể cập nhật thông tin. Vui lòng thử lại!', 'error');
    }
});

// Handle address form submission
document.getElementById('addressForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const ten_nguoinhan = document.getElementById('ten_nguoinhan').value.trim();
        const sdt = document.getElementById('sdt_nguoinhan').value.trim();
        const thanhpho = document.getElementById('thanhpho').value.trim();
        const quanhuyen = document.getElementById('quanhuyen').value.trim();
        const diachi_chitiet = document.getElementById('diachi_chitiet').value.trim();
        const ma_buudien = document.getElementById('ma_buudien').value.trim();

        // Validate required fields
        if (!ten_nguoinhan || !sdt || !thanhpho || !quanhuyen || !diachi_chitiet) {
            showNotification('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
            return;
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(sdt)) {
            showNotification('Số điện thoại không hợp lệ!', 'warning');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/profile/${currentUser.id_nguoidung}/address`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ten_nguoinhan,
                sdt,
                thanhpho,
                quanhuyen,
                diachi_chitiet,
                ma_buudien
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update address');
        }

        const result = await response.json();
        
        // Reload profile
        await loadProfile();
        
        showNotification('Đã cập nhật địa chỉ nhận hàng!', 'success');

    } catch (error) {
        console.error('Error updating address:', error);
        showNotification('Không thể cập nhật địa chỉ. Vui lòng thử lại!', 'error');
    }
});

// Check if user has complete address (for checkout validation)
async function checkUserAddress(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}/check-address`);
        if (!response.ok) {
            throw new Error('Failed to check address');
        }

        const result = await response.json();
        return result.hasAddress;

    } catch (error) {
        console.error('Error checking address:', error);
        return false;
    }
}
