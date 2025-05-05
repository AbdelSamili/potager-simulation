package com.potager_simulation.repository;

import com.potager_simulation.model.DispositifTraitement;
import com.potager_simulation.model.Parcelle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DispositifTraitementRepository extends JpaRepository<DispositifTraitement, Long> {
    Optional<DispositifTraitement> findByParcelle(Parcelle parcelle);
}