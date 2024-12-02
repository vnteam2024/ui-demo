$(document).ready(function() {
    let selectedDate = null;
    let selectedTimeSlot = null;
    const appointmentData = getAppointmentDataFromQuery();

    initializeCalendar();
    loadServiceSummary();
    setupEventListeners();
    updateTotalCost();

    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            selectable: true,
            selectConstraint: {
                start: new Date(),
                end: new Date().setMonth(new Date().getMonth() + 3)
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            dateClick: function(info) {
                handleDateSelection(info.date);
            },
            validRange: {
                start: new Date()
            }
        });
        calendar.render();
    }

    function handleDateSelection(date) {
        selectedDate = date;
        $('#selectedDate').text(date.toLocaleDateString());
        loadTimeSlots(date);
        validateAppointmentSelection();
    }

    function loadTimeSlots(date) {
        const timeSlotsContainer = $('#timeSlots');
        timeSlotsContainer.show();
        
        // Simulate API call to get available time slots
        const availableSlots = generateTimeSlots(date);
        
        const slotsHtml = availableSlots.map(slot => `
            <div class="time-slot ${slot.available ? '' : 'unavailable'}" 
                 data-time="${slot.time}"
                 ${slot.available ? '' : 'disabled'}>
                ${slot.time}
            </div>
        `).join('');
        
        $('.time-slots-container').html(slotsHtml);
    }

    function generateTimeSlots(date) {
        const slots = [];
        const startHour = 8;
        const endHour = 17;
        const interval = 30; // minutes

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({
                    time: timeString,
                    available: Math.random() > 0.3 // Simulate availability
                });
            }
        }
        return slots;
    }

    function loadServiceSummary() {
        // Simulate loading service data from previous page
        const services = [
            { name: 'Oil Change', price: 49.99 },
            { name: 'Brake Inspection', price: 89.99 }
        ];

        const servicesHtml = services.map(service => `
            <div class="d-flex justify-content-between mb-2">
                <span>${service.name}</span>
                <span>$${service.price.toFixed(2)}</span>
            </div>
        `).join('');

        $('#selectedServices').html(servicesHtml);
        $('#vehicleInfo').html(`
            <p class="mb-1">2020 Toyota Camry</p>
            <p class="mb-1">VIN: 1HGCM82633A123456</p>
        `);
    }

    function updateTotalCost() {
        // Calculate total from selected services
        const total = 139.98; // Example total
        $('#totalCost').text(`$${total.toFixed(2)}`);
    }

    function validateAppointmentSelection() {
        const isValid = selectedDate && selectedTimeSlot;
        $('#confirmAppointment').prop('disabled', !isValid);
    }

    function setupEventListeners() {
        // Time slot selection
        $(document).on('click', '.time-slot:not(.unavailable)', function() {
            $('.time-slot').removeClass('selected');
            $(this).addClass('selected');
            selectedTimeSlot = $(this).data('time');
            $('#selectedTime').text(selectedTimeSlot);
            validateAppointmentSelection();
        });

        // Service center selection
        $('#serviceCenter').change(function() {
            const address = $(this).find(':selected').data('address');
            $('#serviceCenterAddress').text(address);
        });

        // Confirm appointment
        $('#confirmAppointment').click(function() {
            submitAppointment();
        });

        // Back button
        $('#backToInquiry').click(function() {
            window.history.back();
        });
    }

    function submitAppointment() {
        $('#loadingModal').modal('show');

        const appointmentData = {
            date: selectedDate,
            time: selectedTimeSlot,
            serviceCenter: $('#serviceCenter').val(),
            services: ['oil_change', 'brake_inspection'], // From previous page
            vehicleInfo: {
                make: 'Toyota',
                model: 'Camry',
                year: '2020'
            }
        };

        // Simulate API call
        setTimeout(() => {
            $('#loadingModal').modal('hide');
            window.location.href = '/appointment-confirmation?id=123456';
        }, 1500);
    }

    function getAppointmentDataFromQuery() {
        // Parse URL parameters to get data from previous page
        const urlParams = new URLSearchParams(window.location.search);
        return {
            inquiryId: urlParams.get('inquiry')
        };
    }
});