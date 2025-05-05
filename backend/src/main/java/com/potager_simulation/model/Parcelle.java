package com.potager_simulation.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Parcelle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int x;
    private int y;
    private double tauxHumidite = 50.0; // Valeur par défaut

    @OneToMany(mappedBy = "parcelle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Plante> plantes = new ArrayList<>();

    @OneToMany(mappedBy = "parcelle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Insecte> insectes = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    private DispositifTraitement dispositifTraitement;

    // Méthodes métier
    public void ajouterHumidite(double quantite) {
        this.tauxHumidite = Math.min(100.0, this.tauxHumidite + quantite);
    }

    public void diminuerHumidite(double quantite) {
        this.tauxHumidite = Math.max(0.0, this.tauxHumidite - quantite);
    }
}