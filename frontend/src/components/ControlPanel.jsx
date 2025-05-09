// src/components/ControlPanel.jsx
import React from 'react';
import { SPEED_OPTIONS } from '../utils/constants';
import '../styles/ControlPanel.css';

const ControlPanel = ({
                          isRunning,
                          speed,
                          onStart,
                          onStop,
                          onReset,
                          onStep,
                          onSpeedChange
                      }) => {
    const handleSpeedChange = (e) => {
        const newSpeed = parseInt(e.target.value, 10);
        onSpeedChange(newSpeed);

        // If simulation is running, update it with the new speed
        if (isRunning) {
            onStop();
            setTimeout(() => onStart(newSpeed), 100);
        }
    };

    return (
        <div className="control-panel">
            <h2>Contrôles de Simulation</h2>

            <div className="control-buttons">
                {!isRunning ? (
                    <button
                        className="start-button"
                        onClick={() => onStart(speed)}
                        disabled={isRunning}
                    >
                        <span className="icon">▶</span>
                        Démarrer
                    </button>
                ) : (
                    <button
                        className="stop-button"
                        onClick={onStop}
                        disabled={!isRunning}
                    >
                        <span className="icon">◼</span>
                        Arrêter
                    </button>
                )}

                <button
                    className="step-button"
                    onClick={onStep}
                    disabled={isRunning}
                >
                    <span className="icon">↪</span>
                    Pas Suivant
                </button>

                <button
                    className="reset-button"
                    onClick={onReset}
                >
                    <span className="icon">↺</span>
                    Réinitialiser
                </button>
            </div>

            <div className="speed-control">
                <label htmlFor="speed-slider">
                    Vitesse de simulation: <strong>{speed}x</strong>
                </label>
                <input
                    id="speed-slider"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={speed}
                    onChange={handleSpeedChange}
                    className="speed-slider"
                />

                <div className="speed-presets">
                    {SPEED_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            className={`speed-preset ${speed === option.value ? 'active' : ''}`}
                            onClick={() => {
                                onSpeedChange(option.value);
                                if (isRunning) {
                                    onStop();
                                    setTimeout(() => onStart(option.value), 100);
                                }
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="simulation-legend">
                <h3>Légende</h3>
                <div className="legend-item">
                    <div className="legend-color humidity"></div>
                    <span>Taux d'humidité (bleu)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon plant">🌱</div>
                    <span>Plantes</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon insect">🐛</div>
                    <span>Insectes</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon device">💧</div>
                    <span>Dispositif d'arrosage</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon fertilizer">🌱</div>
                    <span>Dispositif d'engrais</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon insecticide">🐛</div>
                    <span>Dispositif d'insecticide</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon fruit">🍎</div>
                    <span>Plante produisant des fruits</span>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;