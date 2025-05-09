/**
 * Garden Visualization Main Module
 * This file handles the visualization of the garden grid and its elements
 */

// Global variables
let gardenState = {
    grid: null,
    selectedCell: null,
    viewMode: 'all',
    selectedParcelleId: null,
    currentStep: 0
};

// Initialize the garden when DOM is ready
$(document).ready(function() {
    // Initialize garden grid
    initializeGardenGrid();

    // Initialize view mode buttons
    initializeViewModes();

    // Initialize WebSocket connection for real-time updates
    initializeWebSocket();

    // Fetch initial garden state
    fetchGardenState();
});

/**
 * Initialize the garden grid
 */
function initializeGardenGrid() {
    const gridContainer = $('#garden-grid');
    gridContainer.empty();
}

/**
 * Initialize view mode controls
 */
function initializeViewModes() {
    $('.garden-controls button').on('click', function() {
        $('.garden-controls button').removeClass('active');
        $(this).addClass('active');

        // Set view mode
        const viewMode = $(this).attr('id').replace('view-', '');
        gardenState.viewMode = viewMode;

        // Update garden visualization
        updateGardenView();
    });
}

/**
 * Initialize WebSocket connection to receive real-time updates
 */
function initializeWebSocket() {
    const socket = new SockJS('/potager-websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        // Subscribe to garden updates
        stompClient.subscribe('/topic/potager-updates', function(message) {
            const gardenState = JSON.parse(message.body);
            updateGarden(gardenState);
        });
    }, function(error) {
        console.error('Error connecting to WebSocket:', error);
        // Fallback to polling for updates
        setInterval(fetchGardenState, 2000);
    });
}

/**
 * Fetch the current garden state from the server
 */
