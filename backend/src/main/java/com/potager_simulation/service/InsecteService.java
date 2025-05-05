package com.potager_simulation.service;

import com.potager_simulation.dto.InsecteDTO;
import com.potager_simulation.model.Insecte;
import com.potager_simulation.model.Parcelle;
import com.potager_simulation.repository.InsecteRepository;
import com.potager_simulation.repository.ParcelleRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsecteService {
    private final InsecteRepository insecteRepository;
    private final ParcelleRepository parcelleRepository;

    @Autowired
    public InsecteService(InsecteRepository insecteRepository, ParcelleRepository parcelleRepository) {
        this.insecteRepository = insecteRepository;
        this.parcelleRepository = parcelleRepository;
    }

    public List<InsecteDTO> getAllInsectes() {
        return insecteRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InsecteDTO getInsecteById(Long id) {
        Insecte insecte = insecteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Insecte non trouvé avec l'ID: " + id));
        return convertToDTO(insecte);
    }

    @Transactional
    public InsecteDTO createInsecte(InsecteDTO insecteDTO) {
        Parcelle parcelle = parcelleRepository.findById(insecteDTO.getParcelleId())
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + insecteDTO.getParcelleId()));

        Insecte insecte = new Insecte();
        insecte.setEspece(insecteDTO.getEspece());
        insecte.setSexe(insecteDTO.getSexe());
        insecte.setSante(insecteDTO.getSante());
        insecte.setMobilite(insecteDTO.getMobilite());
        insecte.setResistanceInsecticide(insecteDTO.getResistanceInsecticide());
        insecte.setPassSansManger(0);
        insecte.setParcelle(parcelle);

        Insecte savedInsecte = insecteRepository.save(insecte);
        return convertToDTO(savedInsecte);
    }

    @Transactional
    public InsecteDTO updateInsecte(Long id, InsecteDTO insecteDTO) {
        Insecte insecte = insecteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Insecte non trouvé avec l'ID: " + id));

        // Ne pas mettre à jour la parcelle, cela est géré par la simulation
        insecte.setSante(insecteDTO.getSante());
        insecte.setMobilite(insecteDTO.getMobilite());
        insecte.setResistanceInsecticide(insecteDTO.getResistanceInsecticide());

        Insecte updatedInsecte = insecteRepository.save(insecte);
        return convertToDTO(updatedInsecte);
    }

    @Transactional
    public void deleteInsecte(Long id) {
        insecteRepository.deleteById(id);
    }

    public List<InsecteDTO> getInsectesByParcelle(Long parcelleId) {
        Parcelle parcelle = parcelleRepository.findById(parcelleId)
                .orElseThrow(() -> new EntityNotFoundException("Parcelle non trouvée avec l'ID: " + parcelleId));

        return insecteRepository.findByParcelle(parcelle).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private InsecteDTO convertToDTO(Insecte insecte) {
        InsecteDTO dto = new InsecteDTO();
        dto.setId(insecte.getId());
        dto.setEspece(insecte.getEspece());
        dto.setSexe(insecte.getSexe());
        dto.setSante(insecte.getSante());
        dto.setMobilite(insecte.getMobilite());
        dto.setResistanceInsecticide(insecte.getResistanceInsecticide());
        dto.setPassSansManger(insecte.getPassSansManger());
        dto.setParcelleId(insecte.getParcelle().getId());
        dto.setParcelleCoordX(insecte.getParcelle().getX());
        dto.setParcelleCoordY(insecte.getParcelle().getY());
        return dto;
    }
}