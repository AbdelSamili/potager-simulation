package com.potager_simulation.service;

import com.potager_simulation.model.*;
import com.potager_simulation.model.enums.TypeTraitement;
import com.potager_simulation.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SimulationDataService {
    private final ParcelleRepository parcelleRepository;
    private final PlanteRepository planteRepository;
    private final InsecteRepository insecteRepository;
    private final DispositifTraitementRepository dispositifRepository;
    private final ProgrammeRepository programmeRepository;

    @Autowired
    public SimulationDataService(
            ParcelleRepository parcelleRepository,
            PlanteRepository planteRepository,
            InsecteRepository insecteRepository,
            DispositifTraitementRepository dispositifRepository,
            ProgrammeRepository programmeRepository) {
        this.parcelleRepository = parcelleRepository;
        this.planteRepository = planteRepository;
        this.insecteRepository = insecteRepository;
        this.dispositifRepository = dispositifRepository;
        this.programmeRepository = programmeRepository;
    }

    /**
     * Initialise un potager par défaut pour commencer la simulation
     */
    @Transactional
    public void initialiserPotagerDefaut() {
        // Nettoyer les données existantes
        nettoyerDonnees();

        // Créer une grille de parcelles 5x5
        List<Parcelle> parcelles = creerGrilleParcelles(5, 5);

        // Ajouter quelques plantes
        ajouterPlantesInitiales(parcelles);

        // Ajouter quelques insectes
        ajouterInsectesInitiaux(parcelles);

        // Ajouter des dispositifs de traitement
        ajouterDispositifsPronfigures(parcelles);
    }

    /**
     * Nettoie toutes les entités (plantes, insectes, dispositifs) mais conserve les parcelles.
     * Réinitialise les taux d'humidité à des valeurs spécifiques.
     */
    @Transactional
    public void reinitialiserPotager() {
        // Supprimer tous les insectes
        insecteRepository.deleteAll();

        // Supprimer toutes les plantes
        planteRepository.deleteAll();

        // Supprimer tous les programmes et dispositifs
        try {
            programmeRepository.deleteAll();
        } catch (Exception e) {
            // Dans certains cas, les programmes sont supprimés par cascade
            System.out.println("Les programmes ont déjà été supprimés: " + e.getMessage());
        }

        // Supprimer les dispositifs
        dispositifRepository.deleteAll();

        // Récupérer toutes les parcelles
        List<Parcelle> parcelles = parcelleRepository.findAll();

        // Map pour stocker les valeurs d'humidité spécifiques
        Map<String, Double> humiditeParPosition = new HashMap<>();

        // Définir les valeurs d'humidité spécifiques selon les coordonnées
        // Row 0
        humiditeParPosition.put("0-0", 35.0);
        humiditeParPosition.put("1-0", 40.0);
        humiditeParPosition.put("2-0", 45.0);
        humiditeParPosition.put("3-0", 10.0);
        humiditeParPosition.put("4-0", 55.0);
        // Row 1
        humiditeParPosition.put("0-1", 38.0);
        humiditeParPosition.put("1-1", 43.0);
        humiditeParPosition.put("2-1", 23.0);
        humiditeParPosition.put("3-1", 53.0);
        humiditeParPosition.put("4-1", 58.0);
        // Row 2
        humiditeParPosition.put("0-2", 41.0);
        humiditeParPosition.put("1-2", 46.0);
        humiditeParPosition.put("2-2", 51.0); // Centre
        humiditeParPosition.put("3-2", 56.0);
        humiditeParPosition.put("4-2", 61.0);
        // Row 3
        humiditeParPosition.put("0-3", 44.0);
        humiditeParPosition.put("1-3", 29.0);
        humiditeParPosition.put("2-3", 54.0);
        humiditeParPosition.put("3-3", 59.0);
        humiditeParPosition.put("4-3", 64.0);
        // Row 4
        humiditeParPosition.put("0-4", 47.0);
        humiditeParPosition.put("1-4", 52.0);
        humiditeParPosition.put("2-4", 19.0);
        humiditeParPosition.put("3-4", 62.0);
        humiditeParPosition.put("4-4", 67.0);

        // Mettre à jour les parcelles avec les valeurs d'humidité spécifiques
        for (Parcelle parcelle : parcelles) {
            // Clé pour rechercher dans la map
            String key = parcelle.getX() + "-" + parcelle.getY();

            // Vérifier si une valeur spécifique existe pour cette position
            if (humiditeParPosition.containsKey(key)) {
                double humidite = humiditeParPosition.get(key);
                parcelle.setTauxHumidite(humidite);
                System.out.println("Parcelle (" + parcelle.getX() + "," + parcelle.getY() +
                        ") humidité réinitialisée à " + humidite);
            } else {
                // Valeur par défaut si non spécifiée (ne devrait pas arriver avec une grille 5x5)
                parcelle.setTauxHumidite(50.0);
                System.out.println("Parcelle (" + parcelle.getX() + "," + parcelle.getY() +
                        ") humidité réinitialisée à la valeur par défaut (50.0)");
            }

            // Enlever la référence au dispositif de traitement
            parcelle.setDispositifTraitement(null);
        }

        // Sauvegarder les parcelles mises à jour
        parcelleRepository.saveAll(parcelles);
        System.out.println("Réinitialisation du potager terminée avec des valeurs d'humidité personnalisées");
    }

    /**
     * Nettoie toutes les données existantes
     */
    @Transactional
    public void nettoyerDonnees() {
        insecteRepository.deleteAll();
        planteRepository.deleteAll();
        dispositifRepository.deleteAll();
        parcelleRepository.deleteAll();
    }

    /**
     * Crée une grille de parcelles de taille width x height
     */
    private List<Parcelle> creerGrilleParcelles(int width, int height) {
        List<Parcelle> parcelles = new ArrayList<>();

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                Parcelle parcelle = new Parcelle();
                parcelle.setX(x);
                parcelle.setY(y);
                parcelle.setTauxHumidite(50.0); // Taux d'humidité initial moyen
                parcelles.add(parcelle);
            }
        }

        return parcelleRepository.saveAll(parcelles);
    }

    /**
     * Ajoute des plantes initiales sur certaines parcelles
     */
    private void ajouterPlantesInitiales(List<Parcelle> parcelles) {
        // Quelques types de plantes avec leurs caractéristiques
        String[][] typesDePlantes = {
                // {espèce, âge de maturité, est drageonnante, probabilité de colonisation}
                {"Tomate", "10", "false", "0.0"},
                {"Fraisier", "8", "true", "0.3"},
                {"Carotte", "12", "false", "0.0"},
                {"Menthe", "5", "true", "0.5"},
                {"Salade", "7", "false", "0.0"}
        };

        // Placer quelques plantes sur le potager
        for (int i = 0; i < 10; i++) {
            // Choisir une parcelle aléatoire
            int indexParcelle = (int) (Math.random() * parcelles.size());
            Parcelle parcelle = parcelles.get(indexParcelle);

            // Choisir un type de plante aléatoire
            int indexPlante = (int) (Math.random() * typesDePlantes.length);
            String[] typePlante = typesDePlantes[indexPlante];

            Plante plante = new Plante();
            plante.setEspece(typePlante[0]);
            plante.setAge(0); // Plante jeune
            plante.setAgeMaturite(Integer.parseInt(typePlante[1]));
            plante.setEstDrageonnante(Boolean.parseBoolean(typePlante[2]));
            plante.setProbabiliteColonisation(Double.parseDouble(typePlante[3]));
            plante.setParcelle(parcelle);

            planteRepository.save(plante);
        }
    }

    /**
     * Ajoute des insectes initiaux sur certaines parcelles
     */
    private void ajouterInsectesInitiaux(List<Parcelle> parcelles) {
        // Quelques types d'insectes avec leurs caractéristiques
        String[][] typesDInsectes = {
                // {espèce, mobilité, résistance insecticide}
                {"Coccinelle", "0.5", "0.7"},
                {"Puceron", "0.3", "0.2"},
                {"Fourmi", "0.6", "0.4"},
                {"Abeille", "0.8", "0.5"},
                {"Chenille", "0.2", "0.3"}
        };

        // Placer quelques insectes sur le potager
        for (int i = 0; i < 15; i++) {
            // Choisir une parcelle aléatoire
            int indexParcelle = (int) (Math.random() * parcelles.size());
            Parcelle parcelle = parcelles.get(indexParcelle);

            // Choisir un type d'insecte aléatoire
            int indexInsecte = (int) (Math.random() * typesDInsectes.length);
            String[] typeInsecte = typesDInsectes[indexInsecte];

            Insecte insecte = new Insecte();
            insecte.setEspece(typeInsecte[0]);
            insecte.setSexe(Math.random() < 0.5 ? "M" : "F"); // Sexe aléatoire
            insecte.setSante(7 + (int)(Math.random() * 4)); // Santé entre 7 et 10
            insecte.setMobilite(Double.parseDouble(typeInsecte[1]));
            insecte.setResistanceInsecticide(Double.parseDouble(typeInsecte[2]));
            insecte.setPassSansManger(0);
            insecte.setParcelle(parcelle);

            insecteRepository.save(insecte);
        }
    }

    /**
     * Ajoute des dispositifs de traitement préconfigurés
     */
    private void ajouterDispositifsPronfigures(List<Parcelle> parcelles) {
        // Dispositif d'arrosage au centre
        if (parcelles.size() >= 13) { // Pour une grille 5x5, l'index 12 est au centre
            Parcelle parcelleCentrale = parcelles.get(12);

            DispositifTraitement dispositifArrosage = new DispositifTraitement();
            dispositifArrosage.setRayon(2);
            dispositifArrosage.setParcelle(parcelleCentrale);

            DispositifTraitement dispositifSauvegarde = dispositifRepository.save(dispositifArrosage);

            // Ajouter des programmes pour ce dispositif
            Programme programmeArrosage = new Programme();
            programmeArrosage.setInstantDebut(10);
            programmeArrosage.setDuree(5);
            programmeArrosage.setTypeTraitement(TypeTraitement.EAU);
            programmeArrosage.setDispositifTraitement(dispositifSauvegarde);

            Programme programmeInsecticide = new Programme();
            programmeInsecticide.setInstantDebut(20);
            programmeInsecticide.setDuree(3);
            programmeInsecticide.setTypeTraitement(TypeTraitement.INSECTICIDE);
            programmeInsecticide.setDispositifTraitement(dispositifSauvegarde);

            // Récupération du dispositif pour y ajouter les programmes
            dispositifSauvegarde.getProgrammes().add(programmeArrosage);
            dispositifSauvegarde.getProgrammes().add(programmeInsecticide);

            dispositifRepository.save(dispositifSauvegarde);

            // Mettre à jour la parcelle avec le dispositif
            parcelleCentrale.setDispositifTraitement(dispositifSauvegarde);
            parcelleRepository.save(parcelleCentrale);
        }

        // Dispositif d'engrais dans un coin
        if (!parcelles.isEmpty()) {
            Parcelle parcelleEngrais = parcelles.get(0);

            DispositifTraitement dispositifEngrais = new DispositifTraitement();
            dispositifEngrais.setRayon(1);
            dispositifEngrais.setParcelle(parcelleEngrais);

            DispositifTraitement dispositifSauvegarde = dispositifRepository.save(dispositifEngrais);

            // Ajouter un programme pour ce dispositif
            Programme programmeEngrais = new Programme();
            programmeEngrais.setInstantDebut(30);
            programmeEngrais.setDuree(8);
            programmeEngrais.setTypeTraitement(TypeTraitement.ENGRAIS);
            programmeEngrais.setDispositifTraitement(dispositifSauvegarde);

            // Récupération du dispositif pour y ajouter le programme
            dispositifSauvegarde.getProgrammes().add(programmeEngrais);

            dispositifRepository.save(dispositifSauvegarde);

            // Mettre à jour la parcelle avec le dispositif
            parcelleEngrais.setDispositifTraitement(dispositifSauvegarde);
            parcelleRepository.save(parcelleEngrais);
        }
    }

    /**
     * Sauvegarde l'état actuel de la simulation
     */
    @Transactional
    public void sauvegarderEtat(String nomFichier) {
        // Cette méthode pourrait être étendue pour sauvegarder l'état dans un fichier
        // ou dans une table spéciale de la base de données

        // Pour l'instant, elle ne fait rien de spécial car l'état est déjà persisté en BDD
        System.out.println("Sauvegarde de l'état dans " + nomFichier);
    }

    /**
     * Charge un état sauvegardé de la simulation
     */
    @Transactional
    public void chargerEtat(String nomFichier) {
        // Cette méthode pourrait charger un état depuis un fichier
        // ou depuis une table spéciale de la base de données

        System.out.println("Chargement de l'état depuis " + nomFichier);
        // Pour cet exemple, on réinitialise simplement le potager par défaut
        initialiserPotagerDefaut();
    }

    /**
     * Obtient une parcelle à partir de ses coordonnées
     */
    public Optional<Parcelle> getParcelle(int x, int y) {
        return Optional.ofNullable(parcelleRepository.findByXAndY(x, y));
    }

    /**
     * Ajoute une plante à une parcelle spécifique
     */
    @Transactional
    public Plante ajouterPlante(int x, int y, String espece, int ageMaturite, boolean estDrageonnante, double probabiliteColonisation) {
        Optional<Parcelle> optParcelle = getParcelle(x, y);

        if (optParcelle.isPresent()) {
            Parcelle parcelle = optParcelle.get();

            Plante plante = new Plante();
            plante.setEspece(espece);
            plante.setAge(0);
            plante.setAgeMaturite(ageMaturite);
            plante.setEstDrageonnante(estDrageonnante);
            plante.setProbabiliteColonisation(probabiliteColonisation);
            plante.setParcelle(parcelle);

            return planteRepository.save(plante);
        }

        return null;
    }

    /**
     * Ajoute un insecte à une parcelle spécifique
     */
    @Transactional
    public Insecte ajouterInsecte(int x, int y, String espece, String sexe, double mobilite, double resistanceInsecticide) {
        Optional<Parcelle> optParcelle = getParcelle(x, y);

        if (optParcelle.isPresent()) {
            Parcelle parcelle = optParcelle.get();

            Insecte insecte = new Insecte();
            insecte.setEspece(espece);
            insecte.setSexe(sexe);
            insecte.setSante(8);
            insecte.setMobilite(mobilite);
            insecte.setResistanceInsecticide(resistanceInsecticide);
            insecte.setPassSansManger(0);
            insecte.setParcelle(parcelle);

            return insecteRepository.save(insecte);
        }

        return null;
    }

    /**
     * Ajoute un dispositif de traitement à une parcelle spécifique
     */
    @Transactional
    public DispositifTraitement ajouterDispositif(int x, int y, int rayon) {
        Optional<Parcelle> optParcelle = getParcelle(x, y);

        if (optParcelle.isPresent()) {
            Parcelle parcelle = optParcelle.get();

            // Vérifier si un dispositif existe déjà sur cette parcelle
            if (parcelle.getDispositifTraitement() != null) {
                return parcelle.getDispositifTraitement();
            }

            DispositifTraitement dispositif = new DispositifTraitement();
            dispositif.setRayon(rayon);
            dispositif.setParcelle(parcelle);

            DispositifTraitement dispositifSauvegarde = dispositifRepository.save(dispositif);

            parcelle.setDispositifTraitement(dispositifSauvegarde);
            parcelleRepository.save(parcelle);

            return dispositifSauvegarde;
        }

        return null;
    }

    /**
     * Ajoute un programme à un dispositif existant
     */
    @Transactional
    public Programme ajouterProgramme(Long dispositifId, int instantDebut, int duree, TypeTraitement typeTraitement) {
        Optional<DispositifTraitement> optDispositif = dispositifRepository.findById(dispositifId);

        if (optDispositif.isPresent()) {
            DispositifTraitement dispositif = optDispositif.get();

            Programme programme = new Programme();
            programme.setInstantDebut(instantDebut);
            programme.setDuree(duree);
            programme.setTypeTraitement(typeTraitement);
            programme.setDispositifTraitement(dispositif);

            dispositif.getProgrammes().add(programme);

            dispositifRepository.save(dispositif);

            return programme;
        }

        return null;
    }
}