function fetchGardenState() {
    $.ajax({
        url: '/simulation/state',
        method: 'GET',
        success: function(data) {
            updateGarden(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching garden state:', error);
            // Show error message
            $('#garden-grid').html('<div class="alert alert-danger">Erreur lors du chargement du potager. Veuillez réessayer.</div>');
        }
    });
}

/**
 * Update the garden grid with new state data
 */
function updateGarden(data) {
    // Update current step
    gardenState.currentStep = data.pasSimulation;
    $('#current-step').text(data.pasSimulation);

    // Update simulation time
    const minutes = Math.floor(data.pasSimulation / 60);
    const seconds = data.pasSimulation % 60;
    $('#simulation-time').text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

    // Create or update the garden grid
    if (!gardenState.grid) {
        createGardenGrid(data);
    } else {
        updateGardenGrid(data);
    }

    // Update statistics
    updateStatistics(data);

    // Update garden view mode
    updateGardenView();
}

/**
 * Create the garden grid
 */
function createGardenGrid(data) {
    const gridContainer = $('#garden-grid');
    gridContainer.empty();

    // Set grid size
    gridContainer.css('grid-template-columns', `repeat(${data.largeur}, 1fr)`);

    // Create cells
    data.parcelles.forEach(parcelle => {
        const cell = $('<div></div>')
            .addClass('garden-cell')
            .attr('id', `parcelle-${parcelle.id}`)
            .attr('data-parcelle-id', parcelle.id)
            .attr('data-x', parcelle.x)
            .attr('data-y', parcelle.y);

        // Add cell content
        cell.html(`
            <div class="cell-content">
                <div class="cell-coordinates">(${parcelle.x},${parcelle.y})</div>
                <div class="cell-humidity">${Math.round(parcelle.tauxHumidite)}%</div>
                <div class="plants-container"></div>
                <div class="insects-container"></div>
            </div>
        `);

        // Add click event
        cell.on('click', function() {
            selectCell($(this));
        });

        gridContainer.append(cell);
    });

    // Store grid reference
    gardenState.grid = gridContainer;

    // Update grid with data
    updateGardenGrid(data);
}

/**
 * Update the garden grid with new data
 */
function updateGardenGrid(data) {
    data.parcelles.forEach(parcelle => {
        const cell = $(`#parcelle-${parcelle.id}`);

        // Update humidity
        cell.find('.cell-humidity').text(`${Math.round(parcelle.tauxHumidite)}%`);

        // Set humidity class
        let humidityClass = 'low';
        if (parcelle.tauxHumidite > 70) {
            humidityClass = 'high';
        } else if (parcelle.tauxHumidite > 30) {
            humidityClass = 'medium';
        }
        cell.attr('data-humidity', humidityClass);

        // Update plants
        updatePlantsInCell(cell, parcelle.plantes);

        // Update insects
        updateInsectsInCell(cell, parcelle.insectes);

        // Update device
        updateDeviceInCell(cell, parcelle.dispositifTraitement);
    });
}

/**
 * Update plants visualization in a cell
 */
function updatePlantsInCell(cell, plants) {
    const plantsContainer = cell.find('.plants-container');
    plantsContainer.empty();

    if (plants && plants.length > 0) {
        plants.forEach(plant => {
            const plantElement = $('<div></div>')
                .addClass('plant-item')
                .attr('data-plant-id', plant.id)
                .attr('data-espece', plant.espece)
                .attr('title', `${plant.espece} (${plant.age}/${plant.ageMaturite})`);

            // Add classes for mature and drageonnante plants
            if (plant.estMature) {
                plantElement.addClass('mature');
            }
            if (plant.estDrageonnante) {
                plantElement.addClass('drageon');
            }

            plantsContainer.append(plantElement);
        });
    }
}

/**
 * Update insects visualization in a cell
 */
function updateInsectsInCell(cell, insects) {
    const insectsContainer = cell.find('.insects-container');
    insectsContainer.empty();

    if (insects && insects.length > 0) {
        insects.forEach(insect => {
            const insectElement = $('<div></div>')
                .addClass('insect-item')
                .attr('data-insect-id', insect.id)
                .attr('data-espece', insect.espece)
                .attr('title', `${insect.espece} (${insect.sexe}) - Santé: ${insect.sante}/10`);

            // Add classes for gender and health
            if (insect.sexe === 'M') {
                insectElement.addClass('male');
            } else {
                insectElement.addClass('female');
            }

            if (insect.sante > 7) {
                insectElement.addClass('healthy');
            }

            if (insect.passSansManger > 2) {
                insectElement.addClass('hungry');
            }

            insectsContainer.append(insectElement);
        });
    }
}

/**
 * Update device visualization in a cell
 */
function updateDeviceInCell(cell, device) {
    // Remove existing device
    cell.find('.device-container, .device-radius').remove();

    if (device) {
        // Create device element
        const deviceElement = $('<div></div>')
            .addClass('device-container')
            .attr('data-device-id', device.id)
            .attr('title', `Dispositif de traitement (rayon: ${device.rayon})`);

        // Create radius visualization
        const radiusElement = $('<div></div>')
            .addClass('device-radius')
            .css({
                width: `${device.rayon * 100}%`,
                height: `${device.rayon * 100}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });

        cell.append(deviceElement);
        cell.append(radiusElement);

        // Enable manual treatment buttons if a device is selected
        if (gardenState.selectedParcelleId === parseInt(cell.attr('data-parcelle-id'))) {
            enableManualTreatmentButtons();
        }
    }
}

/**
 * Select a cell in the garden grid
 */
function selectCell(cell) {
    // Remove selection from the previous cell
    if (gardenState.selectedCell) {
        gardenState.selectedCell.removeClass('selected');
    }

    // Add selection to the new cell
    cell.addClass('selected');
    gardenState.selectedCell = cell;
    gardenState.selectedParcelleId = parseInt(cell.attr('data-parcelle-id'));

    // Update detail panel
    updateDetailPanel(cell);

    // Enable/disable manual treatment buttons
    if (cell.find('.device-container').length > 0) {
        enableManualTreatmentButtons();
    } else {
        disableManualTreatmentButtons();
    }
}

/**
 * Update detail panel with selected cell information
 */
function updateDetailPanel(cell) {
    const parcelleId = cell.attr('data-parcelle-id');

    // Fetch detailed information about the parcelle
    $.ajax({
        url: `/parcelles/${parcelleId}`,
        method: 'GET',
        success: function(data) {
            // Update detail panel
            showParcelleDetails(data);
        },
        error: function(xhr, status, error) {
            console.error(`Error fetching parcelle details: ${error}`);

            // Show basic information from the cell
            const basicInfo = {
                id: parcelleId,
                x: cell.attr('data-x'),
                y: cell.attr('data-y'),
                tauxHumidite: cell.find('.cell-humidity').text().replace('%', ''),
                plantes: [],
                insectes: []
            };

            // Get plants
            cell.find('.plant-item').each(function() {
                basicInfo.plantes.push({
                    id: $(this).attr('data-plant-id'),
                    espece: $(this).attr('data-espece'),
                    estMature: $(this).hasClass('mature'),
                    estDrageonnante: $(this).hasClass('drageon')
                });
            });

            // Get insects
            cell.find('.insect-item').each(function() {
                basicInfo.insectes.push({
                    id: $(this).attr('data-insect-id'),
                    espece: $(this).attr('data-espece'),
                    sexe: $(this).hasClass('male') ? 'M' : 'F'
                });
            });

            // Show basic information
            showParcelleDetails(basicInfo);
        }
    });
}

/**
 * Update garden view based on selected view mode
 */
function updateGardenView() {
    const gridContainer = $('#garden-grid');

    // Remove all view mode classes
    gridContainer.removeClass('humidity-view plants-view insects-view devices-view');

    // Add appropriate view mode class
    if (gardenState.viewMode !== 'all-elements') {
        gridContainer.addClass(`${gardenState.viewMode}-view`);
    }
}

/**
 * Update statistics panel
 */
function updateStatistics(data) {
    // Count plants, insects, etc.
    let plantsCount = 0;
    let insectsCount = 0;
    let totalHumidity = 0;
    let maturePlantsCount = 0;

    data.parcelles.forEach(parcelle => {
        plantsCount += parcelle.plantes ? parcelle.plantes.length : 0;
        insectsCount += parcelle.insectes ? parcelle.insectes.length : 0;
        totalHumidity += parcelle.tauxHumidite;

        // Count mature plants
        if (parcelle.plantes) {
            maturePlantsCount += parcelle.plantes.filter(plant => plant.estMature).length;
        }
    });

    // Calculate average humidity
    const avgHumidity = data.parcelles.length > 0 ? Math.round(totalHumidity / data.parcelles.length) : 0;

    // Update statistics panel
    $('#stats-plantes').text(plantsCount);
    $('#stats-insectes').text(insectsCount);
    $('#stats-humidite').text(`${avgHumidity}%`);
    $('#stats-plantes-matures').text(maturePlantsCount);
}

/**
 * Enable manual treatment buttons
 */
function enableManualTreatmentButtons() {
    $('#manual-water, #manual-insecticide, #manual-fertilizer').prop('disabled', false);
}

/**
 * Disable manual treatment buttons
 */
function disableManualTreatmentButtons() {
    $('#manual-water, #manual-insecticide, #manual-fertilizer').prop('disabled', true);
}

/**
 * Show treatment animation
 */
function showTreatmentAnimation(parcelleId, treatmentType) {
    const cell = $(`#parcelle-${parcelleId}`);
    const deviceElement = cell.find('.device-container');

    if (deviceElement.length === 0) return;

    const radius = cell.find('.device-radius').width();
    const centerX = deviceElement.offset().left + deviceElement.width() / 2;
    const centerY = deviceElement.offset().top + deviceElement.height() / 2;

    // Create the animation element
    const animationElement = $('<div></div>')
        .addClass(`treatment-effect ${treatmentType}`);

    // Set position and size
    animationElement.css({
        top: centerY - radius / 2,
        left: centerX - radius / 2,
        width: radius,
        height: radius
    });

    // Add to container and remove after animation
    $('#treatment-animation-container').append(animationElement);

    // Remove after animation completes
    setTimeout(() => {
        animationElement.remove();
    }, 2000);
}