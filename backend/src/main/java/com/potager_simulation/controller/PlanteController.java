package com.potager_simulation.controller;

import com.potager_simulation.dto.PlanteDTO;
import com.potager_simulation.service.PlanteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plantes")
public class PlanteController {
    private final PlanteService planteService;

    @Autowired
    public PlanteController(PlanteService planteService) {
        this.planteService = planteService;
    }

    @GetMapping
    public ResponseEntity<List<PlanteDTO>> getAllPlantes() {
        return ResponseEntity.ok(planteService.getAllPlantes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanteDTO> getPlanteById(@PathVariable Long id) {
        return ResponseEntity.ok(planteService.getPlanteById(id));
    }

    @PostMapping
    public ResponseEntity<PlanteDTO> createPlante(@RequestBody PlanteDTO planteDTO) {
        PlanteDTO createdPlante = planteService.createPlante(planteDTO);
        return new ResponseEntity<>(createdPlante, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanteDTO> updatePlante(@PathVariable Long id, @RequestBody PlanteDTO planteDTO) {
        return ResponseEntity.ok(planteService.updatePlante(id, planteDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlante(@PathVariable Long id) {
        planteService.deletePlante(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/parcelle/{parcelleId}")
    public ResponseEntity<List<PlanteDTO>> getPlantesByParcelle(@PathVariable Long parcelleId) {
        return ResponseEntity.ok(planteService.getPlantesByParcelle(parcelleId));
    }

    @GetMapping("/espece/{espece}")
    public ResponseEntity<List<PlanteDTO>> getPlantesByEspece(@PathVariable String espece) {
        return ResponseEntity.ok(planteService.getPlantesByEspece(espece));
    }

    @GetMapping("/matures")
    public ResponseEntity<List<PlanteDTO>> getPlantesMatures() {
        return ResponseEntity.ok(planteService.getPlantesMatures());
    }

    @GetMapping("/drageonnantes")
    public ResponseEntity<List<PlanteDTO>> getPlantesDrageonnantes() {
        // Cette méthode nécessiterait d'ajouter une méthode correspondante dans PlanteService
        // Pour l'instant, nous filtrons tous les plantes
        List<PlanteDTO> plantes = planteService.getAllPlantes().stream()
                .filter(PlanteDTO::isEstDrageonnante)
                .toList();
        return ResponseEntity.ok(plantes);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<PlanteDTO>> createMultiplePlantes(@RequestBody List<PlanteDTO> planteDTOs) {
        List<PlanteDTO> createdPlantes = planteDTOs.stream()
                .map(planteService::createPlante)
                .toList();
        return new ResponseEntity<>(createdPlantes, HttpStatus.CREATED);
    }

    @GetMapping("/count-by-espece")
    public ResponseEntity<List<Object[]>> countPlantesByEspece() {
        // Cette méthode nécessiterait d'ajouter une méthode correspondante dans PlanteService et Repository
        // Pour l'instant, nous calculons manuellement
        var plantes = planteService.getAllPlantes();

        // Groupe et compte les plantes par espèce
        var countByEspece = plantes.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        PlanteDTO::getEspece,
                        java.util.stream.Collectors.counting()
                ))
                .entrySet().stream()
                .map(entry -> new Object[]{entry.getKey(), entry.getValue()})
                .toList();

        return ResponseEntity.ok(countByEspece);
    }
}