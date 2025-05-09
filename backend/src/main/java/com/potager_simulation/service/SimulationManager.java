package com.potager_simulation.service;

import com.potager_simulation.dto.*;
import com.potager_simulation.model.*;
import com.potager_simulation.model.enums.TypeTraitement;
import com.potager_simulation.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ScheduledFuture;
import java.util.stream.Collectors;

@Service
public class SimulationManager {
    private int pasSimulationActuel = 0;
    private boolean simulationEnCours = false;
    private ScheduledFuture<?> tacheSimulation;

    private final ParcelleRepository parcelleRepository;
    private final PlanteRepository planteRepository;
    private final InsecteRepository insecteRepository;
    private final SimulationEventPublisher eventPublisher;
    private final TaskScheduler taskScheduler;

    @Autowired
    public SimulationManager(
            ParcelleRepository parcelleRepository,
            PlanteRepository planteRepository,
            InsecteRepository insecteRepository,
            SimulationEventPublisher eventPublisher,
            TaskScheduler taskScheduler) {
        this.parcelleRepository = parcelleRepository;
        this.planteRepository = planteRepository;
        this.insecteRepository = insecteRepository;
        this.eventPublisher = eventPublisher;
        this.taskScheduler = taskScheduler;
    }

    /**
     * Réinitialise le compteur de pas de simulation à 0
     * et s'assure que la simulation est arrêtée
     */
    public void resetPasSimulation() {
        pasSimulationActuel = 0;
        simulationEnCours = false;
    }

    public void demarrerSimulation(int delaiEntrePassMs) {
        if (simulationEnCours) {
            return;
        }

        simulationEnCours = true;
        tacheSimulation = taskScheduler.scheduleAtFixedRate(
                this::executerPasSimulation,
                Duration.ofMillis(delaiEntrePassMs)
        );
    }

    public void arreterSimulation() {
        if (!simulationEnCours) {
            return;
        }

        if (tacheSimulation != null) {
            tacheSimulation.cancel(false);
        }
        simulationEnCours = false;
    }

    @Transactional
    public void executerPasSimulation() {
        // Incrémenter le compteur de pas
        pasSimulationActuel++;

        // 1. Appliquer les traitements programmés
        appliquerTraitements();

        // 2. Mettre à jour les plantes
        mettreAJourPlantes();

        // 3. Mettre à jour les insectes
        mettreAJourInsectes();

        // 4. Mettre à jour l'environnement naturel (évaporation, etc.)
        mettreAJourEnvironnement();

        // 5. Publier l'état actuel pour la visualisation
        publierEtatActuel();
    }

    private void appliquerTraitements() {
        List<Parcelle> parcelles = parcelleRepository.findAll();
        System.out.println("Starting treatment application at time: " + pasSimulationActuel);
        int deviceCount = 0;
        int programsCount = 0;

        for (Parcelle parcelle : parcelles) {
            if (parcelle.getDispositifTraitement() == null) {
                continue;
            }
            deviceCount++;

            DispositifTraitement dispositif = parcelle.getDispositifTraitement();
            List<Programme> programmesActifs = dispositif.getProgrammesActifs(pasSimulationActuel);
            programsCount += programmesActifs.size();

            for (Programme programme : programmesActifs) {
                System.out.println("Applying treatment: " + programme.getTypeTraitement() +
                        " at parcelle (" + parcelle.getX() + "," + parcelle.getY() +
                        ") with radius " + dispositif.getRayon());

                appliquerTraitementDansRayon(
                        parcelle,
                        dispositif.getRayon(),
                        programme.getTypeTraitement()
                );
            }
        }

        System.out.println("Found " + deviceCount + " devices and " + programsCount + " active programs");
    }

