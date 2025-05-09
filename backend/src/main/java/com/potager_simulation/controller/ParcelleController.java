package com.potager_simulation.controller;

import com.potager_simulation.dto.ParcelleDTO;
import com.potager_simulation.model.Parcelle;
import com.potager_simulation.service.ParcelleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parcelles")
public class ParcelleController {
    private final ParcelleService parcelleService;

    @Autowired
    public ParcelleController(ParcelleService parcelleService) {
        this.parcelleService = parcelleService;
    }

    @GetMapping
    public ResponseEntity<List<ParcelleDTO>> getAllParcelles() {
        return ResponseEntity.ok(parcelleService.getAllParcelles());
    }

    // Dans ParcelleController.java
    @GetMapping("/{id}/voisines")
    public ResponseEntity<List<ParcelleDTO>> getParcellesVoisines(@PathVariable Long id) {
        return ResponseEntity.ok(parcelleService.getParcellesVoisines(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParcelleDTO> getParcelleById(@PathVariable Long id) {
        return ResponseEntity.ok(parcelleService.getParcelleById(id));
    }

    @PostMapping
    public ResponseEntity<ParcelleDTO> createParcelle(@RequestBody ParcelleDTO parcelleDTO) {
        return ResponseEntity.ok(parcelleService.createParcelle(parcelleDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParcelleDTO> updateParcelle(@PathVariable Long id, @RequestBody ParcelleDTO parcelleDTO) {
        return ResponseEntity.ok(parcelleService.updateParcelle(id, parcelleDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParcelle(@PathVariable Long id) {
        parcelleService.deleteParcelle(id);
        return ResponseEntity.noContent().build();
    }
}