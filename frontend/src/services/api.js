// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Simulation endpoints
export const startSimulation = (config) => api.post('/simulation/start', config);
export const stopSimulation = () => api.post('/simulation/stop');
export const resetSimulation = () => api.post('/simulation/reset');
export const advanceOneStep = () => api.post('/simulation/pas');
export const getSimulationState = () => api.get('/simulation/state');

// Parcelle endpoints
export const getAllParcelles = () => api.get('/parcelles');
export const getParcelle = (id) => api.get(`/parcelles/${id}`);
export const getParcellesVoisines = (id) => api.get(`/parcelles/${id}/voisines`);
export const createParcelle = (parcelle) => api.post('/parcelles', parcelle);
export const updateParcelle = (id, parcelle) => api.put(`/parcelles/${id}`, parcelle);
export const deleteParcelle = (id) => api.delete(`/parcelles/${id}`);

// Plante endpoints
export const getAllPlantes = () => api.get('/plantes');
export const getPlante = (id) => api.get(`/plantes/${id}`);
export const getPlantesByParcelle = (parcelleId) => api.get(`/plantes/parcelle/${parcelleId}`);
export const getPlantesByEspece = (espece) => api.get(`/plantes/espece/${espece}`);
export const getPlantesMatures = () => api.get('/plantes/matures');
export const getPlantesDrageonnantes = () => api.get('/plantes/drageonnantes');
export const createPlante = (plante) => api.post('/plantes', plante);
export const createMultiplePlantes = (plantes) => api.post('/plantes/bulk', plantes);
export const updatePlante = (id, plante) => api.put(`/plantes/${id}`, plante);
export const deletePlante = (id) => api.delete(`/plantes/${id}`);
export const countPlantesByEspece = () => api.get('/plantes/count-by-espece');

// Insecte endpoints
export const getAllInsectes = () => api.get('/insectes');
export const getInsecte = (id) => api.get(`/insectes/${id}`);
export const getInsectesByParcelle = (parcelleId) => api.get(`/insectes/parcelle/${parcelleId}`);
export const getInsectesByEspece = (espece) => api.get(`/insectes/espece/${espece}`);
export const getInsectesBySexe = (sexe) => api.get(`/insectes/sexe/${sexe}`);
export const createInsecte = (insecte) => api.post('/insectes', insecte);
export const createMultipleInsectes = (insectes) => api.post('/insectes/bulk', insectes);
export const updateInsecte = (id, insecte) => api.put(`/insectes/${id}`, insecte);
export const deleteInsecte = (id) => api.delete(`/insectes/${id}`);

// Dispositif de traitement endpoints
export const getAllDispositifs = () => api.get('/dispositifs');
export const getDispositif = (id) => api.get(`/dispositifs/${id}`);
export const createDispositifSurParcelle = (parcelleId, dispositif) =>
    api.post(`/dispositifs/parcelle/${parcelleId}`, dispositif);
export const ajouterProgramme = (dispositifId, programme) =>
    api.post(`/dispositifs/${dispositifId}/programmes`, programme);
export const supprimerProgramme = (dispositifId, programmeId) =>
    api.delete(`/dispositifs/${dispositifId}/programmes/${programmeId}`);

export default api;