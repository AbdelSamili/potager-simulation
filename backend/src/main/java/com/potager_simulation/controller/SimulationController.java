package com.potager_simulation.controller;

import com.potager_simulation.dto.EtatPotagerDTO;
import com.potager_simulation.dto.SimulationConfigDTO;
import com.potager_simulation.service.SimulationDataService;
import com.potager_simulation.service.SimulationManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/simulation")
public class SimulationController {
    private final SimulationManager simulationManager;
    private final SimulationDataService dataService;

    @Autowired
    public SimulationController(
            SimulationManager simulationManager,
            SimulationDataService dataService) {
        this.simulationManager = simulationManager;
        this.dataService = dataService;
    }

    @PostMapping("/start")
    public ResponseEntity<String> startSimulation(@RequestBody SimulationConfigDTO config) {
        int delaiMs = 1000 / config.getSpeed(); // Convertir la vitesse en délai
        simulationManager.demarrerSimulation(delaiMs);
        return ResponseEntity.ok("Simulation démarrée");
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopSimulation() {
        simulationManager.arreterSimulation();
        return ResponseEntity.ok("Simulation arrêtée");
    }

    @GetMapping("/state")
    public ResponseEntity<EtatPotagerDTO> getSimulationState() {
        return ResponseEntity.ok(simulationManager.getEtatActuel());
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetSimulation() {
        // 1. Arrêter la simulation en cours
        simulationManager.arreterSimulation();

        // 2. Réinitialiser le compteur de pas dans SimulationManager
        simulationManager.resetPasSimulation();

        // 3. Nettoyer toutes les entités sans en recréer de nouvelles
        dataService.reinitialiserPotager();

        return ResponseEntity.ok("Simulation réinitialisée");
    }

    @PostMapping("/pas")
    public ResponseEntity<String> avancerUnPas() {
        simulationManager.executerPasSimulation();
        return ResponseEntity.ok("Pas de simulation exécuté");
    }
}