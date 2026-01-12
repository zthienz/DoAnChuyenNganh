// =============================================
// PRODUCT SECTION MANAGER
// Quản lý sản phẩm theo từng mục hiển thị
// =============================================

class ProductSectionManager {
    constructor(sectionCode, sectionName) {
        this.sectionCode = sectionCode; // 'sale', 'featured', 'all'
        this.sectionName = sectionName;
        this.products = [];
        this.availableProducts = [];
        this.modal = null;
    }

    // Mở modal quản lý
    async openManager() {
        await this.loadProducts();
        this.createModal();
        this.showModal();
    }

    // Load sản phẩm trong section
    async loadProducts() {
        try {
            const url = `${window.API_BASE_URL}/products/sections/${this.sectionCode}/all`;
            console.log('Loading products from:', url);
            
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                this.products = data.products;
                console.log(`✅ Loaded ${this.products.length} products for section ${this.sectionCode}`);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification(`Không thể tải danh sách sản phẩm: ${error.message}`, 'error');
            this.products = []; // Set empty array to prevent further errors
        }
    }

    // Load sản phẩm có thể thêm
    async loadAvailableProducts() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/products/sections/${this.sectionCode}/available`);
            const data = await response.json();
            
            if (data.success) {
                this.availableProducts = data.products;
                return this.availableProducts;
            }
        } catch (error) {
            console.error('Error loading available products:', error);
            return [];
        }
    }

    // Tạo modal
    createModal() {
        const modalHTML = `
            <div class="modal fade" id="sectionManagerModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-edit me-2"></i>Quản lý: ${this.sectionName}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Toolbar -->
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <button class="btn btn-success btn-sm" onclick="sectionManager.showAddProductModal()">
                                        <i class="fas fa-plus me-1"></i>Thêm sản phẩm
                                    </button>
                                    <button class="btn btn-info btn-sm ms-2" onclick="sectionManager.loadProducts(); sectionManager.renderProducts()">
                                        <i class="fas fa-sync me-1"></i>Làm mới
                                    </button>
                                </div>
                                <div class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Tổng: <strong>${this.products.length}</strong> sản phẩm
                                </div>
                            </div>

                            <!-- Products Table -->
                            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th width="5%">
                                                <i class="fas fa-arrows-alt" title="Kéo để sắp xếp"></i>
                                            </th>
                                            <th width="8%">Ảnh</th>
                                            <th width="25%">Tên sản phẩm</th>
                                            <th width="15%">Giá hiển thị</th>
                                            <th width="10%">Tồn kho</th>
                                            <th width="10%">Trạng thái</th>
                                            <th width="27%">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody id="sectionProductsTable">
                                        <!-- Products will be rendered here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('sectionManagerModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = new bootstrap.Modal(document.getElementById('sectionManagerModal'));
    }

    // Hiển thị modal
    showModal() {
        this.renderProducts();
        this.modal.show();
    }