    private void appliquerTraitementDansRayon(
            Parcelle centre,
            int rayon,
            TypeTraitement typeTraitement) {
        List<Parcelle> parcellesDansRayon = parcelleRepository.findParcellesDansRayon(
                centre.getX(), centre.getY(), rayon);

        for (Parcelle parcelle : parcellesDansRayon) {
            switch (typeTraitement) {
                case EAU:
                    double oldHumidity = parcelle.getTauxHumidite();
                    parcelle.ajouterHumidite(20.0);
                    System.out.println("Water applied to parcelle (" + parcelle.getX() + "," +
                            parcelle.getY() + "), humidity: " + oldHumidity +
                            " -> " + parcelle.getTauxHumidite());
                    break;
                case INSECTICIDE:
                    for (Insecte insecte : parcelle.getInsectes()) {
                        insecte.appliquerInsecticide(5.0); // Puissance de l'insecticide
                    }
                    break;
                case ENGRAIS:
                    for (Plante plante : parcelle.getPlantes()) {
                        // Accélération de la croissance (exemple simplifié)
                        if (Math.random() < 0.5) {
                            plante.vieillir();
                        }
                    }
                    break;
            }
        }

        parcelleRepository.saveAll(parcellesDansRayon);
    }

    private void mettreAJourPlantes() {
        List<Plante> plantes = planteRepository.findAll();
        List<Plante> nouvellesPlantes = new ArrayList<>();

        for (Plante plante : plantes) {
            // Faire vieillir la plante - IMPORTANT: cette méthode incrémente l'âge selon les exigences du PDF
            plante.vieillir();

            // Si la plante est drageonnante et mature, tenter de coloniser les parcelles voisines
            if (plante.estMature() && plante.tenterColonisation()) {
                List<Parcelle> parcellesVoisines = parcelleRepository.findParcellesAdjacentes(
                        plante.getParcelle().getX(),
                        plante.getParcelle().getY()
                );

                for (Parcelle parcelle : parcellesVoisines) {
                    if (Math.random() < plante.getProbabiliteColonisation()) {
                        Plante nouvellePlante = new Plante();
                        nouvellePlante.setEspece(plante.getEspece());
                        nouvellePlante.setAge(0);
                        nouvellePlante.setAgeMaturite(plante.getAgeMaturite());
                        nouvellePlante.setEstDrageonnante(true);
                        nouvellePlante.setProbabiliteColonisation(plante.getProbabiliteColonisation());
                        nouvellePlante.setParcelle(parcelle);

                        nouvellesPlantes.add(nouvellePlante);
                    }
                }
            }
        }

        // Sauvegarder les nouvelles plantes
        planteRepository.saveAll(plantes); // Mise à jour des plantes existantes
        planteRepository.saveAll(nouvellesPlantes); // Ajout des nouvelles plantes
    }

    private void mettreAJourInsectes() {
        List<Insecte> insectes = insecteRepository.findAll();
        List<Insecte> nouveauxInsectes = new ArrayList<>();
        List<Insecte> insectesASupprimer = new ArrayList<>();

        for (Insecte insecte : insectes) {
            // Nourrir l'insecte
            boolean planteDisponible = !insecte.getParcelle().getPlantes().isEmpty();
            insecte.seNourrir(planteDisponible);

            // Vérifier sa survie - selon le PDF, un insecte meurt s'il ne mange pas pendant 5 pas
            if (!insecte.estVivant()) {
                insectesASupprimer.add(insecte);
                continue;
            }

            // Tenter un déplacement
            if (insecte.tenterDeplacement()) {
                List<Parcelle> parcellesVoisines = parcelleRepository.findParcellesAdjacentes(
                        insecte.getParcelle().getX(),
                        insecte.getParcelle().getY()
                );

                if (!parcellesVoisines.isEmpty()) {
                    int index = (int) (Math.random() * parcellesVoisines.size());
                    insecte.setParcelle(parcellesVoisines.get(index));
                }
            }

            // Tenter une reproduction si l'insecte est en bonne santé
            if (insecte.getSante() > 7) {
                // Chercher un partenaire du sexe opposé
                List<Insecte> partenaires = insecteRepository.findByParcelleAndEspeceAndSexeNot(
                        insecte.getParcelle(),
                        insecte.getEspece(),
                        insecte.getSexe()
                );

                if (!partenaires.isEmpty() && Math.random() < 0.3) {
                    Insecte nouvelInsecte = new Insecte();
                    nouvelInsecte.setEspece(insecte.getEspece());
                    nouvelInsecte.setSexe(Math.random() > 0.5 ? "M" : "F");
                    nouvelInsecte.setSante(8);
                    nouvelInsecte.setMobilite(insecte.getMobilite());
                    nouvelInsecte.setResistanceInsecticide(insecte.getResistanceInsecticide());
                    nouvelInsecte.setParcelle(insecte.getParcelle());

                    nouveauxInsectes.add(nouvelInsecte);
                }
            }
        }

        // Sauvegarder les changements
        insecteRepository.saveAll(insectes); // Mise à jour des insectes existants
        insecteRepository.saveAll(nouveauxInsectes); // Ajout des nouveaux insectes
        insecteRepository.deleteAll(insectesASupprimer); // Suppression des insectes morts
    }

    private void mettreAJourEnvironnement() {
        List<Parcelle> parcelles = parcelleRepository.findAll();

        for (Parcelle parcelle : parcelles) {
            // Évaporation naturelle de l'eau
            parcelle.diminuerHumidite(2.0);
        }

        parcelleRepository.saveAll(parcelles);
    }

    private void publierEtatActuel() {
        EtatPotagerDTO etat = creerEtatPotagerDTO();
        eventPublisher.publierEtatPotager(etat);
    }

    public EtatPotagerDTO getEtatActuel() {
        return creerEtatPotagerDTO();
    }

    private EtatPotagerDTO creerEtatPotagerDTO() {
        // Créer un DTO représentant l'état actuel du potager
        EtatPotagerDTO etatDTO = new EtatPotagerDTO();
        etatDTO.setPasSimulation(pasSimulationActuel);
        etatDTO.setEnCours(simulationEnCours);

        // Récupérer toutes les parcelles
        List<Parcelle> parcelles = parcelleRepository.findAll();

        // Déterminer les dimensions du potager
        int maxX = 0, maxY = 0;
        for (Parcelle p : parcelles) {
            maxX = Math.max(maxX, p.getX());
            maxY = Math.max(maxY, p.getY());
        }

        etatDTO.setLargeur(maxX + 1);
        etatDTO.setHauteur(maxY + 1);

        // Convertir les parcelles en DTOs
        List<ParcelleDTO> parcellesDTO = parcelles.stream()
                .map(this::convertParcelleToDTO)
                .collect(Collectors.toList());

        etatDTO.setParcelles(parcellesDTO);

        return etatDTO;
    }

