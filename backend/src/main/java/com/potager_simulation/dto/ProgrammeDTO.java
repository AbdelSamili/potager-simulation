package com.potager_simulation.dto;

import lombok.Data;

/**
 * DTO (Data Transfer Object) pour les programmes d'activation des dispositifs de traitement
 * Cette classe permet de transférer les données des programmes entre le backend et le frontend
 */
@Data
public class ProgrammeDTO {
    private Long id;
    private int instantDebut;
    private int duree;
    private String typeTraitement;
    private Long dispositifId;

    // Constructeurs
    public ProgrammeDTO() {
        // Constructeur par défaut nécessaire pour la désérialisation JSON
    }

    public ProgrammeDTO(Long id, int instantDebut, int duree, String typeTraitement) {
        this.id = id;
        this.instantDebut = instantDebut;
        this.duree = duree;
        this.typeTraitement = typeTraitement;
    }

    /**
     * Vérifie si ce programme est actif à un instant donné
     * @param instantCourant L'instant actuel de la simulation
     * @return true si le programme est actif, false sinon
     */
    public boolean estActif(int instantCourant) {
        return instantCourant >= instantDebut && instantCourant < (instantDebut + duree);
    }

    /**
     * Calcule l'instant de fin du programme
     * @return L'instant de fin (instantDebut + duree)
     */
    public int getInstantFin() {
        return instantDebut + duree;
    }
}