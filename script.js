function analyzeData() {
    const numTreatments = parseInt(document.getElementById('numTreatments').value);
    const numReplications = parseInt(document.getElementById('numReplications').value);
    const numSets = parseInt(document.getElementById('numSets').value);
    const design = document.getElementById('design').value;
    const transformation = document.getElementById('transformation').value;
    const dataInput = document.getElementById('dataInput').value;

    // Display loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';

    // Disable analyze button
    document.getElementById('analyzeBtn').disabled = true;

    // Parse the input data
    const data = dataInput.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));

    // Validate input data
    if (data.length !== numTreatments * numSets) {
        alert(`Error: Expected ${numTreatments * numSets} rows of data, but got ${data.length}.`);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
        return;
    }
    if (data.some(row => row.length !== numReplications)) {
        alert(`Error: Each row should have ${numReplications} values.`);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
        return;
    }

    // Perform the analysis for each set
    let allResults = '';
    for (let set = 0; set < numSets; set++) {
        const setData = data.slice(set * numTreatments, (set + 1) * numTreatments);
        const results = performAnalysis(setData, numTreatments, numReplications, design, transformation);
        allResults += `<article><h3>Analysis for Set ${set + 1}</h3>${results}</article>`;
    }

    // Display the results
    document.getElementById('results').innerHTML = allResults;

    // Add download button
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Results';
    downloadBtn.onclick = () => downloadResults(allResults);
    document.getElementById('results').appendChild(downloadBtn);

    // Hide loading indicator
    document.getElementById('loadingIndicator').style.display = 'none';

    // Enable analyze button
    document.getElementById('analyzeBtn').disabled = false;
}

function performAnalysis(data, numTreatments, numReplications, design, transformation) {
    // Apply transformation if needed
    if (transformation !== 'none') {
        data = data.map(row => row.map(val => transformValue(val, transformation)));
    }

    // Calculate basic statistics
    const grandTotal = data.flat().reduce((sum, val) => sum + val, 0);
    const grandMean = grandTotal / (numTreatments * numReplications);
    const treatmentTotals = data.map(row => row.reduce((sum, val) => sum + val, 0));
    const treatmentMeans = treatmentTotals.map(total => total / numReplications);

    // Calculate Sum of Squares
    const totalSS = data.flat().reduce((sum, val) => sum + Math.pow(val - grandMean, 2), 0);
    const treatmentSS = treatmentTotals.reduce((sum, total) => sum + Math.pow(total / numReplications - grandMean, 2), 0) * numReplications;

    let blockSS = 0;
    if (design === 'RBD') {
        const blockTotals = Array(numReplications).fill(0);
        for (let i = 0; i < numTreatments; i++) {
            for (let j = 0; j < numReplications; j++) {
                blockTotals[j] += data[i][j];
            }
        }
        blockSS = blockTotals.reduce((sum, total) => sum + Math.pow(total / numTreatments - grandMean, 2), 0) * numTreatments;
    }

    const errorSS = totalSS - treatmentSS - blockSS;

    // Calculate Degrees of Freedom
    const totalDF = numTreatments * numReplications - 1;
    const treatmentDF = numTreatments - 1;
    const blockDF = design === 'RBD' ? numReplications - 1 : 0;
    const errorDF = totalDF - treatmentDF - blockDF;

    // Calculate Mean Squares
    const treatmentMS = treatmentSS / treatmentDF;
    const blockMS = blockSS / blockDF;
    const errorMS = errorSS / errorDF;

    // Calculate F-value
    const fValue = treatmentMS / errorMS;

    // Prepare results HTML
    let resultsHTML = `
        <table>
            <thead>
                <tr>
                    <th>Source of Variation</th>
                    <th>DF</th>
                    <th>SS</th>
                    <th>MS</th>
                    <th>F-value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Treatments</td>
                    <td>${treatmentDF}</td>
                    <td>${treatmentSS.toFixed(2)}</td>
                    <td>${treatmentMS.toFixed(2)}</td>
                    <td>${fValue.toFixed(2)}</td>
                </tr>
    `;

    if (design === 'RBD') {
        resultsHTML += `
            <tr>
                <td>Blocks</td>
                <td>${blockDF}</td>
                <td>${blockSS.toFixed(2)}</td>
                <td>${blockMS.toFixed(2)}</td>
                <td>-</td>
            </tr>
        `;
    }

    resultsHTML += `
                <tr>
                    <td>Error</td>
                    <td>${errorDF}</td>
                    <td>${errorSS.toFixed(2)}</td>
                    <td>${errorMS.toFixed(2)}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td>${totalDF}</td>
                    <td>${totalSS.toFixed(2)}</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            </tbody>
        </table>
        <p>Grand Mean: ${grandMean.toFixed(2)}</p>
        <h4>Treatment Means:</h4>
        <ul>
            ${treatmentMeans.map((mean, i) => `<li>Treatment ${String.fromCharCode(65 + i)}: ${mean.toFixed(2)}</li>`).join('')}
        </ul>
    `;

    // Add Tukey's HSD test results
    const tukeyResults = performTukeyHSD(data, treatmentMeans, errorMS, numReplications);
    resultsHTML += `
        <h4>Tukey's HSD Test:</h4>
        <p>HSD: ${tukeyResults.HSD.toFixed(2)}</p>
        <table>
            <thead>
                <tr>
                    <th>Comparison</th>
                    <th>Difference</th>
                    <th>Significant</th>
                </tr>
            </thead>
            <tbody>
                ${tukeyResults.comparisons.map(comp => `
                    <tr>
                        <td>${comp.pair}</td>
                        <td>${comp.difference}</td>
                        <td>${comp.significant ? 'Yes' : 'No'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Add visualizations
    resultsHTML += `
        <h4>Visualizations:</h4>
        <div class="grid">
            <div>
                <canvas id="treatmentMeansChart"></canvas>
            </div>
            <div>
                <canvas id="boxPlotChart"></canvas>
            </div>
            <div>
                <canvas id="scatterPlotChart"></canvas>
            </div>
        </div>
    `;

    // Create charts after a short delay to ensure the canvas elements are ready
    setTimeout(() => {
        createTreatmentMeansChart(treatmentMeans);
        createBoxPlotChart(data);
        createScatterPlot(data);
    }, 100);

    return resultsHTML;
}

function transformValue(value, transformation) {
    switch (transformation) {
        case 'square_root':
            return Math.sqrt(value);
        case 'angular':
            return Math.asin(Math.sqrt(value / 100)) * (180 / Math.PI);
        default:
            return value;
    }
}

function performTukeyHSD(data, treatmentMeans, errorMS, numReplications) {
    const q = 4.33; // q value for 3 treatments, 9 degrees of freedom at 0.05 significance
    const HSD = q * Math.sqrt(errorMS / numReplications);

    let comparisons = [];
    for (let i = 0; i < treatmentMeans.length; i++) {
        for (let j = i + 1; j < treatmentMeans.length; j++) {
            const diff = Math.abs(treatmentMeans[i] - treatmentMeans[j]);
            const significant = diff > HSD;
            comparisons.push({
                pair: `${String.fromCharCode(65 + i)} - ${String.fromCharCode(65 + j)}`,
                difference: diff.toFixed(2),
                significant: significant
            });
        }
    }

    return { HSD, comparisons };
}

function downloadResults(results) {
    const formattedResults = results
        .replace(/<h3>/g, '\n\n### ')
        .replace(/<\/h3>/g, '\n')
        .replace(/<h4>/g, '\n#### ')
        .replace(/<\/h4>/g, '\n')
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '\n')
        .replace(/<ul>/g, '')
        .replace(/<\/ul>/g, '')
        .replace(/<li>/g, '- ')
        .replace(/<\/li>/g, '\n')
        .replace(/<table>/g, '\n')
        .replace(/<\/table>/g, '\n')
        .replace(/<thead>/g, '')
        .replace(/<\/thead>/g, '')
        .replace(/<tbody>/g, '')
        .replace(/<\/tbody>/g, '')
        .replace(/<tr>/g, '')
        .replace(/<\/tr>/g, '\n')
        .replace(/<th>/g, '| ')
        .replace(/<\/th>/g, ' ')
        .replace(/<td>/g, '| ')
        .replace(/<\/td>/g, ' ');

    const blob = new Blob([formattedResults], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'one_factor_analysis_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function createTreatmentMeansChart(treatmentMeans) {
    const ctx = document.getElementById('treatmentMeansChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: treatmentMeans.map((_, i) => `Treatment ${String.fromCharCode(65 + i)}`),
            datasets: [{
                label: 'Treatment Means',
                data: treatmentMeans,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Treatment Means Comparison'
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Mean Value'
                    }
                }
            }
        }
    });
}

