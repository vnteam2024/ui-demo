// customer-management.js

const SAMPLE_CUSTOMERS = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    vehicles: [
      { id: 1, make: 'Toyota', model: 'Camry', year: 2020, vin: '1HGCM82633A123456' },
      { id: 2, make: 'Honda', model: 'CR-V', year: 2019, vin: '2HKRW2H54JH123456' }
    ],
    loyaltyPoints: 500,
    loyaltyActivity: [
      { description: 'Oil Change', points: 50, date: '2024-03-15' },
      { description: 'Tire Rotation', points: 30, date: '2024-02-20' }
    ],
    serviceHistory: [
      {
        date: '2024-03-15',
        description: 'Oil Change + Filter',
        vehicle: 'Toyota Camry',
        cost: 89.99,
        warranty: { active: true, expiry: '2024-09-15' },
        status: 'Completed'
      },
      {
        date: '2024-02-20',
        description: 'Tire Rotation',
        vehicle: 'Toyota Camry',
        cost: 49.99,
        warranty: { active: true, expiry: '2024-08-20' },
        status: 'Completed'
      }
    ]
  }
  // Add more sample customers here
];

$(document).ready(function() {
  // Initialize DataTable
  const table = $('#customerTable').DataTable({
    data: SAMPLE_CUSTOMERS,
    columns: [
      {
        data: null,
        render: (data) => `${data.firstName} ${data.lastName}`
      },
      {
        data: null,
        render: (data) => `${data.email}<br>${data.phone}`
      },
      {
        data: 'vehicles',
        render: (vehicles) => vehicles.map(v =>
          `${v.year} ${v.make} ${v.model}`).join('<br>')
      },
      {
        data: 'serviceHistory',
        render: (history) => history.length ?
          formatDate(history[0].date) : 'No service history'
      },
      { data: 'loyaltyPoints' },
      {
        data: null,
        render: (data) => generateActionButtons(data.id)
      }
    ]
  });

  // Event handlers and helper functions as in the original code
  // but using SAMPLE_CUSTOMERS instead of API calls

  function loadCustomerProfile(customerId) {
    const customer = SAMPLE_CUSTOMERS.find(c => c.id === customerId);
    if (customer) {
      updateProfileView(customer);
    }
  }

  // Add form submission handler
  $('#customerForm').on('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const newCustomer = {
      id: SAMPLE_CUSTOMERS.length + 1,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      // ... other fields
    };
    SAMPLE_CUSTOMERS.push(newCustomer);
    table.row.add(newCustomer).draw();
    $('#addCustomerModal').modal('hide');
  });

  initializeDataTable();
  setupEventListeners();
  loadInitialData();

  function initializeDataTable() {
    $('#customerTable').DataTable({
      columns: [
        { data: 'name' },
        { data: 'contact' },
        { data: 'vehicle' },
        { data: 'lastService' },
        { data: 'loyaltyPoints' },
        {
          data: null,
          render: function(data, type, row) {
            return `
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary view-profile" data-id="${row.id}">
                                    View Profile
                                </button>
                                <button class="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split" 
                                        data-bs-toggle="dropdown">
                                </button>
                                <div class="dropdown-menu">
                                    <a class="dropdown-item edit-customer" href="#" data-id="${row.id}">
                                        <i class="bi bi-pencil"></i> Edit
                                    </a>
                                    <a class="dropdown-item book-appointment" href="#" data-id="${row.id}">
                                        <i class="bi bi-calendar-plus"></i> Book Appointment
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a class="dropdown-item text-danger delete-customer" href="#" data-id="${row.id}">
                                        <i class="bi bi-trash"></i> Delete
                                    </a>
                                </div>
                            </div>
                        `;
          }
        }
      ]
    });
  }

  function setupEventListeners() {
    // Search functionality
    $('#customerSearch').on('keyup', function() {
      $('#customerTable').DataTable().search($(this).val()).draw();
    });

    // View profile
    $(document).on('click', '.view-profile', function() {
      const customerId = $(this).data('id');
      loadCustomerProfile(customerId);
    });

    // Add new customer
    $('#saveCustomer').click(function() {
      saveCustomerData();
    });

    // Close profile
    $('#closeProfile').click(function() {
      $('#customerProfile').hide();
    });

    // Quick actions in profile
    $('#bookAppointment').click(function() {
      const customerId = $('#customerProfile').data('customerId');
      openAppointmentModal(customerId);
    });

    $('#sendMessage').click(function() {
      const customerId = $('#customerProfile').data('customerId');
      openMessageModal(customerId);
    });

    $('#generateReport').click(function() {
      const customerId = $('#customerProfile').data('customerId');
      generateCustomerReport(customerId);
    });

    // Edit customer information
    $('#editPersonalInfo').click(function() {
      const customerId = $('#customerProfile').data('customerId');
      openEditModal(customerId);
    });

    // Add vehicle
    $('#addVehicle').click(function() {
      const customerId = $('#customerProfile').data('customerId');
      openAddVehicleModal(customerId);
    });
  }

  function loadInitialData() {
    // Simulate API call to load customer data
    $.ajax({
      url: '/api/customers',
      method: 'GET',
      success: function(response) {
        $('#customerTable').DataTable().clear().rows.add(response).draw();
      },
      error: function(xhr) {
        showError('Failed to load customer data');
      }
    });
  }

  function loadCustomerProfile(customerId) {
    // Show loading state
    $('#customerProfile').html('<div class="text-center"><div class="spinner-border"></div></div>').show();

    // Load customer data
    $.ajax({
      url: `/api/customers/${customerId}`,
      method: 'GET',
      success: function(customer) {
        updateProfileView(customer);
      },
      error: function(xhr) {
        showError('Failed to load customer profile');
        $('#customerProfile').hide();
      }
    });
  }

  function updateProfileView(customer) {
    // Update personal information
    $('#personalInfo').html(`
            <div class="mb-2">
                <strong>Name:</strong> ${customer.firstName} ${customer.lastName}
            </div>
            <div class="mb-2">
                <strong>Email:</strong> ${customer.email}
            </div>
            <div class="mb-2">
                <strong>Phone:</strong> ${customer.phone}
            </div>
        `);

    // Update vehicle information
    const vehiclesHtml = customer.vehicles.map(vehicle => `
            <div class="vehicle-card">
                <div class="d-flex justify-content-between">
                    <strong>${vehicle.year} ${vehicle.make} ${vehicle.model}</strong>
                    <button class="btn btn-sm btn-link edit-vehicle" data-id="${vehicle.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
                <div>VIN: ${vehicle.vin}</div>
            </div>
        `).join('');
    $('#vehicleInfo').html(vehiclesHtml);

    // Update loyalty information
    $('#loyaltyInfo').html(`
            <div class="text-center">
                <div class="loyalty-points mb-2">${customer.loyaltyPoints}</div>
                <div class="text-muted">Available Points</div>
            </div>
            <div class="mt-3">
                <h6>Recent Activity</h6>
                <div class="loyalty-activity">
                    ${generateLoyaltyActivity(customer.loyaltyActivity)}
                </div>
            </div>
        `);

    // Update service history
    updateServiceHistory(customer.serviceHistory);

    // Show profile
    $('#customerProfile').show().data('customerId', customer.id);
  }

  function generateLoyaltyActivity(activities) {
    return activities.map(activity => `
            <div class="d-flex justify-content-between mb-2">
                <span>${activity.description}</span>
                <span class="${activity.points > 0 ? 'text-success' : 'text-danger'}">
                    ${activity.points > 0 ? '+' : ''}${activity.points}
                </span>
            </div>
        `).join('');
  }

  function updateServiceHistory(history) {
    const historyHtml = history.map(service => `
            <tr>
                <td>${formatDate(service.date)}</td>
                <td>${service.description}</td>
                <td>${service.vehicle}</td>
                <td>$${service.cost.toFixed(2)}</td>
                <td>
                    <span class="badge warranty-${service.warranty.active ? 'active' : 'expired'}">
                        ${service.warranty.active ? 'Active' : 'Expired'}
                    </span>
                </td>
                <td>${service.status}</td>
            </tr>
        `).join('');

    $('#serviceHistoryTable tbody').html(historyHtml);
  }

  function saveCustomerData() {
    const formData = new FormData($('#customerForm')[0]);

    $.ajax({
      url: '/api/customers',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        $('#addCustomerModal').modal('hide');
        loadInitialData();
        showSuccess('Customer added successfully');
      },
      error: function(xhr) {
        showError('Failed to save customer data');
      }
    });
  }

  // Helper functions
  function formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  function showSuccess(message) {
    // Implementation of success notification
  }

  function showError(message) {
    // Implementation of error notification
  }
});