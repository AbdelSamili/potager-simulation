// src/components/PlantInfo.jsx
import React, { useState } from 'react';
import { getPlantColor } from '../utils/helpers';
import { ESPECES_PLANTES } from '../utils/constants';
import * as api from '../services/api';
import '../styles/PlantInfo.css';

const PlantInfo = ({ parcelleId, plantes = [], onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPlant, setNewPlant] = useState({
        espece: ESPECES_PLANTES[0],
        age: 0,
        ageMaturite: 20,
        estDrageonnante: false,
        probabiliteColonisation: 0.1
    });

    const handleAddPlant = async (e) => {
        e.preventDefault();
        try {
            // Add parcelleId to the plant data
            const planteData = {
                ...newPlant,
                parcelleId: parcelleId
            };

            await api.createPlante(planteData);

            // Reset form and refresh data
            setNewPlant({
                espece: ESPECES_PLANTES[0],
                age: 0,
                ageMaturite: 20,
                estDrageonnante: false,
                probabiliteColonisation: 0.1
            });
            setShowAddForm(false);

            // Notify parent to update
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding plant:', error);
            alert('Erreur lors de l\'ajout de la plante');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPlant({
            ...newPlant,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseFloat(value) :
                    value
        });
    };

    const handleDeletePlant = async (plantId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette plante?')) {
            try {
                await api.deletePlante(plantId);
                // Notify parent to update
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error('Error deleting plant:', error);
                alert('Erreur lors de la suppression de la plante');
            }
        }
    };

    return (
        <div className="plant-info">
            {plantes.length === 0 ? (
                <p className="no-plants">Aucune plante sur cette parcelle</p>
            ) : (
                <div className="plants-list">
                    {plantes.map(plante => (
                        <div
                            key={plante.id}
                            className="plant-item"
                            style={{ borderLeft: `5px solid ${getPlantColor(plante.espece)}` }}
                        >
                            <div className="plant-header">
                                <h4>{plante.espece}</h4>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeletePlant(plante.id)}
                                    title="Supprimer cette plante"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="plant-details">
                                <div className="plant-detail">
                                    <span className="detail-label">Âge:</span>
                                    <span className="detail-value">{plante.age}</span>
                                </div>

                                <div className="plant-detail">
                                    <span className="detail-label">Maturité:</span>
                                    <span className="detail-value">{plante.ageMaturite}</span>
                                </div>

                                <div className="plant-detail">
                                    <span className="detail-label">Statut:</span>
                                    <span className="detail-value">
                                        {plante.age >= plante.ageMaturite ? (
                                            <span className="status-mature">Mature 🍎</span>
                                        ) : (
                                            <span className="status-growing">En croissance 🌱</span>
                                        )}
                                    </span>
                                </div>

                                {plante.estDrageonnante && (
                                    <div className="plant-detail">
                                        <span className="detail-label">Drageonnante:</span>
                                        <span className="detail-value">
                                            Oui (Prob: {plante.probabiliteColonisation})
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!showAddForm ? (
                <button
                    className="add-button"
                    onClick={() => setShowAddForm(true)}
                >
                    + Ajouter une plante
                </button>
            ) : (
                <div className="add-plant-form">
                    <h4>Ajouter une nouvelle plante</h4>
                    <form onSubmit={handleAddPlant}>
                        <div className="form-group">
                            <label htmlFor="espece">Espèce:</label>
                            <select
                                id="espece"
                                name="espece"
                                value={newPlant.espece}
                                onChange={handleInputChange}
                                required
                            >
                                {ESPECES_PLANTES.map(espece => (
                                    <option key={espece} value={espece}>{espece}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="age">Âge initial:</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                min="0"
                                max="100"
                                value={newPlant.age}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="ageMaturite">Âge de maturité:</label>
                            <input
                                type="number"
                                id="ageMaturite"
                                name="ageMaturite"
                                min="1"
                                max="100"
                                value={newPlant.ageMaturite}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="estDrageonnante"
                                name="estDrageonnante"
                                checked={newPlant.estDrageonnante}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="estDrageonnante">Plante drageonnante</label>
                        </div>

                        {newPlant.estDrageonnante && (
                            <div className="form-group">
                                <label htmlFor="probabiliteColonisation">Probabilité de colonisation:</label>
                                <input
                                    type="number"
                                    id="probabiliteColonisation"
                                    name="probabiliteColonisation"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={newPlant.probabiliteColonisation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}

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
            )}
        </div>
    );
};

export default PlantInfo;