    private ParcelleDTO convertParcelleToDTO(Parcelle parcelle) {
        ParcelleDTO dto = new ParcelleDTO();

        // Copier les propriétés de base
        dto.setId(parcelle.getId());
        dto.setX(parcelle.getX());
        dto.setY(parcelle.getY());
        dto.setTauxHumidite(parcelle.getTauxHumidite());

        // Pour la compatibilité avec le frontend
        dto.setCoordX(parcelle.getX());
        dto.setCoordY(parcelle.getY());

        // Déterminer la catégorie d'humidité
        if (parcelle.getTauxHumidite() < 20) {
            dto.setCategorieHumidite("sec");
        } else if (parcelle.getTauxHumidite() < 40) {
            dto.setCategorieHumidite("légèrement humide");
        } else if (parcelle.getTauxHumidite() < 60) {
            dto.setCategorieHumidite("moyennement humide");
        } else if (parcelle.getTauxHumidite() < 80) {
            dto.setCategorieHumidite("humide");
        } else {
            dto.setCategorieHumidite("très humide");
        }

        // Convertir les plantes
        if (parcelle.getPlantes() != null && !parcelle.getPlantes().isEmpty()) {
            dto.setPlantes(parcelle.getPlantes().stream()
                    .map(this::convertPlanteToDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setPlantes(new ArrayList<>());
        }

        // Convertir les insectes
        if (parcelle.getInsectes() != null && !parcelle.getInsectes().isEmpty()) {
            dto.setInsectes(parcelle.getInsectes().stream()
                    .map(this::convertInsecteToDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setInsectes(new ArrayList<>());
        }

        // Convertir le dispositif de traitement
        if (parcelle.getDispositifTraitement() != null) {
            dto.setDispositifTraitement(convertDispositifToDTO(parcelle.getDispositifTraitement()));
        }

        return dto;
    }

    // Méthodes de conversion supplémentaires nécessaires
    private PlanteDTO convertPlanteToDTO(Plante plante) {
        PlanteDTO dto = new PlanteDTO();
        dto.setId(plante.getId());
        dto.setEspece(plante.getEspece());
        dto.setAge(plante.getAge());
        dto.setAgeMaturite(plante.getAgeMaturite());
        dto.setEstMature(plante.estMature());
        dto.setEstDrageonnante(plante.isEstDrageonnante());
        dto.setProbabiliteColonisation(plante.getProbabiliteColonisation());

        // Ajouter des informations de parcelle pour le frontend
        if (plante.getParcelle() != null) {
            dto.setParcelleId(plante.getParcelle().getId());
            dto.setParcelleCoordX(plante.getParcelle().getX());
            dto.setParcelleCoordY(plante.getParcelle().getY());
        }

        return dto;
    }

    private InsecteDTO convertInsecteToDTO(Insecte insecte) {
        InsecteDTO dto = new InsecteDTO();
        dto.setId(insecte.getId());
        dto.setEspece(insecte.getEspece());
        dto.setSexe(insecte.getSexe());
        dto.setSante(insecte.getSante());
        dto.setMobilite(insecte.getMobilite());
        dto.setResistanceInsecticide(insecte.getResistanceInsecticide());
        dto.setPassSansManger(insecte.getPassSansManger());

        // Pour la compatibilité avec le frontend
        if (insecte.getParcelle() != null) {
            dto.setParcelleId(insecte.getParcelle().getId());
            dto.setParcelleCoordX(insecte.getParcelle().getX());
            dto.setParcelleCoordY(insecte.getParcelle().getY());
        }

        return dto;
    }

    private DispositifTraitementDTO convertDispositifToDTO(DispositifTraitement dispositif) {
        DispositifTraitementDTO dto = new DispositifTraitementDTO();
        dto.setId(dispositif.getId());
        dto.setRayon(dispositif.getRayon());

        if (dispositif.getParcelle() != null) {
            dto.setParcelleId(dispositif.getParcelle().getId());
            dto.setParcelleCoordX(dispositif.getParcelle().getX());
            dto.setParcelleCoordY(dispositif.getParcelle().getY());
        }

        // Convertir les programmes
        List<ProgrammeDTO> programmesDTO = dispositif.getProgrammes().stream()
                .map(this::convertProgrammeToDTO)
                .collect(Collectors.toList());

        // Pour la compatibilité avec le frontend
        dto.setProgrammesActifs(programmesDTO);

        return dto;
    }

    private ProgrammeDTO convertProgrammeToDTO(Programme programme) {
        ProgrammeDTO dto = new ProgrammeDTO();
        dto.setId(programme.getId());
        dto.setInstantDebut(programme.getInstantDebut());
        dto.setDuree(programme.getDuree());
        dto.setTypeTraitement(programme.getTypeTraitement().name());

        if (programme.getDispositifTraitement() != null) {
            dto.setDispositifId(programme.getDispositifTraitement().getId());
        }

        return dto;
    }
}