const fs = require('fs-extra');
const path = require('path');

async function generateTestReport() {
  const resultsDir = 'test-results';
  const reportFiles = await fs.readdir(resultsDir);
  const testReports = [];

  // Read all test report JSON files
  for (const file of reportFiles) {
    if (file.endsWith('-report.json')) {
      const reportData = await fs.readJson(path.join(resultsDir, file));
      testReports.push(reportData);
    }
  }

  const totalTests = testReports.length;
  const passedTests = testReports.filter(test => test.status === 'PASSED').length;
  const failedTests = totalTests - passedTests;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ParaBank CI/CD Test Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .summary-card.failed { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); }
        .summary-card h3 { margin: 0 0 10px 0; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .chart-container { max-width: 500px; margin: 20px auto; }
        .test-details { margin-top: 30px; }
        .test-card { border: 1px solid #ddd; border-radius: 10px; margin-bottom: 20px; overflow: hidden; }
        .test-header { background: #28a745; color: white; padding: 15px; font-weight: bold; }
        .test-body { padding: 20px; }
        .badge { padding: 5px 12px; border-radius: 20px; font-size: 0.9em; }
        .badge.passed { background: #d4edda; color: #155724; }
        .timestamp { text-align: center; margin-top: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ParaBank CI/CD Test Report</h1>
            <p>Automated Test Execution Pipeline Results</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="number">${totalTests}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number">${passedTests}</div>
                </div>
                <div class="summary-card ${failedTests > 0 ? 'failed' : ''}">
                    <h3>Failed</h3>
                    <div class="number">${failedTests}</div>
                </div>
                <div class="summary-card">
                    <h3>Pass Rate</h3>
                    <div class="number">${passRate}%</div>
                </div>
            </div>

            <div class="chart-container">
                <canvas id="resultsChart" width="400" height="200"></canvas>
            </div>

            <div class="test-details">
                <h2>📋 Test Case Details</h2>
                ${testReports.map(test => `
                <div class="test-card">
                    <div class="test-header">
                        ${test.testCaseId} - ${test.testCaseName}
                        <span class="badge passed" style="float: right;">✅ ${test.status}</span>
                    </div>
                    <div class="test-body">
                        <p><strong>Username:</strong> ${test.username}</p>
                        <p><strong>Browser:</strong> ${test.browser}</p>
                        <p><strong>Execution Time:</strong> ${new Date(test.executionTime).toLocaleString()}</p>
                        <p><strong>Steps Executed:</strong></p>
                        <ul>
                            ${test.steps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                `).join('')}
            </div>

            <div class="timestamp">
                <p>🔧 CI/CD Pipeline | 🧪 Playwright Test Framework | 📊 Automated Reporting</p>
            </div>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed'],
                datasets: [{
                    data: [${passedTests}, ${failedTests}],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Test Results Distribution'
                    }
                }
            }
        });
    </script>
</body>
</html>`;

  await fs.writeFile('test-execution-report.html', htmlReport);
  console.log('📊 CI/CD Test report generated: test-execution-report.html');
}

// Run if called directly
if (require.main === module) {
  generateTestReport().catch(console.error);
}

module.exports = { generateTestReport };