package com.sportify.backend.repository;

import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Integer> {
    // Esta interfaz queda vacía. JPA se encarga de todo el CRUD automáticamente.
    List<Clase> findByFecha(LocalDate fecha);
    List<Clase> findByActividad(Actividad actividad);
    List<Clase> findByActividad_IdActividad(Integer actividadId);
}