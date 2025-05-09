/**
 * Parcelle Module
 * This file handles the visualization and interaction with garden parcelles.
 */

/**
 * Show parcelle details in the detail panel
 */
function showParcelleDetails(parcelle) {
    // Update title
    $('#detail-panel-title').text(`Parcelle (${parcelle.x},${parcelle.y})`);

    // Create detail content
    let content = `
        <div class="detail-section">
            <h6>Informations générales</h6>
            <div class="detail-panel-item">
                <div class="icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div>
                    <div>Position: (${parcelle.x}, ${parcelle.y})</div>
                    <div>Humidité: ${Math.round(parcelle.tauxHumidite)}%</div>
                </div>
            </div>
        </div>
    `;

    // Add plants section if there are plants
    if (parcelle.plantes && parcelle.plantes.length > 0) {
        content += `
            <div class="detail-section mt-3">
                <h6>Plantes (${parcelle.plantes.length})</h6>
                <div class="detail-list">
        `;

        parcelle.plantes.forEach(plante => {
            const matureText = plante.estMature ? 'Mature' : `${plante.age}/${plante.ageMaturite}`;
            const drageonnanteText = plante.estDrageonnante ? 'Drageonnante' : 'Non-drageonnante';

            content += `
                <div class="detail-panel-item">
                    <div class="icon plant-icon">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <div>
                        <div><strong>${plante.espece}</strong></div>
                        <div>Âge: ${matureText}</div>
                        <div>${drageonnanteText}</div>
                    </div>
                </div>
            `;
        });

        content += `
                </div>
            </div>
        `;
    }

    // Add insects section if there are insects
    if (parcelle.insectes && parcelle.insectes.length > 0) {
        content += `
            <div class="detail-section mt-3">
                <h6>Insectes (${parcelle.insectes.length})</h6>
                <div class="detail-list">
        `;

        parcelle.insectes.forEach(insecte => {
            const sexeText = insecte.sexe === 'M' ? 'Mâle' : 'Femelle';
            const santeText = insecte.sante > 7 ? 'Bonne santé' : (insecte.sante > 4 ? 'Santé moyenne' : 'Mauvaise santé');

            content += `
                <div class="detail-panel-item">
                    <div class="icon insect-icon">
                        <i class="fas fa-bug"></i>
                    </div>
                    <div>
                        <div><strong>${insecte.espece}</strong></div>
                        <div>${sexeText} - ${santeText} (${insecte.sante}/10)</div>
                        <div>Mobilité: ${insecte.mobilite}, Résistance: ${insecte.resistanceInsecticide}</div>
                    </div>
                </div>
            `;
        });

        content += `
                </div>
            </div>
        `;
    }

    // Add device section if there is a device
    if (parcelle.dispositifTraitement) {
        content += `
            <div class="detail-section mt-3">
                <h6>Dispositif de traitement</h6>
                <div class="detail-panel-item">
                    <div class="icon device-icon">
                        <i class="fas fa-shower"></i>
                    </div>
                    <div>
                        <div>Rayon d'action: ${parcelle.dispositifTraitement.rayon} parcelles</div>
                        <div>Programmes: ${parcelle.dispositifTraitement.programmesActifs.length}</div>
                    </div>
                </div>
        `;

        // Add programs if there are any
        if (parcelle.dispositifTraitement.programmesActifs && parcelle.dispositifTraitement.programmesActifs.length > 0) {
            content += `<div class="programmes-list mt-2">`;

            parcelle.dispositifTraitement.programmesActifs.forEach(programme => {
                let typeIcon = 'tint';
                let typeClass = 'text-primary';

                if (programme.typeTraitement === 'INSECTICIDE') {
                    typeIcon = 'skull-crossbones';
                    typeClass = 'text-danger';
                } else if (programme.typeTraitement === 'ENGRAIS') {
                    typeIcon = 'leaf';
                    typeClass = 'text-success';
                }

                content += `
                    <div class="programme-item small">
                        <i class="fas fa-${typeIcon} ${typeClass} me-1"></i>
                        ${programme.typeTraitement.toLowerCase()} - début: ${programme.instantDebut}, durée: ${programme.duree}
                    </div>
                `;
            });

            content += `</div>`;
        }

        content += `
            </div>
        `;
    }

    // Add action buttons
    content += `
        <div class="action-buttons mt-3">
            <div class="btn-group w-100">
                <button class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#add-plant-modal">
                    <i class="fas fa-seedling me-1"></i> Ajouter plante
                </button>
                <button class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#add-insect-modal">
                    <i class="fas fa-bug me-1"></i> Ajouter insecte
                </button>
            </div>
    `;

    // Add device button only if there is no device yet
    if (!parcelle.dispositifTraitement) {
        content += `
            <button class="btn btn-sm btn-outline-primary w-100 mt-2" data-bs-toggle="modal" data-bs-target="#add-device-modal">
                <i class="fas fa-shower me-1"></i> Ajouter dispositif
            </button>
        `;
    }

    content += `</div>`;

    // Set content
    $('#detail-panel-content').html(content);
}