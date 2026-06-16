package com.sportify.backend.repositories;

import com.sportify.backend.entities.ClasePlantilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClasePlantillaRepository extends JpaRepository<ClasePlantilla, Integer> {
}
