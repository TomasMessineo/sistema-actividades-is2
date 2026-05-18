package com.sportify.backend.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sportify.backend.entities.Clase;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Integer> {

    List<Clase> findByProfesorId(int idProfesor);

    List<Clase> findByActividadIdActividad(int idActividad);

    List<Clase> findByFecha(LocalDate fecha);

    List<Clase> findByPrecio(double precio);
}