/**
 * Dispositif Module
 * This file handles the visualization and interaction with garden treatment devices.
 */

/**
 * Show detailed information about a treatment device
 */
function showDispositifDetails(dispositif) {
    // Fetch complete device information
    $.ajax({
        url: `/dispositifs/${dispositif.id}`,
        method: 'GET',
        success: function(data) {
            displayDispositifDetails(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching device details:', error);
            // Use the data we already have
            displayDispositifDetails(dispositif);
        }
    });
}

/**
 * Display device details in the detail panel
 */
function displayDispositifDetails(dispositif) {
    // Update title
    $('#detail-panel-title').text('Dispositif de traitement');

    // Create content
    let content = `
        <div class="device-details">
            <div class="device-icon-large mb-3 text-center">
                <div class="device-image">
                    <i class="fas fa-shower fa-3x text-primary"></i>
                </div>
                <h5 class="mt-2">Dispositif de traitement</h5>
                <div class="badge bg-primary">Rayon d'action: ${dispositif.rayon} parcelles</div>
            </div>
            
            <div class="device-info mt-3">
                <h6>Programmes actifs</h6>
    `;

    // Add programmes information
    if (dispositif.programmesActifs && dispositif.programmesActifs.length > 0) {
        content += `<div class="programmes-list">`;

        dispositif.programmesActifs.forEach(programme => {
            // Determine program type and style
            let typeIcon, typeClass, typeName;

            switch (programme.typeTraitement) {
                case 'EAU':
                    typeIcon = 'tint';
                    typeClass = 'primary';
                    typeName = 'Arrosage';
                    break;
                case 'INSECTICIDE':
                    typeIcon = 'skull-crossbones';
                    typeClass = 'danger';
                    typeName = 'Insecticide';
                    break;
                case 'ENGRAIS':
                    typeIcon = 'leaf';
                    typeClass = 'success';
                    typeName = 'Engrais';
                    break;
                default:
                    typeIcon = 'question-circle';
                    typeClass = 'secondary';
                    typeName = programme.typeTraitement;
            }

            // Calculate status
            let statusText, statusClass;
            const isActive = programme.instantDebut <= gardenState.currentStep &&
                (programme.instantDebut + programme.duree) > gardenState.currentStep;

            if (isActive) {
                statusText = 'Actif';
                statusClass = 'success';
            } else if (programme.instantDebut > gardenState.currentStep) {
                statusText = 'À venir';
                statusClass = 'warning';
            } else {
                statusText = 'Terminé';
                statusClass = 'secondary';
            }

            // Add programme
            content += `
                <div class="card mb-2">
                    <div class="card-body p-2">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <i class="fas fa-${typeIcon} text-${typeClass} me-1"></i> 
                                <strong>${typeName}</strong>
                            </div>
                            <span class="badge bg-${statusClass}">${statusText}</span>
                        </div>
                        <div class="programme-timeline mt-2">
                            <div class="d-flex justify-content-between small text-muted">
                                <span>Début: ${programme.instantDebut}</span>
                                <span>Fin: ${programme.instantDebut + programme.duree}</span>
                            </div>
                            <div class="progress mt-1" style="height: 8px;">
                                <div class="progress-bar bg-${typeClass}" 
                                     role="progressbar" 
                                     style="width: ${isActive ? ((gardenState.currentStep - programme.instantDebut) * 100 / programme.duree) : (programme.instantDebut > gardenState.currentStep ? 0 : 100)}%">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        content += `</div>`;
    } else {
        content += `
            <div class="alert alert-info">
                Aucun programme actif. Ajoutez un programme pour automatiser les traitements.
            </div>
        `;
    }

    // Manual treatments
    content += `
        <div class="manual-treatments mt-3">
            <h6>Traitements manuels</h6>
            <div class="btn-group w-100">
                <button class="btn btn-outline-primary" onclick="applyManualTreatment(${dispositif.parcelleId}, 'EAU')">
                    <i class="fas fa-tint me-1"></i> Eau
                </button>
                <button class="btn btn-outline-danger" onclick="applyManualTreatment(${dispositif.parcelleId}, 'INSECTICIDE')">
                    <i class="fas fa-skull-crossbones me-1"></i> Insecticide
                </button>
                <button class="btn btn-outline-success" onclick="applyManualTreatment(${dispositif.parcelleId}, 'ENGRAIS')">
                    <i class="fas fa-leaf me-1"></i> Engrais
                </button>
            </div>
        </div>
        
        <div class="device-location mt-3">
            <h6>Emplacement</h6>
            <div class="info-item d-flex justify-content-between">
                <span>Parcelle:</span>
                <span>(${dispositif.parcelleCoordX}, ${dispositif.parcelleCoordY})</span>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2 w-100" onclick="showParcelleDetails({id: ${dispositif.parcelleId}, x: ${dispositif.parcelleCoordX}, y: ${dispositif.parcelleCoordY}})">
                <i class="fas fa-map-marker-alt me-1"></i> Voir la parcelle
            </button>
        </div>
        
        <div class="device-actions mt-3">
            <button class="btn btn-sm btn-outline-primary w-100 mb-2" onclick="showAddProgrammeModal(${dispositif.id})">
                <i class="fas fa-plus me-1"></i> Ajouter un programme
            </button>
            <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteDispositif(${dispositif.id})">
                <i class="fas fa-trash me-1"></i> Supprimer le dispositif
            </button>
        </div>
    `;

    // Set content
    $('#detail-panel-content').html(content);
}

/**
 * Show modal to add a programme to a device
 */
function showAddProgrammeModal(dispositifId) {
    // Clear previous programmes
    $('#programmes-container').empty();

    // Add a programme field
    addProgrammeField();

    // Update confirm button to add programme to the specific device
    $('#confirm-add-device').off('click').on('click', function() {
        addProgrammesToDevice(dispositifId, getProgrammesFromForm());
        $('#add-device-modal').modal('hide');
    });

    // Update modal title
    $('#add-device-modal-label').text('Ajouter un programme au dispositif');

    // Show only the programmes section
    $('#add-device-form .mb-3').hide();
    $('#add-device-form .mb-3:nth-child(2)').show();

    // Show the modal
    $('#add-device-modal').modal('show');
}

/**
 * Delete a treatment device
 */
function deleteDispositif(dispositifId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dispositif de traitement ?')) {
        $.ajax({
            url: `/dispositifs/${dispositifId}`,
            method: 'DELETE',
            success: function() {
                showAlert('Dispositif supprimé avec succès', 'success');
                // Go back to parcelle view
                const cell = gardenState.selectedCell;
                if (cell) {
                    // Update detail panel with parcelle information
                    updateDetailPanel(cell);
                }
                // Refresh garden state
                fetchGardenState();
            },
            error: function(xhr, status, error) {
                console.error('Error deleting device:', error);
                showAlert('Erreur lors de la suppression du dispositif', 'danger');
            }
        });
    }
}