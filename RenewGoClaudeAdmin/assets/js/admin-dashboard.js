$(document).ready(function() {
  initializeDashboard();
  setupEventListeners();
  startRealTimeUpdates();

  function initializeDashboard() {
    loadAppointments();
    loadNotifications();
    loadTechnicianStatus();
    loadInventoryAlerts();
    initializeCharts();
  }

  function loadAppointments() {
    // Simulate API call
    const appointments = [
      {
        time: '09:00 AM',
        customer: 'John Doe',
        service: 'Oil Change',
        technician: 'Mike Johnson',
        status: 'In Progress'
      },
      // Add more appointments...
    ];

    const appointmentsHtml = appointments.map(appointment => `
            <tr>
                <td>${appointment.time}</td>
                <td>${appointment.customer}</td>
                <td>${appointment.service}</td>
                <td>${appointment.technician}</td>
                <td><span class="badge bg-warning">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">Edit</button>
                    <button class="btn btn-sm btn-outline-danger">Cancel</button>
                </td>
            </tr>
        `).join('');

    $('#appointmentsList').html(appointmentsHtml);
  }

  function loadNotifications() {
    const notifications = [
      {
        type: 'urgent',
        message: 'Low inventory alert: Oil filters running low',
        time: '5 minutes ago'
      },
      // Add more notifications...
    ];

    const notificationsHtml = notifications.map(notification => `
            <div class="notification-item ${notification.type === 'urgent' ? 'unread' : ''}">
                <div class="d-flex justify-content-between">
                    <strong>${notification.message}</strong>
                    <small class="text-muted">${notification.time}</small>
                </div>
            </div>
        `).join('');

    $('.notifications-list').html(notificationsHtml);
  }

  function loadTechnicianStatus() {
    const technicians = [
      {
        name: 'Mike Johnson',
        status: 'available',
        currentTask: 'Oil Change - Bay 1'
      },
      // Add more technicians...
    ];

    const techniciansHtml = technicians.map(tech => `
            <div class="technician-status-item">
                <div class="status-indicator ${tech.status}"></div>
                <div>
                    <div><strong>${tech.name}</strong></div>
                    <small class="text-muted">${tech.currentTask}</small>
                </div>
            </div>
        `).join('');

    $('#technicianStatus').html(techniciansHtml);
  }

  function loadInventoryAlerts() {
    const alerts = [
      {
        item: 'Oil Filters',
        current: 5,
        minimum: 10,
        urgency: 'high'
      },
      // Add more alerts...
    ];

    const alertsHtml = alerts.map(alert => `
            <div class="inventory-alert">
                <strong>${alert.item}</strong>
                <p class="mb-1">Current stock: ${alert.current} (Min: ${alert.minimum})</p>
                <button class="btn btn-sm btn-primary">Order Now</button>
            </div>
        `).join('');

    $('#inventoryAlerts').html(alertsHtml);
  }

  function initializeCharts() {
    const ctx = document.getElementById('servicePerformanceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Services Completed',
          data: [65, 59, 80, 81],
          borderColor: '#0d6efd',
          tension: 0.4
        }, {
          label: 'Revenue ($K)',
          data: [28, 48, 40, 45],
          borderColor: '#198754',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function setupEventListeners() {
    // Quick action buttons
    $('.quick-actions button').click(function() {
      handleQuickAction($(this).text().trim());
    });

    // Appointment actions
    $(document).on('click', '.btn-outline-primary', function() {
      const row = $(this).closest('tr');
      handleAppointmentEdit(row);
    });

    $(document).on('click', '.btn-outline-danger', function() {
      const row = $(this).closest('tr');
      handleAppointmentCancel(row);
    });

    // Notification handling
    $('.notification-item').click(function() {
      handleNotificationClick($(this));
    });
  }

  function handleQuickAction(action) {
    switch(action) {
      case 'New Appointment':
        showAppointmentForm();
        break;
      case 'Generate Report':
        generateReport();
        break;
      case 'Settings':
        showSettings();
        break;
      case 'Manage Staff':
        showStaffManagement();
        break;
    }
  }

  function showAppointmentForm() {
    const form = `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Customer Name</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Service Type</label>
                    <select class="form-select" required>
                        <option value="">Select service...</option>
                        <option>Oil Change</option>
                        <option>Brake Service</option>
                        <option>Tire Rotation</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Preferred Date</label>
                    <input type="date" class="form-control" required>
                </div>
                <div class="col-12">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" rows="3"></textarea>
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary">Schedule Appointment</button>
                </div>
            </div>
        `;

    $('#appointmentForm').html(form);
  }

  function startRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      updateDashboardMetrics();
    }, 30000);
  }

  function updateDashboardMetrics() {
    // Update appointment counts
    updateAppointmentStats();
    // Update technician availability
    updateTechnicianStats();
    // Update revenue data
    updateRevenueStats();
    // Check for new notifications
    checkNewNotifications();
  }

  function updateAppointmentStats() {
    $.ajax({
      url: '/api/appointments/stats',
      method: 'GET',
      success: function(response) {
        // Update appointment counters
        updateStatCard('appointments', response);
      }
    });
  }

  function updateTechnicianStats() {
    $.ajax({
      url: '/api/technicians/availability',
      method: 'GET',
      success: function(response) {
        // Update technician availability
        updateStatCard('technicians', response);
      }
    });
  }

  function updateStatCard(type, data) {
    const card = $(`.stat-card[data-type="${type}"]`);
    card.find('h3').text(data.value);
    card.find('.badges').html(generateBadgesHtml(data.breakdown));
  }

  function checkNewNotifications() {
    $.ajax({
      url: '/api/notifications/new',
      method: 'GET',
      success: function(response) {
        if (response.hasNew) {
          addNewNotifications(response.notifications);
        }
      }
    });
  }

  function addNewNotifications(notifications) {
    notifications.forEach(notification => {
      const notificationHtml = `
                <div class="notification-item unread">
                    <div class="d-flex justify-content-between">
                        <strong>${notification.message}</strong>
                        <small class="text-muted">Just now</small>
                    </div>
                </div>
            `;
      $('.notifications-list').prepend(notificationHtml);
      showNotificationAlert(notification);
    });
  }

  function showNotificationAlert(notification) {
    if (notification.priority === 'urgent') {
      const toast = `
                <div class="toast" role="alert">
                    <div class="toast-header">
                        <strong class="me-auto">Urgent Notification</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        ${notification.message}
                    </div>
                </div>
            `;
      $('.toast-container').append(toast);
      $('.toast').toast('show');
    }
  }

  // Initialize dashboard
  initializeDashboard();
});