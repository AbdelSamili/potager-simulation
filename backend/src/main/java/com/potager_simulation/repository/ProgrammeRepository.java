package com.potager_simulation.repository;

import com.potager_simulation.model.Programme;
import com.potager_simulation.model.DispositifTraitement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    /**
     * Trouve tous les programmes associés à un dispositif de traitement spécifique
     */
    List<Programme> findByDispositifTraitement(DispositifTraitement dispositifTraitement);

    /**
     * Trouve tous les programmes actifs à un instant donné
     * Utilise une requête JPQL personnalisée pour vérifier si le programme est actif
     */
    @Query("SELECT p FROM Programme p WHERE p.instantDebut <= :instant AND (p.instantDebut + p.duree) > :instant")
    List<Programme> findActiveProgrammes(@Param("instant") int instantCourant);

    /**
     * Supprime tous les programmes associés à un dispositif de traitement
     */
    void deleteByDispositifTraitement(DispositifTraitement dispositifTraitement);
}