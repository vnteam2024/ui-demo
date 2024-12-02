// Data Management
const AppointmentManager = {
  technicians: [
    { id: 1, name: 'John Smith', available: true },
    { id: 2, name: 'Sarah Johnson', available: true },
    { id: 3, name: 'Mike Wilson', available: false }
  ],

  serviceBays: [
    { id: 1, name: 'Bay 1', available: true },
    { id: 2, name: 'Bay 2', available: false },
    { id: 3, name: 'Bay 3', available: true }
  ],

  updateTechnicianList() {
    const techList = $('#technicianList');
    techList.empty();

    this.technicians.forEach(tech => {
      const statusClass = tech.available ? 'bg-success' : 'bg-danger';
      techList.append(`
                <div class="technician-availability ${statusClass} text-white">
                    ${tech.name} - ${tech.available ? 'Available' : 'Busy'}
                </div>
            `);
    });

    this.updateTechnicianSelect();
  },

  updateTechnicianSelect() {
    const techSelect = $('#assignedTechnician');
    techSelect.empty();
    this.technicians.forEach(tech => {
      techSelect.append(`<option value="${tech.id}">${tech.name}</option>`);
    });
  },

  updateBayStatus() {
    const bayList = $('#bayStatus');
    bayList.empty();

    this.serviceBays.forEach(bay => {
      bayList.append(`
                <div class="mb-2">
                    <span class="bay-status ${bay.available ? 'bay-available' : 'bay-occupied'}"></span>
                    ${bay.name} - ${bay.available ? 'Available' : 'Occupied'}
                </div>
            `);
    });

    this.updateBaySelect();
  },

  updateBaySelect() {
    const baySelect = $('#serviceBay');
    baySelect.empty();
    this.serviceBays.forEach(bay => {
      baySelect.append(`<option value="${bay.id}">${bay.name}</option>`);
    });
  }
};

// Calendar Configuration
const CalendarManager = {
  calendar: null,

  init() {
    this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,
      droppable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      events: this.fetchEvents.bind(this),
      eventClick: this.handleEventClick.bind(this),
      select: this.handleDateSelect.bind(this),
      eventDrop: this.handleEventDrop.bind(this)
    });

    this.calendar.render();
  },

  fetchEvents(fetchInfo, successCallback, failureCallback) {
    // AJAX call to fetch events
    // For demo, returning static data
    successCallback([
      {
        title: 'Oil Change - John Smith',
        start: '2024-11-29T10:00:00',
        end: '2024-11-29T11:00:00',
        className: 'status-confirmed'
      }
    ]);
  },

  handleEventClick(info) {
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    // Populate modal with event data
    $('#customerName').val('John Smith');
    $('#serviceType').val('oil');
    modal.show();
  },

  handleDateSelect(info) {
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    $('#appointmentForm')[0].reset();
    modal.show();
  },

  handleEventDrop(info) {
    if (!confirm("Are you sure you want to reschedule this appointment?")) {
      info.revert();
    } else {
      // AJAX call to update appointment
      console.log('Appointment rescheduled');
    }
  }
};

// Form Handlers
const FormManager = {
  init() {
    $('#saveAppointment').click(this.handleSave.bind(this));
    $('#deleteAppointment').click(this.handleDelete.bind(this));

    // Initialize date range picker
    $('#dateRange').daterangepicker({
      opens: 'left',
      locale: {
        format: 'MM/DD/YYYY'
      }
    });

    // Initialize filters
    $('#statusFilter, #serviceFilter').change(() => {
      CalendarManager.calendar.refetchEvents();
    });
  },

  handleSave() {
    if ($('#appointmentForm')[0].checkValidity()) {
      const formData = {
        customerName: $('#customerName').val(),
        serviceType: $('#serviceType').val(),
        technician: $('#assignedTechnician').val(),
        bay: $('#serviceBay').val(),
        notes: $('#appointmentNotes').val()
      };

      // AJAX call to save appointment
      $.ajax({
        url: '/api/appointments',
        method: 'POST',
        data: formData,
        success: (response) => {
          // Show success message
          this.showNotification('Appointment saved successfully', 'success');

          // Close modal and refresh calendar
          const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
          modal.hide();
          CalendarManager.calendar.refetchEvents();
        },
        error: (error) => {
          this.showNotification('Error saving appointment', 'error');
        }
      });
    } else {
      $('#appointmentForm')[0].reportValidity();
    }
  },

  handleDelete() {
    if (confirm('Are you sure you want to delete this appointment?')) {
      // AJAX call to delete appointment
      $.ajax({
        url: `/api/appointments/${appointmentId}`,
        method: 'DELETE',
        success: (response) => {
          this.showNotification('Appointment deleted successfully', 'success');

          const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
          modal.hide();
          CalendarManager.calendar.refetchEvents();
        },
        error: (error) => {
          this.showNotification('Error deleting appointment', 'error');
        }
      });
    }
  },

  showNotification(message, type) {
    // You can implement your preferred notification system here
    alert(message);
  }
};

// Stats Manager
const StatsManager = {
  updateStats() {
    // AJAX call to fetch updated statistics
    $.ajax({
      url: '/api/stats/dashboard',
      method: 'GET',
      success: (response) => {
        // Update stats cards with new data
        this.updateStatsDisplay(response);
      },
      error: (error) => {
        console.error('Error fetching stats:', error);
      }
    });
  },

  updateStatsDisplay(data) {
    // Update the stats cards with new data
    // Implementation depends on your stats card structure
  }
};

// Document Ready Handler
$(document).ready(function() {
  // Initialize components
  AppointmentManager.updateTechnicianList();
  AppointmentManager.updateBayStatus();
  CalendarManager.init();
  FormManager.init();

  // Set up auto-refresh for stats
  setInterval(() => {
    StatsManager.updateStats();
  }, 300000); // Refresh every 5 minutes
});

// Global error handler
$(document).ajaxError(function(event, jqXHR, settings, error) {
  console.error('Ajax error:', error);
  FormManager.showNotification('An error occurred. Please try again.', 'error');
});