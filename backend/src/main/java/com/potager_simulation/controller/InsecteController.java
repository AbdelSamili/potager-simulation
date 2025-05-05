package com.potager_simulation.controller;

import com.potager_simulation.dto.InsecteDTO;
import com.potager_simulation.service.InsecteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insectes")
public class InsecteController {
    private final InsecteService insecteService;

    @Autowired
    public InsecteController(InsecteService insecteService) {
        this.insecteService = insecteService;
    }

    @GetMapping
    public ResponseEntity<List<InsecteDTO>> getAllInsectes() {
        return ResponseEntity.ok(insecteService.getAllInsectes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsecteDTO> getInsecteById(@PathVariable Long id) {
        return ResponseEntity.ok(insecteService.getInsecteById(id));
    }

    @PostMapping
    public ResponseEntity<InsecteDTO> createInsecte(@RequestBody InsecteDTO insecteDTO) {
        InsecteDTO createdInsecte = insecteService.createInsecte(insecteDTO);
        return new ResponseEntity<>(createdInsecte, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsecteDTO> updateInsecte(@PathVariable Long id, @RequestBody InsecteDTO insecteDTO) {
        return ResponseEntity.ok(insecteService.updateInsecte(id, insecteDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsecte(@PathVariable Long id) {
        insecteService.deleteInsecte(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/parcelle/{parcelleId}")
    public ResponseEntity<List<InsecteDTO>> getInsectesByParcelle(@PathVariable Long parcelleId) {
        return ResponseEntity.ok(insecteService.getInsectesByParcelle(parcelleId));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<InsecteDTO>> createMultipleInsectes(@RequestBody List<InsecteDTO> insecteDTOs) {
        List<InsecteDTO> createdInsectes = insecteDTOs.stream()
                .map(insecteService::createInsecte)
                .toList();
        return new ResponseEntity<>(createdInsectes, HttpStatus.CREATED);
    }

    @GetMapping("/espece/{espece}")
    public ResponseEntity<List<InsecteDTO>> getInsectesByEspece(@PathVariable String espece) {
        // Cette méthode nécessiterait d'ajouter une méthode correspondante dans InsecteService
        // Pour l'instant, nous filtrons tous les insectes
        List<InsecteDTO> insectes = insecteService.getAllInsectes().stream()
                .filter(insecteDTO -> insecteDTO.getEspece().equalsIgnoreCase(espece))
                .toList();
        return ResponseEntity.ok(insectes);
    }

    @GetMapping("/sexe/{sexe}")
    public ResponseEntity<List<InsecteDTO>> getInsectesBySexe(@PathVariable String sexe) {
        // Cette méthode nécessiterait d'ajouter une méthode correspondante dans InsecteService
        // Pour l'instant, nous filtrons tous les insectes
        List<InsecteDTO> insectes = insecteService.getAllInsectes().stream()
                .filter(insecteDTO -> insecteDTO.getSexe().equalsIgnoreCase(sexe))
                .toList();
        return ResponseEntity.ok(insectes);
    }
}