    // Render danh sách sản phẩm
    renderProducts() {
        const tbody = document.getElementById('sectionProductsTable');
        
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-box-open fa-3x mb-2"></i>
                        <p>Chưa có sản phẩm nào trong mục này</p>
                        <button class="btn btn-primary btn-sm" onclick="sectionManager.showAddProductModal()">
                            <i class="fas fa-plus me-1"></i>Thêm sản phẩm đầu tiên
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.products.map((product, index) => {
            const imageUrl = product.image ? `http://localhost:3000${product.image}` : 'images/products/default.jpg';
            const isCustomized = product.ten_sanpham_custom || product.gia_custom || product.mota_ngan_custom;
            
            return `
                <tr data-product-id="${product.product_id}" class="${!product.is_active_section ? 'table-secondary' : ''}">
                    <td class="text-center">
                        <i class="fas fa-grip-vertical text-muted" style="cursor: move;"></i>
                        <div class="small text-muted">#${index + 1}</div>
                    </td>
                    <td>
                        <img src="${imageUrl}" alt="${product.product_name}" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"
                             onerror="this.src='images/products/default.jpg'">
                    </td>
                    <td>
                        <strong>${product.product_name}</strong>
                        ${isCustomized ? '<span class="badge bg-warning text-dark ms-1" title="Đã tùy chỉnh"><i class="fas fa-edit"></i></span>' : ''}
                        <br>
                        <small class="text-muted">SKU: ${product.sku || 'N/A'}</small>
                        ${product.original_name && product.original_name !== product.product_name ? 
                            `<br><small class="text-info">Gốc: ${product.original_name}</small>` : ''}
                    </td>
                    <td>
                        <strong class="text-success">${formatPrice(product.price)}</strong>
                        ${product.sale_price && product.sale_price > product.price ? 
                            `<br><small class="text-muted"><del>${formatPrice(product.sale_price)}</del></small>` : ''}
                    </td>
                    <td>
                        <span class="badge ${product.stock_quantity > 0 ? 'bg-success' : 'bg-danger'}">
                            ${product.stock_quantity}
                        </span>
                    </td>
                    <td>
                        ${product.is_active_section ? 
                            '<span class="badge bg-success">Hiển thị</span>' : 
                            '<span class="badge bg-secondary">Đã ẩn</span>'}
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            ${product.is_active_section ?
                                `<button class="btn btn-warning" onclick="sectionManager.toggleProduct(${product.product_id}, false)" title="Ẩn">
                                    <i class="fas fa-eye-slash"></i>
                                </button>` :
                                `<button class="btn btn-success" onclick="sectionManager.toggleProduct(${product.product_id}, true)" title="Hiện">
                                    <i class="fas fa-eye"></i>
                                </button>`
                            }
                            <button class="btn btn-info" onclick="sectionManager.showEditModal(${product.product_id})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger" onclick="sectionManager.removeProduct(${product.product_id})" title="Xóa khỏi mục">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Enable drag and drop for reordering
        this.enableDragAndDrop();
    }

    // Enable drag and drop
    enableDragAndDrop() {
        const tbody = document.getElementById('sectionProductsTable');
        let draggedRow = null;

        tbody.querySelectorAll('tr').forEach(row => {
            row.draggable = true;

            row.addEventListener('dragstart', (e) => {
                draggedRow = row;
                row.style.opacity = '0.5';
            });

            row.addEventListener('dragend', (e) => {
                row.style.opacity = '1';
            });

            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(tbody, e.clientY);
                if (afterElement == null) {
                    tbody.appendChild(draggedRow);
                } else {
                    tbody.insertBefore(draggedRow, afterElement);
                }
            });
        });

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('tr:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        // Save order button
        const saveOrderBtn = document.createElement('button');
        saveOrderBtn.className = 'btn btn-primary btn-sm mt-2';
        saveOrderBtn.innerHTML = '<i class="fas fa-save me-1"></i>Lưu thứ tự';
        saveOrderBtn.onclick = () => this.saveOrder();
        
        const tableContainer = tbody.closest('.table-responsive');
        if (!tableContainer.querySelector('.save-order-btn')) {
            saveOrderBtn.classList.add('save-order-btn');
            tableContainer.after(saveOrderBtn);
        }
    }

    // Save order
    async saveOrder() {
        const rows = document.querySelectorAll('#sectionProductsTable tr[data-product-id]');
        const productOrders = Array.from(rows).map((row, index) => ({
            productId: parseInt(row.dataset.productId),
            order: index
        }));

        try {
            const response = await fetch(`${window.API_BASE_URL}/products/sections/${this.sectionCode}/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productOrders })
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Đã lưu thứ tự sản phẩm', 'success');
                await this.loadProducts();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            showNotification('Không thể lưu thứ tự', 'error');
        }
    }

    // Show add product modal
    async showAddProductModal() {
        const products = await this.loadAvailableProducts();
        
        if (products.length === 0) {
            showNotification('Không còn sản phẩm nào để thêm', 'info');
            return;
        }

        const modalHTML = `
            <div class="modal fade" id="addProductModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Thêm sản phẩm vào ${this.sectionName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="searchAddProduct" placeholder="Tìm kiếm sản phẩm...">
                            </div>
                            <div class="row" id="availableProductsList" style="max-height: 400px; overflow-y: auto;">
                                ${products.map(p => {
                                    const img = p.image ? `http://localhost:3000${p.image}` : 'images/products/default.jpg';
                                    return `
                                        <div class="col-md-6 mb-3 product-item-add" data-name="${p.product_name.toLowerCase()}">
                                            <div class="card h-100">
                                                <div class="row g-0">
                                                    <div class="col-4">
                                                        <img src="${img}" class="img-fluid rounded-start" alt="${p.product_name}"
                                                             style="height: 100px; object-fit: cover;" onerror="this.src='images/products/default.jpg'">
                                                    </div>
                                                    <div class="col-8">
                                                        <div class="card-body p-2">
                                                            <h6 class="card-title small">${p.product_name}</h6>
                                                            <p class="card-text small text-success mb-1">${formatPrice(p.price)}</p>
                                                            <button class="btn btn-primary btn-sm" onclick="sectionManager.addProduct(${p.product_id})">
                                                                <i class="fas fa-plus me-1"></i>Thêm
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const addModal = new bootstrap.Modal(document.getElementById('addProductModal'));
        addModal.show();

        // Search functionality
        document.getElementById('searchAddProduct').addEventListener('input', (e) => {
            const search = e.target.value.toLowerCase();
            document.querySelectorAll('.product-item-add').forEach(item => {
                item.style.display = item.dataset.name.includes(search) ? '' : 'none';
            });
        });

        // Clean up on close
        document.getElementById('addProductModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Add product to section
    async addProduct(productId) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/products/sections/${this.sectionCode}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Đã thêm sản phẩm', 'success');
                
                // Close add modal
                const addModal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (addModal) addModal.hide();
                
                // Reload products
                await this.loadProducts();
                this.renderProducts();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            showNotification('Không thể thêm sản phẩm: ' + error.message, 'error');
        }
    }

    // Remove product from section
    async removeProduct(productId) {
        if (!confirm('Xóa sản phẩm khỏi mục này?\n\nSản phẩm sẽ không hiển thị ở mục này nữa, nhưng vẫn tồn tại trong hệ thống.')) {
            return;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/products/sections/${this.sectionCode}/products/${productId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Đã xóa sản phẩm khỏi mục', 'success');
                await this.loadProducts();
                this.renderProducts();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error removing product:', error);
            showNotification('Không thể xóa sản phẩm', 'error');
        }
    }

    // Toggle product visibility in section
    async toggleProduct(productId, isActive) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/products/sections/${this.sectionCode}/products/${productId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive })
            });

            const data = await response.json();
            if (data.success) {
                showNotification(data.message, 'success');
                await this.loadProducts();
                this.renderProducts();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error toggling product:', error);
            showNotification('Không thể cập nhật trạng thái', 'error');
        }
    }

    // Show edit modal
    showEditModal(productId) {
        const product = this.products.find(p => p.product_id === productId);
        if (!product) return;

        const modalHTML = `
            <div class="modal fade" id="editProductSectionModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Chỉnh sửa thông tin hiển thị</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted small">
                                <i class="fas fa-info-circle me-1"></i>
                                Thông tin tùy chỉnh chỉ áp dụng cho mục "${this.sectionName}". Các mục khác vẫn hiển thị thông tin gốc.
                            </p>
                            
                            <div class="mb-3">
                                <label class="form-label">Tên sản phẩm</label>
                                <input type="text" class="form-control" id="edit_custom_name" 
                                       value="${product.product_name}" placeholder="${product.original_name || product.product_name}">
                                <small class="text-muted">Để trống để dùng tên gốc</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Giá hiển thị (VNĐ)</label>
                                <input type="number" class="form-control" id="edit_custom_price" 
                                       value="${product.price}" placeholder="${product.original_price || product.price}">
                                <small class="text-muted">Để trống để dùng giá gốc</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Giá gốc (VNĐ)</label>
                                <input type="number" class="form-control" id="edit_custom_sale_price" 
                                       value="${product.sale_price || ''}" placeholder="${product.original_sale_price || ''}">
                                <small class="text-muted">Để trống nếu không có giá gốc</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Mô tả ngắn</label>
                                <textarea class="form-control" id="edit_custom_description" rows="3" 
                                          placeholder="${product.original_description || ''}">${product.short_description || ''}</textarea>
                                <small class="text-muted">Để trống để dùng mô tả gốc</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                            <button type="button" class="btn btn-primary" onclick="sectionManager.saveEdit(${productId})">
                                <i class="fas fa-save me-1"></i>Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const editModal = new bootstrap.Modal(document.getElementById('editProductSectionModal'));
        editModal.show();

        document.getElementById('editProductSectionModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Save edit
    async saveEdit(productId) {
        const customName = document.getElementById('edit_custom_name').value.trim() || null;
        const customPrice = document.getElementById('edit_custom_price').value || null;
        const customSalePrice = document.getElementById('edit_custom_sale_price').value || null;
        const customDescription = document.getElementById('edit_custom_description').value.trim() || null;

        try {
            const response = await fetch(`${window.API_BASE_URL}/products/sections/${this.sectionCode}/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customName,
                    customPrice,
                    customSalePrice,
                    customDescription
                })
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Đã cập nhật thông tin', 'success');
                
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductSectionModal'));
                if (editModal) editModal.hide();
                
                await this.loadProducts();
                this.renderProducts();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving edit:', error);
            showNotification('Không thể lưu thay đổi', 'error');
        }
    }
}

// Global instance
let sectionManager = null;

// Function to open section manager
function openSectionManager(sectionCode, sectionName) {
    // Nếu là featured section, sử dụng manager đặc biệt
    if (sectionCode === 'featured') {
        openFeaturedProductsManager();
    } else {
        sectionManager = new ProductSectionManager(sectionCode, sectionName);
        sectionManager.openManager();
    }
}

// Featured Products Manager - Chỉ xem và ẩn/hiện
async function openFeaturedProductsManager() {
    try {
        // Load top 12 sản phẩm bán chạy
        const response = await fetch(`${window.API_BASE_URL}/products/stats/featured`);
        const data = await response.json();
        
        if (!data.success || !data.products) {
            throw new Error('Không thể tải danh sách sản phẩm');
        }
        
        const products = data.products;
        
        // Tạo modal
        const modalHTML = `
            <div class="modal fade" id="featuredManagerModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-star me-2"></i>Quản lý: Sản phẩm nổi bật
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Lưu ý:</strong> Sản phẩm nổi bật được tự động chọn dựa trên lượt bán. 
                                Bạn chỉ có thể ẩn/hiện sản phẩm. Khi ẩn 1 sản phẩm, sản phẩm bán chạy tiếp theo sẽ tự động thay thế.
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="text-muted">
                                    <i class="fas fa-chart-line me-1"></i>
                                    Hiển thị top <strong>12</strong> sản phẩm bán chạy nhất
                                </div>
                                <button class="btn btn-info btn-sm" onclick="location.reload()">
                                    <i class="fas fa-sync me-1"></i>Làm mới
                                </button>
                            </div>

                            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th width="5%">Hạng</th>
                                            <th width="8%">Ảnh</th>
                                            <th width="30%">Tên sản phẩm</th>
                                            <th width="12%">Giá</th>
                                            <th width="10%">Đã bán</th>
                                            <th width="10%">Tồn kho</th>
                                            <th width="10%">Trạng thái</th>
                                            <th width="15%">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${products.map((product, index) => {
                                            const imageUrl = product.image ? 
                                                (product.image.startsWith('/images') ? `http://localhost:3000${product.image}` : product.image) :
                                                'images/products/default.jpg';
                                            
                                            const rankBadge = index < 3 ? 
                                                `<span class="badge fs-6 ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-danger'}">
                                                    ${index + 1}
                                                </span>` :
                                                `<span class="badge fs-6 bg-light text-dark">${index + 1}</span>`;
                                            
                                            return `
                                                <tr class="${!product.is_active ? 'table-secondary' : ''}">
                                                    <td class="text-center">${rankBadge}</td>
                                                    <td>
                                                        <img src="${imageUrl}" alt="${product.product_name}" 
                                                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"
                                                             onerror="this.src='images/products/default.jpg'">
                                                    </td>
                                                    <td>
                                                        <strong>${product.product_name}</strong>
                                                        <br>
                                                        <small class="text-muted">SKU: ${product.sku || 'N/A'}</small>
                                                    </td>
                                                    <td>
                                                        <strong class="text-success">${formatPrice(product.price)}</strong>
                                                        ${product.sale_price && product.sale_price > product.price ? 
                                                            `<br><small class="text-muted"><del>${formatPrice(product.sale_price)}</del></small>` : ''}
                                                    </td>
                                                    <td class="text-center">
                                                        <span class="badge bg-success fs-6">${product.total_sold || 0}</span>
                                                    </td>
                                                    <td class="text-center">
                                                        <span class="badge ${product.stock_quantity > 0 ? 'bg-success' : 'bg-danger'}">
                                                            ${product.stock_quantity}
                                                        </span>
                                                    </td>
                                                    <td class="text-center">
                                                        ${product.is_active ? 
                                                            '<span class="badge bg-success">Hiển thị</span>' : 
                                                            '<span class="badge bg-secondary">Đã ẩn</span>'}
                                                    </td>
                                                    <td class="text-center">
                                                        ${product.is_active ?
                                                            `<button class="btn btn-warning btn-sm" onclick="toggleFeaturedProduct(${product.product_id}, false)" title="Ẩn sản phẩm">
                                                                <i class="fas fa-eye-slash me-1"></i>Ẩn
                                                            </button>` :
                                                            `<button class="btn btn-success btn-sm" onclick="toggleFeaturedProduct(${product.product_id}, true)" title="Hiện sản phẩm">
                                                                <i class="fas fa-eye me-1"></i>Hiện
                                                            </button>`
                                                        }
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('featuredManagerModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('featuredManagerModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error opening featured manager:', error);
        showNotification('Không thể mở quản lý sản phẩm nổi bật: ' + error.message, 'error');
    }
}

// Toggle featured product visibility
async function toggleFeaturedProduct(productId, isActive) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/products/${productId}/visibility`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: isActive })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Đóng modal và reload trang để cập nhật
            const modal = bootstrap.Modal.getInstance(document.getElementById('featuredManagerModal'));
            if (modal) modal.hide();
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            throw new Error(data.error || 'Không thể cập nhật trạng thái');
        }
        
    } catch (error) {
        console.error('Error toggling product:', error);
        showNotification('Không thể cập nhật trạng thái: ' + error.message, 'error');
    }
}
