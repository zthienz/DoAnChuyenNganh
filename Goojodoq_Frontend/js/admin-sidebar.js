// =============================================
// ADMIN SIDEBAR LOADER
// =============================================

// Load admin sidebar into page
async function loadAdminSidebar() {
    try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`components/admin-sidebar.html?v=${timestamp}`);
        const html = await response.text();
        
        // Insert sidebar at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', html);
        
        // Highlight current page in sidebar
        highlightCurrentPage();
    } catch (error) {
        console.error('Error loading admin sidebar:', error);
    }
}

// Highlight current page in sidebar
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.admin-nav .nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        }
    });
}

// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is an admin page
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin-') && !currentPage.includes('admin-login')) {
        loadAdminSidebar();
    }
});
