package com.potager_simulation.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Insecte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String espece;
    private String sexe; // "M" ou "F"
    private int sante = 8; // Sur une échelle de 0 à 10
    private double mobilite; // Probabilité de déplacement
    private double resistanceInsecticide = 0.0;
    private int passSansManger = 0;

    @ManyToOne
    @JoinColumn(name = "parcelle_id")
    private Parcelle parcelle;

    /**
     * Nourrir l'insecte ou diminuer sa santé s'il n'y a pas de plante.
     * Conforme au PDF: "Un insecte se nourrit automatiquement si une plante est présente sur la parcelle.
     * Sinon, il perd 1 point de santé par pas de simulation."
     * @param planteDisponible true s'il y a des plantes sur la parcelle
     */
    public void seNourrir(boolean planteDisponible) {
        if (planteDisponible) {
            // L'insecte se nourrit, récupère de la santé et réinitialise le compteur de pas sans manger
            this.sante = Math.min(10, this.sante + 1);
            this.passSansManger = 0;
        } else {
            // L'insecte ne peut pas se nourrir, perd de la santé et incrémente le compteur
            this.sante = Math.max(0, this.sante - 1);
            this.passSansManger++;
        }
    }

    /**
     * Vérifie si l'insecte est toujours vivant
     * Conforme au PDF: "Si un insecte ne se nourrit pas pendant 5 pas consécutifs, il meurt automatiquement"
     * @return true si l'insecte est vivant, false s'il est mort
     */
    public boolean estVivant() {
        return this.sante > 0 && this.passSansManger < 5;
    }

    /**
     * Tente un déplacement vers une parcelle voisine selon sa mobilité
     * @return true si l'insecte doit se déplacer, false sinon
     */
    public boolean tenterDeplacement() {
        return Math.random() < this.mobilite;
    }

    /**
     * Applique un insecticide à l'insecte avec l'effet selon sa résistance
     * @param puissance La puissance de l'insecticide (réduction de santé)
     */
    public void appliquerInsecticide(double puissance) {
        // L'insecte peut résister selon sa résistance
        if (Math.random() > this.resistanceInsecticide) {
            // Calcul des dégâts en fonction de la puissance et de la résistance
            int degats = (int)(puissance * (1 - this.resistanceInsecticide));
            this.sante = Math.max(0, this.sante - degats);
        }
    }
}