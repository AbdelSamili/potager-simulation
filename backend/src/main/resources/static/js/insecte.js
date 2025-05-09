/**
 * Insecte Module
 * This file handles the visualization and interaction with garden insects.
 */

/**
 * Show detailed information about an insect
 */
function showInsecteDetails(insecte) {
    // Fetch complete insect information
    $.ajax({
        url: `/insectes/${insecte.id}`,
        method: 'GET',
        success: function(data) {
            displayInsecteDetails(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching insect details:', error);
            // Use the data we already have
            displayInsecteDetails(insecte);
        }
    });
}

/**
 * Display insect details in the detail panel
 */
function displayInsecteDetails(insecte) {
    // Update title
    $('#detail-panel-title').text(`Insecte: ${insecte.espece}`);

    // Determine health status
    let santeStatus = 'Bonne santé';
    let santeClass = 'text-success';

    if (insecte.sante <= 3) {
        santeStatus = 'Mauvaise santé';
        santeClass = 'text-danger';
    } else if (insecte.sante <= 7) {
        santeStatus = 'Santé moyenne';
        santeClass = 'text-warning';
    }

    // Create content
    const content = `
        <div class="insect-details">
            <div class="insect-icon-large mb-3 text-center">
                <div class="insect-image ${insecte.sexe === 'M' ? 'male' : 'female'}">
                    <i class="fas fa-bug fa-3x ${insecte.sexe === 'M' ? 'text-danger' : 'text-danger'}"></i>
                </div>
                <h5 class="mt-2">${insecte.espece}</h5>
                <div class="badge ${insecte.sexe === 'M' ? 'bg-primary' : 'bg-info'}">${insecte.sexe === 'M' ? 'Mâle' : 'Femelle'}</div>
            </div>
            
            <div class="insect-info">
                <div class="info-item mt-3">
                    <label class="form-label mb-1">Santé: <span class="${santeClass}">${santeStatus} (${insecte.sante}/10)</span></label>
                    <div class="progress">
                        <div class="progress-bar ${insecte.sante > 7 ? 'bg-success' : (insecte.sante > 3 ? 'bg-warning' : 'bg-danger')}" 
                             role="progressbar" style="width: ${insecte.sante * 10}%" 
                             aria-valuenow="${insecte.sante * 10}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                </div>
                
                <div class="info-item mt-3">
                    <label class="form-label mb-1">Résistance aux insecticides: ${(insecte.resistanceInsecticide * 100).toFixed(0)}%</label>
                    <div class="progress">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${insecte.resistanceInsecticide * 100}%" 
                             aria-valuenow="${insecte.resistanceInsecticide * 100}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                </div>
                
                <div class="info-item mt-3">
                    <label class="form-label mb-1">Mobilité: ${(insecte.mobilite * 100).toFixed(0)}%</label>
                    <div class="progress">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${insecte.mobilite * 100}%" 
                             aria-valuenow="${insecte.mobilite * 100}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                </div>
                
                <div class="info-item mt-3">
                    <div class="alert ${insecte.passSansManger > 0 ? (insecte.passSansManger > 3 ? 'alert-danger' : 'alert-warning') : 'alert-success'} p-2">
                        <div class="d-flex align-items-center">
                            <i class="fas ${insecte.passSansManger > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2"></i>
                            <div>
                                ${insecte.passSansManger > 0
        ? `Sans nourriture depuis ${insecte.passSansManger} pas${insecte.passSansManger > 1 ? 's' : ''} (mort à 5 pas)`
        : 'Bien nourri'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="insect-location mt-3">
                <h6>Emplacement</h6>
                <div class="info-item d-flex justify-content-between">
                    <span>Parcelle:</span>
                    <span>(${insecte.parcelleCoordX}, ${insecte.parcelleCoordY})</span>
                </div>
                <button class="btn btn-sm btn-outline-primary mt-2 w-100" onclick="showParcelleDetails({id: ${insecte.parcelleId}, x: ${insecte.parcelleCoordX}, y: ${insecte.parcelleCoordY}})">
                    <i class="fas fa-map-marker-alt me-1"></i> Voir la parcelle
                </button>
            </div>
            
            <div class="insect-actions mt-3">
                <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteInsecte(${insecte.id})">
                    <i class="fas fa-trash me-1"></i> Supprimer l'insecte
                </button>
            </div>
        </div>
    `;

    // Set content
    $('#detail-panel-content').html(content);
}

/**
 * Delete an insect
 */
function deleteInsecte(insecteId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet insecte ?')) {
        $.ajax({
            url: `/insectes/${insecteId}`,
            method: 'DELETE',
            success: function() {
                showAlert('Insecte supprimé avec succès', 'success');
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
                console.error('Error deleting insect:', error);
                showAlert('Erreur lors de la suppression de l\'insecte', 'danger');
            }
        });
    }
}