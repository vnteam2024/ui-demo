$(document).ready(function() {
    setupPaymentMethodToggle();
    setupFormValidation();
    setupPaymentProcessing();
    
    function setupPaymentMethodToggle() {
        $('input[name="paymentMethod"]').change(function() {
            const method = $(this).attr('id');
            
            // Hide all payment forms
            $('#cardPaymentForm').hide();
            $('#digitalWalletForm').hide();
            $('#cashPaymentForm').hide();
            
            // Show selected payment form
            switch(method) {
                case 'cardPayment':
                    $('#cardPaymentForm').show();
                    break;
                case 'digitalWallet':
                    initializeDigitalWallet();
                    break;
                case 'cashPayment':
                    showCashInstructions();
                    break;
            }
        });
    }
    
    function setupFormValidation() {
        // Card number formatting
        $('#cardNumber').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            $(this).val(value);
        });
        
        // Expiry date formatting
        $('#expiryDate').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0,2) + '/' + value.slice(2,4);
            }
            $(this).val(value);
        });
        
        // CVV validation
        $('#cvv').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            $(this).val(value.slice(0,3));
        });
    }
    
    function setupPaymentProcessing() {
        $('#payNowBtn').click(function() {
            if (validatePaymentForm()) {
                processPayment();
            }
        });
    }
    
    function validatePaymentForm() {
        let isValid = true;
        const selectedMethod = $('input[name="paymentMethod"]:checked').attr('id');
        
        if (selectedMethod === 'cardPayment') {
            // Card number validation
            const cardNumber = $('#cardNumber').val().replace(/\s/g, '');
            if (cardNumber.length !== 16) {
                showError('cardNumber', 'Please enter a valid card number');
                isValid = false;
            }
            
            // Expiry validation
            const expiry = $('#expiryDate').val();
            if (!expiry.match(/^\d{2}\/\d{2}$/)) {
                showError('expiryDate', 'Please enter a valid expiry date');
                isValid = false;
            }
            
            // CVV validation
            const cvv = $('#cvv').val();
            if (cvv.length !== 3) {
                showError('cvv', 'Please enter a valid CVV');
                isValid = false;
            }
            
            // Name validation
            const cardName = $('#cardName').val().trim();
            if (cardName.length < 3) {
                showError('cardName', 'Please enter the name as shown on card');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function showError(fieldId, message) {
        $(`#${fieldId}`).addClass('is-invalid')
            .after(`<div class="invalid-feedback">${message}</div>`);
    }
    
    function clearErrors() {
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
    }
    
    function processPayment() {
        const paymentMethod = $('input[name="paymentMethod"]:checked').attr('id');
        $('#payNowBtn').prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');
            
        // Simulate payment processing
        setTimeout(() => {
            $('#payNowBtn').prop('disabled', false).html('Pay Now $238.06');
            showPaymentSuccess();
        }, 2000);
    }
    
    function showPaymentSuccess() {
        $('#paymentSuccessModal').modal('show');
        // Update invoice status in background
        updateInvoiceStatus('paid');
    }
    
    function updateInvoiceStatus(status) {
        $.ajax({
            url: '/api/invoices/update-status',
            method: 'POST',
            data: {
                invoiceId: 'INV-2024-001',
                status: status
            },
            success: function(response) {
                console.log('Invoice status updated successfully');
            },
            error: function(xhr) {
                console.error('Failed to update invoice status');
            }
        });
    }
    
    function initializeDigitalWallet() {
        // Check for available digital wallet options
        const wallets = checkAvailableWallets();
        
        const walletOptions = `
            <div id="digitalWalletForm" class="mt-3">
                <div class="d-grid gap-2">
                    ${wallets.map(wallet => `
                        <button class="btn btn-outline-primary wallet-btn" data-wallet="${wallet.id}">
                            <i class="bi ${wallet.icon} me-2"></i>Pay with ${wallet.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        $('#cardPaymentForm').hide().after(walletOptions);
        
        // Setup wallet payment handlers
        $('.wallet-btn').click(function() {
            const walletId = $(this).data('wallet');
            processWalletPayment(walletId);
        });
    }
    
    function checkAvailableWallets() {
        // Simulate checking available digital wallets
        return [
            { id: 'apple-pay', name: 'Apple Pay', icon: 'bi-apple' },
            { id: 'google-pay', name: 'Google Pay', icon: 'bi-google' },
            { id: 'paypal', name: 'PayPal', icon: 'bi-paypal' }
        ];
    }
    
    function processWalletPayment(walletId) {
        // Simulate wallet payment processing
        $('#payNowBtn').prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');
            
        setTimeout(() => {
            $('#payNowBtn').prop('disabled', false).html('Pay Now $238.06');
            showPaymentSuccess();
        }, 2000);
    }
    
    function showCashInstructions() {
        const cashInstructions = `
            <div id="cashPaymentForm" class="mt-3">
                <div class="alert alert-info">
                    <h6>Cash Payment Instructions</h6>
                    <p>Please proceed to the service center counter to complete your payment.</p>
                    <p class="mb-0">Amount due: $238.06</p>
                </div>
            </div>
        `;
        
        $('#cardPaymentForm').hide().after(cashInstructions);
    }
    
    // Invoice download functionality
    $('#downloadInvoice').click(function() {
        generatePDF('invoice');
    });
    
    function generatePDF(type) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add company logo
        // doc.addImage(logoUrl, 'PNG', 15, 15, 30, 30);
        
        // Add header
        doc.setFontSize(18);
        doc.text('Service Center Invoice', 105, 30, { align: 'center' });
        
        // Add invoice details
        doc.setFontSize(12);
        doc.text(`Invoice #: INV-2024-001`, 15, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 60);
        
        // Add customer details
        doc.text('Customer Information:', 15, 80);
        doc.setFontSize(10);
        doc.text('John Doe', 15, 90);
        doc.text('john.doe@email.com', 15, 100);
        doc.text('(555) 123-4567', 15, 110);
        
        // Add service details
        doc.setFontSize(12);
        doc.text('Services:', 15, 130);
        doc.setFontSize(10);
        
        let yPos = 140;
        doc.text('Oil Change', 15, yPos);
        doc.text('$49.99', 180, yPos, { align: 'right' });
        
        yPos += 10;
        doc.text('Brake Service', 15, yPos);
        doc.text('$134.99', 180, yPos, { align: 'right' });
        
        // Add totals
        yPos += 20;
        doc.line(15, yPos, 195, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text('Total:', 15, yPos);
        doc.text('$238.06', 180, yPos, { align: 'right' });
        
        // Save the PDF
        const fileName = type === 'invoice' ? 'invoice.pdf' : 'receipt.pdf';
        doc.save(fileName);
    }
});