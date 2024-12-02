// Sample Data
const MOCK_DATA = {
    technicians: [
        {
            id: 1,
            name: "John Smith",
            status: "AVAILABLE",
            specializations: ["oil", "tire"],
            currentAssignment: null,
            completedJobs: 5,
            totalJobs: 8,
            schedule: {
                monday: { start: "09:00", end: "17:00" },
                tuesday: { start: "09:00", end: "17:00" },
                wednesday: { start: "09:00", end: "17:00" },
                thursday: { start: "09:00", end: "17:00" },
                friday: { start: "09:00", end: "17:00" }
            }
        },
        {
            id: 2,
            name: "Sarah Johnson",
            status: "BUSY",
            specializations: ["brake", "general"],
            currentAssignment: "Brake Service - Bay 2",
            completedJobs: 3,
            totalJobs: 6,
            schedule: {
                monday: { start: "10:00", end: "18:00" },
                tuesday: { start: "10:00", end: "18:00" },
                wednesday: { start: "10:00", end: "18:00" },
                thursday: { start: "10:00", end: "18:00" },
                friday: { start: "10:00", end: "18:00" }
            }
        },
        {
            id: 3,
            name: "Mike Wilson",
            status: "BREAK",
            specializations: ["oil", "general"],
            currentAssignment: null,
            completedJobs: 4,
            totalJobs: 4,
            schedule: {
                monday: { start: "08:00", end: "16:00" },
                tuesday: { start: "08:00", end: "16:00" },
                wednesday: { start: "08:00", end: "16:00" },
                thursday: { start: "08:00", end: "16:00" },
                friday: { start: "08:00", end: "16:00" }
            }
        }
    ],
    serviceBays: [
        {
            id: 1,
            name: "Bay 1",
            available: true,
            currentJob: null,
            assignedTechnician: null
        },
        {
            id: 2,
            name: "Bay 2",
            available: false,
            currentJob: "Brake Service",
            assignedTechnician: "Sarah Johnson"
        },
        {
            id: 3,
            name: "Bay 3",
            available: true,
            currentJob: null,
            assignedTechnician: null
        }
    ],
    equipment: [
        {
            id: 1,
            name: "Tire Mounting Machine",
            available: true,
            maintenanceStatus: 85
        },
        {
            id: 2,
            name: "Diagnostic Scanner",
            available: false,
            maintenanceStatus: 92
        },
        {
            id: 3,
            name: "Brake Lathe",
            available: true,
            maintenanceStatus: 67
        }
    ],
    conflicts: [
        {
            id: 1,
            priority: "HIGH",
            title: "Overlapping Appointments",
            description: "Two appointments scheduled for Bay 2 at 2:00 PM",
            suggestions: [
                { action: "reschedule", label: "Reschedule Second Appointment" },
                { action: "reassign", label: "Reassign to Bay 3" }
            ]
        },
        {
            id: 2,
            priority: "NORMAL",
            title: "Equipment Maintenance Due",
            description: "Brake Lathe requires maintenance check",
            suggestions: [
                { action: "schedule", label: "Schedule Maintenance" },
                { action: "postpone", label: "Postpone 24h" }
            ]
        }
    ]
};

// Technician Management
const TechnicianManager = {
    technicians: [],

    init() {
        this.loadTechnicians();
        this.initEventListeners();
    },

    initEventListeners() {
        $('#saveTechnician').click(() => this.saveTechnician());
    },

    loadTechnicians() {
        // Using mock data instead of API call
        this.technicians = MOCK_DATA.technicians;
        this.updateTechnicianTable();
    },

    updateTechnicianTable() {
        const tbody = $('#technicianTable tbody');
        tbody.empty();

        this.technicians.forEach(tech => {
            tbody.append(`
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="status-indicator status-${tech.status.toLowerCase()}"></span>
                            ${tech.name}
                        </div>
                    </td>
                    <td>${this.formatStatus(tech.status)}</td>
                    <td>${tech.currentAssignment || 'None'}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            ${tech.completedJobs}/${tech.totalJobs}
                            <div class="progress mx-2" style="width: 60px; height: 5px;">
                                <div class="progress-bar" style="width: ${(tech.completedJobs/tech.totalJobs)*100}%"></div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="TechnicianManager.editTechnician(${tech.id})">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="TechnicianManager.toggleAvailability(${tech.id})">
                                Toggle Status
                            </button>
                        </div>
                    </td>
                </tr>
            `);
        });
    },

    editTechnician(id) {
        const tech = this.technicians.find(t => t.id === id);
        if (!tech) return;

        $('#techName').val(tech.name);
        $('#techSpecializations').val(tech.specializations);
        this.buildScheduleForm(tech.schedule);

        const modal = new bootstrap.Modal(document.getElementById('technicianModal'));
        modal.show();
    },

    buildScheduleForm(schedule) {
        const container = $('#scheduleBuilder');
        container.empty();

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            const daySchedule = schedule?.[day.toLowerCase()];
            container.append(`
                <div class="schedule-block">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="day_${day}" 
                            ${daySchedule ? 'checked' : ''}>
                        <label class="form-check-label" for="day_${day}">${day}</label>
                    </div>
                    <input type="time" class="form-control form-control-sm mx-2" 
                        value="${daySchedule?.start || '09:00'}" id="start_${day}">
                    <input type="time" class="form-control form-control-sm" 
                        value="${daySchedule?.end || '17:00'}" id="end_${day}">
                </div>
            `);
        });
    },

    toggleAvailability(id) {
        const tech = this.technicians.find(t => t.id === id);
        if (!tech) return;

        // Cycle through statuses
        const statuses = ['AVAILABLE', 'BUSY', 'BREAK'];
        const currentIndex = statuses.indexOf(tech.status);
        tech.status = statuses[(currentIndex + 1) % statuses.length];

        this.updateTechnicianTable();
        NotificationManager.show('Status updated successfully', 'success');
    },

    saveTechnician() {
        const formData = {
            name: $('#techName').val(),
            specializations: $('#techSpecializations').val(),
            schedule: this.getScheduleData()
        };

        // In a real app, this would be saved to the server
        console.log('Saving technician:', formData);

        const modal = bootstrap.Modal.getInstance(document.getElementById('technicianModal'));
        modal.hide();
        NotificationManager.show('Technician saved successfully', 'success');
    },

    getScheduleData() {
        const schedule = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach(day => {
            if ($(`#day_${day}`).is(':checked')) {
                schedule[day.toLowerCase()] = {
                    start: $(`#start_${day}`).val(),
                    end: $(`#end_${day}`).val()
                };
            }
        });

        return schedule;
    },

    formatStatus(status) {
        const statusMap = {
            'AVAILABLE': '<span class="badge bg-success">Available</span>',
            'BUSY': '<span class="badge bg-danger">Busy</span>',
            'BREAK': '<span class="badge bg-warning">On Break</span>'
        };
        return statusMap[status] || status;
    }
};

