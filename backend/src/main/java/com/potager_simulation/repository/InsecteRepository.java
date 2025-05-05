package com.potager_simulation.repository;

import com.potager_simulation.model.Insecte;
import com.potager_simulation.model.Parcelle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsecteRepository extends JpaRepository<Insecte, Long> {
    List<Insecte> findByParcelle(Parcelle parcelle);
    List<Insecte> findByParcelleAndEspeceAndSexeNot(Parcelle parcelle, String espece, String sexe);
}