// src/components/DeviceConfig.jsx
import React, { useState } from 'react';
import { TYPES_TRAITEMENT } from '../utils/constants';
import * as api from '../services/api';
import '../styles/DeviceConfig.css';

const DeviceConfig = ({ parcelleId, dispositif, onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddProgramForm, setShowAddProgramForm] = useState(false);
    const [newDevice, setNewDevice] = useState({
        rayon: 1
    });
    const [newProgram, setNewProgram] = useState({
        instantDebut: 0,
        duree: 10,
        typeTraitement: TYPES_TRAITEMENT.EAU
    });

    // Normalize dispositif data for compatibility
    const normalizedDispositif = dispositif ? {
        ...dispositif,
        typesTraitement: ['EAU', 'ENGRAIS', 'INSECTICIDE'],
        programmes: dispositif.programmesActifs || []
    } : null;

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            // Add parcelleId to the device data
            const deviceData = {
                ...newDevice
            };

            await api.createDispositifSurParcelle(parcelleId, deviceData);

            // Reset form and refresh data
            setNewDevice({
                rayon: 1
            });
            setShowAddForm(false);

            // Notify parent to update
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding device:', error);
            alert('Erreur lors de l\'ajout du dispositif');
        }
    };

    const handleAddProgram = async (e) => {
        e.preventDefault();
        try {
            if (!dispositif) {
                throw new Error("Aucun dispositif disponible pour ajouter un programme");
            }

            // Submit program to the device
            const programData = {
                ...newProgram
            };

            await api.ajouterProgramme(dispositif.id, programData);

            // Reset form and refresh data
            setNewProgram({
                instantDebut: 0,
                duree: 10,
                typeTraitement: TYPES_TRAITEMENT.EAU
            });
            setShowAddProgramForm(false);

            // Notify parent to update
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding program:', error);
            alert('Erreur lors de l\'ajout du programme');
        }
    };

    const handleDeleteProgram = async (programId) => {
        if (!dispositif) {
            console.error("Aucun dispositif disponible pour supprimer un programme");
            return;
        }

        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programme?')) {
            try {
                await api.supprimerProgramme(dispositif.id, programId);
                // Notify parent to update
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error('Error deleting program:', error);
                alert('Erreur lors de la suppression du programme');
            }
        }
    };

    const handleDeviceInputChange = (e) => {
        const { name, value, type } = e.target;
        setNewDevice({
            ...newDevice,
            [name]: type === 'number' ? parseFloat(value) : value
        });
    };

    const handleProgramInputChange = (e) => {
        const { name, value, type } = e.target;
        setNewProgram({
            ...newProgram,
            [name]: type === 'number' ? parseInt(value, 10) : value
        });
    };

    // Format time in minutes as hours:minutes
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    return (
        <div className="device-config">
            {!normalizedDispositif ? (
                !showAddForm ? (
                    <div className="no-device">
                        <p>Aucun dispositif de traitement sur cette parcelle</p>
                        <button
                            className="add-button"
                            onClick={() => setShowAddForm(true)}
                        >
                            + Ajouter un dispositif
                        </button>
                    </div>
                ) : (
                    <div className="add-device-form">
                        <h4>Ajouter un nouveau dispositif</h4>
                        <form onSubmit={handleAddDevice}>
                            <div className="form-group">
                                <label htmlFor="rayon">Rayon d'action:</label>
                                <input
                                    type="number"
                                    id="rayon"
                                    name="rayon"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={newDevice.rayon}
                                    onChange={handleDeviceInputChange}
                                    required
                                />
                                <div className="range-display">
                                    <span className="range-value">{newDevice.rayon}</span>
                                    <span className="range-label">parcelles</span>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-button">Ajouter</button>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )
            ) : (
                <div className="device-details">
                    <div className="device-header">
                        <h4>Dispositif de traitement</h4>
                    </div>

                    <div className="device-info">
                        <div className="device-feature">
                            <span className="feature-label">Rayon d'action:</span>
                            <span className="feature-value">{normalizedDispositif.rayon} parcelles</span>
                        </div>

                        <div className="device-feature">
                            <span className="feature-label">Types de traitement:</span>
                            <div className="feature-value treatment-types">
                                {normalizedDispositif.typesTraitement.map(type => (
                                    <span key={type} className={`treatment-type ${type.toLowerCase()}`}>
                                        {type === 'EAU' && '💧'}
                                        {type === 'ENGRAIS' && '🌱'}
                                        {type === 'INSECTICIDE' && '🐛'}
                                        {' '}{type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="programs-section">
                        <h4>Programmes d'activation</h4>

                        {normalizedDispositif.programmes && normalizedDispositif.programmes.length > 0 ? (
                            <div className="programs-list">
                                {normalizedDispositif.programmes.map(programme => (
                                    <div key={programme.id} className="program-item">
                                        <div className="program-info">
                                            <div className="program-feature">
                                                <span className="feature-label">Début:</span>
                                                <span className="feature-value">{formatTime(programme.instantDebut)}</span>
                                            </div>

                                            <div className="program-feature">
                                                <span className="feature-label">Durée:</span>
                                                <span className="feature-value">{programme.duree} min</span>
                                            </div>

                                            <div className="program-feature">
                                                <span className="feature-label">Traitement:</span>
                                                <span className={`feature-value treatment-type ${programme.typeTraitement.toLowerCase()}`}>
                                                    {programme.typeTraitement === 'EAU' && '💧'}
                                                    {programme.typeTraitement === 'ENGRAIS' && '🌱'}
                                                    {programme.typeTraitement === 'INSECTICIDE' && '🐛'}
                                                    {' '}{programme.typeTraitement}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteProgram(programme.id)}
                                            title="Supprimer ce programme"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-programs">Aucun programme défini</p>
                        )}

                        {!showAddProgramForm ? (
                            <button
                                className="add-button"
                                onClick={() => setShowAddProgramForm(true)}
                            >
                                + Ajouter un programme
                            </button>
                        ) : (
                            <div className="add-program-form">
                                <h4>Nouveau programme</h4>
                                <form onSubmit={handleAddProgram}>
                                    <div className="form-group">
                                        <label htmlFor="instantDebut">Début (minutes après minuit):</label>
                                        <input
                                            type="number"
                                            id="instantDebut"
                                            name="instantDebut"
                                            min="0"
                                            max="1439" // 23h59
                                            value={newProgram.instantDebut}
                                            onChange={handleProgramInputChange}
                                            required
                                        />
                                        <span className="time-display">{formatTime(newProgram.instantDebut)}</span>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="duree">Durée (minutes):</label>
                                        <input
                                            type="number"
                                            id="duree"
                                            name="duree"
                                            min="1"
                                            max="120"
                                            value={newProgram.duree}
                                            onChange={handleProgramInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="typeTraitement">Type de traitement:</label>
                                        <select
                                            id="typeTraitement"
                                            name="typeTraitement"
                                            value={newProgram.typeTraitement}
                                            onChange={handleProgramInputChange}
                                            required
                                        >
                                            {Object.values(TYPES_TRAITEMENT).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="submit-button">Ajouter</button>
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() => setShowAddProgramForm(false)}
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceConfig;