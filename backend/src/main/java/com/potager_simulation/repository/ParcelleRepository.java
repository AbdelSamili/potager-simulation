package com.potager_simulation.repository;

import com.potager_simulation.model.Parcelle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParcelleRepository extends JpaRepository<Parcelle, Long> {
    @Query("SELECT p FROM Parcelle p WHERE " +
            "((p.x - :x) * (p.x - :x) + (p.y - :y) * (p.y - :y)) <= :rayon * :rayon")
    List<Parcelle> findParcellesDansRayon(int x, int y, int rayon);

    @Query("SELECT p FROM Parcelle p WHERE " +
            "ABS(p.x - :x) <= 1 AND ABS(p.y - :y) <= 1 AND NOT (p.x = :x AND p.y = :y)")
    List<Parcelle> findParcellesAdjacentes(int x, int y);

    Parcelle findByXAndY(int x, int y);
}