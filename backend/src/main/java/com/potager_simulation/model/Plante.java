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

    // Méthodes métier
    public void vieillir() {
        this.age++;
    }

    public boolean estMature() {
        return this.age >= this.ageMaturite;
    }

    public boolean tenterColonisation() {
        return this.estDrageonnante && Math.random() < this.probabiliteColonisation;
    }
}