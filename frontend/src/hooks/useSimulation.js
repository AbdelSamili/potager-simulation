// src/hooks/useSimulation.js
import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';
import websocketService from '../services/websocketService';

const useSimulation = () => {
    const [etatPotager, setEtatPotager] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use a ref to track if any WebSocket update has been received
    const webSocketUpdatedRef = useRef(false);

    // Fetch current state
    const fetchState = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.getSimulationState();
            const stateData = response.data;

            setEtatPotager(stateData);
            setCurrentStep(stateData.pasSimulation || 0);
            setIsRunning(stateData.enCours || false);
            setLoading(false);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Erreur lors de la récupération de l\'état:', err);
            setError('Impossible de récupérer l\'état de la simulation');
            setLoading(false);
        }
    }, []);

    // Start simulation
    const startSimulation = useCallback(async (speedValue = speed) => {
        try {
            // If we're already running at this speed, do nothing
            if (isRunning && speedValue === speed) {
                return;
            }

            await api.startSimulation({ speed: speedValue });
            setSpeed(speedValue);
            setIsRunning(true);
            setError(null);
        } catch (err) {
            console.error('Erreur lors du démarrage de la simulation:', err);
            setError('Impossible de démarrer la simulation');
        }
    }, [isRunning, speed]);

    // Stop simulation
    const stopSimulation = useCallback(async () => {
        if (!isRunning) return;

        try {
            await api.stopSimulation();
            setIsRunning(false);
            setError(null);
        } catch (err) {
            console.error('Erreur lors de l\'arrêt de la simulation:', err);
            setError('Impossible d\'arrêter la simulation');
        }
    }, [isRunning]);

    // Reset simulation - fixed to properly clear entities without regenerating fake data
    const resetSimulation = useCallback(async () => {
        try {
            setLoading(true);
            const wasRunning = isRunning;

            // Stop the simulation if it's running
            if (wasRunning) {
                await api.stopSimulation();
            }

            // Reset the simulation on the backend
            await api.resetSimulation();

            // Update local state - immediately update counter to avoid UI flicker
            setIsRunning(false);
            setCurrentStep(0);

            // Fetch updated state from backend
            await fetchState();
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de la réinitialisation de la simulation:', err);
            setError('Impossible de réinitialiser la simulation');
            setLoading(false);
        }
    }, [isRunning, fetchState]);

    // Advance one step
    const advanceOneStep = useCallback(async () => {
        if (isRunning) {
            console.warn("Impossible d'avancer d'un pas pendant que la simulation est en cours");
            return;
        }

        try {
            setLoading(true);
            await api.advanceOneStep();
            await fetchState(); // Refresh state after advancing
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de l\'avancement d\'un pas:', err);
            setError('Impossible d\'avancer d\'un pas');
            setLoading(false);
        }
    }, [isRunning, fetchState]);

    // Handle WebSocket update
    const handleWebSocketUpdate = useCallback((data) => {
        if (!data) return;

        setEtatPotager(data);
        setCurrentStep(data.pasSimulation || 0);
        setIsRunning(data.enCours || false);
        webSocketUpdatedRef.current = true;
    }, []);

    // Setup WebSocket connection and subscription
    useEffect(() => {
        let didUnsubscribe = false;

        // Connect to WebSocket
        websocketService.connect(
            () => {
                if (didUnsubscribe) return;
                console.log('WebSocket connected');

                // Subscribe to both possible topics for updates
                websocketService.subscribe('/topic/simulation', handleWebSocketUpdate);
                websocketService.subscribe('/topic/potager-updates', handleWebSocketUpdate);
            },
            (error) => {
                if (didUnsubscribe) return;
                console.error('WebSocket connection error:', error);
                setError('Erreur de connexion WebSocket');
            }
        );

        // Initial fetch - only if we haven't received any WebSocket updates
        if (!webSocketUpdatedRef.current) {
            fetchState();
        }

        // Cleanup on unmount
        return () => {
            didUnsubscribe = true;
            websocketService.disconnect();
        };
    }, [fetchState, handleWebSocketUpdate]);

    // Refresh data regularly if we're not getting WebSocket updates
    useEffect(() => {
        let intervalId;

        if (isRunning && !webSocketUpdatedRef.current) {
            // If simulation is running but we're not getting WebSocket updates, poll every second
            intervalId = setInterval(() => {
                fetchState();
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isRunning, fetchState, webSocketUpdatedRef]);

    return {
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
    };
};

export default useSimulation;