// src/App.js
import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Composants
import PotagerGrid from './components/PotagerGrid';
import ControlPanel from './components/ControlPanel';
import StatisticsPanel from './components/StatisticsPanel';
import ConfigPanel from './components/ConfigPanel';

// Hooks personnalisés
import useSimulation from './hooks/useSimulation';

// Styles
import './styles/App.css';

function App() {
    // Récupération des données de simulation
    const {
        etatPotager,
        isRunning,
        speed,
        currentStep,
        loading,
        error,
        startSimulation,
        stopSimulation,
        resetSimulation,
        advanceOneStep,
        setSpeed,
        fetchState
    } = useSimulation();

    // Afficher les erreurs comme notifications toast
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Rendu du potager avec gestion de l'état de chargement
    const renderPotagerGrid = () => {
        if (loading) {
            return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement du potager...</p>
                </div>
            );
        } else if (etatPotager) {
            return <PotagerGrid etatPotager={etatPotager} onRefresh={fetchState} />;
        } else {
            return (
                <div className="error-message">
                    Impossible de charger le potager. Veuillez réessayer.
                </div>
            );
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-left">
                    <h1>🌱 Potager Automatisé</h1>
                </div>

                <div className="header-center">
                    <div className={`simulation-status ${isRunning ? 'running' : 'stopped'}`}>
                        {isRunning ? 'Simulation en cours' : 'Simulation en pause'}
                    </div>
                </div>

                <div className="header-right">
                    <span className="step-counter">
                        Pas de simulation: <strong>{currentStep}</strong>
                    </span>
                </div>
            </header>

            <div className="main-content">
                {/* Section supérieure : Contrôle + Potager côte à côte */}
                <div className="top-section">
                    <div className="control-section">
                        <ControlPanel
                            isRunning={isRunning}
                            speed={speed}
                            currentStep={currentStep}
                            onStart={startSimulation}
                            onStop={stopSimulation}
                            onReset={resetSimulation}
                            onStep={advanceOneStep}
                            onSpeedChange={setSpeed}
                        />
                    </div>

                    <div className="potager-section">
                        {renderPotagerGrid()}
                    </div>
                </div>

                {/* Section du milieu : Config Panel */}
                <div className="middle-section">
                    <ConfigPanel />
                </div>

                {/* Section inférieure : Statistics Panel */}
                <div className="bottom-section">
                    <StatisticsPanel etatPotager={etatPotager} />
                </div>
            </div>

            <footer className="app-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img
                            src="/logo-uca.png"
                            alt="Logo Université"
                            className="footer-logo-img"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                    <div className="footer-text">
                        <p>
                            Université Cadi Ayyad-Marrakech | École supérieure de Technologie Safi |
                            Licence : Ingénierie des systèmes d'information et réseaux
                        </p>
                    </div>
                </div>
            </footer>

            <ToastContainer position="bottom-right" />
        </div>
    );
}

export default App;