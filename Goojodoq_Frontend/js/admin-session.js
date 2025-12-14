// =============================================
// ADMIN SESSION MANAGEMENT
// =============================================

// Session timeout configuration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout
let sessionTimer = null;
let warningTimer = null;
let lastActivity = Date.now();

// =============================================
// INITIALIZE SESSION MANAGEMENT
// =============================================
function initAdminSession() {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, updateLastActivity, true);
    });
    
    // Start session timer
    resetSessionTimer();
    
    console.log('🔐 Admin session initialized - timeout:', SESSION_TIMEOUT / 60000, 'minutes');
}

function updateLastActivity() {
    lastActivity = Date.now();
    resetSessionTimer();
}

function resetSessionTimer() {
    // Clear existing timers
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    
    // Set warning timer (5 minutes before timeout)
    warningTimer = setTimeout(showSessionWarning, SESSION_TIMEOUT - WARNING_TIME);
    
    // Set logout timer
    sessionTimer = setTimeout(autoLogoutAdmin, SESSION_TIMEOUT);
}

function showSessionWarning() {
    const remainingTime = Math.ceil(WARNING_TIME / 60000); // minutes
    
    // Create a more professional warning modal
    const warningModal = document.createElement('div');
    warningModal.className = 'modal fade';
    warningModal.id = 'sessionWarningModal';
    warningModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Cảnh báo phiên làm việc
                    </h5>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-3">
                        <i class="fas fa-clock text-warning" style="font-size: 3rem;"></i>
                    </div>
                    <h6>Phiên làm việc sẽ hết hạn trong ${remainingTime} phút</h6>
                    <p class="text-muted">Bạn có muốn tiếp tục làm việc không?</p>
                    <div class="countdown-timer">
                        <span id="countdownDisplay" class="badge bg-warning fs-6">05:00</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="autoLogoutAdmin()">Đăng xuất</button>
                    <button type="button" class="btn btn-primary" onclick="extendSession()">Tiếp tục làm việc</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningModal);
    
    // Show modal
    const modal = new bootstrap.Modal(warningModal, {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
    
    // Start countdown
    startCountdown();
}

function startCountdown() {
    let timeLeft = WARNING_TIME / 1000; // Convert to seconds
    const countdownDisplay = document.getElementById('countdownDisplay');
    
    const countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (countdownDisplay) {
            countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            autoLogoutAdmin();
        }
    }, 1000);
    
    // Store interval ID to clear it if user extends session
    window.sessionCountdownInterval = countdownInterval;
}

function extendSession() {
    // Clear countdown
    if (window.sessionCountdownInterval) {
        clearInterval(window.sessionCountdownInterval);
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('sessionWarningModal'));
    if (modal) {
        modal.hide();
    }
    
    // Remove modal from DOM
    const modalElement = document.getElementById('sessionWarningModal');
    if (modalElement) {
        modalElement.remove();
    }
    
    // Reset session
    updateLastActivity();
    
    // Show success notification
    showNotification('Phiên làm việc đã được gia hạn', 'success');
}

function autoLogoutAdmin() {
    console.log('🔐 Auto logout admin due to inactivity');
    
    // Clear timers
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    if (window.sessionCountdownInterval) {
        clearInterval(window.sessionCountdownInterval);
    }
    
    // Clear session data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Show logout notification
    showNotification('Phiên làm việc đã hết hạn. Đang chuyển về trang đăng nhập...', 'warning');
    
    // Redirect to admin login after a short delay
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 2000);
}

function checkAdminSessionValidity() {
    const timeSinceLastActivity = Date.now() - lastActivity;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
        autoLogoutAdmin();
        return false;
    }
    
    return true;
}

// =============================================
// ADMIN LOGOUT FUNCTION
// =============================================
function logoutAdmin() {
    // Create confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'logoutConfirmModal';
    confirmModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-sign-out-alt me-2"></i>
                        Xác nhận đăng xuất
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-3">
                        <i class="fas fa-question-circle text-warning" style="font-size: 3rem;"></i>
                    </div>
                    <h6>Bạn có chắc chắn muốn đăng xuất?</h6>
                    <p class="text-muted">Tất cả dữ liệu chưa lưu sẽ bị mất.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="button" class="btn btn-danger" onclick="confirmLogout()">Đăng xuất</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Show modal
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
    
    // Remove modal from DOM when hidden
    confirmModal.addEventListener('hidden.bs.modal', () => {
        confirmModal.remove();
    });
}

function confirmLogout() {
    // Clear timers
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    if (window.sessionCountdownInterval) {
        clearInterval(window.sessionCountdownInterval);
    }
    
    // Clear session data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Close any open modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    });
    
    // Show logout notification
    showNotification('Đã đăng xuất thành công', 'success');
    
    // Redirect to admin login
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 1000);
}

// =============================================
// NOTIFICATION HELPER
// =============================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// =============================================
// AUTO-INITIALIZE ON DOM LOAD
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on an admin page
    if (document.querySelector('.admin-container') || document.querySelector('.admin-sidebar')) {
        initAdminSession();
    }
});