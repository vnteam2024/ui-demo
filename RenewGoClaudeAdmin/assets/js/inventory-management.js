// Mock Data
const MOCK_DATA = {
    inventory: [
        {
            id: 1,
            name: "5W-30 Synthetic Oil",
            category: "oil",
            stock: 15,
            reorderPoint: 20,
            monthlyUsage: 45,
            price: 24.99,
            location: "A1-B2"
        },
        {
            id: 2,
            name: "Oil Filter Type A",
            category: "filters",
            stock: 8,
            reorderPoint: 15,
            monthlyUsage: 35,
            price: 8.99,
            location: "B2-C3"
        },
        {
            id: 3,
            name: "Brake Pads - Front",
            category: "brakes",
            stock: 4,
            reorderPoint: 10,
            monthlyUsage: 12,
            price: 45.99,
            location: "C3-D4"
        },
        {
            id: 4,
            name: "All-Season Tire 215/55R17",
            category: "tires",
            stock: 12,
            reorderPoint: 8,
            monthlyUsage: 16,
            price: 89.99,
            location: "D4-E5"
        }
    ],
    usageHistory: [
        {
            id: 1,
            itemId: 1,
            quantity: 5,
            serviceId: "SRV001",
            date: "2024-11-29",
            technician: "John Smith",
            serviceName: "Oil Change"
        },
        {
            id: 2,
            itemId: 3,
            quantity: 2,
            serviceId: "SRV002",
            date: "2024-11-29",
            technician: "Sarah Johnson",
            serviceName: "Brake Service"
        }
    ]
};

