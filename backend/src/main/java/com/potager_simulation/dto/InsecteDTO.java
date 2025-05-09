package com.potager_simulation.dto;

import lombok.Data;

/**
 * DTO (Data Transfer Object) pour les insectes
 * Cette classe permet de transférer les données des insectes entre le backend et le frontend
 */
@Data
public class InsecteDTO {
    private Long id;
    private String espece;
    private String sexe;
    private int sante;
    private double mobilite;
    private double resistanceInsecticide;
    private int passSansManger;
    private Long parcelleId;
    private int parcelleCoordX;
    private int parcelleCoordY;

    // Pour la compatibilité avec le frontend qui utilise ce champ
    private Integer indiceBonneSante;

    // Constructeurs
    public InsecteDTO() {
        // Constructeur par défaut nécessaire pour la désérialisation JSON
    }

    public InsecteDTO(Long id, String espece, String sexe, int sante, double mobilite,
                      double resistanceInsecticide, int passSansManger) {
        this.id = id;
        this.espece = espece;
        this.sexe = sexe;
        this.sante = sante;
        this.mobilite = mobilite;
        this.resistanceInsecticide = resistanceInsecticide;
        this.passSansManger = passSansManger;
    }

    // Getter personnalisé pour adapter aux attentes du frontend
    public int getIndiceBonneSante() {
        return this.sante;
    }

    // Setter personnalisé pour adapter aux attentes du frontend
    public void setIndiceBonneSante(Integer indiceBonneSante) {
        if (indiceBonneSante != null) {
            this.sante = indiceBonneSante;
        }
    }

    /**
     * Vérifie si l'insecte est en bonne santé (santé > 7)
     * @return true si l'insecte est en bonne santé, false sinon
     */
    public boolean estEnBonneSante() {
        return sante > 7;
    }

    /**
     * Vérifie si l'insecte est en train de mourir de faim (passSansManger >= 3)
     * @return true si l'insecte est affamé, false sinon
     */
    public boolean estAffame() {
        return passSansManger >= 3;
    }
}