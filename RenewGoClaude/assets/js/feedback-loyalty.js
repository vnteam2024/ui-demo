$(document).ready(function() {
    setupRatingSystem();
    setupRewardRedemption();
    handleFeedbackSubmission();

    function setupRatingSystem() {
        // Star rating hover effect
        $('.rating i').hover(
            function() {
                const rating = $(this).data('rating');
                updateStars(rating, true);
            },
            function() {
                const selectedRating = $('.rating').data('selected') || 0;
                updateStars(selectedRating, false);
            }
        );

        // Star rating click
        $('.rating i').click(function() {
            const rating = $(this).data('rating');
            $('.rating').data('selected', rating);
            updateStars(rating, false);
            updateRatingText(rating);
        });
    }

    function updateStars(rating, isHover) {
        $('.rating i').each(function() {
            const star = $(this);
            const starRating = star.data('rating');
            
            if (starRating <= rating) {
                star.removeClass('bi-star').addClass('bi-star-fill active');
            } else {
                star.removeClass('bi-star-fill active').addClass('bi-star');
            }
        });
    }

    function updateRatingText(rating) {
        const texts = [
            'Click to rate',
            'Poor',
            'Fair',
            'Good',
            'Very Good',
            'Excellent'
        ];
        $('.rating-text').text(texts[rating]);
    }

    function setupRewardRedemption() {
        $('.redeem-btn:not([disabled])').click(function() {
            const rewardCard = $(this).closest('.reward-card');
            const rewardTitle = rewardCard.find('h6').text();
            const pointsCost = rewardCard.find('p').text();

            $('#rewardTitle').text(rewardTitle);
            $('#pointsCost').text(pointsCost);
            $('#redeemModal').modal('show');
        });

        $('#confirmRedeem').click(function() {
            const button = $(this);
            button.prop('disabled', true)
                .html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');

            // Simulate redemption process
            setTimeout(() => {
                $('#redeemModal').modal('hide');
                showRedemptionSuccess();
                updatePointsBalance();
                button.prop('disabled', false).text('Confirm Redemption');
            }, 1500);
        });
    }

    function handleFeedbackSubmission() {
        $('#feedbackForm').submit(function(e) {
            e.preventDefault();
            
            if (validateFeedback()) {
                const submitButton = $(this).find('button[type="submit"]');
                submitButton.prop('disabled', true)
                    .html('<span class="spinner-border spinner-border-sm me-2"></span>Submitting...');

                // Simulate submission
                setTimeout(() => {
                    showFeedbackSuccess();
                    submitButton.prop('disabled', false).text('Submit Feedback');
                }, 1500);
            }
        });
    }

    function validateFeedback() {
        let isValid = true;
        const rating = $('.rating').data('selected');

        if (!rating) {
            $('.rating-container').append('<div class="text-danger mt-2">Please select a rating</div>');
            isValid = false;
        }

        return isValid;
    }

    function showFeedbackSuccess() {
        const successAlert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Thank you for your feedback! You've earned 50 loyalty points.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        $('#feedbackForm').prepend(successAlert);
        updatePointsBalance(50);
    }

    function showRedemptionSuccess() {
        const successAlert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Reward redeemed successfully! Check your email for the reward code.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        $('.card-body').prepend(successAlert);
    }

    function updatePointsBalance(change = 0) {
        const currentPoints = parseInt($('.points-value').text());
        const newPoints = currentPoints + change;
        
        // Animate points change
        $({ points: currentPoints }).animate({ points: newPoints }, {
            duration: 1000,
            step: function() {
                $('.points-value').text(Math.round(this.points));
            },
            complete: function() {
                // Update points history
                if (change !== 0) {
                    addPointsHistoryEntry(change);
                }
                
                // Update reward availability
                updateRewardAvailability(newPoints);
            }
        });
    }

    function addPointsHistoryEntry(points) {
        const activity = points > 0 ? 'Feedback Bonus' : 'Reward Redemption';
        const pointsText = points > 0 ? `+${points} points` : `${points} points`;
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const newEntry = `
            <tr>
                <td>${activity}</td>
                <td class="text-end ${points > 0 ? 'text-success' : 'text-danger'}">${pointsText}</td>
                <td class="text-end">${date}</td>
            </tr>
        `;
        
        $('.points-history tbody').prepend(newEntry);
    }

    function updateRewardAvailability(points) {
        $('.reward-card').each(function() {
            const requiredPoints = parseInt($(this).find('p').text());
            const redeemBtn = $(this).find('.redeem-btn');
            
            if (points >= requiredPoints) {
                redeemBtn.prop('disabled', false)
                    .text('Redeem')
                    .removeClass('btn-secondary')
                    .addClass('btn-outline-primary');
            } else {
                const pointsNeeded = requiredPoints - points;
                redeemBtn.prop('disabled', true)
                    .text(`Need ${pointsNeeded} more points`)
                    .removeClass('btn-outline-primary')
                    .addClass('btn-secondary');
            }
        });
    }

    // Next service recommendation handling
    function setupNextServiceRecommendation() {
        $('.next-service button').click(function() {
            window.location.href = '/schedule-service';
        });
    }

    // Service history chart (if needed)
    function initializeServiceHistory() {
        // Implementation for service history visualization
        // This could use a charting library like Chart.js
    }

    // Feedback analytics (for internal use)
    function trackFeedbackMetrics(feedback) {
        // Implementation for tracking feedback metrics
        const metrics = {
            rating: feedback.rating,
            serviceQuality: feedback.serviceQuality,
            staffCourtesy: feedback.staffCourtesy,
            timestamp: new Date(),
            serviceId: feedback.serviceId
        };
        
        // Send metrics to analytics endpoint
        $.ajax({
            url: '/api/feedback/metrics',
            method: 'POST',
            data: metrics,
            success: function(response) {
                console.log('Feedback metrics tracked successfully');
            },
            error: function(xhr) {
                console.error('Failed to track feedback metrics');
            }
        });
    }

    // Social sharing functionality
    function setupSocialSharing() {
        $('.share-feedback').click(function() {
            const platform = $(this).data('platform');
            const message = "Just had a great experience at AutoService! #CustomerService";
            
            let shareUrl;
            switch(platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    }

    // Initialize all components
    function initializeAll() {
        setupRatingSystem();
        setupRewardRedemption();
        handleFeedbackSubmission();
        setupNextServiceRecommendation();
        setupSocialSharing();
        
        // Check for URL parameters (e.g., after service completion)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('service_completed')) {
            // Show feedback prompt
            showFeedbackPrompt();
        }
    }

    // Call initialization
    initializeAll();
});            