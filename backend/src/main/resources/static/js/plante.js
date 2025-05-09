/**
 * Plante Module
 * This file handles the visualization and interaction with garden plants.
 */

/**
 * Show detailed information about a plant
 */
function showPlanteDetails(plante) {
    // Fetch complete plant information
    $.ajax({
        url: `/plantes/${plante.id}`,
        method: 'GET',
        success: function(data) {
            displayPlanteDetails(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching plant details:', error);
            // Use the data we already have
            displayPlanteDetails(plante);
        }
    });
}

/**
 * Display plant details in the detail panel
 */
function displayPlanteDetails(plante) {
    // Update title
    $('#detail-panel-title').text(`Plante: ${plante.espece}`);

    // Calculate maturity percentage
    const maturitePercent = plante.ageMaturite > 0 ? Math.min(100, Math.round((plante.age / plante.ageMaturite) * 100)) : 100;

    // Create content
    const content = `
        <div class="plant-details">
            <div class="plant-icon-large mb-3 text-center">
                <div class="plant-image ${plante.estMature ? 'mature' : ''} ${plante.estDrageonnante ? 'drageon' : ''}">
                    <i class="fas fa-seedling fa-3x ${plante.estMature ? 'text-success' : 'text-success'}"></i>
                </div>
                <h5 class="mt-2">${plante.espece}</h5>
            </div>
            
            <div class="plant-info">
                <div class="info-item d-flex justify-content-between">
                    <span>Âge:</span>
                    <span>${plante.age}</span>
                </div>
                <div class="info-item d-flex justify-content-between">
                    <span>Âge de maturité:</span>
                    <span>${plante.ageMaturite}</span>
                </div>
                <div class="info-item d-flex justify-content-between">
                    <span>Statut:</span>
                    <span>${plante.estMature ? 'Mature' : 'En croissance'}</span>
                </div>
                <div class="info-item d-flex justify-content-between">
                    <span>Type:</span>
                    <span>${plante.estDrageonnante ? 'Drageonnante' : 'Non-drageonnante'}</span>
                </div>
                ${plante.estDrageonnante ? `
                <div class="info-item d-flex justify-content-between">
                    <span>Probabilité de colonisation:</span>
                    <span>${plante.probabiliteColonisation.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="info-item mt-3">
                    <label class="form-label mb-1">Progression vers la maturité:</label>
                    <div class="progress">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${maturitePercent}%" 
                             aria-valuenow="${maturitePercent}" aria-valuemin="0" aria-valuemax="100">
                            ${maturitePercent}%
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="plant-location mt-3">
                <h6>Emplacement</h6>
                <div class="info-item d-flex justify-content-between">
                    <span>Parcelle:</span>
                    <span>(${plante.parcelleCoordX}, ${plante.parcelleCoordY})</span>
                </div>
                <button class="btn btn-sm btn-outline-primary mt-2 w-100" onclick="showParcelleDetails({id: ${plante.parcelleId}, x: ${plante.parcelleCoordX}, y: ${plante.parcelleCoordY}})">
                    <i class="fas fa-map-marker-alt me-1"></i> Voir la parcelle
                </button>
            </div>
            
            <div class="plant-actions mt-3">
                <button class="btn btn-sm btn-outline-danger w-100" onclick="deletePlante(${plante.id})">
                    <i class="fas fa-trash me-1"></i> Supprimer la plante
                </button>
            </div>
        </div>
    `;

    // Set content
    $('#detail-panel-content').html(content);
}

/**
 * Delete a plant
 */
function deletePlante(planteId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette plante ?')) {
        $.ajax({
            url: `/plantes/${planteId}`,
            method: 'DELETE',
            success: function() {
                showAlert('Plante supprimée avec succès', 'success');
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
                console.error('Error deleting plant:', error);
                showAlert('Erreur lors de la suppression de la plante', 'danger');
            }
        });
    }
}