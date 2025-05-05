package com.potager_simulation.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO (Data Transfer Object) pour les dispositifs de traitement
 * Cette classe sert à transférer les données des dispositifs entre le backend et le frontend
 */
@Data
public class DispositifTraitementDTO {
    private Long id;
    private int rayon;
    private Long parcelleId;
    private int parcelleCoordX;
    private int parcelleCoordY;
    private List<ProgrammeDTO> programmesActifs = new ArrayList<>();

    // Constructeurs
    public DispositifTraitementDTO() {
        // Constructeur par défaut nécessaire pour la désérialisation JSON
    }

    public DispositifTraitementDTO(Long id, int rayon) {
        this.id = id;
        this.rayon = rayon;
    }

    // Méthode utilitaire pour ajouter un programme
    public void ajouterProgramme(ProgrammeDTO programme) {
        if (programmesActifs == null) {
            programmesActifs = new ArrayList<>();
        }
        programmesActifs.add(programme);
    }
}