// src/components/ParcelleItem.jsx
import React from 'react';
import { getHumidityColor, getPlantColor, getInsectColor } from '../utils/helpers';
import '../styles/ParcelleItem.css';

const ParcelleItem = ({ parcelle, selected, onClick }) => {
    const { coordX, coordY, tauxHumidite, plantes, insectes, dispositifTraitement } = parcelle;

    const gridStyle = {
        gridColumn: coordX + 1,
        gridRow: coordY + 1
    };

    const humidityPercentage = typeof tauxHumidite === 'number' ?
        (tauxHumidite <= 1 ? tauxHumidite * 100 : tauxHumidite) : 0;
    const humidityColor = getHumidityColor(humidityPercentage);

    const plantesByEspece = {};
    if (plantes && plantes.length > 0) {
        plantes.forEach(plante => {
            if (!plantesByEspece[plante.espece]) {
                plantesByEspece[plante.espece] = 0;
            }
            plantesByEspece[plante.espece]++;
        });
    }

    const insectesByEspece = {};
    if (insectes && insectes.length > 0) {
        insectes.forEach(insecte => {
            if (!insectesByEspece[insecte.espece]) {
                insectesByEspece[insecte.espece] = 0;
            }
            insectesByEspece[insecte.espece]++;
        });
    }

    const hasFruitingPlants = plantes && plantes.some(plante => plante.age >= plante.ageMaturite);
    const maxPlantAge = plantes && plantes.length > 0
        ? Math.max(...plantes.map(p => p.age || 0))
        : 0;
    const growthStage = Math.min(3, Math.floor(maxPlantAge / 10));
    const formattedHumidity = humidityPercentage.toFixed(0);

    return (
        <div
            className={`parcelle-item ${selected ? 'selected' : ''}`}
            style={gridStyle}
            onClick={onClick}
            title={`Parcelle (${coordX}, ${coordY}) - Humidité: ${formattedHumidity}%`}
        >
            <div
                className="humidity-background"
                style={{ backgroundColor: humidityColor, opacity: humidityPercentage / 100 }}
            />

            <div className="humidity-indicator">
                {formattedHumidity}%
            </div>

            {Object.entries(plantesByEspece).length > 0 && (
                <div className="plant-indicators">
                    {Object.entries(plantesByEspece).map(([espece, count]) => (
                        <div
                            key={`plant-${espece}`}
                            className="plant-indicator"
                            style={{ backgroundColor: getPlantColor(espece) }}
                            title={`${espece}: ${count}`}
                        >
                            <span className="count">{count}</span>
                        </div>
                    ))}
                </div>
            )}

            {Object.entries(insectesByEspece).length > 0 && (
                <div className="insect-indicators">
                    {Object.entries(insectesByEspece).map(([espece, count]) => (
                        <div
                            key={`insect-${espece}`}
                            className="insect-indicator"
                            style={{ backgroundColor: getInsectColor(espece) }}
                            title={`${espece}: ${count}`}
                        >
                            <span className="count">{count}</span>
                        </div>
                    ))}
                </div>
            )}

            {plantes && plantes.length > 0 && (
                <div className={`growth-stage stage-${growthStage}`}>
                    {hasFruitingPlants && <div className="fruits"></div>}
                </div>
            )}

            {dispositifTraitement && (
                <div className="device-indicator" title="Dispositif de traitement">
                    {dispositifTraitement?.typesTraitement?.includes('EAU') && <span className="water-icon">💧</span>}
                    {dispositifTraitement?.typesTraitement?.includes('ENGRAIS') && <span className="fertilizer-icon">🌱</span>}
                    {dispositifTraitement?.typesTraitement?.includes('INSECTICIDE') && <span className="insecticide-icon">🐛</span>}
                </div>
            )}

            <div className="coords-label">{coordX},{coordY}</div>
        </div>
    );
};

export default ParcelleItem;
