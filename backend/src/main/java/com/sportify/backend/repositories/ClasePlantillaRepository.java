package com.sportify.backend.repositories;

import com.sportify.backend.entities.ClasePlantilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ClasePlantillaRepository extends JpaRepository<ClasePlantilla, Integer> {
    List<ClasePlantilla> findByDiaSemanaAndHoraAndActivaTrue(DayOfWeek diaSemana, Integer hora);
}
