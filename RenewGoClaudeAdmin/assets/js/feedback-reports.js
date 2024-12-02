// Sample Data
const sampleData = {
  services: ['Repair', 'Installation', 'Maintenance', 'Inspection', 'Consultation'],
  technicians: ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson', 'Mike Wilson'],
  feedback: Array.from({length: 100}, (_, i) => ({
    id: i + 1,
    date: moment().subtract(Math.floor(Math.random() * 30), 'days').format('YYYY-MM-DD'),
    customer: `Customer ${i + 1}`,
    service: ['Repair', 'Installation', 'Maintenance'][Math.floor(Math.random() * 3)],
    technician: ['John Smith', 'Maria Garcia', 'David Chen'][Math.floor(Math.random() * 3)],
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `Sample feedback comment ${i + 1}`,
    status: Math.random() > 0.5 ? 'Addressed' : 'Pending'
  }))
};

// Initialize DataTable
let feedbackTable;

$(document).ready(function() {
  initializeFilters();
  initializeDateRangePicker();
  initializeCharts();
  initializeDataTable();
  updateMetrics();

  // Event Listeners
  $('#dateRange, #serviceType, #technician, #ratingFilter').on('change', function() {
    updateDashboard();
  });

  $('#exportCSV').click(exportToCSV);
  $('#printReport').click(printReport);
  $('#generateReport').click(generateReport);
});

function initializeFilters() {
  // Populate service types
  sampleData.services.forEach(service => {
    $('#serviceType').append(`<option value="${service}">${service}</option>`);
  });

  // Populate technicians
  sampleData.technicians.forEach(tech => {
    $('#technician').append(`<option value="${tech}">${tech}</option>`);
  });
}

function initializeDateRangePicker() {
  $('#dateRange').daterangepicker({
    startDate: moment().subtract(29, 'days'),
    endDate: moment(),
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  });
}

function initializeDataTable() {
  feedbackTable = $('#feedbackTable').DataTable({
    data: sampleData.feedback,
    columns: [
      { data: 'date' },
      { data: 'customer' },
      { data: 'service' },
      { data: 'technician' },
      {
        data: 'rating',
        render: function(data) {
          return '⭐'.repeat(data);
        }
      },
      { data: 'comment' },
      {
        data: 'status',
        render: function(data, type, row) {
          return `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary action-btn view-btn">View</button>
                            <button class="btn btn-sm btn-outline-success action-btn respond-btn">Respond</button>
                        </div>
                    `;
        }
      }
    ],
    order: [[0, 'desc']],
    pageLength: 10,
    responsive: true
  });
}

function initializeCharts() {
  // Rating Trend Chart
  const ratingCtx = document.getElementById('ratingTrendChart').getContext('2d');
  new Chart(ratingCtx, {
    type: 'line',
    data: generateRatingTrendData(),
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Rating Trend Over Time'
        }
      }
    }
  });

  // Service Distribution Chart
  const serviceCtx = document.getElementById('servicePieChart').getContext('2d');
  new Chart(serviceCtx, {
    type: 'pie',
    data: generateServiceDistributionData(),
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Feedback by Service Type'
        }
      }
    }
  });
}

function generateRatingTrendData() {
  const dates = Array.from({length: 7}, (_, i) =>
    moment().subtract(i, 'days').format('MMM DD')
  ).reverse();

  return {
    labels: dates,
    datasets: [{
      label: 'Average Rating',
      data: dates.map(() => (Math.random() * 2 + 3).toFixed(1)),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
}

function generateServiceDistributionData() {
  return {
    labels: sampleData.services,
    datasets: [{
      data: sampleData.services.map(() => Math.floor(Math.random() * 50) + 10),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };
}

function updateMetrics() {
  const filteredData = getFilteredData();

  $('#avgRating').text((filteredData.reduce((sum, item) => sum + item.rating, 0) / filteredData.length).toFixed(1));
  $('#totalFeedback').text(filteredData.length);
  $('#responseRate').text(Math.round(filteredData.filter(item => item.status === 'Addressed').length / filteredData.length * 100) + '%');
  $('#satisfaction').text(Math.round(filteredData.filter(item => item.rating >= 4).length / filteredData.length * 100) + '%');
}

function getFilteredData() {
  return sampleData.feedback.filter(item => {
    const dateRange = $('#dateRange').data('daterangepicker');
    const inDateRange = moment(item.date).isBetween(dateRange.startDate, dateRange.endDate, 'day', '[]');
    const selectedServices = $('#serviceType').val();
    const selectedTechs = $('#technician').val();
    const selectedRating = $('#ratingFilter').val();

    return inDateRange &&
      (!selectedServices.length || selectedServices.includes(item.service)) &&
      (!selectedTechs.length || selectedTechs.includes(item.technician)) &&
      (!selectedRating || item.rating === parseInt(selectedRating));
  });
}

function updateDashboard() {
  updateMetrics();
  feedbackTable.clear().rows.add(getFilteredData()).draw();
  // Update charts here if needed
}

function exportToCSV() {
  const data = getFilteredData();
  const csvContent = "data:text/csv;charset=utf-8,"
    + Object.keys(data[0]).join(",") + "\n"
    + data.map(row => Object.values(row).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "feedback_report.csv");
  document.body.appendChild(link);
  link.click();
}

function printReport() {
  window.print();
}

function generateReport() {
  const reportType = $('#reportType').val();
  const reportFormat = $('#reportFormat').val();

  // Simulate report generation
  alert(`Generating ${reportType} report in ${reportFormat} format...`);
  $('#reportModal').modal('hide');
}

// Event handlers for table actions
$('#feedbackTable').on('click', '.view-btn', function() {
  const data = feedbackTable.row($(this).closest('tr')).data();
  alert(`Viewing feedback ID: ${data.id}`);
});

$('#feedbackTable').on('click', '.respond-btn', function() {
  const data = feedbackTable.row($(this).closest('tr')).data();
  alert(`Responding to feedback ID: ${data.id}`);
});