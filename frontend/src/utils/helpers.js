// src/utils/helpers.js
import { PLANT_COLORS, INSECT_COLORS } from './constants';

// Get color for plant by species
export function getPlantColor(espece) {
    return PLANT_COLORS[espece] || '#777777';
}

// Get color for insect by species
export function getInsectColor(espece) {
    return INSECT_COLORS[espece] || '#777777';
}

// Calculate the humidity color based on the humidity level (0-100%)
export function getHumidityColor(tauxHumidite) {
    // Ensure input is in range 0-100
    const humidityNormalized = Math.min(100, Math.max(0, tauxHumidite)) / 100;

    // Blue gradient for humidity
    const r = Math.round(255 * (1 - humidityNormalized));
    const g = Math.round(255 * (1 - humidityNormalized * 0.5));
    const b = 255;

    return `rgb(${r}, ${g}, ${b})`;
}

// Get the opacity based on a value (0-1)
export function getOpacity(value) {
    return Math.max(0.2, Math.min(1, value));
}

// Format time in seconds to minutes:seconds
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get neighboring cells coordinates
export function getNeighborCoords(x, y) {
    return [
        { x: x-1, y: y-1 }, // Top-left
        { x: x,   y: y-1 }, // Top
        { x: x+1, y: y-1 }, // Top-right
        { x: x-1, y: y   }, // Left
        { x: x+1, y: y   }, // Right
        { x: x-1, y: y+1 }, // Bottom-left
        { x: x,   y: y+1 }, // Bottom
        { x: x+1, y: y+1 }  // Bottom-right
    ];
}

// Calculate the distance between two points
export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Check if a point is in range of another point
export function isInRange(x1, y1, x2, y2, range) {
    return calculateDistance(x1, y1, x2, y2) <= range;
}

// Format a date object to a readable string
export function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Calculate plant growth percentage
export function calculateGrowthPercentage(age, ageMaturite) {
    return Math.min(100, Math.round((age / ageMaturite) * 100));
}

// Generate a unique ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}