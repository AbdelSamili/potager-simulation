// src/utils/constants.js

export const TYPES_TRAITEMENT = {
    EAU: 'EAU',
    ENGRAIS: 'ENGRAIS',
    INSECTICIDE: 'INSECTICIDE'
};

export const SPEED_OPTIONS = [
    { value: 1, label: 'Lent (1x)' },
    { value: 2, label: 'Normal (2x)' },
    { value: 5, label: 'Rapide (5x)' },
    { value: 10, label: 'Très rapide (10x)' }
];

export const ESPECES_PLANTES = [
    'Tomate',
    'Carotte',
    'Laitue',
    'Courgette',
    'Pomme de terre',
    'Fraise',
    'Aubergine',
    'Poivron',
    'Oignon',
    'Haricot'
];

export const ESPECES_INSECTES = [
    'Coccinelle',
    'Puceron',
    'Fourmi',
    'Abeille',
    'Chenille',
    'Papillon',
    'Scarabée',
    'Moustique',
    'Guêpe',
    'Araignée'
];

export const PLANT_COLORS = {
    'Tomate': '#e74c3c',
    'Carotte': '#e67e22',
    'Laitue': '#2ecc71',
    'Courgette': '#27ae60',
    'Pomme de terre': '#795548',
    'Fraise': '#e91e63',
    'Aubergine': '#9b59b6',
    'Poivron': '#f1c40f',
    'Oignon': '#d35400',
    'Haricot': '#3498db'
};

export const INSECT_COLORS = {
    'Coccinelle': '#e74c3c',
    'Puceron': '#2ecc71',
    'Fourmi': '#34495e',
    'Abeille': '#f1c40f',
    'Chenille': '#9b59b6',
    'Papillon': '#3498db',
    'Scarabée': '#795548',
    'Moustique': '#7f8c8d',
    'Guêpe': '#f39c12',
    'Araignée': '#2c3e50'
};