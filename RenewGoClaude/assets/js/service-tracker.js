$(document).ready(function() {
    initializeTracker();
    setupEventListeners();
    startProgressUpdates();

    function initializeTracker() {
        updateProgress();
        loadChatHistory();
    }

    function setupEventListeners() {
        // Chat functionality
        $('#startChat').click(function() {
            $('#chatModal').modal('show');
        });

        $('#sendMessage').click(sendMessage);
        $('#messageInput').keypress(function(e) {
            if (e.which == 13) {
                sendMessage();
            }
        });

        // Call center click
        $('#callCenter').click(function() {
            window.location.href = 'tel:5551234567';
        });

        // Additional service approval
        $('.btn-success').click(function() {
            approveAdditionalService($(this));
        });
    }

    function updateProgress() {
        // Simulate real-time progress updates
        const progress = {
            currentStep: 2,
            stepTimes: {
                checkIn: '10:00 AM',
                serviceStart: '10:15 AM',
                estimatedCompletion: '2:30 PM'
            }
        };

        $('.progress-step').each(function() {
            const step = $(this).data('step');
            if (step < progress.currentStep) {
                $(this).addClass('completed');
            } else if (step === progress.currentStep) {
                $(this).addClass('active');
            }
        });
    }

    function startProgressUpdates() {
        // Simulate periodic updates
        setInterval(function() {
            checkForUpdates();
        }, 30000);
    }

    function checkForUpdates() {
        // Simulate API call for updates
        const updates = {
            newStep: false,
            additionalServices: [],
            estimatedCompletion: '2:30 PM'
        };

        if (updates.newStep) {
            updateProgress();
        }

        if (updates.additionalServices.length > 0) {
            addNewServices(updates.additionalServices);
        }
    }

    function addNewServices(services) {
        services.forEach(service => {
            const serviceRow = `
                <tr>
                    <td>${service.name}</td>
                    <td><span class="badge bg-info">Pending</span></td>
                    <td>${service.duration}</td>
                    <td>$${service.cost}</td>
                </tr>
            `;
            $('#servicesList').append(serviceRow);
        });
    }

    function approveAdditionalService(button) {
        button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');
        
        // Simulate API call
        setTimeout(() => {
            const alert = button.closest('.alert');
            alert.removeClass('alert-warning').addClass('alert-success');
            alert.find('.btn-group').html('<span class="badge bg-success">Approved</span>');
            addNewServices([{
                name: 'Brake Pad Replacement',
                duration: '1.5 hours',
                cost: '199.99'
            }]);
        }, 1500);
    }

    function loadChatHistory() {
        const messages = [
            {
                type: 'received',
                sender: 'Mike Johnson',
                message: 'Hello! How can I help you today?',
                time: '10:30 AM'
            }
        ];

        const chatHtml = messages.map(message => createMessageHTML(message)).join('');
        $('#chatMessages').html(chatHtml);
    }

    function sendMessage() {
        const input = $('#messageInput');
        const message = input.val().trim();
        
        if (message) {
            const messageObj = {
                type: 'sent',
                message: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            $('#chatMessages').append(createMessageHTML(messageObj));
            input.val('');
            scrollChat();

            // Simulate response
            setTimeout(() => {
                const response = {
                    type: 'received',
                    sender: 'Mike Johnson',
                    message: 'I\'ll check on that for you right away.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                $('#chatMessages').append(createMessageHTML(response));
                scrollChat();
            }, 1500);
        }
    }

    function createMessageHTML(message) {
        return `
            <div class="message ${message.type}">
                ${message.sender ? `<small class="text-muted">${message.sender}</small><br>` : ''}
                ${message.message}
                <div class="message-time">
                    <small class="text-muted">${message.time}</small>
                </div>
            </div>
        `;
    }

    function scrollChat() {
        const chatMessages = $('#chatMessages');
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }

    // Real-time service updates
    function initializeServiceUpdates() {
        const eventSource = new EventSource('/api/service-updates');
        
        eventSource.onmessage = function(event) {
            const update = JSON.parse(event.data);
            handleServiceUpdate(update);
        };

        eventSource.onerror = function() {
            console.error('Service update connection failed');
            eventSource.close();
            // Fallback to polling
            startPolling();
        };
    }

    function handleServiceUpdate(update) {
        switch (update.type) {
            case 'progress':
                updateProgressStep(update.step);
                break;
            case 'estimate':
                updateEstimatedTime(update.time);
                break;
            case 'additional':
                showAdditionalService(update.service);
                break;
            case 'completion':
                handleServiceCompletion(update);
                break;
        }
    }

    function updateProgressStep(stepData) {
        const step = $(`.progress-step[data-step="${stepData.number}"]`);
        
        // Update previous steps
        step.prevAll('.progress-step').addClass('completed');
        
        // Update current step
        step.addClass('active')
            .find('.step-content p')
            .text(`Started at ${stepData.startTime}`);
        
        // Update status badge
        $('.badge.bg-primary').text(stepData.status);
    }

    function updateEstimatedTime(timeData) {
        $('.completion-time').text(timeData.estimated);
        
        if (timeData.delayed) {
            showDelayNotification(timeData.reason);
        }
    }

    function showAdditionalService(service) {
        const serviceHtml = `
            <div class="alert alert-warning fade show" role="alert">
                <h6 class="alert-heading">${service.name} Recommended</h6>
                <p class="mb-0">${service.description}</p>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <span>Estimated Cost: $${service.cost}</span>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="approveService(${service.id})">Approve</button>
                        <button class="btn btn-sm btn-danger" onclick="declineService(${service.id})">Decline</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add new service alert
        $('.additional-services').prepend(serviceHtml);
        
        // Show notification
        showNotification(`New service recommendation: ${service.name}`);
    }

    function showDelayNotification(reason) {
        const notification = `
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <strong>Service Update:</strong> ${reason}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        $('.notifications').prepend(notification);
    }

    function handleServiceCompletion(completion) {
        // Update all progress steps
        $('.progress-step').addClass('completed');
        
        // Update status badge
        $('.badge.bg-primary')
            .removeClass('bg-primary')
            .addClass('bg-success')
            .text('Completed');
        
        // Show completion notification
        showCompletionModal(completion);
    }

    function showCompletionModal(completion) {
        const modalHtml = `
            <div class="modal fade" id="completionModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Service Completed</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Your vehicle is ready for pickup!</p>
                            <ul class="list-unstyled">
                                <li>Total Service Time: ${completion.duration}</li>
                                <li>Final Cost: $${completion.cost}</li>
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="location.href='/payment'">Proceed to Payment</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHtml);
        $('#completionModal').modal('show');
    }

    // Fallback polling mechanism
    function startPolling() {
        setInterval(() => {
            $.ajax({
                url: '/api/service-status',
                method: 'GET',
                success: function(response) {
                    handleServiceUpdate(response);
                },
                error: function(xhr) {
                    console.error('Failed to fetch service updates');
                }
            });
        }, 30000); // Poll every 30 seconds
    }
});