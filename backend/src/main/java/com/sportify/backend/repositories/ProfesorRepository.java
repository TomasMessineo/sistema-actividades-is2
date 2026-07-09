package com.sportify.backend.repositories;

import com.sportify.backend.entities.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfesorRepository extends JpaRepository<Profesor,Integer> {

    List<Profesor> findByActividad_IdActividad(Integer idActividad);

    List<Profesor> findByActivoTrue();

    List<Profesor> findByActivoFalse();

    List<Profesor> findByActividad_IdActividadAndActivoTrue(Integer idActividad);

}
