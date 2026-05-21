package com.sportify.backend.repository;

import com.sportify.backend.entities.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Integer> {
    // Esta interfaz queda vacía. JPA se encarga de todo el CRUD automáticamente

    //se supone que springboot auto-genera basado en nombre
    List<Clase> findByFecha(LocalDate fecha);
    List<Clase> findByActividad(Actividad actividad)
    List<Clase> findByActividadId(Integer actividadId)
}