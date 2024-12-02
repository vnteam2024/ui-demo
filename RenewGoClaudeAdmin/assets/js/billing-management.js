// Sample data
const sampleInvoices = [
  {
    invoiceNumber: "INV-001",
    clientName: "John Doe",
    date: "2024-11-01",
    amount: 150.00,
    status: "paid"
  },
  {
    invoiceNumber: "INV-002",
    clientName: "Jane Smith",
    date: "2024-11-15",
    amount: 200.00,
    status: "unpaid"
  },
  {
    invoiceNumber: "INV-003",
    clientName: "Bob Johnson",
    date: "2024-10-15",
    amount: 300.00,
    status: "overdue"
  }
];

let currentInvoiceId = null;

$(document).ready(function() {
  let table = $('#invoicesTable').DataTable({
    data: sampleInvoices,
    columns: [
      { data: 'invoiceNumber' },
      { data: 'clientName' },
      { data: 'date' },
      { data: 'amount' },
      { data: 'status' },
      {
        data: null,
        render: function(data) {
          return `
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary edit-invoice">Edit</button>
                            <button class="btn btn-sm btn-success record-payment">Record Payment</button>
                        </div>
                    `;
        }
      }
    ]
  });

  $('.filter-btn').click(function() {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');
    let status = $(this).data('status');

    if(status === 'all') {
      table.search('').draw();
    } else {
      table.search(status).draw();
    }
  });

  $('#generateInvoice').click(function() {
    const newInvoice = {
      invoiceNumber: `INV-00${sampleInvoices.length + 1}`,
      clientName: "New Client",
      date: new Date().toISOString().split('T')[0],
      amount: 100.00,
      status: "unpaid"
    };
    sampleInvoices.push(newInvoice);
    table.clear().rows.add(sampleInvoices).draw();
  });

  $('#saveInvoice').click(function() {
    const index = sampleInvoices.findIndex(inv => inv.invoiceNumber === currentInvoiceId);
    if (index !== -1) {
      sampleInvoices[index].amount -= (sampleInvoices[index].amount * $('#discount').val() / 100);
      if ($('#payment').val() >= sampleInvoices[index].amount) {
        sampleInvoices[index].status = 'paid';
      }
    }
    $('#invoiceModal').modal('hide');
    table.clear().rows.add(sampleInvoices).draw();
  });

  $('#refundBtn').click(function() {
    if(confirm('Are you sure you want to issue a refund?')) {
      const index = sampleInvoices.findIndex(inv => inv.invoiceNumber === currentInvoiceId);
      if (index !== -1) {
        sampleInvoices[index].status = 'refunded';
      }
      $('#invoiceModal').modal('hide');
      table.clear().rows.add(sampleInvoices).draw();
    }
  });

  $('#invoicesTable').on('click', '.edit-invoice', function() {
    const data = table.row($(this).closest('tr')).data();
    currentInvoiceId = data.invoiceNumber;
    $('#discount').val(0);
    $('#payment').val(data.amount);
    $('#notes').val('');
    $('#invoiceModal').modal('show');
  });
});