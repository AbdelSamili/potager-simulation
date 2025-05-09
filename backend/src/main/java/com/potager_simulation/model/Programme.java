package com.potager_simulation.model;

import com.potager_simulation.model.enums.TypeTraitement;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Programme {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int instantDebut;
    private int duree;

    @Enumerated(EnumType.STRING)
    private TypeTraitement typeTraitement;

    @ManyToOne
    @JoinColumn(name = "dispositif_id")
    private DispositifTraitement dispositifTraitement;

    // Méthodes métier
    public boolean estActif(int instantCourant) {
        boolean active = instantCourant >= instantDebut && instantCourant < (instantDebut + duree);

        // Debug output
        if (active) {
            System.out.println("Program " + id + " is active: starts at " + instantDebut +
                    ", duration " + duree + ", current time " + instantCourant);
        }

        return active;
    }
}