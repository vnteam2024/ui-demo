const sampleData = {
  warranties: Array.from({length: 50}, (_, i) => ({
    id: `W${String(i+1).padStart(4, '0')}`,
    item: Math.random() > 0.5 ?
      `Vehicle ${['Toyota', 'Honda', 'Ford'][Math.floor(Math.random() * 3)]}` :
      `Part ${['Engine', 'Transmission', 'Brakes'][Math.floor(Math.random() * 3)]}`,
    customer: `Customer ${i+1}`,
    startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    expiryDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    status: Math.random() > 0.2 ? 'Active' : 'Expired'
  })),
  claims: Array.from({length: 30}, (_, i) => ({
    id: `C${String(i+1).padStart(4, '0')}`,
    warrantyId: `W${String(Math.floor(Math.random() * 50) + 1).padStart(4, '0')}`,
    customer: `Customer ${Math.floor(Math.random() * 50) + 1}`,
    issueDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
    amount: Math.floor(Math.random() * 5000) + 500
  }))
};

$(document).ready(function() {
  initializeTables();
  updateStats();
  setupEventListeners();
});

function initializeTables() {
  $('#warrantiesTable').DataTable({
    data: sampleData.warranties,
    columns: [
      { data: 'id' },
      { data: 'item' },
      { data: 'customer' },
      {
        data: 'startDate',
        render: data => data.toLocaleDateString()
      },
      {
        data: 'expiryDate',
        render: data => data.toLocaleDateString()
      },
      {
        data: 'status',
        render: data => `<span class="status-badge status-${data.toLowerCase()}">${data}</span>`
      },
      {
        data: null,
        render: data => `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary view-warranty">View</button>
                        <button class="btn btn-sm btn-outline-success create-claim">Create Claim</button>
                    </div>
                `
      }
    ]
  });

  $('#claimsTable').DataTable({
    data: sampleData.claims,
    columns: [
      { data: 'id' },
      { data: 'warrantyId' },
      { data: 'customer' },
      {
        data: 'issueDate',
        render: data => data.toLocaleDateString()
      },
      {
        data: 'status',
        render: data => `<span class="status-badge status-${data.toLowerCase()}">${data}</span>`
      },
      {
        data: 'amount',
        render: data => `$${data.toFixed(2)}`
      },
      {
        data: null,
        render: (data, type, row) => {
          const buttons = [`<button class="btn btn-sm btn-outline-primary view-claim">View</button>`];
          if (data.status === 'Pending') {
            buttons.push(`
                            <button class="btn btn-sm btn-outline-success approve-claim">Approve</button>
                            <button class="btn btn-sm btn-outline-danger reject-claim">Reject</button>
                        `);
          }
          return `<div class="btn-group">${buttons.join('')}</div>`;
        }
      }
    ]
  });
}

function updateStats() {
  const activeWarranties = sampleData.warranties.filter(w => w.status === 'Active').length;
  const pendingClaims = sampleData.claims.filter(c => c.status === 'Pending').length;
  const approvedClaims = sampleData.claims.filter(c => c.status === 'Approved').length;
  const approvalRate = (approvedClaims / sampleData.claims.length * 100).toFixed(1);

  $('#activeWarranties').text(activeWarranties);
  $('#pendingClaims').text(pendingClaims);
  $('#approvalRate').text(`${approvalRate}%`);
  $('#processingTime').text('3.2 days');
}

function setupEventListeners() {
  $('#newClaim').click(() => {
    populateWarrantySelect();
    $('#claimModal').modal('show');
  });

  $('#submitClaim').click(() => {
    if (!$('#claimForm')[0].checkValidity()) {
      return;
    }
    // Simulate claim submission
    const newClaim = {
      id: `C${String(sampleData.claims.length + 1).padStart(4, '0')}`,
      warrantyId: $('#warrantySelect').val(),
      customer: 'New Customer',
      issueDate: new Date(),
      status: 'Pending',
      amount: 1000
    };
    sampleData.claims.push(newClaim);
    $('#claimsTable').DataTable().row.add(newClaim).draw();
    $('#claimModal').modal('hide');
    updateStats();
  });

  $('.btn-group [data-status]').click(function() {
    const status = $(this).data('status');
    const table = $('#claimsTable').DataTable();
    if (status === 'all') {
      table.search('').draw();
    } else {
      table.search(status).draw();
    }
  });

  $('#claimsTable').on('click', '.approve-claim, .reject-claim', function() {
    const row = $(this).closest('tr');
    const data = $('#claimsTable').DataTable().row(row).data();
    data.status = $(this).hasClass('approve-claim') ? 'Approved' : 'Rejected';
    $('#claimsTable').DataTable().row(row).data(data).draw();
    updateStats();
  });
}

function populateWarrantySelect() {
  const select = $('#warrantySelect');
  select.empty();
  sampleData.warranties
    .filter(w => w.status === 'Active')
    .forEach(w => {
      select.append(`<option value="${w.id}">${w.id} - ${w.item}</option>`);
    });
}