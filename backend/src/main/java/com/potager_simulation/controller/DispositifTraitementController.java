package com.potager_simulation.controller;

import com.potager_simulation.dto.DispositifTraitementDTO;
import com.potager_simulation.dto.ProgrammeDTO;
import com.potager_simulation.service.DispositifTraitementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dispositifs")
public class DispositifTraitementController {
    private final DispositifTraitementService dispositifService;

    @Autowired
    public DispositifTraitementController(DispositifTraitementService dispositifService) {
        this.dispositifService = dispositifService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispositifTraitementDTO> getDispositifById(@PathVariable Long id) {
        return ResponseEntity.ok(dispositifService.getDispositifById(id));
    }

    @GetMapping
    public ResponseEntity<List<DispositifTraitementDTO>> getAllDispositifs() {
        return ResponseEntity.ok(dispositifService.getAllDispositifs());
    }

    @PostMapping("/parcelle/{parcelleId}")
    public ResponseEntity<DispositifTraitementDTO> ajouterDispositifAParcelle(
            @PathVariable Long parcelleId,
            @RequestBody DispositifTraitementDTO dispositifDTO) {
        return ResponseEntity.ok(dispositifService.creerDispositifSurParcelle(parcelleId, dispositifDTO));
    }

    @PostMapping("/{dispositifId}/programmes")
    public ResponseEntity<ProgrammeDTO> ajouterProgramme(
            @PathVariable Long dispositifId,
            @RequestBody ProgrammeDTO programmeDTO) {
        return ResponseEntity.ok(dispositifService.ajouterProgramme(dispositifId, programmeDTO));
    }

    @DeleteMapping("/{dispositifId}/programmes/{programmeId}")
    public ResponseEntity<Void> supprimerProgramme(
            @PathVariable Long dispositifId,
            @PathVariable Long programmeId) {
        dispositifService.supprimerProgramme(dispositifId, programmeId);
        return ResponseEntity.noContent().build();
    }
}