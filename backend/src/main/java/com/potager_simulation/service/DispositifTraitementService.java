package com.potager_simulation.service;

import com.potager_simulation.dto.DispositifTraitementDTO;
import com.potager_simulation.dto.ProgrammeDTO;
import com.potager_simulation.model.DispositifTraitement;
import com.potager_simulation.model.Parcelle;
import com.potager_simulation.model.Programme;
import com.potager_simulation.model.enums.TypeTraitement;
import com.potager_simulation.repository.DispositifTraitementRepository;
import com.potager_simulation.repository.ParcelleRepository;
import com.potager_simulation.repository.ProgrammeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DispositifTraitementService {
    private final DispositifTraitementRepository dispositifRepository;
    private final ParcelleRepository parcelleRepository;
    private final ProgrammeRepository programmeRepository;

    @Autowired
    public DispositifTraitementService(
            DispositifTraitementRepository dispositifRepository,
            ParcelleRepository parcelleRepository,
            ProgrammeRepository programmeRepository) {
        this.dispositifRepository = dispositifRepository;
        this.parcelleRepository = parcelleRepository;
        this.programmeRepository = programmeRepository;
    }

    public List<DispositifTraitementDTO> getAllDispositifs() {
        return dispositifRepository.findAll().stream()
                .map(this::convertDispositifToDTO)
                .collect(Collectors.toList());
    }

    public DispositifTraitementDTO getDispositifById(Long id) {
        DispositifTraitement dispositif = dispositifRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + id));
        return convertDispositifToDTO(dispositif);
    }

    @Transactional
    public DispositifTraitementDTO creerDispositifSurParcelle(Long parcelleId, DispositifTraitementDTO dispositifDTO) {
        Parcelle parcelle = parcelleRepository.findById(parcelleId)
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + parcelleId));

        // Vérifier si la parcelle a déjà un dispositif
        if (parcelle.getDispositifTraitement() != null) {
            throw new IllegalStateException("La parcelle possède déjà un dispositif de traitement");
        }

        DispositifTraitement dispositif = new DispositifTraitement();
        dispositif.setRayon(dispositifDTO.getRayon());
        dispositif.setParcelle(parcelle);

        DispositifTraitement savedDispositif = dispositifRepository.save(dispositif);

        // Mettre à jour la parcelle avec le dispositif
        parcelle.setDispositifTraitement(savedDispositif);
        parcelleRepository.save(parcelle);

        return convertDispositifToDTO(savedDispositif);
    }

    @Transactional
    public DispositifTraitementDTO updateDispositif(Long id, DispositifTraitementDTO dispositifDTO) {
        DispositifTraitement dispositif = dispositifRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + id));

        dispositif.setRayon(dispositifDTO.getRayon());

        DispositifTraitement updatedDispositif = dispositifRepository.save(dispositif);
        return convertDispositifToDTO(updatedDispositif);
    }

    @Transactional
    public void deleteDispositif(Long id) {
        DispositifTraitement dispositif = dispositifRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + id));

        // Détacher le dispositif de la parcelle
        Parcelle parcelle = dispositif.getParcelle();
        if (parcelle != null) {
            parcelle.setDispositifTraitement(null);
            parcelleRepository.save(parcelle);
        }

        dispositifRepository.deleteById(id);
    }

    @Transactional
    public ProgrammeDTO ajouterProgramme(Long dispositifId, ProgrammeDTO programmeDTO) {
        DispositifTraitement dispositif = dispositifRepository.findById(dispositifId)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + dispositifId));

        Programme programme = new Programme();
        programme.setInstantDebut(programmeDTO.getInstantDebut());
        programme.setDuree(programmeDTO.getDuree());
        programme.setTypeTraitement(TypeTraitement.valueOf(programmeDTO.getTypeTraitement()));
        programme.setDispositifTraitement(dispositif);

        Programme savedProgramme = programmeRepository.save(programme);
        dispositif.getProgrammes().add(savedProgramme);
        dispositifRepository.save(dispositif);

        return convertProgrammeToDTO(savedProgramme);
    }

    @Transactional
    public ProgrammeDTO updateProgramme(Long programmeId, ProgrammeDTO programmeDTO) {
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new EntityNotFoundException("Programme non trouvé avec l'ID: " + programmeId));

        programme.setInstantDebut(programmeDTO.getInstantDebut());
        programme.setDuree(programmeDTO.getDuree());
        programme.setTypeTraitement(TypeTraitement.valueOf(programmeDTO.getTypeTraitement()));

        Programme updatedProgramme = programmeRepository.save(programme);
        return convertProgrammeToDTO(updatedProgramme);
    }

    @Transactional
    public void deleteProgramme(Long programmeId) {
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new EntityNotFoundException("Programme non trouvé avec l'ID: " + programmeId));

        // Détacher le programme du dispositif
        DispositifTraitement dispositif = programme.getDispositifTraitement();
        if (dispositif != null) {
            dispositif.getProgrammes().remove(programme);
            dispositifRepository.save(dispositif);
        }

        programmeRepository.deleteById(programmeId);
    }

    public List<ProgrammeDTO> getProgrammesByDispositif(Long dispositifId) {
        DispositifTraitement dispositif = dispositifRepository.findById(dispositifId)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + dispositifId));

        return dispositif.getProgrammes().stream()
                .map(this::convertProgrammeToDTO)
                .collect(Collectors.toList());
    }

    // Appliquer un traitement manuel immédiat
    @Transactional
    public void appliquerTraitementManuel(Long dispositifId, TypeTraitement typeTraitement) {
        DispositifTraitement dispositif = dispositifRepository.findById(dispositifId)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + dispositifId));

        Parcelle parcelleCentrale = dispositif.getParcelle();
        List<Parcelle> parcellesDansRayon = parcelleRepository.findParcellesDansRayon(
                parcelleCentrale.getX(), parcelleCentrale.getY(), dispositif.getRayon());

        for (Parcelle parcelle : parcellesDansRayon) {
            switch (typeTraitement) {
                case EAU:
                    parcelle.ajouterHumidite(15.0);
                    break;
                case INSECTICIDE:
                    parcelle.getInsectes().forEach(insecte -> insecte.appliquerInsecticide(4.0));
                    break;
                case ENGRAIS:
                    // Effet simplifié de l'engrais
                    parcelle.getPlantes().forEach(plante -> {
                        if (Math.random() < 0.4) { // 40% de chance d'accélération
                            plante.vieillir();
                        }
                    });
                    break;
            }
        }

        parcelleRepository.saveAll(parcellesDansRayon);
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

        List<ProgrammeDTO> programmesDTO = dispositif.getProgrammes().stream()
                .map(this::convertProgrammeToDTO)
                .collect(Collectors.toList());

        dto.setProgrammesActifs(programmesDTO);

        return dto;
    }

    private ProgrammeDTO convertProgrammeToDTO(Programme programme) {
        ProgrammeDTO dto = new ProgrammeDTO();
        dto.setId(programme.getId());
        dto.setInstantDebut(programme.getInstantDebut());
        dto.setDuree(programme.getDuree());
        dto.setTypeTraitement(programme.getTypeTraitement().name());
        dto.setDispositifId(programme.getDispositifTraitement().getId());
        return dto;
    }
    /**
     * Supprime un programme pour un dispositif spécifique
     * Cette méthode vérifie que le programme appartient bien au dispositif avant de le supprimer
     *
     * @param dispositifId ID du dispositif concerné
     * @param programmeId ID du programme à supprimer
     */
    @Transactional
    public void supprimerProgramme(Long dispositifId, Long programmeId) {
        // Vérifier que le dispositif existe
        DispositifTraitement dispositif = dispositifRepository.findById(dispositifId)
                .orElseThrow(() -> new EntityNotFoundException("Dispositif non trouvé avec l'ID: " + dispositifId));

        // Vérifier que le programme existe
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new EntityNotFoundException("Programme non trouvé avec l'ID: " + programmeId));

        // Vérifier que le programme appartient bien au dispositif
        if (!programme.getDispositifTraitement().getId().equals(dispositifId)) {
            throw new IllegalArgumentException("Le programme avec ID " + programmeId +
                    " n'appartient pas au dispositif avec ID " + dispositifId);
        }

        // Retirer le programme de la liste des programmes du dispositif
        dispositif.getProgrammes().remove(programme);

        // Sauvegarder le dispositif mis à jour
        dispositifRepository.save(dispositif);

        // Supprimer le programme de la base de données
        programmeRepository.delete(programme);
    }
}