// src/components/ConfigPanel.jsx
import React, { useState } from 'react';
import { ESPECES_PLANTES, ESPECES_INSECTES } from '../utils/constants';
import { getPlantColor, getInsectColor } from '../utils/helpers';
import '../styles/ConfigPanel.css';

const ConfigPanel = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`config-panel ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="panel-header" onClick={() => setExpanded(!expanded)}>
                <h2>Informations</h2>
                <span className={`expand-icon ${expanded ? 'up' : 'down'}`}>▼</span>
            </div>

            {expanded && (
                <div className="panel-content">
                    <div className="config-section">
                        <h3>Espèces de Plantes</h3>
                        <div className="species-list">
                            {ESPECES_PLANTES.map(espece => (
                                <div key={espece} className="species-item">
                                    <span className="species-color" style={{ backgroundColor: getPlantColor(espece) }}></span>
                                    <span className="species-name">{espece}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>Espèces d'Insectes</h3>
                        <div className="species-list">
                            {ESPECES_INSECTES.map(espece => (
                                <div key={espece} className="species-item">
                                    <span className="species-color" style={{ backgroundColor: getInsectColor(espece) }}></span>
                                    <span className="species-name">{espece}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>Paramètres de Simulation</h3>
                        <p className="simulation-info">
                            La simulation est divisée en pas de temps, chaque pas représentant une minute dans le potager virtuel.
                        </p>
                        <ul className="simulation-rules">
                            <li>Les plantes gagnent 1 point d'âge à chaque pas</li>
                            <li>Les plantes produisent des fruits après avoir atteint leur âge de maturité</li>
                            <li>Les plantes drageonnantes peuvent coloniser les parcelles voisines</li>
                            <li>Les insectes peuvent se déplacer entre parcelles selon leur mobilité</li>
                            <li>Les insectes doivent se nourrir de plantes ou perdent 1 point de santé</li>
                            <li>Les dispositifs appliquent des traitements selon leurs programmes</li>
                        </ul>
                    </div>

                    <div className="config-section">
                        <h3>À propos du projet</h3>
                        <p className="about-info">
                            Ce projet de simulation d'un potager automatisé a été développé dans le cadre de la
                            licence Ingénierie des systèmes d'information et réseaux à l'École supérieure de Technologie
                            de Safi - Université Cadi Ayyad-Marrakech.
                        </p>
                        <p className="about-info">
                            L'objectif est d'évaluer l'efficacité d'un système automatisé d'arrosage,
                            ainsi que des traitements associés tels que les insecticides et les engrais.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigPanel;