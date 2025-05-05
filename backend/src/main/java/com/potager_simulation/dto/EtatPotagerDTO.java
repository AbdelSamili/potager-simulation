package com.potager_simulation.dto;

import lombok.Data;
import java.util.List;

@Data
public class EtatPotagerDTO {
    private int pasSimulation;
    private int largeur;
    private int hauteur;
    private List<ParcelleDTO> parcelles;
}

