// src/components/PotagerGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ParcelleItem from './ParcelleItem';
import PlantInfo from './PlantInfo';
import InsectInfo from './InsectInfo';
import DeviceConfig from './DeviceConfig';
import '../styles/PotagerGrid.css';

const PotagerGrid = ({ etatPotager, onRefresh }) => {
    const [selectedParcelle, setSelectedParcelle] = useState(null);
    const [activeTab, setActiveTab] = useState('plantes');
    const [gridData, setGridData] = useState([]);

    // Traiter les données pour les adapter à l'affichage de la grille
    const processGridData = useCallback(() => {
        if (!etatPotager || !etatPotager.parcelles) return;

        console.log("Données du potager reçues:", etatPotager);

        // Récupérer largeur et hauteur de la grille
        // Nous n'utilisons pas directement ces variables dans la fonction,
        // mais elles sont calculées pour le contexte
        const largeurPotager = etatPotager.largeur || 5;
        const hauteurPotager = etatPotager.hauteur || 5;

        // Réorganiser les parcelles dans une grille appropriée
        const newGridData = [];

        // Utiliser les parcelles existantes
        for (let i = 0; i < etatPotager.parcelles.length; i++) {
            const parcelle = etatPotager.parcelles[i];

            // Vérifier si coordX/coordY sont disponibles, sinon utiliser x/y
            const x = parcelle.coordX !== undefined ? parcelle.coordX : parcelle.x;
            const y = parcelle.coordY !== undefined ? parcelle.coordY : parcelle.y;

            // Créer une copie de la parcelle avec des coordonnées correctes
            const processedParcelle = {
                ...parcelle,
                coordX: x,
                coordY: y,
                x: x,
                y: y,
                // Assurer que ces propriétés existent
                tauxHumidite: parcelle.tauxHumidite || 0,
                plantes: parcelle.plantes || [],
                insectes: parcelle.insectes || []
            };

            newGridData.push(processedParcelle);
        }

        console.log("Données de grille transformées:", newGridData);
        setGridData(newGridData);

        // Si une parcelle est sélectionnée, mettre à jour la sélection avec les nouvelles données
        if (selectedParcelle) {
            const updatedSelectedParcelle = newGridData.find(p =>
                p.id === selectedParcelle.id ||
                (p.coordX === selectedParcelle.coordX && p.coordY === selectedParcelle.coordY)
            );

            if (updatedSelectedParcelle) {
                setSelectedParcelle(updatedSelectedParcelle);
            }
        }
    }, [etatPotager, selectedParcelle]);

    // Processe les données lorsque etatPotager change
    useEffect(() => {
        processGridData();
    }, [etatPotager, processGridData]);

    if (!etatPotager || !etatPotager.parcelles) {
        return <div className="empty-grid">Aucune donnée de potager disponible</div>;
    }

    // Find maximum x and y coordinates to determine grid size
    const maxX = etatPotager.largeur - 1 || 4;  // Default to 5x5 grid
    const maxY = etatPotager.hauteur - 1 || 4;

    // Create a grid with the proper dimensions
    const gridStyle = {
        gridTemplateColumns: `repeat(${maxX + 1}, 1fr)`,
        gridTemplateRows: `repeat(${maxY + 1}, 1fr)`
    };

    // Handle clicking on a parcelle
    const handleParcelleClick = (parcelle) => {
        console.log("Parcelle clicked:", parcelle);
        setSelectedParcelle(parcelle);
        setActiveTab('plantes'); // Default to plants tab
    };

    // Handle closing info panels
    const handleCloseInfoPanel = () => {
        setSelectedParcelle(null);
    };

    // Render the parcelles in a grid
    const renderGrid = () => {
        const gridCells = [];

        // Create a position-based lookup map for quick access
        const parcelleMap = {};
        gridData.forEach(p => {
            parcelleMap[`${p.coordX}-${p.coordY}`] = p;
        });

        for (let y = 0; y <= maxY; y++) {
            for (let x = 0; x <= maxX; x++) {
                const key = `${x}-${y}`;
                const parcelle = parcelleMap[key];

                if (parcelle) {
                    gridCells.push(
                        <ParcelleItem
                            key={key}
                            parcelle={parcelle}
                            selected={selectedParcelle && selectedParcelle.id === parcelle.id}
                            onClick={() => handleParcelleClick(parcelle)}
                        />
                    );
                } else {
                    // Empty cell as placeholder
                    gridCells.push(
                        <div
                            key={key}
                            className="parcelle-item empty"
                            style={{ gridColumn: x + 1, gridRow: y + 1 }}
                        />
                    );
                }
            }
        }

        return gridCells;
    };

    return (
        <div className="potager-container">
            <div className="potager-info">
                <div className="potager-stats">
                    <span>Dimensions: {maxX + 1}x{maxY + 1}</span>
                    <span>Pas de simulation: {etatPotager.pasSimulation || 0}</span>
                </div>
            </div>

            <div className="potager-grid" style={gridStyle}>
                {renderGrid()}
            </div>

            {selectedParcelle && (
                <div className="parcelle-details-panel">
                    <div className="panel-header">
                        <h3>Parcelle ({selectedParcelle.coordX}, {selectedParcelle.coordY})</h3>
                        <button className="close-button" onClick={handleCloseInfoPanel}>×</button>
                    </div>

                    <div className="panel-content">
                        <div className="parcelle-info">
                            <p><strong>Taux d'humidité:</strong> {selectedParcelle.tauxHumidite.toFixed(1)}%</p>
                            <p><strong>Catégorie:</strong> {selectedParcelle.categorieHumidite || 'Non définie'}</p>
                        </div>

                        <div className="panel-tabs">
                            <button
                                className={`panel-tab ${activeTab === 'plantes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('plantes')}
                            >
                                🌱 Plantes ({selectedParcelle.plantes?.length || 0})
                            </button>

                            <button
                                className={`panel-tab ${activeTab === 'insectes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('insectes')}
                            >
                                🐛 Insectes ({selectedParcelle.insectes?.length || 0})
                            </button>

                            <button
                                className={`panel-tab ${activeTab === 'dispositif' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dispositif')}
                            >
                                💧 Dispositif
                            </button>
                        </div>

                        <div className="panel-details">
                            {activeTab === 'plantes' && (
                                <PlantInfo
                                    parcelleId={selectedParcelle.id}
                                    plantes={selectedParcelle.plantes || []}
                                    onUpdate={onRefresh}
                                />
                            )}

                            {activeTab === 'insectes' && (
                                <InsectInfo
                                    parcelleId={selectedParcelle.id}
                                    insectes={selectedParcelle.insectes || []}
                                    onUpdate={onRefresh}
                                />
                            )}

                            {activeTab === 'dispositif' && (
                                <DeviceConfig
                                    parcelleId={selectedParcelle.id}
                                    dispositif={selectedParcelle.dispositifTraitement}
                                    onUpdate={onRefresh}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PotagerGrid;