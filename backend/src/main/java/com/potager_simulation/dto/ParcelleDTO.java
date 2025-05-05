package com.potager_simulation.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO (Data Transfer Object) pour les parcelles
 * Cette classe permet de transférer les données des parcelles entre le backend et le frontend
 */
@Data
public class ParcelleDTO {
    private Long id;
    private int x;
    private int y;
    private double tauxHumidite;
    private List<PlanteDTO> plantes = new ArrayList<>();
    private List<InsecteDTO> insectes = new ArrayList<>();
    private DispositifTraitementDTO dispositifTraitement;

    // Constructeurs
    public ParcelleDTO() {
        // Constructeur par défaut nécessaire pour la désérialisation JSON
    }

    public ParcelleDTO(Long id, int x, int y, double tauxHumidite) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.tauxHumidite = tauxHumidite;
    }

    /**
     * Indique si la parcelle contient des plantes
     * @return true si la parcelle a au moins une plante, false sinon
     */
    public boolean hasPlantes() {
        return plantes != null && !plantes.isEmpty();
    }

    /**
     * Indique si la parcelle contient des insectes
     * @return true si la parcelle a au moins un insecte, false sinon
     */
    public boolean hasInsectes() {
        return insectes != null && !insectes.isEmpty();
    }

    /**
     * Indique si la parcelle a un dispositif de traitement
     * @return true si la parcelle a un dispositif, false sinon
     */
    public boolean hasDispositif() {
        return dispositifTraitement != null;
    }

    /**
     * Détermine la catégorie d'humidité de la parcelle
     * @return une chaîne décrivant le niveau d'humidité (sec, modéré, humide)
     */
    public String getCategorieHumidite() {
        if (tauxHumidite < 30) {
            return "sec";
        } else if (tauxHumidite < 70) {
            return "modéré";
        } else {
            return "humide";
        }
    }

    /**
     * Ajoute une plante à la liste des plantes
     * @param plante la plante à ajouter
     */
    public void ajouterPlante(PlanteDTO plante) {
        if (plantes == null) {
            plantes = new ArrayList<>();
        }
        plantes.add(plante);
    }

    /**
     * Ajoute un insecte à la liste des insectes
     * @param insecte l'insecte à ajouter
     */
    public void ajouterInsecte(InsecteDTO insecte) {
        if (insectes == null) {
            insectes = new ArrayList<>();
        }
        insectes.add(insecte);
    }
}