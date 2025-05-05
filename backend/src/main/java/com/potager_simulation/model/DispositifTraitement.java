package com.potager_simulation.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data
public class DispositifTraitement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rayon = 2; // Rayon d'action par défaut

    @OneToMany(mappedBy = "dispositifTraitement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Programme> programmes = new ArrayList<>();

    @OneToOne(mappedBy = "dispositifTraitement")
    private Parcelle parcelle;

    // Méthodes métier
    public List<Programme> getProgrammesActifs(int instantCourant) {
        return programmes.stream()
                .filter(p -> p.estActif(instantCourant))
                .collect(Collectors.toList());
    }
}