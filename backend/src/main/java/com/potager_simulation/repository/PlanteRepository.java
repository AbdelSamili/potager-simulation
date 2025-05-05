package com.potager_simulation.repository;

import com.potager_simulation.model.Parcelle;
import com.potager_simulation.model.Plante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanteRepository extends JpaRepository<Plante, Long> {
    List<Plante> findByParcelle(Parcelle parcelle);
    List<Plante> findByEspece(String espece);
}