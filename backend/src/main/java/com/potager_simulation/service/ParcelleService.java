package com.potager_simulation.service;

import com.potager_simulation.dto.DispositifTraitementDTO;
import com.potager_simulation.dto.InsecteDTO;
import com.potager_simulation.dto.ParcelleDTO;
import com.potager_simulation.dto.PlanteDTO;
import com.potager_simulation.model.Parcelle;
import com.potager_simulation.model.Programme;
import com.potager_simulation.repository.ParcelleRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParcelleService {
    private final ParcelleRepository parcelleRepository;

    @Autowired
    public ParcelleService(ParcelleRepository parcelleRepository) {
        this.parcelleRepository = parcelleRepository;
    }

    public List<ParcelleDTO> getAllParcelles() {
        return parcelleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ParcelleDTO getParcelleById(Long id) {
        Parcelle parcelle = parcelleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + id));
        return convertToDTO(parcelle);
    }

    public ParcelleDTO getParcelleByCoordinates(int x, int y) {
        Parcelle parcelle = parcelleRepository.findByXAndY(x, y);
        if (parcelle == null) {
            throw new EntityNotFoundException("Parcelle non trouvée aux coordonnées: (" + x + "," + y + ")");
        }
        return convertToDTO(parcelle);
    }

    @Transactional
    public ParcelleDTO createParcelle(ParcelleDTO parcelleDTO) {
        // Vérifier si une parcelle existe déjà à ces coordonnées
        if (parcelleRepository.findByXAndY(parcelleDTO.getX(), parcelleDTO.getY()) != null) {
            throw new IllegalStateException("Une parcelle existe déjà aux coordonnées: (" + parcelleDTO.getX() + "," + parcelleDTO.getY() + ")");
        }

        Parcelle parcelle = new Parcelle();
        parcelle.setX(parcelleDTO.getX());
        parcelle.setY(parcelleDTO.getY());
        parcelle.setTauxHumidite(parcelleDTO.getTauxHumidite());

        Parcelle savedParcelle = parcelleRepository.save(parcelle);
        return convertToDTO(savedParcelle);
    }

    @Transactional
    public ParcelleDTO updateParcelle(Long id, ParcelleDTO parcelleDTO) {
        Parcelle parcelle = parcelleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + id));

        // Seul le taux d'humidité peut être mis à jour manuellement
        parcelle.setTauxHumidite(parcelleDTO.getTauxHumidite());

        Parcelle updatedParcelle = parcelleRepository.save(parcelle);
        return convertToDTO(updatedParcelle);
    }

    @Transactional
    public void deleteParcelle(Long id) {
        parcelleRepository.deleteById(id);
    }

    public List<ParcelleDTO> getParcellesWithPlantes() {
        return parcelleRepository.findAll().stream()
                .filter(p -> !p.getPlantes().isEmpty())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ParcelleDTO> getParcellesWithInsectes() {
        return parcelleRepository.findAll().stream()
                .filter(p -> !p.getInsectes().isEmpty())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ParcelleDTO> getParcellesWithDispositifs() {
        return parcelleRepository.findAll().stream()
                .filter(p -> p.getDispositifTraitement() != null)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ParcelleDTO convertToDTO(Parcelle parcelle) {
        ParcelleDTO dto = new ParcelleDTO();
        dto.setId(parcelle.getId());
        dto.setX(parcelle.getX());
        dto.setY(parcelle.getY());
        dto.setTauxHumidite(parcelle.getTauxHumidite());

        // Conversion des plantes
        List<PlanteDTO> plantesDTO = parcelle.getPlantes().stream()
                .map(plante -> {
                    PlanteDTO planteDTO = new PlanteDTO();
                    planteDTO.setId(plante.getId());
                    planteDTO.setEspece(plante.getEspece());
                    planteDTO.setAge(plante.getAge());
                    planteDTO.setAgeMaturite(plante.getAgeMaturite());
                    planteDTO.setEstMature(plante.estMature());
                    planteDTO.setEstDrageonnante(plante.isEstDrageonnante());
                    planteDTO.setProbabiliteColonisation(plante.getProbabiliteColonisation());
                    planteDTO.setParcelleId(parcelle.getId());
                    return planteDTO;
                })
                .collect(Collectors.toList());
        dto.setPlantes(plantesDTO);

        // Conversion des insectes
        List<InsecteDTO> insectesDTO = parcelle.getInsectes().stream()
                .map(insecte -> {
                    InsecteDTO insecteDTO = new InsecteDTO();
                    insecteDTO.setId(insecte.getId());
                    insecteDTO.setEspece(insecte.getEspece());
                    insecteDTO.setSexe(insecte.getSexe());
                    insecteDTO.setSante(insecte.getSante());
                    insecteDTO.setMobilite(insecte.getMobilite());
                    insecteDTO.setResistanceInsecticide(insecte.getResistanceInsecticide());
                    insecteDTO.setPassSansManger(insecte.getPassSansManger());
                    insecteDTO.setParcelleId(parcelle.getId());
                    return insecteDTO;
                })
                .collect(Collectors.toList());
        dto.setInsectes(insectesDTO);

        // Conversion du dispositif de traitement (si présent)
        if (parcelle.getDispositifTraitement() != null) {
            DispositifTraitementDTO dispositifDTO = new DispositifTraitementDTO();
            dispositifDTO.setId(parcelle.getDispositifTraitement().getId());
            dispositifDTO.setRayon(parcelle.getDispositifTraitement().getRayon());
            dispositifDTO.setParcelleId(parcelle.getId());

            // Récupérer tous les programmes actifs
            List<Programme> programmesActifs = parcelle.getDispositifTraitement().getProgrammes();
            dispositifDTO.setProgrammesActifs(programmesActifs.stream()
                    .map(programme -> {
                        var programmeDTO = new com.potager_simulation.dto.ProgrammeDTO();
                        programmeDTO.setId(programme.getId());
                        programmeDTO.setInstantDebut(programme.getInstantDebut());
                        programmeDTO.setDuree(programme.getDuree());
                        programmeDTO.setTypeTraitement(programme.getTypeTraitement().name());
                        return programmeDTO;
                    })
                    .collect(Collectors.toList()));

            dto.setDispositifTraitement(dispositifDTO);
        }

        return dto;
    }
}