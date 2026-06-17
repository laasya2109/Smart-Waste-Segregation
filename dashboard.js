/* ==========================================
   EcoStation - Dashboard & Analytics Module (dashboard.js)
   ========================================== */

async function loadDashboardStats() {
    if (!currentUser) return;
    try {
        const response = await fetch(`/api/stats?email=${encodeURIComponent(currentUser.email)}`);
        const stats = await response.json();

        // Update card metrics
        document.getElementById('stat-total').innerText = stats.total_scans;
        document.getElementById('stat-objects').innerText = stats.total_objects;
        document.getElementById('stat-plastic').innerText = stats.plastic_count;
        document.getElementById('stat-organic').innerText = stats.organic_count;
        document.getElementById('stat-ewaste').innerText = stats.ewaste_count;

        const plasticVal = stats.plastic_count;
        const organicVal = stats.organic_count;
        const ewasteVal = stats.ewaste_count;
        const paperVal = stats.paper_count;
        const landfillVal = stats.landfill_count;

        // Update Legend List
        document.getElementById('legend-val-plastic').innerText = plasticVal;
        document.getElementById('legend-val-organic').innerText = organicVal;
        document.getElementById('legend-val-ewaste').innerText = ewasteVal;
        document.getElementById('legend-val-paper').innerText = paperVal;
        document.getElementById('legend-val-landfill').innerText = landfillVal;

        // Fetch history for Weekly Scans calculations
        let weeklyData = [0, 0, 0, 0, 0, 0, 0];
        try {
            const histResp = await fetch(`/api/history?email=${encodeURIComponent(currentUser.email)}`);
            const history = await histResp.json();
            if (history && history.length > 0) {
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const scansPerDay = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
                
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                
                history.forEach(scan => {
                    const scanDate = new Date(scan.scan_date);
                    if (scanDate >= sevenDaysAgo) {
                        const dayName = daysOfWeek[scanDate.getDay()];
                        if (scansPerDay[dayName] !== undefined) {
                            scansPerDay[dayName]++;
                        }
                    }
                });
                
                weeklyData = [
                    scansPerDay['Mon'],
                    scansPerDay['Tue'],
                    scansPerDay['Wed'],
                    scansPerDay['Thu'],
                    scansPerDay['Fri'],
                    scansPerDay['Sat'],
                    scansPerDay['Sun']
                ];
            }
        } catch (e) {
            console.error("Failed calculating weekly scans:", e);
        }

        renderCharts(
            { plastic: plasticVal, organic: organicVal, ewaste: ewasteVal, paper: paperVal, landfill: landfillVal },
            weeklyData
        );

    } catch (err) {
        console.error(err);
        showToast('Error loading stats', 'error');
    }
}

function renderCharts(distributionStats, weeklyScansData) {
    const weeklyCtx = document.getElementById('chart-weekly-scans').getContext('2d');
    const distCtx = document.getElementById('chart-distribution').getContext('2d');

    // Destroy existing chart instances to reload fresh data
    if (ecoImpactChart) ecoImpactChart.destroy();
    if (distributionChart) distributionChart.destroy();

    // 1. Weekly Scans Bar Chart
    ecoImpactChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: weeklyScansData,
                backgroundColor: '#10b981', // Emerald Green color
                borderRadius: 4,
                barThickness: 28,
                hoverBackgroundColor: '#059669'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#0f172a',
                    bodyColor: '#10b981',
                    bodyFont: { weight: 'bold' },
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'scans : ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9', borderDash: [5, 5] },
                    ticks: { color: '#64748b', stepSize: 3 }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', weight: '600' } }
                }
            }
        }
    });

    // 2. Distribution Doughnut Chart (No labels / legend, custom colors)
    const totalStats = (distributionStats.plastic || 0) + (distributionStats.organic || 0) + (distributionStats.ewaste || 0) + (distributionStats.paper || 0) + (distributionStats.landfill || 0);
    
    let chartData, chartColors, chartLabels;
    if (totalStats === 0) {
        chartData = [1];
        chartColors = ['#e2e8f0']; // Sleek light gray placeholder ring
        chartLabels = ['No scans yet'];
    } else {
        chartData = [
            distributionStats.plastic,
            distributionStats.organic,
            distributionStats.ewaste,
            distributionStats.paper,
            distributionStats.landfill
        ];
        chartColors = [
            '#0ea5e9', // Blue
            '#10b981', // Green
            '#ef4444', // Red
            '#f59e0b', // Yellow
            '#f97316'  // Orange
        ];
        chartLabels = ['Plastic', 'Organic', 'E-Waste', 'Paper', 'Glass + Metal'];
    }

    distributionChart = new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 0,
                borderColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Custom legend is built in HTML
            },
            cutout: '72%'
        }
    });
}