// Inventory Management
const InventoryManager = {
    init() {
        this.initializeTable();
        this.initializeFilters();
        this.updateLowStockAlerts();
        this.updateUsageHistory();
        this.bindEvents();
    },

    bindEvents() {
        $('#selectAll').change(this.handleSelectAll);
        $('#searchInput').on('keyup', this.filterItems.bind(this));
        $('#categoryFilter, #stockFilter, #turnoverFilter').change(this.filterItems.bind(this));
        $('#saveItem').click(this.saveItem.bind(this));
        $('#reorderSelectedBtn').click(this.reorderSelected.bind(this));
    },

    initializeTable() {
        const tbody = $('#inventoryTable tbody');
        tbody.empty();

        MOCK_DATA.inventory.forEach(item => {
            tbody.append(this.createTableRow(item));
        });
    },

    initializeFilters() {
        // Populate category filter
        const categories = [...new Set(MOCK_DATA.inventory.map(item => item.category))];
        const categorySelect = $('#categoryFilter');
        categories.forEach(category => {
            categorySelect.append(`
                <option value="${category}">
                    ${this.formatCategory(category)}
                </option>
            `);
        });

        // Initialize filters with default values
        $('#stockFilter').val('');
        $('#turnoverFilter').val('');
        $('#searchInput').val('');

        // Add event listeners for real-time filtering
        $('#categoryFilter, #stockFilter, #turnoverFilter').on('change', this.filterItems.bind(this));
        $('#searchInput').on('keyup', this.filterItems.bind(this));
    },

    createTableRow(item) {
        const stockStatus = this.getStockStatus(item.stock, item.reorderPoint);
        return `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input item-checkbox" 
                           data-item-id="${item.id}">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="stock-indicator stock-${stockStatus}"></span>
                        ${item.name}
                    </div>
                </td>
                <td>${this.formatCategory(item.category)}</td>
                <td>${item.stock} units</td>
                <td>${item.reorderPoint} units</td>
                <td>${item.monthlyUsage} units</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" 
                            onclick="InventoryManager.editItem(${item.id})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-success" 
                            onclick="InventoryManager.reorderItem(${item.id})">
                        Reorder
                    </button>
                </td>
            </tr>
        `;
    },

    getStockStatus(current, reorderPoint) {
        if (current === 0) return 'critical';
        if (current <= reorderPoint) return 'low';
        return 'normal';
    },

    formatCategory(category) {
        const categories = {
            'oil': 'Oil & Fluids',
            'brakes': 'Brake Parts',
            'filters': 'Filters',
            'tires': 'Tires'
        };
        return categories[category] || category;
    },

    updateLowStockAlerts() {
        const container = $('#lowStockAlerts');
        container.empty();

        const lowStockItems = MOCK_DATA.inventory.filter(item =>
          item.stock <= item.reorderPoint
        );

        if (lowStockItems.length === 0) {
            container.append(`
                <div class="text-center text-muted">
                    No low stock alerts
                </div>
            `);
            return;
        }

        lowStockItems.forEach(item => {
            container.append(`
                <div class="alert-card ${item.stock === 0 ? 'critical' : ''}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">
                                Current Stock: ${item.stock} / Reorder Point: ${item.reorderPoint}
                            </small>
                        </div>
                        <button class="btn btn-sm btn-success" 
                                onclick="InventoryManager.reorderItem(${item.id})">
                            Reorder
                        </button>
                    </div>
                </div>
            `);
        });
    },

    updateUsageHistory() {
        const container = $('#partsUsageHistory');
        container.empty();

        MOCK_DATA.usageHistory.forEach(usage => {
            const item = MOCK_DATA.inventory.find(i => i.id === usage.itemId);
            if (!item) return;

            container.append(`
                <div class="usage-item">
                    <div class="d-flex justify-content-between">
                        <strong>${item.name}</strong>
                        <span class="text-muted">${usage.date}</span>
                    </div>
                    <div class="mt-1">
                        <small class="text-muted">
                            ${usage.quantity} units - ${usage.serviceName}
                            <br>
                            Technician: ${usage.technician}
                        </small>
                    </div>
                </div>
            `);
        });
    },

    editItem(id) {
        const item = MOCK_DATA.inventory.find(i => i.id === id);
        if (!item) return;

        $('#itemName').val(item.name);
        $('#itemCategory').val(item.category);
        $('#itemStock').val(item.stock);
        $('#itemReorderPoint').val(item.reorderPoint);
        $('#itemPrice').val(item.price);
        $('#itemLocation').val(item.location);

        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        modal.show();
    },

    saveItem() {
        const formData = {
            name: $('#itemName').val(),
            category: $('#itemCategory').val(),
            stock: parseInt($('#itemStock').val()),
            reorderPoint: parseInt($('#itemReorderPoint').val()),
            price: parseFloat($('#itemPrice').val()),
            location: $('#itemLocation').val()
        };

        console.log('Saving item:', formData);

        const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
        modal.hide();

        this.initializeTable();
        this.updateLowStockAlerts();
        NotificationManager.show('Item saved successfully', 'success');
    },

    reorderItem(id) {
        const item = MOCK_DATA.inventory.find(i => i.id === id);
        if (!item) return;

        // Simulate reorder
        item.stock += 20;

        this.initializeTable();
        this.updateLowStockAlerts();
        NotificationManager.show(`Reorder placed for ${item.name}`, 'success');
    },

    reorderSelected() {
        const selectedIds = $('.item-checkbox:checked').map(function() {
            return $(this).data('item-id');
        }).get();

        if (selectedIds.length === 0) {
            NotificationManager.show('Please select items to reorder', 'warning');
            return;
        }

        selectedIds.forEach(id => {
            const item = MOCK_DATA.inventory.find(i => i.id === id);
            if (item) {
                item.stock += 20;
            }
        });

        this.initializeTable();
        this.updateLowStockAlerts();
        NotificationManager.show(`Reorder placed for ${selectedIds.length} items`, 'success');
    },

    filterItems() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        const category = $('#categoryFilter').val();
        const stockLevel = $('#stockFilter').val();
        const turnover = $('#turnoverFilter').val();

        const filteredItems = MOCK_DATA.inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || item.category === category;
            const matchesStock = this.matchesStockFilter(item, stockLevel);
            const matchesTurnover = this.matchesTurnoverFilter(item, turnover);

            return matchesSearch && matchesCategory && matchesStock && matchesTurnover;
        });

        const tbody = $('#inventoryTable tbody');
        tbody.empty();
        filteredItems.forEach(item => {
            tbody.append(this.createTableRow(item));
        });
    },

    matchesStockFilter(item, filter) {
        switch (filter) {
            case 'low':
                return item.stock <= item.reorderPoint && item.stock > 0;
            case 'out':
                return item.stock === 0;
            case 'normal':
                return item.stock > item.reorderPoint;
            default:
                return true;
        }
    },

    matchesTurnoverFilter(item, filter) {
        switch (filter) {
            case 'high':
                return item.monthlyUsage > 20;
            case 'low':
                return item.monthlyUsage <= 20;
            default:
                return true;
        }
    },

    handleSelectAll() {
        const isChecked = $(this).is(':checked');
        $('.item-checkbox').prop('checked', isChecked);
    }
};

// Notification Manager
const NotificationManager = {
    show(message, type = 'info') {
        // Simple alert for demo purposes
        alert(`${type.toUpperCase()}: ${message}`);
    }
};

// Initialize everything when document is ready
$(document).ready(function() {
    InventoryManager.init();
});