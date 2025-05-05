package com.potager_simulation.service;

import com.potager_simulation.dto.EtatPotagerDTO;
import com.potager_simulation.dto.ParcelleDTO;
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

        for (Parcelle parcelle : parcelles) {
            if (parcelle.getDispositifTraitement() == null) {
                continue;
            }

            DispositifTraitement dispositif = parcelle.getDispositifTraitement();
            List<Programme> programmesActifs = dispositif.getProgrammesActifs(pasSimulationActuel);

            for (Programme programme : programmesActifs) {
                appliquerTraitementDansRayon(
                        parcelle,
                        dispositif.getRayon(),
                        programme.getTypeTraitement()
                );
            }
        }
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
                    parcelle.ajouterHumidite(20.0);
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
            // Faire vieillir la plante
            plante.vieillir();

            // Si la plante est drageonnante, tenter de coloniser les parcelles voisines
            if (plante.tenterColonisation()) {
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

            // Vérifier sa survie
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
        // Code de conversion entités -> DTOs
        EtatPotagerDTO etatDTO = new EtatPotagerDTO();
        etatDTO.setPasSimulation(pasSimulationActuel);

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
        // Code de conversion Parcelle -> ParcelleDTO
        // ...
        return new ParcelleDTO(); // À implémenter
    }

    // Autres méthodes helper pour les conversions entités -> DTOs
}