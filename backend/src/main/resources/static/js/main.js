document.addEventListener('DOMContentLoaded', function() {
    // Initialize simulation
    const speedRange = document.getElementById('speed-range');
    const speedValue = document.getElementById('speed-value');
    const startBtn = document.getElementById('start-btn');
    const stepBtn = document.getElementById('step-btn');
    const resetBtn = document.getElementById('reset-btn');
    const simulationRunning = document.getElementById('simulation-running');
    const simulationTime = document.getElementById('simulation-time');
    const simulationStep = document.getElementById('simulation-step');

    // Garden grid interaction
    const gardenCells = document.querySelectorAll('.garden-cell');

    // Speed range change
    speedRange.addEventListener('input', function() {
        speedValue.textContent = this.value + 'x';
    });

    // Start simulation
    startBtn.addEventListener('click', function() {
        fetch('/api/simulation/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ speed: parseFloat(speedRange.value) })
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                startBtn.classList.add('d-none');
                startBtn.classList.remove('d-block');
                simulationRunning.classList.remove('d-none');
                simulationRunning.classList.add('d-block');
                // Continue the JavaScript file: src/main/resources/static/js/main.js

                // Disable inputs during simulation
                speedRange.disabled = true;
                stepBtn.disabled = true;
                resetBtn.disabled = false;

                // Start polling for updates
                startPolling();
            })
            .catch(error => {
                console.error('Error starting simulation:', error);
                alert('Failed to start simulation');
            });
    });

    // Step simulation
    stepBtn.addEventListener('click', function() {
        fetch('/api/simulation/pas', {
            method: 'POST'
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                updateSimulationState();
            })
            .catch(error => {
                console.error('Error executing simulation step:', error);
                alert('Failed to execute simulation step');
            });
    });

    // Reset simulation
    resetBtn.addEventListener('click', function() {
        fetch('/api/simulation/reset', {
            method: 'POST'
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                // Re-enable controls
                startBtn.classList.remove('d-none');
                startBtn.classList.add('d-block');
                simulationRunning.classList.add('d-none');
                simulationRunning.classList.remove('d-block');
                speedRange.disabled = false;
                stepBtn.disabled = false;

                // Stop polling and update state
                stopPolling();
                updateSimulationState();
            })
            .catch(error => {
                console.error('Error resetting simulation:', error);
                alert('Failed to reset simulation');
            });
    });

    // Garden cell selection
    gardenCells.forEach(cell => {
        cell.addEventListener('click', function() {
            // Deselect all cells
            gardenCells.forEach(c => c.classList.remove('selected'));

            // Select current cell
            this.classList.add('selected');

            // Update detail panel
            updateDetailPanel(this);
        });
    });

    // Polling mechanism for real-time updates
    let pollingInterval;

    function startPolling() {
        // Poll every second
        pollingInterval = setInterval(updateSimulationState, 1000);
    }

    function stopPolling() {
        clearInterval(pollingInterval);
    }

    function updateSimulationState() {
        fetch('/api/simulation/state')
            .then(response => response.json())
            .then(data => {
                // Update simulation step
                simulationStep.textContent = data.pasSimulation;

                // Update simulation time
                const minutes = Math.floor(data.pasSimulation / 60);
                const seconds = data.pasSimulation % 60;
                simulationTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                // Update garden grid
                updateGardenGrid(data);

                // Update statistics
                updateStatistics(data);
            })
            .catch(error => {
                console.error('Error fetching simulation state:', error);
            });
    }

    function updateGardenGrid(data) {
        // For each parcelle in the data
        data.parcelles.forEach(parcelle => {
            const cell = document.querySelector(`.garden-cell[data-x="${parcelle.x}"][data-y="${parcelle.y}"]`);

            if (cell) {
                // Update humidity
                updateCellHumidity(cell, parcelle.tauxHumidite);

                // Update plants
                updateCellPlants(cell, parcelle.plantes);

                // Update insects
                updateCellInsects(cell, parcelle.insectes);

                // Update treatment device
                updateCellDevice(cell, parcelle.dispositifTraitement);

                // If this cell is selected, update detail panel
                if (cell.classList.contains('selected')) {
                    updateDetailPanel(cell);
                }
            }
        });
    }

    function updateCellHumidity(cell, humidity) {
        // Update humidity class
        cell.classList.remove('humidity-low', 'humidity-medium', 'humidity-high');
        if (humidity < 30) {
            cell.classList.add('humidity-low');
        } else if (humidity < 70) {
            cell.classList.add('humidity-medium');
        } else {
            cell.classList.add('humidity-high');
        }

        // Update humidity bar
        const humidityBar = cell.querySelector('.humidity-bar');
        if (humidityBar) {
            humidityBar.style.width = `${humidity}%`;
        }

        // Update data attribute
        cell.setAttribute('data-humidity', humidity);
    }

    function updateCellPlants(cell, plants) {
        // Get plants container
        let plantsContainer = cell.querySelector('.plants-container');

        // If no container but plants exist, create container
        if (!plantsContainer && plants && plants.length > 0) {
            plantsContainer = document.createElement('div');
            plantsContainer.classList.add('plants-container');
            cell.querySelector('.cell-content').appendChild(plantsContainer);
        }

        // If container exists but no plants, remove container
        if (plantsContainer && (!plants || plants.length === 0)) {
            plantsContainer.remove();
            return;
        }

        // If no plants, do nothing more
        if (!plants || plants.length === 0) return;

        // Update plants
        plantsContainer.innerHTML = '';

        // Add plants (limit to 4)
        for (let i = 0; i < Math.min(plants.length, 4); i++) {
            const plant = plants[i];
            const plantIcon = document.createElement('div');
            plantIcon.classList.add('plant-icon');
            plantIcon.setAttribute('data-id', plant.id);
            plantIcon.setAttribute('data-species', plant.espece);
            plantIcon.setAttribute('data-mature', plant.estMature);

            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-leaf');
            icon.classList.add(plant.estMature ? 'text-success' : 'text-info');
            plantIcon.appendChild(icon);

            if (plant.estMature) {
                const indicator = document.createElement('div');
                indicator.classList.add('plant-mature-indicator');
                plantIcon.appendChild(indicator);
            }

            plantsContainer.appendChild(plantIcon);
        }

        // Add more indicator if needed
        if (plants.length > 4) {
            const moreIndicator = document.createElement('div');
            moreIndicator.classList.add('more-indicator');
            moreIndicator.textContent = `+${plants.length - 4}`;
            plantsContainer.appendChild(moreIndicator);
        }
    }

    function updateCellInsects(cell, insects) {
        // Similar structure to updateCellPlants
        let insectsContainer = cell.querySelector('.insects-container');

        if (!insectsContainer && insects && insects.length > 0) {
            insectsContainer = document.createElement('div');
            insectsContainer.classList.add('insects-container');
            cell.querySelector('.cell-content').appendChild(insectsContainer);
        }

        if (insectsContainer && (!insects || insects.length === 0)) {
            insectsContainer.remove();
            return;
        }

        if (!insects || insects.length === 0) return;

        insectsContainer.innerHTML = '';

        for (let i = 0; i < Math.min(insects.length, 4); i++) {
            const insect = insects[i];
            const insectIcon = document.createElement('div');
            insectIcon.classList.add('insect-icon');
            insectIcon.setAttribute('data-id', insect.id);
            insectIcon.setAttribute('data-species', insect.espece);
            insectIcon.setAttribute('data-health', insect.sante);

            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-bug');

            if (insect.sante > 7) {
                icon.classList.add('text-success');
            } else if (insect.sante > 3) {
                icon.classList.add('text-warning');
            } else {
                icon.classList.add('text-danger');
            }

            insectIcon.appendChild(icon);

            const indicator = document.createElement('div');
            indicator.classList.add('insect-health-indicator');

            if (insect.sante > 7) {
                indicator.classList.add('health-good');
            } else if (insect.sante > 3) {
                indicator.classList.add('health-medium');
            } else {
                indicator.classList.add('health-poor');
            }

            insectIcon.appendChild(indicator);
            insectsContainer.appendChild(insectIcon);
        }

        if (insects.length > 4) {
            const moreIndicator = document.createElement('div');
            moreIndicator.classList.add('more-indicator');
            moreIndicator.textContent = `+${insects.length - 4}`;
            insectsContainer.appendChild(moreIndicator);
        }
    }

    function updateCellDevice(cell, device) {
        let deviceContainer = cell.querySelector('.device-container');

        if (!deviceContainer && device) {
            deviceContainer = document.createElement('div');
            deviceContainer.classList.add('device-container');
            cell.querySelector('.cell-content').appendChild(deviceContainer);
        }

        if (deviceContainer && !device) {
            deviceContainer.remove();
            return;
        }

        if (!device) return;

        deviceContainer.innerHTML = '';

        const deviceIcon = document.createElement('div');
        deviceIcon.classList.add('device-icon');
        deviceIcon.setAttribute('data-id', device.id);
        deviceIcon.setAttribute('data-radius', device.rayon);

        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-tint', 'text-primary');
        deviceIcon.appendChild(icon);

        const radius = document.createElement('div');
        radius.classList.add('device-radius');
        radius.textContent = device.rayon;
        deviceIcon.appendChild(radius);

        deviceContainer.appendChild(deviceIcon);
    }

    function updateDetailPanel(cell) {
        const noSelection = document.getElementById('no-selection');
        const parcelDetails = document.getElementById('parcel-details');

        // Show parcel details
        noSelection.classList.add('d-none');
        parcelDetails.classList.remove('d-none');

        // Update parcel coords
        const x = cell.getAttribute('data-x');
        const y = cell.getAttribute('data-y');
        document.getElementById('parcel-coords').textContent = `(${x}, ${y})`;

        // Update humidity
        const humidity = cell.getAttribute('data-humidity');
        document.getElementById('parcel-humidity').textContent = `${humidity ? Math.round(humidity) : 0}%`;

        // Update plant count
        const plants = cell.querySelectorAll('.plant-icon');
        const plantsCount = plants.length;
        const moreIndicator = cell.querySelector('.plants-container .more-indicator');
        const totalPlants = moreIndicator ?
            plantsCount + parseInt(moreIndicator.textContent.substring(1)) :
            plantsCount;
        document.getElementById('parcel-plants-count').textContent = totalPlants;

        // Update insects count
        const insects = cell.querySelectorAll('.insect-icon');
        const insectsCount = insects.length;
        const moreInsectsIndicator = cell.querySelector('.insects-container .more-indicator');
        const totalInsects = moreInsectsIndicator ?
            insectsCount + parseInt(moreInsectsIndicator.textContent.substring(1)) :
            insectsCount;
        document.getElementById('parcel-insects-count').textContent = totalInsects;

        // Update device info
        const device = cell.querySelector('.device-icon');
        document.getElementById('parcel-device').textContent = device ? 'Oui' : 'Non';

        // Fetch detailed information
        fetchParcelDetails(x, y);
    }

    function fetchParcelDetails(x, y) {
        // In a real implementation, you would fetch the parcel details from the server
        // For now, we'll load placeholders

        // Config tab content
        document.getElementById('config-tab').innerHTML = `
            <div class="mb-3">
                <label class="form-label">Ajout de plante</label>
                <div class="input-group">
                    <select class="form-select bg-dark text-light border-secondary">
                        <option selected>Tomate</option>
                        <option>Carotte</option>
                        <option>Laitue</option>
                    </select>
                    <button class="btn btn-success">Ajouter</button>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Ajout d'insecte</label>
                <div class="input-group">
                    <select class="form-select bg-dark text-light border-secondary">
                        <option selected>Coccinelle</option>
                        <option>Puceron</option>
                        <option>Chenille</option>
                    </select>
                    <button class="btn btn-warning">Ajouter</button>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Dispositif de traitement</label>
                <div class="input-group">
                    <select class="form-select bg-dark text-light border-secondary">
                        <option selected>Rayon 1</option>
                        <option>Rayon 2</option>
                        <option>Rayon 3</option>
                    </select>
                    <button class="btn btn-primary">Installer</button>
                </div>
            </div>
        `;
    }

    function updateStatistics(data) {
        // Calculate total plants and mature plants
        let totalPlants = 0;
        let maturePlants = 0;
        let plantSpeciesCount = {};

        // Calculate total insects and health distribution
        let totalInsects = 0;
        let healthyInsects = 0;
        let insectSpeciesCount = {};

        // Process all parcelles
        data.parcelles.forEach(parcelle => {
            // Count plants
            if (parcelle.plantes && parcelle.plantes.length > 0) {
                totalPlants += parcelle.plantes.length;

                parcelle.plantes.forEach(plante => {
                    if (plante.estMature) {
                        maturePlants++;
                    }

                    // Count by species
                    if (!plantSpeciesCount[plante.espece]) {
                        plantSpeciesCount[plante.espece] = 0;
                    }
                    plantSpeciesCount[plante.espece]++;
                });
            }

            // Count insects
            if (parcelle.insectes && parcelle.insectes.length > 0) {
                totalInsects += parcelle.insectes.length;

                parcelle.insectes.forEach(insecte => {
                    if (insecte.sante > 7) {
                        healthyInsects++;
                    }

                    // Count by species
                    if (!insectSpeciesCount[insecte.espece]) {
                        insectSpeciesCount[insecte.espece] = 0;
                    }
                    insectSpeciesCount[insecte.espece]++;
                });
            }
        });

        // Update plant statistics
        document.getElementById('total-plants').textContent = totalPlants;
        document.getElementById('mature-plants').textContent = maturePlants +
            (totalPlants > 0 ? ` (${Math.round((maturePlants / totalPlants) * 100)}%)` : '');

        // Update plant species chart
        const plantChartContainer = document.getElementById('plant-species-chart');
        if (totalPlants === 0) {
            plantChartContainer.innerHTML = '<p class="text-center text-muted">Aucune plante dans le potager</p>';
        } else {
            let chartHtml = '';

            for (const species in plantSpeciesCount) {
                const count = plantSpeciesCount[species];
                const percentage = Math.round((count / totalPlants) * 100);

                chartHtml += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>${species}</span>
                        <span>${count} (${percentage}%)</span>
                    </div>
                    <div class="progress bg-dark">
                        <div class="progress-bar bg-success" style="width: ${percentage}%"></div>
                    </div>
                </div>`;
            }

            plantChartContainer.innerHTML = chartHtml;
        }

        // Update insect statistics
        document.getElementById('total-insects').textContent = totalInsects;
        document.getElementById('healthy-insects').textContent = healthyInsects +
            (totalInsects > 0 ? ` (${Math.round((healthyInsects / totalInsects) * 100)}%)` : '');

        // Update insect species chart
        const insectChartContainer = document.getElementById('insect-species-chart');
        if (totalInsects === 0) {
            insectChartContainer.innerHTML = '<p class="text-center text-muted">Aucun insecte dans le potager</p>';
        } else {
            let chartHtml = '';

            for (const species in insectSpeciesCount) {
                const count = insectSpeciesCount[species];
                const percentage = Math.round((count / totalInsects) * 100);

                chartHtml += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>${species}</span>
                        <span>${count} (${percentage}%)</span>
                    </div>
                    <div class="progress bg-dark">
                        <div class="progress-bar bg-danger" style="width: ${percentage}%"></div>
                    </div>
                </div>`;
            }

            insectChartContainer.innerHTML = chartHtml;
        }
    }
});