// Resource Management
const ResourceManager = {
    init() {
        this.loadServiceBays();
        this.loadEquipment();
        this.checkConflicts();
    },

    loadServiceBays() {
        // Using mock data instead of API call
        this.updateServiceBayStatus(MOCK_DATA.serviceBays);
    },

    updateServiceBayStatus(bays) {
        const container = $('#serviceBayStatus');
        container.empty();

        bays.forEach(bay => {
            container.append(`
                <div class="bay-card ${bay.available ? 'available' : 'occupied'}">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${bay.name}</h6>
                        <span class="badge ${bay.available ? 'bg-success' : 'bg-danger'}">
                            ${bay.available ? 'Available' : 'Occupied'}
                        </span>
                    </div>
                    ${bay.currentJob ? `
                        <small class="text-muted d-block mt-2">
                            Current: ${bay.currentJob}
                            <br>
                            Tech: ${bay.assignedTechnician}
                        </small>
                    ` : ''}
                </div>
            `);
        });
    },

    loadEquipment() {
        // Using mock data instead of API call
        this.updateEquipmentStatus(MOCK_DATA.equipment);
    },

    updateEquipmentStatus(equipment) {
        const container = $('#equipmentStatus');
        container.empty();

        equipment.forEach(item => {
            container.append(`
                <div class="equipment-status">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${item.name}</span>
                        <span class="badge ${item.available ? 'bg-success' : 'bg-danger'}">
                            ${item.available ? 'Available' : 'In Use'}
                        </span>
                    </div>
                    ${item.maintenanceStatus ? `
                        <div class="progress mt-2">
                            <div class="progress-bar bg-info" style="width: ${item.maintenanceStatus}%"></div>
                        </div>
                        <small class="text-muted">Maintenance: ${item.maintenanceStatus}%</small>
                    ` : ''}
                </div>
            `);
        });
    },

    checkConflicts() {
        // Using mock data instead of API call
        this.updateConflictAlerts(MOCK_DATA.conflicts);
    },

    updateConflictAlerts(conflicts) {
        const container = $('#conflictAlerts');
        container.empty();

        if (conflicts.length === 0) {
            container.append(`
                <div class="text-center text-muted">
                    No resource conflicts detected
                </div>
            `);
            return;
        }

        conflicts.forEach(conflict => {
            container.append(`
                <div class="conflict-alert ${conflict.priority === 'HIGH' ? 'high-priority' : ''}">
                    <h6 class="mb-1">
                        ${conflict.priority === 'HIGH' ? '⚠️ ' : ''}
                        ${conflict.title}
                    </h6>
                    <p class="mb-2">${conflict.description}</p>
                    <div class="suggested-actions">
                        ${conflict.suggestions.map(suggestion => `
                            <button class="btn btn-sm btn-outline-primary me-2"
                                onclick="ResourceManager.applySuggestion(${conflict.id}, '${suggestion.action}')">
                                ${suggestion.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `);
        });
    },

    applySuggestion(conflictId, action) {
        // In a real app, this would call the API
        console.log('Applying suggestion:', { conflictId, action });

        // Remove the conflict from the display
        MOCK_DATA.conflicts = MOCK_DATA.conflicts.filter(c => c.id !== conflictId);
        this.checkConflicts();

        NotificationManager.show('Conflict resolved successfully', 'success');
    }
};

// Notification Manager
const NotificationManager = {
    show(message, type = 'info') {
        // Simple alert for demo purposes
        // In a real app, you'd want to use a proper notification system
        alert(`${type.toUpperCase()}: ${message}`);
    }
};

// Initialize everything when document is ready
$(document).ready(function() {
    TechnicianManager.init();
    ResourceManager.init();

    // Set up auto-refresh
    setInterval(() => {
        ResourceManager.loadServiceBays();
        ResourceManager.loadEquipment();
        ResourceManager.checkConflicts();
    }, 60000); // Refresh every minute
});