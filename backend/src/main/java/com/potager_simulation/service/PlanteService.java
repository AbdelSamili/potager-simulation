package com.potager_simulation.service;

import com.potager_simulation.dto.PlanteDTO;
import com.potager_simulation.model.Parcelle;
import com.potager_simulation.model.Plante;
import com.potager_simulation.repository.ParcelleRepository;
import com.potager_simulation.repository.PlanteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanteService {
    private final PlanteRepository planteRepository;
    private final ParcelleRepository parcelleRepository;

    @Autowired
    public PlanteService(PlanteRepository planteRepository, ParcelleRepository parcelleRepository) {
        this.planteRepository = planteRepository;
        this.parcelleRepository = parcelleRepository;
    }

    public List<PlanteDTO> getAllPlantes() {
        return planteRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PlanteDTO getPlanteById(Long id) {
        Plante plante = planteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plante non trouvée avec l'ID: " + id));
        return convertToDTO(plante);
    }

    @Transactional
    public PlanteDTO createPlante(PlanteDTO planteDTO) {
        Parcelle parcelle = parcelleRepository.findById(planteDTO.getParcelleId())
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + planteDTO.getParcelleId()));

        Plante plante = new Plante();
        plante.setEspece(planteDTO.getEspece());
        plante.setAge(planteDTO.getAge());
        plante.setAgeMaturite(planteDTO.getAgeMaturite());
        plante.setEstDrageonnante(planteDTO.isEstDrageonnante());
        plante.setProbabiliteColonisation(planteDTO.getProbabiliteColonisation());
        plante.setParcelle(parcelle);

        Plante savedPlante = planteRepository.save(plante);
        return convertToDTO(savedPlante);
    }

    @Transactional
    public PlanteDTO updatePlante(Long id, PlanteDTO planteDTO) {
        Plante plante = planteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plante non trouvée avec l'ID: " + id));

        // Mettre à jour uniquement les propriétés autorisées (pas la parcelle)
        plante.setAge(planteDTO.getAge());
        plante.setAgeMaturite(planteDTO.getAgeMaturite());
        plante.setEstDrageonnante(planteDTO.isEstDrageonnante());
        plante.setProbabiliteColonisation(planteDTO.getProbabiliteColonisation());

        Plante updatedPlante = planteRepository.save(plante);
        return convertToDTO(updatedPlante);
    }

    @Transactional
    public void deletePlante(Long id) {
        planteRepository.deleteById(id);
    }

    public List<PlanteDTO> getPlantesByParcelle(Long parcelleId) {
        Parcelle parcelle = parcelleRepository.findById(parcelleId)
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + parcelleId));

        return planteRepository.findByParcelle(parcelle).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PlanteDTO> getPlantesByEspece(String espece) {
        return planteRepository.findByEspece(espece).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PlanteDTO> getPlantesMatures() {
        return planteRepository.findAll().stream()
                .filter(Plante::estMature)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PlanteDTO convertToDTO(Plante plante) {
        PlanteDTO dto = new PlanteDTO();
        dto.setId(plante.getId());
        dto.setEspece(plante.getEspece());
        dto.setAge(plante.getAge());
        dto.setAgeMaturite(plante.getAgeMaturite());
        dto.setEstMature(plante.estMature());
        dto.setEstDrageonnante(plante.isEstDrageonnante());
        dto.setProbabiliteColonisation(plante.getProbabiliteColonisation());
        dto.setParcelleId(plante.getParcelle().getId());
        dto.setParcelleCoordX(plante.getParcelle().getX());
        dto.setParcelleCoordY(plante.getParcelle().getY());
        return dto;
    }
}