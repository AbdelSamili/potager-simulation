package com.potager_simulation.model;

import com.potager_simulation.model.Parcelle;
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

    // Méthodes métier
    public void seNourrir(boolean planteDisponible) {
        if (planteDisponible) {
            this.sante = Math.min(10, this.sante + 1);
            this.passSansManger = 0;
        } else {
            this.sante = Math.max(0, this.sante - 1);
            this.passSansManger++;
        }
    }

    public boolean estVivant() {
        return this.sante > 0 && this.passSansManger < 5;
    }

    public boolean tenterDeplacement() {
        return Math.random() < this.mobilite;
    }

    public void appliquerInsecticide(double puissance) {
        if (Math.random() > this.resistanceInsecticide) {
            this.sante = Math.max(0, this.sante - (int)(puissance * (1 - this.resistanceInsecticide)));
        }
    }
}