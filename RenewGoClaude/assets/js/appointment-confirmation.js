$(document).ready(function() {
    loadNotificationHistory();
    setupEventListeners();

    function loadNotificationHistory() {
        const notifications = [
            {
                type: 'confirmation',
                message: 'Appointment confirmed',
                timestamp: new Date(),
                icon: 'check-circle-fill'
            },
            {
                type: 'reminder',
                message: 'Appointment reminder sent via email',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                icon: 'envelope'
            },
            {
                type: 'schedule',
                message: 'Appointment scheduled',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                icon: 'calendar-check'
            }
        ];

        const notificationHtml = notifications.map(notification => `
            <div class="notification-item">
                <div class="notification-content">
                    <i class="bi bi-${notification.icon} text-primary me-2"></i>
                    <span>${notification.message}</span>
                    <div class="notification-time">
                        ${formatTimestamp(notification.timestamp)}
                    </div>
                </div>
            </div>
        `).join('');

        $('#notificationHistory').html(notificationHtml);
    }

    function setupEventListeners() {
        // Reschedule button
        $('#rescheduleBtn').click(function() {
            $('#rescheduleModal').modal('show');
        });

        // Cancel button
        $('#cancelBtn').click(function() {
            $('#cancelModal').modal('show');
        });

        // Confirm reschedule
        $('#confirmReschedule').click(function() {
            handleReschedule();
        });

        // Confirm cancel
        $('#confirmCancel').click(function() {
            handleCancel();
        });
    }

    function handleReschedule() {
        // Show loading state
        $('#confirmReschedule').prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');

        // Simulate API call
        setTimeout(() => {
            window.location.href = '/appointment-scheduling?reschedule=true';
        }, 1500);
    }

    function handleCancel() {
        // Show loading state
        $('#confirmCancel').prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');

        const reason = $('#cancelModal textarea').val();

        // Simulate API call
        setTimeout(() => {
            $('#cancelModal').modal('hide');
            showCancelSuccess();
        }, 1500);
    }

    function showCancelSuccess() {
        $('.alert-success').removeClass('alert-success').addClass('alert-info')
            .html('<i class="bi bi-info-circle-fill me-2"></i>Your appointment has been cancelled.');
        
        // Update status badge
        $('.badge.bg-success').removeClass('bg-success').addClass('bg-danger')
            .text('Cancelled');

        // Disable action buttons
        $('#rescheduleBtn, #cancelBtn').prop('disabled', true);

        // Add cancellation to notification history
        const cancelNotification = `
            <div class="notification-item">
                <div class="notification-content">
                    <i class="bi bi-x-circle-fill text-danger me-2"></i>
                    <span>Appointment cancelled</span>
                    <div class="notification-time">Just now</div>
                </div>
            </div>
        `;
        $('#notificationHistory').prepend(cancelNotification);
    }

    function formatTimestamp(date) {
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        if (diffMinutes < 120) return '1 hour ago';
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
        return date.toLocaleDateString();
    }
});