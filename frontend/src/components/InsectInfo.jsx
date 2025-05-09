// src/components/InsectInfo.jsx
import React, { useState } from 'react';
import { getInsectColor } from '../utils/helpers';
import { ESPECES_INSECTES } from '../utils/constants';
import * as api from '../services/api';
import '../styles/InsectInfo.css';

const InsectInfo = ({ parcelleId, insectes = [], onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newInsect, setNewInsect] = useState({
        espece: ESPECES_INSECTES[0],
        sexe: 'F',
        indiceBonneSante: 10,
        mobilite: 0.3,
        resistanceInsecticide: 0.2
    });

    const handleAddInsect = async (e) => {
        e.preventDefault();
        try {
            // Add parcelleId to the insect data
            const insecteData = {
                ...newInsect,
                parcelleId: parcelleId
            };

            await api.createInsecte(insecteData);

            // Reset form and refresh data
            setNewInsect({
                espece: ESPECES_INSECTES[0],
                sexe: 'F',
                indiceBonneSante: 10,
                mobilite: 0.3,
                resistanceInsecticide: 0.2
            });
            setShowAddForm(false);

            // Notify parent to update
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding insect:', error);
            alert('Erreur lors de l\'ajout de l\'insecte');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setNewInsect({
            ...newInsect,
            [name]: type === 'number' ? parseFloat(value) : value
        });
    };

    const handleDeleteInsect = async (insectId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet insecte?')) {
            try {
                await api.deleteInsecte(insectId);
                // Notify parent to update
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error('Error deleting insect:', error);
                alert('Erreur lors de la suppression de l\'insecte');
            }
        }
    };

    // Get health status text and color
    const getHealthStatus = (health) => {
        if (health >= 8) return { text: 'Excellent', color: '#2ecc71' };
        if (health >= 5) return { text: 'Bon', color: '#f1c40f' };
        if (health >= 3) return { text: 'Faible', color: '#e67e22' };
        return { text: 'Critique', color: '#e74c3c' };
    };

    return (
        <div className="insect-info">
            {insectes.length === 0 ? (
                <p className="no-insects">Aucun insecte sur cette parcelle</p>
            ) : (
                <div className="insects-list">
                    {insectes.map(insecte => {
                        const healthStatus = getHealthStatus(insecte.indiceBonneSante);

                        return (
                            <div
                                key={insecte.id}
                                className="insect-item"
                                style={{ borderLeft: `5px solid ${getInsectColor(insecte.espece)}` }}
                            >
                                <div className="insect-header">
                                    <h4>{insecte.espece}</h4>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteInsect(insecte.id)}
                                        title="Supprimer cet insecte"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="insect-details">
                                    <div className="insect-detail">
                                        <span className="detail-label">Sexe:</span>
                                        <span className="detail-value">{insecte.sexe === 'M' ? 'Mâle' : 'Femelle'}</span>
                                    </div>

                                    <div className="insect-detail">
                                        <span className="detail-label">Santé:</span>
                                        <span
                                            className="detail-value health-status"
                                            style={{ color: healthStatus.color }}
                                        >
                                            {insecte.indiceBonneSante}/10 ({healthStatus.text})
                                        </span>
                                    </div>

                                    <div className="insect-detail">
                                        <span className="detail-label">Mobilité:</span>
                                        <span className="detail-value">{insecte.mobilite}</span>
                                    </div>

                                    <div className="insect-detail">
                                        <span className="detail-label">Résistance:</span>
                                        <span className="detail-value">{insecte.resistanceInsecticide}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!showAddForm ? (
                <button
                    className="add-button"
                    onClick={() => setShowAddForm(true)}
                >
                    + Ajouter un insecte
                </button>
            ) : (
                <div className="add-insect-form">
                    <h4>Ajouter un nouvel insecte</h4>
                    <form onSubmit={handleAddInsect}>
                        <div className="form-group">
                            <label htmlFor="espece">Espèce:</label>
                            <select
                                id="espece"
                                name="espece"
                                value={newInsect.espece}
                                onChange={handleInputChange}
                                required
                            >
                                {ESPECES_INSECTES.map(espece => (
                                    <option key={espece} value={espece}>{espece}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="sexe">Sexe:</label>
                            <select
                                id="sexe"
                                name="sexe"
                                value={newInsect.sexe}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="F">Femelle</option>
                                <option value="M">Mâle</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="indiceBonneSante">Indice de bonne santé (0-10):</label>
                            <input
                                type="number"
                                id="indiceBonneSante"
                                name="indiceBonneSante"
                                min="0"
                                max="10"
                                step="1"
                                value={newInsect.indiceBonneSante}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobilite">Mobilité (probabilité de déplacement):</label>
                            <input
                                type="number"
                                id="mobilite"
                                name="mobilite"
                                min="0"
                                max="1"
                                step="0.1"
                                value={newInsect.mobilite}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="resistanceInsecticide">Résistance aux insecticides:</label>
                            <input
                                type="number"
                                id="resistanceInsecticide"
                                name="resistanceInsecticide"
                                min="0"
                                max="1"
                                step="0.1"
                                value={newInsect.resistanceInsecticide}
                                onChange={handleInputChange}
                                required
                            />
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
            )}
        </div>
    );
};

export default InsectInfo;