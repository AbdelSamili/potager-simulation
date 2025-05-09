package com.potager_simulation.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Plante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String espece;
    private int age = 0;
    private int ageMaturite;
    private boolean estDrageonnante = false;
    private double probabiliteColonisation = 0.0;

    @ManyToOne
    @JoinColumn(name = "parcelle_id")
    private Parcelle parcelle;

    /**
     * Fait vieillir la plante d'un pas de simulation
     * Conforme au PDF: "À chaque pas de simulation, la plante gagne un point d'âge (age = age + 1)"
     */
    public void vieillir() {
        this.age++;
    }

    /**
     * Vérifie si la plante a atteint son âge de maturité
     * Conforme au PDF: "Lorsqu'elle atteint son âge de maturité, elle commence à produire des fruits"
     * @return true si la plante est mature, false sinon
     */
    public boolean estMature() {
        return this.age >= this.ageMaturite;
    }

    /**
     * Tente une colonisation des parcelles voisines
     * Ne doit être effectuée que si la plante est drageonnante et mature
     * @return true si la plante peut tenter de coloniser, false sinon
     */
    public boolean tenterColonisation() {
        // Une plante doit être drageonnante ET mature pour coloniser d'autres parcelles
        return this.estDrageonnante && this.estMature() && (Math.random() < this.probabiliteColonisation);
    }
}