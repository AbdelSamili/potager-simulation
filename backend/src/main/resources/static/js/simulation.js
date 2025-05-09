/**
 * Simulation Control Module
 * This file handles the interaction with the backend simulation.
 */

// Global variables
let simulationState = {
    running: false,
    speed: 1,
    selectedParcelleForAdd: null,
};

// Initialize when DOM is ready
$(document).ready(function() {
    // Initialize simulation controls
    initializeSimulationControls();

    // Initialize add element controls
    initializeAddElementControls();

    // Initialize range inputs
    initializeRangeInputs();
    initializeRangeInputs();

    // Initialize reset button
    $('#reset-simulation').on('click', resetSimulation);
});

/**
 * Initialize simulation control buttons
 */
function initializeSimulationControls() {
    // Start button
    $('#start-simulation').on('click', function() {
        startSimulation();
    });

    // Pause button
    $('#pause-simulation').on('click', function() {
        pauseSimulation();
    });

    // Step button
    $('#step-simulation').on('click', function() {
        stepSimulation();
    });

    // Speed control
    $('#simulation-speed').on('input', function() {
        updateSimulationSpeed($(this).val());
    });

    // Manual treatment buttons
    $('#manual-water').on('click', function() {
        if (gardenState.selectedParcelleId) {
            applyManualTreatment(gardenState.selectedParcelleId, 'EAU');
        }
    });

    $('#manual-insecticide').on('click', function() {
        if (gardenState.selectedParcelleId) {
            applyManualTreatment(gardenState.selectedParcelleId, 'INSECTICIDE');
        }
    });

    $('#manual-fertilizer').on('click', function() {
        if (gardenState.selectedParcelleId) {
            applyManualTreatment(gardenState.selectedParcelleId, 'ENGRAIS');
        }
    });
}

/**
 * Initialize add element controls
 */
function initializeAddElementControls() {
    // Add plant button
    $('#confirm-add-plant').on('click', function() {
        if (gardenState.selectedParcelleId) {
            addPlant(gardenState.selectedParcelleId);
        } else {
            showAlert('Veuillez sélectionner une parcelle avant d\'ajouter une plante.', 'warning');
        }
    });

    // Add insect button
    $('#confirm-add-insect').on('click', function() {
        if (gardenState.selectedParcelleId) {
            addInsect(gardenState.selectedParcelleId);
        } else {
            showAlert('Veuillez sélectionner une parcelle avant d\'ajouter un insecte.', 'warning');
        }
    });

    // Add device button
    $('#confirm-add-device').on('click', function() {
        if (gardenState.selectedParcelleId) {
            addDevice(gardenState.selectedParcelleId);
        } else {
            showAlert('Veuillez sélectionner une parcelle avant d\'ajouter un dispositif.', 'warning');
        }
    });

    // Add programme button
    $('#add-programme').on('click', function() {
        addProgrammeField();
    });
}