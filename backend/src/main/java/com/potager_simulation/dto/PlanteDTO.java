package com.potager_simulation.dto;

import lombok.Data;

/**
 * DTO (Data Transfer Object) pour les plantes
 * Cette classe permet de transférer les données des plantes entre le backend et le frontend
 */
@Data
public class PlanteDTO {
    private Long id;
    private String espece;
    private int age;
    private int ageMaturite;
    private boolean estMature;
    private boolean estDrageonnante;
    private double probabiliteColonisation;
    private Long parcelleId;
    private int parcelleCoordX;
    private int parcelleCoordY;

    // Constructeurs
    public PlanteDTO() {
        // Constructeur par défaut nécessaire pour la désérialisation JSON
    }

    public PlanteDTO(Long id, String espece, int age, int ageMaturite,
                     boolean estDrageonnante, double probabiliteColonisation) {
        this.id = id;
        this.espece = espece;
        this.age = age;
        this.ageMaturite = ageMaturite;
        this.estMature = age >= ageMaturite;
        this.estDrageonnante = estDrageonnante;
        this.probabiliteColonisation = probabiliteColonisation;
    }

    /**
     * Calcule le pourcentage de maturité de la plante
     * @return un pourcentage de maturité (de 0 à 100)
     */
    public int getPourcentageMaturite() {
        if (ageMaturite == 0) return 100; // Éviter division par zéro
        return Math.min(100, (age * 100) / ageMaturite);
    }

    /**
     * Vérifie si la plante est mature
     * Cette méthode peut être utilisée à la place du getter isEstMature()
     * @return true si la plante a atteint son âge de maturité, false sinon
     */
    public boolean estMature() {
        return age >= ageMaturite;
    }

    /**
     * Calcule le nombre de pas restants avant que la plante atteigne sa maturité
     * @return le nombre de pas restants, ou 0 si la plante est déjà mature
     */
    public int getPasRestantsAvantMaturite() {
        if (estMature()) return 0;
        return ageMaturite - age;
    }

    /**
     * Indique si cette plante peut coloniser d'autres parcelles
     * @return true si la plante est drageonnante et a une probabilité de colonisation > 0
     */
    public boolean peutColoniser() {
        return estDrageonnante && probabiliteColonisation > 0;
    }
}