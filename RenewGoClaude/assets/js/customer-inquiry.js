$(document).ready(function() {
    // Initialize Select2 for enhanced dropdowns
    $('#serviceType').select2({
        placeholder: 'Select services',
        maximumSelectionLength: 3
    });

    // Populate vehicle years
    const currentYear = new Date().getFullYear();
    const yearSelect = $('#vehicleYear');
    for (let year = currentYear; year >= currentYear - 20; year--) {
        yearSelect.append($('<option>', {
            value: year,
            text: year
        }));
    }

    // Load FAQ items
    loadFAQs();

    // Form validation
    $('#serviceInquiryForm').on('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            submitInquiry();
        }
    });

    // Dynamic vehicle model loading based on make
    $('#vehicleMake').on('change', function() {
        loadVehicleModels($(this).val());
    });

    // Live chat initialization
    $('#startChat').on('click', initializeLiveChat);
});

// Form validation function
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    $('.error-feedback').remove();
    
    // Required field validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    requiredFields.forEach(field => {
        const value = $(`#${field}`).val().trim();
        if (!value) {
            showError(field, 'This field is required');
            isValid = false;
        }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test($('#email').val().trim())) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test($('#phone').val().trim())) {
        showError('phone', 'Please enter a valid phone number: (XXX) XXX-XXXX');
        isValid = false;
    }

    return isValid;
}

// Show error message under input field
function showError(fieldId, message) {
    $(`#${fieldId}`).addClass('is-invalid')
        .after(`<div class="error-feedback">${message}</div>`);
}

// Submit form data via AJAX
function submitInquiry() {
    const formData = {
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        vehicleMake: $('#vehicleMake').val(),
        vehicleModel: $('#vehicleModel').val(),
        vehicleYear: $('#vehicleYear').val(),
        services: $('#serviceType').val(),
        notes: $('#notes').val()
    };

    $.ajax({
        url: '/api/service-inquiry',
        method: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(response) {
            showSuccessModal();
            // Redirect to appointment scheduling
            setTimeout(() => {
                window.location.href = `/schedule-appointment?inquiry=${response.inquiryId}`;
            }, 2000);
        },
        error: function(xhr) {
            showErrorModal('Unable to submit inquiry. Please try again.');
        }
    });
}

// Load FAQ items
function loadFAQs() {
    const faqs = [
        {
            question: "How long does an oil change take?",
            answer: "A standard oil change typically takes 30-45 minutes."
        },
        {
            question: "What's included in the basic service?",
            answer: "Our basic service includes oil change, filter replacement, and multi-point inspection."
        },
        {
            question: "Do you offer warranty on services?",
            answer: "Yes, we offer a 12-month/12,000-mile warranty on all our services."
        }
    ];

    const accordion = $('#faqAccordion');
    faqs.forEach((faq, index) => {
        accordion.append(`
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq${index}">
                        ${faq.question}
                    </button>
                </h2>
                <div id="faq${index}" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        ${faq.answer}
                    </div>
                </div>
            </div>
        `);
    });
}

// Initialize live chat
function initializeLiveChat() {
    // This would integrate with your chosen live chat service
    $('#startChat').text('Connecting...')
        .prop('disabled', true);
    
    // Simulate chat initialization
    setTimeout(() => {
        $('#liveChat').html(`
            <div class="chat-window">
                <div class="chat-header">
                    <h6>Chat with Support</h6>
                </div>
                <div class="chat-messages">
                    <p class="system-message">Connected with Agent Sarah</p>
                </div>
                <input type="text" class="form-control" placeholder="Type your message...">
            </div>
        `);
    }, 1500);
}