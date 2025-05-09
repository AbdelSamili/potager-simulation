// src/components/StatisticsPanel.jsx
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
    getPlantColor, getInsectColor
} from '../utils/helpers';
import {
    ESPECES_PLANTES, ESPECES_INSECTES
} from '../utils/constants';
import '../styles/StatisticsPanel.css';

const StatisticsPanel = ({ etatPotager }) => {
    const [activeTab, setActiveTab] = useState('plantes');
    const [plantStats, setPlantStats] = useState([]);
    const [insectStats, setInsectStats] = useState([]);
    const [humidityStats, setHumidityStats] = useState([]);
    const [generalStats, setGeneralStats] = useState({
        totalPlantes: 0,
        totalInsectes: 0,
        plantesMatures: 0,
        humiditeAvg: 0,
        parcellesCount: 0
    });

    // Calculate statistics when etatPotager changes
    useEffect(() => {
        if (!etatPotager) return;

        // Count plants by species
        const plantsBySpecies = {};
        // Count insects by species
        const insectsBySpecies = {};
        // Count parcelles by humidity range
        const humidityRanges = [
            { name: '0-20%', count: 0 },
            { name: '21-40%', count: 0 },
            { name: '41-60%', count: 0 },
            { name: '61-80%', count: 0 },
            { name: '81-100%', count: 0 }
        ];

        let totalPlantes = 0;
        let totalInsectes = 0;
        let totalHumidity = 0;
        let maturePlants = 0;

        // Initialize all plant species with 0 count
        ESPECES_PLANTES.forEach(espece => {
            plantsBySpecies[espece] = 0;
        });

        // Initialize all insect species with 0 count
        ESPECES_INSECTES.forEach(espece => {
            insectsBySpecies[espece] = 0;
        });

        // Process parcelles data
        etatPotager.parcelles.forEach(parcelle => {
            // Add to total humidity
            totalHumidity += parcelle.tauxHumidite;

            // Count humidity by range
            const humidityIndex = Math.min(4, Math.floor(parcelle.tauxHumidite / 20));
            humidityRanges[humidityIndex].count++;

            // Process plants
            if (parcelle.plantes && parcelle.plantes.length > 0) {
                parcelle.plantes.forEach(plante => {
                    // Count by species
                    if (plantsBySpecies[plante.espece] !== undefined) {
                        plantsBySpecies[plante.espece]++;
                    } else {
                        plantsBySpecies[plante.espece] = 1;
                    }

                    // Count mature plants
                    if (plante.age >= plante.ageMaturite) {
                        maturePlants++;
                    }

                    totalPlantes++;
                });
            }

            // Process insects
            if (parcelle.insectes && parcelle.insectes.length > 0) {
                parcelle.insectes.forEach(insecte => {
                    // Count by species
                    if (insectsBySpecies[insecte.espece] !== undefined) {
                        insectsBySpecies[insecte.espece]++;
                    } else {
                        insectsBySpecies[insecte.espece] = 1;
                    }

                    totalInsectes++;
                });
            }
        });

        // Convert plant stats to array format for charts
        const plantStatsArray = Object.entries(plantsBySpecies)
            .map(([espece, count]) => ({ name: espece, value: count }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

        // Convert insect stats to array format for charts
        const insectStatsArray = Object.entries(insectsBySpecies)
            .map(([espece, count]) => ({ name: espece, value: count }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

        // Calculate average humidity
        const avgHumidity = etatPotager.parcelles.length > 0
            ? totalHumidity / etatPotager.parcelles.length
            : 0;

        // Update states
        setPlantStats(plantStatsArray);
        setInsectStats(insectStatsArray);
        setHumidityStats(humidityRanges);
        setGeneralStats({
            totalPlantes,
            totalInsectes,
            plantesMatures: maturePlants,
            humiditeAvg: avgHumidity.toFixed(1),
            parcellesCount: etatPotager.parcelles.length
        });

    }, [etatPotager]);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${payload[0].name || label}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="statistics-panel">
            <h2>Statistiques du Potager</h2>

            <div className="general-stats">
                <div className="stat-item">
                    <span className="stat-value">{generalStats.parcellesCount}</span>
                    <span className="stat-label">Parcelles</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{generalStats.totalPlantes}</span>
                    <span className="stat-label">Plantes</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{generalStats.plantesMatures}</span>
                    <span className="stat-label">Matures</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{generalStats.totalInsectes}</span>
                    <span className="stat-label">Insectes</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{generalStats.humiditeAvg}%</span>
                    <span className="stat-label">Humidité</span>
                </div>
            </div>

            <div className="stat-tabs">
                <button
                    className={`tab-button ${activeTab === 'plantes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plantes')}
                >
                    Plantes
                </button>
                <button
                    className={`tab-button ${activeTab === 'insectes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insectes')}
                >
                    Insectes
                </button>
                <button
                    className={`tab-button ${activeTab === 'humidite' ? 'active' : ''}`}
                    onClick={() => setActiveTab('humidite')}
                >
                    Humidité
                </button>
            </div>

            <div className="stat-content">
                {activeTab === 'plantes' && (
                    <>
                        <h3>Distribution des Plantes</h3>
                        {plantStats.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={plantStats}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {plantStats.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={getPlantColor(entry.name)}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={plantStats}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" name="Quantité">
                                            {plantStats.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={getPlantColor(entry.name)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="no-data">Aucune plante présente dans le potager</p>
                        )}
                    </>
                )}

                {activeTab === 'insectes' && (
                    <>
                        <h3>Distribution des Insectes</h3>
                        {insectStats.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={insectStats}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {insectStats.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={getInsectColor(entry.name)}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={insectStats}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" name="Quantité">
                                            {insectStats.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={getInsectColor(entry.name)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="no-data">Aucun insecte présent dans le potager</p>
                        )}
                    </>
                )}

                {activeTab === 'humidite' && (
                    <>
                        <h3>Distribution de l'Humidité</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={humidityStats}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Parcelles" fill="#3498db" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StatisticsPanel;