function createBoxPlotChart(data) {
    const ctx = document.getElementById('boxPlotChart').getContext('2d');

    const boxplotData = data.map((treatment, i) => {
        const sorted = treatment.sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length / 4)];
        const median = sorted[Math.floor(sorted.length / 2)];
        const q3 = sorted[Math.floor(3 * sorted.length / 4)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];

        return {
            label: `Treatment ${String.fromCharCode(65 + i)}`,
            data: [
                { x: String.fromCharCode(65 + i), y: [min, q1, median, q3, max] }
            ],
            backgroundColor: `hsla(${i * 360 / data.length}, 70%, 50%, 0.5)`,
            borderColor: `hsla(${i * 360 / data.length}, 70%, 50%, 1)`,
            borderWidth: 1
        };
    });

    new Chart(ctx, {
        type: 'boxplot',
        data: {
            datasets: boxplotData
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Box Plot of Treatments'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}

function createScatterPlot(data) {
    const ctx = document.getElementById('scatterPlotChart').getContext('2d');
    const datasets = data.map((treatment, i) => ({
        label: `Treatment ${String.fromCharCode(65 + i)}`,
        data: treatment.map((value, j) => ({ x: j + 1, y: value })),
        backgroundColor: `hsla(${i * 360 / data.length}, 70%, 50%, 0.7)`,
    }));

    new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Scatter Plot of Treatments' },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const { x, y } = context.parsed;
                            return `Replication: ${x}, Value: ${y}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Replication' },
                    stepSize: 1
                },
                y: { title: { display: true, text: 'Value' } }
            }
        }
    });
}

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('dataInput').value = e.target.result;
    };
    reader.readAsText(file);
}

function exportData() {
    const data = document.getElementById('dataInput').value;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment_data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadExample(exampleNumber) {
    const numTreatmentsInput = document.getElementById('numTreatments');
    const numReplicationsInput = document.getElementById('numReplications');
    const numSetsInput = document.getElementById('numSets');
    const designInput = document.getElementById('design');
    const dataInput = document.getElementById('dataInput');

    if (exampleNumber === 1) {
        numTreatmentsInput.value = 3;
        numReplicationsInput.value = 4;
        numSetsInput.value = 1;
        designInput.value = 'CRD';
        dataInput.value = `123 123 131 133
142 149 147 134
147 172 143 139`;
    } else if (exampleNumber === 2) {
        numTreatmentsInput.value = 3;
        numReplicationsInput.value = 4;
        numSetsInput.value = 1;
        designInput.value = 'RBD';
        dataInput.value = `25.0 23.0 24.3 26.5
28.5 24.9 27.3 29.2
41.3 42.5 41.3 46.5`;
    }
}
